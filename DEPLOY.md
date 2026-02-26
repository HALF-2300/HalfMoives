# Deploy HalfMovies to halfmovies.com (Cloudflare)

Your app is a **Node.js + Express** server (not static-only), so it needs to run on a host that supports Node. Cloudflare sits in front as DNS + proxy (SSL, cache, DDoS).

---

## 1. Before you deploy – production env

On the **server** where Node runs, set (or add to your host’s env):

```env
# Required for production
BASE_URL=https://halfmovies.com
PORT=4000

# Strong random string (e.g. openssl rand -hex 32)
SESSION_SECRET=your-production-secret-here

# Resend (verification emails) – keep your key
RESEND_API_KEY=re_xxxxx

# Optional: use your domain for “From” (verify domain in Resend first)
EMAIL_FROM=HalfMovies <noreply@halfmovies.com>
```

- **BASE_URL** must be `https://halfmovies.com` so verification emails use the correct link.
- **SESSION_SECRET** must be set and kept secret in production.

---

## 2. Where to run the Node app

Pick one:

| Option | Notes |
|--------|--------|
| **Railway** | Connect GitHub repo, set env vars, add custom domain `halfmovies.com`. |
| **Render** | Web Service, connect repo, set env, add custom domain. |
| **Fly.io** | `fly launch`, set secrets, then `fly certs add halfmovies.com`. |
| **VPS** (DigitalOcean, etc.) | Clone repo, `npm install`, `npm start`, use PM2 or systemd. Run behind Nginx/Caddy if you want. |

On all of these you’ll get a URL like `https://your-app.railway.app` or an IP. You’ll point **halfmovies.com** to that in Cloudflare (step 3).

---

## 3. Cloudflare (halfmovies.com)

1. **DNS**
   - In [Cloudflare Dashboard](https://dash.cloudflare.com) → your zone **halfmovies.com** → **DNS** → **Records**.
   - Add a record:
     - **Type:** `CNAME`
     - **Name:** `@` (or `www` if you use www)
     - **Target:** the host you chose (e.g. `your-app.railway.app` or your Fly/Render hostname).
     - **Proxy status:** **Proxied** (orange cloud) so Cloudflare handles SSL and traffic.

2. **SSL/TLS**
   - **SSL/TLS** → Overview: set encryption mode to **Full** or **Full (strict)** so Cloudflare talks HTTPS to your Node server. If your host provides its own certificate, use **Full (strict)**.

3. **No code changes needed** – Cloudflare is just DNS + proxy in front of your existing Node app.

---

## 4. After deploy

- Visit **https://halfmovies.com** and confirm the site loads.
- Test signup → check email for the verification link; it should point to `https://halfmovies.com/verify-email.html?token=...`.
- If you use a custom **EMAIL_FROM** (e.g. `noreply@halfmovies.com`), add and verify that domain in the [Resend dashboard](https://resend.com/domains).

---

## Quick reference

- **Repo:** your WorldStreamMaxSite project (with `server.js`, `index.html`, `movies.json`, etc.).
- **Start command:** `npm start` (runs `node server.js`).
- **Port:** app uses `process.env.PORT || 4000`; the host usually sets `PORT` for you.
- **Data:** `movies.json`, `users.json`, `sessions.json` live on the server; back them up if the host has ephemeral disk.

---

## 5. Optional: Node proxy

If your host only exposes one port (e.g. 80 or 8080) and you want the app to run on an internal port, use the included reverse proxy:

1. **Start the app** (e.g. on port 4000):
   ```bash
   PORT=4000 npm start
   ```

2. **Start the proxy** (listens on 8080 by default, forwards to the app):
   ```bash
   npm run proxy
   ```
   Or on port 80 (needs cap/root on Linux):
   ```bash
   PROXY_PORT=80 node proxy.js
   ```

3. **Env for the proxy (optional):**
   - `APP_BACKEND` – app URL (default `http://127.0.0.1:4000`)
   - `PROXY_PORT` – port the proxy listens on (default `8080`)

4. Point **Cloudflare** or your load balancer at the **proxy** port. The proxy forwards `X-Forwarded-Host` and `X-Forwarded-Proto` so the app sees the real domain and HTTPS. Set `BASE_URL=https://halfmovies.com` on the app.
