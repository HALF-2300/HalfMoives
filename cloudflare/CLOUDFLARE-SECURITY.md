# Cloudflare Security Setup: HalfMovies (Inside + Outside Threats)

This is the strongest practical setup on Cloudflare for your stack: private R2, Worker gateway, Access for admin, WAF, and optional Bucket Locks.

---

## 1) Storage Fortress: Private R2, No Public Buckets

**Rule:** All files live in R2. No bucket is ever publicly reachable (no custom domain on bucket, no r2.dev public access). Your website never exposes raw bucket URLs.

### Steps

1. **Create R2 bucket** (Cloudflare Dashboard → R2 → Create bucket)
   - Name: e.g. `halfmovies-private`
   - **Do not** enable "Public access" / "Allow public access via r2.dev".
   - **Do not** attach a custom domain to the bucket.

2. **Confirm**
   - In bucket settings, "Public access" = Off.
   - No CNAME for this bucket; all access is via the Worker (next section).

3. **Use this bucket for**
   - User uploads, backups, posters/assets you want to serve through your app, or any file you currently store on disk that should be durable and access-controlled.

---

## 2) Access Model: Short-Lived Access Only

**Option A – Recommended: User → Worker → R2 (stream)**

All downloads (and optionally uploads) go through a Cloudflare Worker that:
- Enforces auth (API key header or Cloudflare Access JWT).
- Applies rate limits per IP / per key.
- Logs access (optional: send to Logpush or external SIEM).
- Streams the object from R2 to the client (no presigned redirect).

In this repo: **`worker-r2-gateway/`** implements this. Deploy it and route your storage path (e.g. `halfmovies.com/storage/*`) to the Worker.

**Option B – Presigned URLs**

- A Worker (or your Node app) issues presigned GET/PUT URLs with:
  - Short expiry (e.g. 60–300 seconds).
  - Scope limited to a single object or prefix.
- Client uses the URL directly; R2 serves the object. Credentials never leave your Worker/app.
- Configure in the same Worker: an endpoint like `POST /presign` that returns `{ "url": "..." }` for a given key and method.

This guide and the included Worker focus on **Option A** (stream through Worker). You can add a presign endpoint to the same Worker later.

---

## 3) Insider / Deletion Defense: R2 Bucket Locks

**Purpose:** Even if an admin or key is compromised, the attacker cannot delete or overwrite backups (and optionally critical objects) for a set period or indefinitely (WORM-like).

### Steps

1. **R2 → Your bucket → Settings**
2. **Object Lock / Bucket Lock** (availability depends on plan; see [Cloudflare R2 Object Lock](https://developers.cloudflare.com/r2/api/workers/object-lock/)).
3. Enable **retention** on a prefix, e.g.:
   - `backups/` – compliance mode or retention (e.g. 90 days or indefinite).
   - Optionally `critical/` for documents that must not be overwritten.
4. **Important:** Once lock is set, it cannot be reduced or removed before the retention period. Plan retention carefully.

---

## 4) Admin Zero-Trust: Cloudflare Access in Front of /admin

**Rule:** Only authorized identities can reach `/admin`, dashboards, and internal tools. Access policies define who can reach the app; no “god mode” by default.

### Steps

1. **Zero Trust** (Dashboard → Zero Trust → Access → Applications)
2. **Add an application**
   - Application type: **Self-hosted**
   - Name: e.g. `HalfMovies Admin`
   - Session duration: as you prefer (e.g. 24h)
   - **Application domain:** e.g. `halfmovies.com` (or `admin.halfmovies.com` if you use a subdomain)
   - **Path:** `/admin*` (and any other admin paths, e.g. `/admin/*`)

3. **Policy**
   - **Include:** e.g. "Emails ending in @yourdomain.com" or "Specific emails" or "Okta / Google SSO" group.
   - **Exclude:** (optional) nothing, or known bad countries if you use that.
   - Add a second factor if desired (e.g. one-time PIN).

4. **DNS / routing**
   - Your domain already goes through Cloudflare proxy; Access will evaluate before the request hits your origin. No extra DNS needed if the app is behind Cloudflare.

5. **Principle of least privilege**
   - Use separate Cloudflare roles: e.g. one role for Workers, one for R2, one for Zero Trust. Avoid giving one account full “Super Admin” unless necessary.

---

## 5) API Hardening: WAF + Rate Limits + API Shield

**Rule:** Protect auth, upload, and download endpoints with managed rules and rate limiting; add schema validation where available.

### Steps

1. **WAF** (Dashboard → Security → WAF)
   - Enable **Managed ruleset** (e.g. Cloudflare Managed Ruleset).
   - For stricter policy: use "Block" or "Challenge" for high sensitivity rules.

2. **Rate limiting** (Security → WAF → Rate limiting rules)
   - Create rules, e.g.:
     - **Auth endpoints** (`/api/auth/login`, `/api/auth/signup`): e.g. 5 req/min per IP.
     - **Upload / storage gateway** (e.g. `/storage/*` or your Worker path): e.g. 30 req/min per IP or per API key (if you identify by header).
   - Action: Block or Challenge.

3. **API Shield** (if on a plan that includes it)
   - **Schema Validation:** Define JSON schema for `POST /api/auth/login`, `POST /api/auth/signup`, etc. Requests that don’t match are blocked.
   - **mTLS:** For service-to-service or sensitive internal APIs, attach a client certificate and validate in a Worker or at the edge.

---

## 6) Highest-Tier Confidentiality (Optional)

**If files are ultra-sensitive:**

- **Client-side encryption:** Encrypt before upload; store only ciphertext in R2. Keys stay in the client (or in a separate key vault). Even a breach of R2 or the Worker does not reveal content.
- **Envelope encryption:** Encrypt with a data encryption key (DEK), store DEK in a KMS (e.g. external); Worker or app fetches DEK, decrypts, then serves. Keeps keys out of the runtime.

These are optional and require integration with your upload flow and key management; the rest of this setup (1–5) does not depend on them.

---

## Quick Reference

| Layer              | What you do |
|--------------------|------------|
| R2                 | Private bucket, no public access, no custom domain on bucket. |
| Worker             | All R2 access via Worker (stream or presign); auth + rate limit + logs. |
| Bucket Lock        | Enable on `backups/` (and optionally critical prefixes). |
| Cloudflare Access  | Protect `/admin*` (and other admin paths) with strict policy. |
| WAF + Rate limits  | Managed rules + rate limits on auth and storage endpoints. |
| Optional           | Client-side or envelope encryption for highest confidentiality. |

**In this folder:**

- **`worker-r2-gateway/`** – Worker that streams GET/PUT to private R2; deploy and route e.g. `halfmovies.com/storage/*`.
- **`access-policy-example.md`** – Copy-paste Access policies for `/admin` and service auth.
- **`waf-rate-limit-examples.md`** – WAF managed rules + rate limiting rules for auth and storage.

---

## Deploying the R2 Gateway Worker

See **`worker-r2-gateway/README.md`** and **`wrangler.toml`** in this repo. After deployment:

1. Bind the Worker to your private R2 bucket.
2. Route `halfmovies.com/storage/*` (or your chosen path) to this Worker.
3. Require `Authorization: Bearer <R2_GATEWAY_SECRET>` (or use Cloudflare Access) so only your app or trusted clients can request objects.

Your website must **never** expose raw bucket URLs; all links to stored files go through this Worker (or through short-lived presigned URLs issued by it).
