========================================
  UPLOAD INSTRUCTIONS - تعليمات الرفع
========================================

STEP 1: Delete ALL files from server
-------------------------------------
احذف جميع الملفات من السيرفر أولاً:
- movies.json
- searchIndex.json
- index.html
- movie.html
- searchEngine.js
- أي ملفات JSON أخرى (movies-safe.json, etc.)

STEP 2: Upload files from this folder
--------------------------------------
ارفع جميع الملفات من هذا المجلد (upload-files) إلى السيرفر:
- movies.json (106.64 KB - 109 movies)
- searchIndex.json (53.78 KB - 109 movies)
- index.html (~77 KB)
- movie.html (~14 KB)
- searchEngine.js (~10 KB)

STEP 3: After upload, move files back
--------------------------------------
بعد الرفع الناجح:
1. انقل الملفات من upload-files/ إلى المجلد الرئيسي
2. احذف مجلد upload-files/

STEP 4: Clear cache
--------------------
1. Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh: Ctrl + F5

VERIFICATION:
-------------
Open: https://yourdomain.com/verify-movies.html
Should show: 109 movies, no bad movies

========================================
Files in this folder:
- movies.json (109 movies, clean)
- searchIndex.json (109 movies, synced)
- index.html (with filters and fixes)
- movie.html (with navigation fixes)
- searchEngine.js (with cache-busting)
========================================

