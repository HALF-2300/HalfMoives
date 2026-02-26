# R2 Gateway Worker

Worker that streams access to a **private** R2 bucket. No public bucket; all GET/PUT/HEAD/DELETE go through this Worker with:

- **Auth:** `Authorization: Bearer <R2_GATEWAY_SECRET>` required on every request (except `GET /` and `GET /health`).
- **Logging:** Each request is logged (method, key prefix, IP, timestamp) to Workers Logs; optional Logpush to your SIEM.
- **Rate limiting:** Apply at the Cloudflare dashboard (WAF → Rate limiting) on the route that invokes this Worker (e.g. `/storage/*`).

## Setup

1. **Enable R2** (one-time): Cloudflare Dashboard → **R2 Object Storage** → enable R2 for your account (and add a payment method if required by your plan).

2. **Create the R2 bucket (private, no public access)**

   ```bash
   cd cloudflare/worker-r2-gateway
   npx wrangler r2 bucket create halfmovies-private
   ```

   In Cloudflare Dashboard → R2 → `halfmovies-private`: ensure **Public access** is **Off**. Do not attach a custom domain to the bucket.

3. **Set the gateway secret**

   ```bash
   npx wrangler secret put R2_GATEWAY_SECRET
   ```
   Enter a long random string (e.g. `openssl rand -hex 32`). This is the Bearer token your app (or trusted clients) will send.

4. **Deploy the Worker**

   ```bash
   npx wrangler deploy
   ```

5. **Route traffic to the Worker**

   - **Option A – Workers route:** In Dashboard → Workers & Pages → your worker → Settings → Triggers → Add route: e.g. `halfmovies.com/storage/*` so only `/storage/*` hits this Worker; your main app handles everything else.
   - **Option B – Subdomain:** e.g. `storage.halfmovies.com` and route that host to this Worker.

6. **Use from your app**

   - To **download** a file: `GET https://halfmovies.com/storage/path/to/key` with header `Authorization: Bearer <R2_GATEWAY_SECRET>`.
   - To **upload**: `PUT https://halfmovies.com/storage/path/to/key` with the same header and body (and optional `Content-Type`).
   - Never expose `R2_GATEWAY_SECRET` to the browser; only your server (or a backend) should call this Worker. For user-facing downloads, your Node app can proxy the stream or issue short-lived presigned URLs from another Worker endpoint if you add it.

## WAF / Rate limiting

In Cloudflare Dashboard → Security → WAF → Rate limiting, add a rule for the path that hits this Worker (e.g. URI Path contains `/storage/`), e.g. 60 requests per minute per IP, action Block. This complements the Worker’s auth.

## Bucket Lock (optional)

For backup/immutability: R2 → bucket → Settings → Object Lock / Bucket Lock; enable on prefix `backups/` (or similar). See main [CLOUDFLARE-SECURITY.md](../CLOUDFLARE-SECURITY.md).
