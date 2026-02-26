# 🔗 How to Add YouTube Links to Movies

## 📊 Current Status

- **Total Movies:** 383
- **Movies Added (No YouTube):** 39
- **Status:** Movies are in database but need YouTube links to be playable

---

## ⚠️ Important Note

These 39 movies are **in your database** but **won't play** until you add YouTube links. They will appear on your website but won't be playable.

---

## 🔍 How to Add YouTube Links

### Method 1: Manual Search & Update

1. **For each movie, search YouTube:**
   - Go to YouTube
   - Search: `"[Movie Title] [Year] full movie"`
   - Find a full movie (not trailer)
   - Copy the YouTube URL

2. **Update the movie in movies.json:**
   - Find the movie entry
   - Update these fields:
     ```json
     {
       "hlsUrl": "https://www.youtube.com/embed/VIDEO_ID",
       "youtubeEmbed": true,
       "thumbnailUrl": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
       "posterUrl": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
     }
     ```

3. **Extract Video ID:**
   - From: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Extract: `VIDEO_ID` (11 characters)

---

### Method 2: Use Script (Bulk Update)

Create a script to update multiple movies at once:

```javascript
// Example: Update John Wick
const videoId = "YOUR_VIDEO_ID_HERE";
const movieTitle = "John Wick";

// Find and update in movies.json
```

---

## 📝 Movies That Need YouTube Links

Here are the 39 movies that need links:

### Action Movies (8)
1. John Wick (2014)
2. Mad Max: Fury Road (2015)
3. Inception (2010)
4. The Matrix (1999)
5. The Bourne Identity (2002)
6. Mission: Impossible (1996)
7. Fast & Furious (2009)
8. Die Hard (1988)

### Drama Movies (9)
9. The Shawshank Redemption (1994)
10. Forrest Gump (1994)
11. The Godfather (1972)
12. Pulp Fiction (1994)
13. Fight Club (1999)
14. Goodfellas (1990)
15. Scarface (1983)
16. American History X (1998)
17. The Green Mile (1999)

### Thriller Movies (5)
18. The Silence of the Lambs (1991)
19. Zodiac (2007)
20. Memento (2000)
21. Oldboy (2003)
22. Blade Runner 2049 (2017)

### Sci-Fi Movies (5)
23. The Martian (2015)
24. District 9 (2009)
25. Children of Men (2006)
26. Looper (2012)

### Horror Movies (8)
27. The Shining (1980)
28. The Conjuring (2013)
29. It (2017)
30. A Quiet Place (2018)
31. The Exorcist (1973)
32. The Ring (2002)
33. Saw (2004)
34. The Babadook (2014)

### Comedy Movies (5)
35. The Grand Budapest Hotel (2014)
36. Superbad (2007)
37. The Hangover (2009)
38. Borat (2006)
39. Step Brothers (2008)

---

## 🔧 Quick Update Script Template

```javascript
// update-youtube-links.cjs
const fs = require('fs');
const movies = JSON.parse(fs.readFileSync('movies.json', 'utf8'));

// Example: Update John Wick
const updates = [
    { title: "John Wick", year: 2014, videoId: "YOUR_VIDEO_ID" },
    { title: "Inception", year: 2010, videoId: "YOUR_VIDEO_ID" },
    // Add more...
];

updates.forEach(update => {
    const movie = movies.find(m => 
        m.title === update.title && m.year === update.year
    );
    
    if (movie) {
        movie.hlsUrl = `https://www.youtube.com/embed/${update.videoId}`;
        movie.youtubeEmbed = true;
        movie.thumbnailUrl = `https://img.youtube.com/vi/${update.videoId}/maxresdefault.jpg`;
        movie.posterUrl = movie.thumbnailUrl;
        movie.needsYouTubeLink = false;
        console.log(`✅ Updated: ${movie.title}`);
    }
});

fs.writeFileSync('movies.json', JSON.stringify(movies, null, 4));
```

---

## ✅ Verification

After adding YouTube links:

1. **Check movies.json:**
   - All movies should have `hlsUrl` with YouTube embed URL
   - `youtubeEmbed` should be `true`

2. **Test on website:**
   - Visit: `https://halfmovies.com/`
   - Find one of the updated movies
   - Click play - should work!

3. **Upload to server:**
   - Upload updated `movies.json`
   - Clear browser cache
   - Test again

---

## 📤 Next Steps

1. Search YouTube for each movie
2. Find full movie links (not trailers)
3. Update movies.json with video IDs
4. Upload to server
5. Test playback

---

**Note:** Some of these movies may not be available on YouTube due to copyright. In that case, you'll need to find alternative sources or remove them from the database.

