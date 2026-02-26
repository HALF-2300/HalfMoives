# 📤 How to Upload Updated Movies to Your Server

## ✅ Files to Upload

After adding new movies, you need to upload these files to your server:

1. **movies.json** - Your main database (now has 344 movies)
2. **searchIndex.json** - Search index (needs to be rebuilt)

---

## 📋 Step-by-Step Upload Instructions

### Method 1: Using Hostinger File Manager (Easiest)

1. **Log in to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Log in with your credentials

2. **Open File Manager:**
   - Click on **"File Manager"** in the control panel
   - Navigate to: `public_html/`

3. **Backup Old Files (IMPORTANT):**
   - Right-click on `movies.json` → **Rename** → `movies-backup-[date].json`
   - Right-click on `searchIndex.json` → **Rename** → `searchIndex-backup-[date].json`

4. **Upload New Files:**
   - Click **"Upload"** button
   - Select your local `movies.json` file
   - Wait for upload to complete
   - Repeat for `searchIndex.json` (if you have an updated one)

5. **Verify:**
   - Check file sizes match
   - Check file dates are recent

---

### Method 2: Using FTP (FileZilla, WinSCP, etc.)

1. **Connect to FTP:**
   - Host: `ftp.yourdomain.com` or IP address
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)

2. **Navigate to Server:**
   - Go to: `/public_html/`

3. **Backup Old Files:**
   - Right-click `movies.json` → **Rename** → `movies-backup-[date].json`
   - Right-click `searchIndex.json` → **Rename** → `searchIndex-backup-[date].json`

4. **Upload New Files:**
   - Drag `movies.json` from local to `/public_html/`
   - Drag `searchIndex.json` from local to `/public_html/`
   - Wait for upload to complete

5. **Set Permissions:**
   - Right-click `movies.json` → **File Permissions** → `644`
   - Right-click `searchIndex.json` → **File Permissions** → `644`

---

## 🔄 Rebuild searchIndex.json (Important!)

After uploading `movies.json`, you need to rebuild `searchIndex.json`:

### Option A: Use the Script (Recommended)

1. **On your local computer, run:**
   ```bash
   node rebuild-search-index.cjs
   ```

2. **Upload the new `searchIndex.json`** to your server

### Option B: Manual Rebuild

The `searchIndex.json` should contain:
```json
{
  "movies": [
    {
      "id": "movie_id",
      "title": "Movie Title",
      "year": 2017,
      "genres": ["Action", "Thriller"]
    }
  ],
  "worlds": []
}
```

---

## ✅ Verification Steps

After uploading, verify everything works:

1. **Check File Sizes:**
   - `movies.json` should be ~XXX KB (check your local file size)
   - Files should match between local and server

2. **Test Your Website:**
   - Visit: `https://halfmovies.com/`
   - Check if new movies appear
   - Search for one of the new movies (e.g., "The Foreigner")

3. **Check Browser Console:**
   - Press `F12` → Console tab
   - Look for errors
   - Should see: `🎬 Total movies loaded: 344`

4. **Clear Browser Cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files
   - Hard refresh: `Ctrl + F5`

---

## 🚨 Troubleshooting

### Problem: Movies don't appear on website

**Solutions:**
- Clear browser cache (Ctrl + F5)
- Check file uploaded correctly (size matches)
- Check browser console for errors
- Verify `movies.json` is valid JSON (no syntax errors)

### Problem: Search doesn't work

**Solutions:**
- Rebuild `searchIndex.json`
- Upload updated `searchIndex.json`
- Clear browser cache

### Problem: File upload fails

**Solutions:**
- Check file size (may be too large)
- Check server disk space
- Try FTP instead of File Manager
- Check file permissions (should be 644)

---

## 📝 Quick Checklist

- [ ] Backup old `movies.json`
- [ ] Backup old `searchIndex.json`
- [ ] Upload new `movies.json`
- [ ] Rebuild `searchIndex.json`
- [ ] Upload new `searchIndex.json`
- [ ] Clear browser cache
- [ ] Test website
- [ ] Verify new movies appear
- [ ] Check search functionality

---

## 📊 Current Status

- **Total Movies:** 344
- **New Action Movies Added:** 7
- **Files to Upload:** 
  - `movies.json` (main database)
  - `searchIndex.json` (search index - needs rebuild)

---

## 🔗 File Locations

**Local (Your Computer):**
- `C:\Users\abesa\OneDrive\Documents\WorldStreamMaxSite\movies.json`
- `C:\Users\abesa\OneDrive\Documents\WorldStreamMaxSite\searchIndex.json`

**Server (Hostinger):**
- `/public_html/movies.json`
- `/public_html/searchIndex.json`

---

**Ready to upload?** Follow the steps above! 🚀

