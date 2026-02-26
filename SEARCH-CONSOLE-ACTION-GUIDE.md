# 🔍 Google Search Console - Action Guide

## ✅ Step-by-Step Instructions

---

## 📋 Step 1: Test Live URL (URL Inspection)

### Actions:
1. Go to: **Google Search Console** → **URL Inspection** (top search bar)
2. Enter each URL and click **"Test Live URL"**:

   **URL 1:** `https://halfmovies.com/sitemap.xml`
   - Expected: ✅ HTTP 200 / Available to Google
   - Screenshot: Take screenshot showing status

   **URL 2:** `https://halfmovies.com/robots.txt`
   - Expected: ✅ HTTP 200 / Available to Google
   - Screenshot: Take screenshot showing status

### ✅ Checklist:
- [ ] sitemap.xml tested - Status: ________
- [ ] robots.txt tested - Status: ________
- [ ] Screenshots taken

---

## 📋 Step 2: Clean Up Sitemaps

### Actions:
1. Go to: **Google Search Console** → **Indexing** → **Sitemaps**
2. Check current sitemap entries
3. **Keep ONLY:** `sitemap.xml`
4. **If `/sitemap` exists** (without .xml):
   - If there's a "Remove" option → Remove it
   - If there's NO remove option → **IGNORE IT** (it's historical, Google will stop showing it)
5. **DO NOT** resubmit multiple times
6. **DO NOT** add duplicate entries

### ✅ Checklist:
- [ ] Only `sitemap.xml` is in the list
- [ ] `/sitemap` (if exists) is ignored or removed
- [ ] No duplicate entries

### ⚠️ Important Notes:
- If `sitemap.xml` shows "Couldn't fetch" → **DO NOTHING**
- It will fix automatically in 24-72 hours
- Do NOT resubmit repeatedly

---

## 📋 Step 3: Request Indexing (Limited)

### Actions:
1. Go to: **Google Search Console** → **URL Inspection**
2. Request indexing for **ONLY 2 URLs**:

   **URL 1 (Homepage):**
   - Enter: `https://halfmovies.com/`
   - Click: **"Request Indexing"**
   - Wait for confirmation

   **URL 2 (One Movie Page):**
   - Enter: `https://halfmovies.com/movie.html?id=coherence_2013`
     (or any movie ID from your sitemap)
   - Click: **"Request Indexing"**
   - Wait for confirmation

### ⚠️ Important:
- **DO NOT** request indexing for many pages
- **DO NOT** request indexing for all movies
- Only request 1-2 URLs to test
- Google will crawl the rest from sitemap.xml automatically

### ✅ Checklist:
- [ ] Homepage indexing requested
- [ ] One movie page indexing requested
- [ ] Confirmation received

---

## 📋 Step 4: Monitor & Report (24-72 Hours)

### Actions:
1. Go to: **Google Search Console** → **Pages** → **Indexing** (Coverage)
2. Wait **24-72 hours** after Step 3
3. Check the **Coverage** report
4. Record the following:

### 📊 Metrics to Report:

**Indexed Pages:**
- Total indexed: ________
- Status: ✅ / ❌

**Not Indexed Pages:**
- Total not indexed: ________
- Top reasons (list top 3):
  1. ________
  2. ________
  3. ________

### 📝 Report Template:

```
Date: ________
Time Since Request: ________ hours

INDEXED:
- Total: ________ pages
- Status: ✅ / ❌

NOT INDEXED:
- Total: ________ pages
- Top Reasons:
  1. ________ (count: ____)
  2. ________ (count: ____)
  3. ________ (count: ____)

NOTES:
- Any errors or warnings: ________
- Sitemap status: ________
```

---

## ⏰ Timeline

| Action | When | Duration |
|--------|------|----------|
| Test Live URL | Now | 5 minutes |
| Clean Sitemaps | Now | 2 minutes |
| Request Indexing | Now | 5 minutes |
| Monitor Results | After 24-72 hours | Check daily |

---

## 🎯 Expected Results

### ✅ Good Signs:
- Live Test shows: **HTTP 200 / Available to Google**
- Sitemap shows: **Success** (after 24-72 hours)
- Indexed pages count increases gradually
- No critical errors in Coverage report

### ⚠️ Normal Delays:
- Sitemap processing: 24-72 hours
- Indexing requests: 1-7 days
- Coverage updates: Daily (not real-time)

### ❌ If Issues:
- 404 errors → Check file uploads
- Blocked/Forbidden → Check security/WAF rules
- "Couldn't fetch" sitemap → Wait 24-72 hours (auto-fix)

---

## 📸 Screenshot Checklist

Take screenshots of:
- [ ] Live Test result for sitemap.xml
- [ ] Live Test result for robots.txt
- [ ] Sitemaps page (showing only sitemap.xml)
- [ ] Coverage report (after 24-72 hours)
- [ ] Indexing request confirmations

---

## 🔄 Next Steps (After 24-72 Hours)

1. Review Coverage report
2. Check for indexing errors
3. Monitor indexed page count
4. Report back with results

---

**Created:** $(date)
**Status:** Ready for execution ✅

