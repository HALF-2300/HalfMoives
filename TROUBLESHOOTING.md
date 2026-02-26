# Troubleshooting: Movies Not Showing on Hostinger

## Quick Checklist

1. **File Location**: `movies.json` must be in the same directory as `index.html`
   - On Hostinger, this is usually `public_html/`
   - Check: Both files should be in the same folder

2. **File Name**: Must be exactly `movies.json` (lowercase, no spaces)
   - ❌ Wrong: `Movies.json`, `movies.JSON`, `movies (1).json`
   - ✅ Correct: `movies.json`

3. **File Content**: Must be valid JSON
   - Starts with `[`
   - Ends with `]`
   - No extra text before or after

4. **Browser Console**: Check for errors
   - Press F12 → Console tab
   - Look for red error messages
   - Common errors:
     - `404 Not Found` → File not in correct location
     - `Failed to fetch` → Network/CORS issue
     - `Unexpected token` → Invalid JSON

## Step-by-Step Fix

### Step 1: Upload test-movies.html
1. Upload `test-movies.html` to your `public_html` folder
2. Visit: `https://yourdomain.com/test-movies.html`
3. This will tell you exactly what's wrong

### Step 2: Verify movies.json Location
1. In Hostinger File Manager, go to `public_html`
2. Check if `movies.json` is there
3. Check if `index.html` is in the same folder
4. Both should be in the same directory

### Step 3: Re-upload movies.json
1. Delete the old `movies.json` from Hostinger
2. Upload the new `movies.json` file
3. Make sure it's named exactly `movies.json`
4. Check file permissions (should be 644 or readable)

### Step 4: Test Direct Access
1. Visit: `https://yourdomain.com/movies.json`
2. You should see the JSON content
3. If you see "404 Not Found", the file is in the wrong location
4. If you see the JSON, the file is correct

### Step 5: Check Browser Console
1. Visit your main page: `https://yourdomain.com/index.html`
2. Press F12 → Console tab
3. Look for errors related to `movies.json`
4. Share the error message if you see one

## Common Issues & Solutions

### Issue: "404 Not Found" for movies.json
**Solution**: File is not in `public_html` folder. Move it there.

### Issue: "Failed to fetch" or CORS error
**Solution**: This shouldn't happen with same-origin files. Check:
- File is in same directory as HTML
- No `.htaccess` blocking JSON files
- File permissions are correct (644)

### Issue: "Unexpected token" or JSON parse error
**Solution**: JSON is corrupted. Re-upload the file:
1. Use `movies-minified.json` (smaller, less chance of corruption)
2. Or copy-paste the content directly in Hostinger's file editor

### Issue: Movies load but show as empty/blank
**Solution**: Check the movie data structure:
- Each movie needs: `id`, `title`, `hlsUrl` or `url`
- Open browser console (F12) and check for JavaScript errors

## Alternative: Use Minified Version

If the formatted JSON is causing issues, try `movies-minified.json`:
1. Rename it to `movies.json` after upload
2. It's the same content, just without line breaks
3. Smaller file size = faster upload

## Still Not Working?

1. Upload `test-movies.html` and share what it shows
2. Check browser console (F12) and share any errors
3. Verify file location: `public_html/movies.json`
4. Test direct access: `yourdomain.com/movies.json`

