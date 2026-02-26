# 📝 How to Import 10 Movies from Watcho.com

## ⚠️ Important

- **METADATA ONLY** - No video files will be downloaded
- **You need YouTube links** - Movies won't play until you add YouTube links
- **Manual URLs required** - Watcho uses JavaScript, so you need to provide URLs manually

---

## 📋 Step-by-Step Instructions

### Step 1: Get Movie URLs from Watcho

1. Go to: **https://www.watcho.com/lang/ENG**
2. Browse movies
3. Click on 10 movies you want
4. Copy the URL from your browser (e.g., `https://www.watcho.com/movie/movie-name`)
5. Note the URLs

### Step 2: Add URLs to Script

1. Open: `import-10-watcho-simple.cjs`
2. Find the `watchoMovies` array (around line 90)
3. Add your 10 URLs:

```javascript
const watchoMovies = [
    { url: "https://www.watcho.com/movie/movie-1" },
    { url: "https://www.watcho.com/movie/movie-2" },
    { url: "https://www.watcho.com/movie/movie-3" },
    // ... add 7 more
];
```

### Step 3: Run the Script

```bash
node import-10-watcho-simple.cjs
```

### Step 4: Add YouTube Links (Later)

After importing, you need to:
1. Search YouTube for each movie
2. Find full movie (not trailer)
3. Add YouTube link to `movies.json`

---

## ✅ What Gets Imported

- ✅ Movie title
- ✅ Year (if available)
- ✅ Description
- ✅ Poster image (if available)
- ✅ Genres (if available)
- ✅ Director & Cast (if available)

## ❌ What Does NOT Get Imported

- ❌ Video files
- ❌ Video URLs/streaming links
- ❌ Actual movie content

---

## 🎯 Quick Example

```javascript
const watchoMovies = [
    { url: "https://www.watcho.com/movie/example-movie-1" },
    { url: "https://www.watcho.com/movie/example-movie-2" },
    { url: "https://www.watcho.com/movie/example-movie-3" },
    { url: "https://www.watcho.com/movie/example-movie-4" },
    { url: "https://www.watcho.com/movie/example-movie-5" },
    { url: "https://www.watcho.com/movie/example-movie-6" },
    { url: "https://www.watcho.com/movie/example-movie-7" },
    { url: "https://www.watcho.com/movie/example-movie-8" },
    { url: "https://www.watcho.com/movie/example-movie-9" },
    { url: "https://www.watcho.com/movie/example-movie-10" }
];
```

---

**Ready?** Add your 10 Watcho movie URLs and run the script! 🚀

