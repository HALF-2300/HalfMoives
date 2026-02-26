# 📤 Upload Feeds Files to Hostinger - Step by Step

## ✅ Files Ready to Upload

1. ✅ `feeds.valid.json` - **REQUIRED** (upload this)
2. ✅ `site-feeds.json` - **OPTIONAL** (only if your code uses it)
3. ✅ `.htaccess` - **REQUIRED** (updated to allow JSON files)

---

## 🎯 Step 1: Identify Server Folder

**On Hostinger File Manager (or WinSCP):**

1. Find the folder that contains `index.html`
2. Common paths:
   - ✅ `public_html/` (most common)
   - ✅ `public_html/halfmovies-site/` (if site is in subfolder)
   - ✅ `public_html/dist/` (if using build folder)

**How to confirm:**
- Open `https://yourdomain.com/` in browser
- If it shows your website → that's the correct folder
- Check where `index.html` is located on the server

---

## 📤 Step 2: Upload Files

**Upload these 3 files to the SAME folder as `index.html`:**

1. ✅ `feeds.valid.json` → Upload to server
2. ✅ `site-feeds.json` → Upload to server (optional)
3. ✅ `.htaccess` → Upload to server (overwrite existing)

**DO NOT upload:**
- ❌ `youtube.mjs` (script, not needed on server)
- ❌ `build-site-feeds.mjs` (script, not needed on server)
- ❌ `channels.movies.json` (source file, not needed on server)

---

## ✅ Step 3: Verify Upload

### Test 1: Direct JSON Access

Open in browser:
```
https://halfmovies.com/feeds.valid.json
```

**Expected result:**
- ✅ Shows raw JSON text (like `[{...}]`)
- ✅ NOT the website HTML
- ✅ NOT "404 Not Found"

**If you see 404:**
- File is in wrong folder
- Move it to the same folder as `index.html`

**If you see website HTML instead of JSON:**
- `.htaccess` rewrite is blocking it
- Make sure you uploaded the updated `.htaccess` file

### Test 2: Check File Location

In Hostinger File Manager:
- ✅ `index.html` and `feeds.valid.json` should be in the **same folder**
- ✅ Both files visible in the same directory listing

---

## 🔧 Step 4: Fix .htaccess (if needed)

If `feeds.valid.json` shows website HTML instead of JSON:

1. Open `.htaccess` on the server
2. Make sure it has this line **at the top** (after `RewriteEngine On`):
   ```
   RewriteRule ^(.+)\.json$ - [L]
   ```
3. Save and retest

---

## 🧪 Step 5: Test in Website Code

After JSON URL works, update your website code to fetch:

```javascript
// Option 1: Use feeds.valid.json
const feeds = await fetch('/feeds.valid.json').then(r => r.json());

// Option 2: Use site-feeds.json (if you prefer cleaner format)
const feeds = await fetch('/site-feeds.json').then(r => r.json());
```

---

## 📋 Quick Checklist

- [ ] Found folder with `index.html` on server
- [ ] Uploaded `feeds.valid.json` to same folder
- [ ] Uploaded `site-feeds.json` (optional)
- [ ] Uploaded updated `.htaccess`
- [ ] Tested: `https://halfmovies.com/feeds.valid.json` shows JSON
- [ ] Verified files are in same folder as `index.html`

---

## 🚨 Troubleshooting

### Issue: "404 Not Found"
**Solution:** File is in wrong folder. Move to same folder as `index.html`.

### Issue: Shows website HTML instead of JSON
**Solution:** `.htaccess` needs the JSON rule. Upload the updated `.htaccess` file.

### Issue: "Access Denied" or "Forbidden"
**Solution:** Check file permissions (should be 644 or readable).

### Issue: JSON shows but website can't fetch it
**Solution:** Check browser console (F12) for CORS errors. The `.htaccess` should allow JSON files.

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ `https://halfmovies.com/feeds.valid.json` shows raw JSON
2. ✅ Website can fetch and parse the JSON
3. ✅ No 404 errors in browser console

---

**Ready?** Upload the 3 files and test the JSON URL!

