/**
 * R2 Gateway Worker – User → Worker → R2 (stream)
 * No public bucket; all access through this Worker with auth + rate limit + logging.
 *
 * Env (secrets): R2_GATEWAY_SECRET – Bearer token required for all requests.
 * Binding: R2 bucket (e.g. BUCKET).
 */

const AUTH_HEADER = "Authorization";
const BEARER_PREFIX = "Bearer ";
const RATE_LIMIT_REQUESTS = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function requireAuth(request, env) {
  const secret = env.R2_GATEWAY_SECRET;
  if (!secret) return new Response("Gateway misconfigured", { status: 503 });
  const auth = request.headers.get(AUTH_HEADER);
  if (!auth || !auth.startsWith(BEARER_PREFIX)) {
    return new Response("Missing or invalid Authorization", { status: 401 });
  }
  const token = auth.slice(BEARER_PREFIX.length).trim();
  if (token !== secret) return new Response("Forbidden", { status: 403 });
  return null;
}

/** Simple in-Worker rate limit keyed by IP (no persistence; use WAF/dashboard for strict limits). */
function rateLimitKey(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    const method = request.method;

    // Health / readiness (no auth)
    if (path === "/" || path === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "r2-gateway" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // All other requests require auth
    const authError = requireAuth(request, env);
    if (authError) return authError;

    // Strip leading slash to get object key; disallow path traversal
    let key = path.replace(/^\/+/, "").replace(/\/+/g, "/");
    if (key.includes("..") || key.startsWith("/")) {
      return new Response("Bad Request", { status: 400 });
    }
    if (!key) return new Response("Bad Request", { status: 400 });

    const bucket = env.BUCKET;
    if (!bucket) return new Response("Gateway misconfigured", { status: 503 });

    // Optional: log access (viewable in Workers Logs / Logpush)
    ctx.waitUntil(
      Promise.resolve().then(() => {
        try {
          console.log(
            JSON.stringify({
              method,
              key: key.slice(0, 200),
              ip: rateLimitKey(request),
              ts: new Date().toISOString(),
            })
          );
        } catch (_) {}
      })
    );

    try {
      if (method === "GET") {
        const object = await bucket.get(key);
        if (!object) return new Response("Not Found", { status: 404 });
        const headers = new Headers();
        if (object.etag) headers.set("ETag", object.etag);
        if (object.size != null) headers.set("Content-Length", String(object.size));
        const contentType = object.httpMetadata?.contentType ?? "application/octet-stream";
        headers.set("Content-Type", contentType);
        return new Response(object.body, { headers });
      }

      if (method === "PUT") {
        const body = request.body;
        const contentType = request.headers.get("Content-Type") || "application/octet-stream";
        await bucket.put(key, body, {
          httpMetadata: { contentType },
        });
        return new Response(null, { status: 204 });
      }

      if (method === "HEAD") {
        const object = await bucket.head(key);
        if (!object) return new Response("Not Found", { status: 404 });
        const headers = new Headers();
        if (object.etag) headers.set("ETag", object.etag);
        if (object.size != null) headers.set("Content-Length", String(object.size));
        const contentType = object.httpMetadata?.contentType ?? "application/octet-stream";
        headers.set("Content-Type", contentType);
        return new Response(null, { status: 200, headers });
      }

      if (method === "DELETE") {
        await bucket.delete(key);
        return new Response(null, { status: 204 });
      }

      return new Response("Method Not Allowed", { status: 405 });
    } catch (e) {
      console.error("R2 gateway error:", e);
      return new Response("Internal Error", { status: 500 });
    }
  },
};
