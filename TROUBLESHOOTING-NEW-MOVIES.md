# Troubleshooting: New Movies Not Appearing

## Quick Fixes

### 1. Clear Browser Cache
- **Windows/Linux**: Press `Ctrl + Shift + Delete`
- **Mac**: Press `Cmd + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"

### 2. Hard Refresh
- **Windows/Linux**: Press `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`

### 3. Test the File Directly
Visit: `https://yourdomain.com/movies.json`
- ✅ If you see JSON content → File is uploaded correctly
- ❌ If you see 404 → File is missing or in wrong location

## Step-by-Step Diagnosis

### Step 1: Upload Test Page
1. Upload `test-new-movies.html` to your server (same folder as `index.html`)
2. Visit: `https://yourdomain.com/test-new-movies.html`
3. This will show you exactly what's wrong

### Step 2: Verify File Location
On Hostinger:
1. Go to File Manager
2. Navigate to `public_html`
3. Check that both files are there:
   - ✅ `index.html`
   - ✅ `movies.json`
4. Both must be in the **same folder**

### Step 3: Check File Name
- ✅ Correct: `movies.json` (lowercase, no spaces)
- ❌ Wrong: `Movies.json`, `movies.JSON`, `movies (1).json`

### Step 4: Verify File Size
The new `movies.json` should be approximately **99-100 KB**
- If it's much smaller, the file might be corrupted
- If it's much larger, there might be duplicate entries

### Step 5: Check Browser Console
1. Visit your website
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Look for errors (red text)
5. Common errors:
   - `404 Not Found` → File not found
   - `Failed to fetch` → Network/CORS issue
   - `Unexpected token` → Invalid JSON

## Common Issues & Solutions

### Issue 1: Movies.json Not Found (404)
**Symptoms**: Console shows "404 Not Found" for movies.json

**Solutions**:
1. Re-upload `movies.json` to `public_html` folder
2. Make sure file name is exactly `movies.json` (case-sensitive)
3. Check file permissions (should be 644 or readable)

### Issue 2: Old Movies Still Showing
**Symptoms**: Old movies appear, new ones don't

**Solutions**:
1. Clear browser cache (see above)
2. Hard refresh the page
3. Check if you uploaded the correct file (should be ~100 KB)
4. Verify the file contains 104 movies (check last line of JSON)

### Issue 3: JSON Parse Error
**Symptoms**: Console shows "Unexpected token" or "JSON parse error"

**Solutions**:
1. The file might be corrupted during upload
2. Re-upload `movies.json`
3. Make sure you upload the complete file (not partial)
4. Check file encoding (should be UTF-8)

### Issue 4: Movies Load But Don't Display
**Symptoms**: Console shows movies loaded, but grid is empty

**Solutions**:
1. Check if movies have `posterUrl` or `thumbnailUrl`
2. New movies should have TMDB poster URLs
3. Check browser console for image loading errors

## Verification Checklist

- [ ] `movies.json` is in `public_html` folder
- [ ] File name is exactly `movies.json` (lowercase)
- [ ] File size is ~99-100 KB
- [ ] File contains 104 movies
- [ ] Browser cache is cleared
- [ ] Hard refresh performed
- [ ] No errors in browser console
- [ ] `test-new-movies.html` shows all 20 new movies

## Still Not Working?

1. **Upload test page**: Upload `test-new-movies.html` and share the results
2. **Check console**: Share any error messages from browser console (F12)
3. **Verify file**: Visit `yourdomain.com/movies.json` directly and check if it loads
4. **File size**: Confirm the uploaded file is ~100 KB (not smaller)

## Expected Behavior

After uploading the new `movies.json`:
- ✅ All 104 movies should appear (84 old + 20 new)
- ✅ New movies should have proper posters (TMDB URLs)
- ✅ New movies should show genres and descriptions
- ✅ Movies without `hlsUrl` should still display (using poster images)

