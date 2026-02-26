# Cloudflare Pages – HalfMovies

So the **build** succeeds and **deploy** doesn’t fail with “Could not find Vite config”.

---

## Option A – No custom deploy command (recommended)

In **Cloudflare Dashboard → Pages → your project → Settings → Builds & deployments**:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Deploy command:** leave **empty** (delete any “Deploy command” like `npx wrangler deploy`)

Pages will build with Vite and then deploy the `dist/` folder. No Wrangler deploy step.

---

## Option B – Deploy with Wrangler

If you want to deploy from the repo with Wrangler:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Deploy command:** `npx wrangler pages deploy dist --project-name=halfmovies`

Create the Pages project once (if needed):

```bash
npx wrangler pages project create halfmovies --production-branch=main
```

The root `wrangler.toml` is set up for this (Pages, output dir `dist`). Do **not** use `npx wrangler deploy` at the repo root; that’s for Workers and expects a Worker config.

---

## Note

The main HalfMovies app (Node/Express with `/api/*` and auth) must run on a Node host (e.g. Railway, Render). Pages here only serves the **static** Vite build (HTML/JS/CSS). For a full site with API, run `server.js` elsewhere and point your domain or API subdomain to it.
