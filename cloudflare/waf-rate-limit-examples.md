# WAF + Rate Limiting – Rule Examples (HalfMovies)

Use these in **Security → WAF** and **Security → WAF → Rate limiting** for halfmovies.com.

---

## 1) Managed ruleset

- **WAF** → **Managed rules** (or Configuration rules)
- Enable **Cloudflare Managed Ruleset**
- Set sensitivity to **High** or **Medium**; for strictest, use **Block** for high/critical rules

---

## 2) Rate limiting rules

Create **custom rate limiting** rules so that abuse is blocked before it hits your origin.

### Rule: Auth endpoints (login / signup)

- **Name:** HalfMovies – Auth rate limit  
- **If:**  
  - **Field:** URI Path  
  - **Operator:** equals  
  - **Value:** `/api/auth/login`  
  - **Or** add another condition: URI Path equals `/api/auth/signup`  
  - (Or use "URI Path starts with" `/api/auth/` if you have more auth routes)  
- **Then:**  
  - **Requests:** 10  
  - **Period:** 1 minute  
  - **Counting:** Per IP (or "Per cookie" if you identify users)  
- **Action:** Block (or Challenge)

### Rule: R2 gateway (storage)

- **Name:** HalfMovies – Storage gateway rate limit  
- **If:**  
  - **Field:** URI Path  
  - **Operator:** starts with  
  - **Value:** `/storage/`  
- **Then:**  
  - **Requests:** 60  
  - **Period:** 1 minute  
  - **Counting:** Per IP  
- **Action:** Block

### Rule: General API (optional)

- **If:** URI Path starts with `/api/`  
- **Then:** 120 requests per minute per IP  
- **Action:** Block or Challenge  

---

## 3) API Shield (if available on your plan)

- **Schema Validation:** Define JSON schemas for:
  - `POST /api/auth/login` – body: `{ "email": "string", "password": "string" }`
  - `POST /api/auth/signup` – body: `{ "email": "string", "password": "string" }`
- Invalid JSON or extra/missing fields → Block

- **mTLS:** For service-to-service (e.g. another Worker or internal service calling your API), attach a client certificate and validate in a Worker or at the edge.

---

## 4) Suggested order

1. Enable Managed Ruleset.  
2. Add rate limiting for `/api/auth/*` and `/storage/*`.  
3. Add Schema Validation for auth endpoints if API Shield is available.  
4. Optionally add a rule that blocks known bad countries or ASNs if you only serve specific regions.
