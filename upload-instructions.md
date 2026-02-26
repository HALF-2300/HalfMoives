# تعليمات رفع الملفات - Upload Instructions

## ⚠️ مهم جداً - Very Important

### قبل الرفع - Before Upload:

1. **تحقق من الملفات محلياً:**
   - افتح `verify-movies.html` في المتصفح
   - تأكد أن كل شيء يعمل

2. **احفظ نسخة احتياطية:**
   - احفظ `movies.json` القديم باسم `movies.json.backup`
   - احفظ `searchIndex.json` القديم باسم `searchIndex.json.backup`

### طريقة الرفع الآمنة - Safe Upload Method:

#### الطريقة 1: استبدال تدريجي (الأفضل)
1. ارفع `movies.json` الجديد باسم `movies-new.json`
2. افتح `movies-new.json` في المتصفح للتأكد أنه يعمل
3. احذف `movies.json` القديم
4. غيّر اسم `movies-new.json` إلى `movies.json`
5. كرر نفس الخطوات لـ `searchIndex.json`

#### الطريقة 2: رفع مباشر (إذا كان السيرفر يدعم)
1. احذف `movies.json` القديم أولاً
2. ارفع `movies.json` الجديد مباشرة
3. افتح `verify-movies.html` للتحقق

### بعد الرفع - After Upload:

1. افتح: `https://yourdomain.com/verify-movies.html`
2. تأكد أن:
   - Total Movies: 109 ✅
   - No bad movies found ✅
   - All movies have YouTube links ✅

3. امسح الكاش:
   - `Ctrl + Shift + Delete`
   - Hard Refresh: `Ctrl + F5`

### إذا فشل الموقع - If Website Goes Down:

1. **استرجع النسخة الاحتياطية:**
   - ارفع `movies.json.backup` وسمه `movies.json`
   - ارفع `searchIndex.json.backup` وسمه `searchIndex.json`

2. **تحقق من الأخطاء:**
   - افتح Console (F12)
   - ابحث عن أخطاء JSON
   - تأكد أن الملفات ليست فارغة

3. **تحقق من حجم الملف:**
   - `movies.json` يجب أن يكون ~60-70 KB
   - إذا كان أصغر، الملف تالف

### الملفات المطلوبة - Required Files:

- ✅ `movies.json` (109 movies, ~60-70 KB)
- ✅ `searchIndex.json` (109 movies)
- ✅ `index.html` (with cache-busting)
- ✅ `verify-movies.html` (for testing)

