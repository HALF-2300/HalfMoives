/**
 * Reverse proxy for HalfMovies.
 * Forwards requests to the Node app and sets X-Forwarded-* headers
 * so the app sees the real host and protocol (for cookies, BASE_URL, etc.).
 *
 * Usage:
 *   Terminal 1: npm start          (app on PORT, default 4000)
 *   Terminal 2: node proxy.js      (proxy on PROXY_PORT, default 8080)
 * Then point Cloudflare or your load balancer to the proxy port.
 *
 * Or set PROXY_PORT=80 and run as root (or use authbind/cap_net_bind_service)
 * so the proxy listens on 80 and forwards to the app on 4000.
 */

import http from "http";
import httpProxy from "http-proxy";

const APP_BACKEND = process.env.APP_BACKEND || "http://127.0.0.1:4000";
const PROXY_PORT = parseInt(process.env.PROXY_PORT || "8080", 10);

const proxy = httpProxy.createProxyServer({
  target: APP_BACKEND,
  changeOrigin: true,
  ws: false,
});

proxy.on("error", (err, req, res) => {
  console.error("[proxy] error:", err.message);
  if (res && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway");
  }
});

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "http";

  req.headers["x-forwarded-host"] = host;
  req.headers["x-forwarded-proto"] = proto;
  if (!req.headers["x-forwarded-for"]) {
    req.headers["x-forwarded-for"] = req.socket.remoteAddress || "";
  }

  proxy.web(req, res, {}, (err) => {
    if (err) console.error("[proxy]", err.message);
  });
});

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`[proxy] listening on 0.0.0.0:${PROXY_PORT} → ${APP_BACKEND}`);
});
