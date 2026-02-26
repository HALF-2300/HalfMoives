# Cloudflare Access – Policy Examples (HalfMovies Admin)

Use these in **Zero Trust → Access → Applications** when protecting `/admin` and related paths.

---

## Application

- **Application type:** Self-hosted  
- **Application name:** HalfMovies Admin  
- **Session duration:** 24 hours (or your preference)  
- **Application domain:** `halfmovies.com` (or `admin.halfmovies.com` if you use a subdomain)  
- **Path:** `/admin` or `/admin*` (covers `/admin`, `/admin.html`, `/admin/...`)

---

## Policy 1: Allow only your team (recommended)

- **Policy name:** Allow verified email  
- **Action:** Allow  
- **Include:**
  - Selector: **Emails** → **Ends with** → `@yourdomain.com`  
  - Or: **Emails** → **In list** → `you@example.com`, `admin@example.com`  
- **Exclude:** (optional) leave empty or add "Country" not in [your allowed countries]  
- **Require:** (optional) **One-time PIN** or **Hardware key** for stricter control  

Add a second policy if you want:

- **Policy 2:** Allow  
- **Include:** **Authentication method** → **Okta** or **Google** → group "Admins"  
- **Session duration:** 8 hours  

Only one policy needs to match for Allow.

---

## Policy: Service auth (for API / Worker calling R2)

If you protect an API route with Access (e.g. for internal tools), add a **Service Auth** policy:

- **Application:** e.g. `halfmovies.com/internal/*`  
- **Policy:** Include **Service Token** (create a token in Access → Service Auth, then use the generated Client ID + Client Secret in your script).  

Use this only for server-to-server; do not use for browser users.

---

## Principle of least privilege

- Create a **custom role** in Cloudflare (e.g. "HalfMovies R2 Only") with only R2 read/write, no Workers or DNS.
- Give admin dashboard access only to people who need it; use separate roles for Workers vs R2 vs Zero Trust config.
