# 🔗 How to Add YouTube Links to Movies

## 📊 Current Status

- **Total movies:** 653
- **Movies without YouTube links:** 284
- **Movies with posters but no links:** 284

---

## 🚀 Quick Method: Use the Script

### Step 1: Edit `youtube-links.json`

Open `youtube-links.json` and add YouTube links in this format:

```json
{
  "movie_id": "https://www.youtube.com/watch?v=VIDEO_ID",
  "another_movie_id": "https://www.youtube.com/watch?v=ANOTHER_VIDEO_ID"
}
```

### Step 2: Run the Script

```powershell
node add-youtube-links-manual.cjs
```

The script will:
- ✅ Update all movies with links from the file
- ✅ Set `hlsUrl`, `youtubeEmbed`, and thumbnails
- ✅ Remove `needsYouTubeLink` flag

---

## 🔍 How to Find YouTube Links

### Method 1: Search YouTube Manually

1. Go to YouTube
2. Search: `"[Movie Title] [Year] full movie"`
3. Find a full movie (not trailer)
4. Copy the URL
5. Add to `youtube-links.json`

### Method 2: Use Movie ID

The script uses movie IDs from `movies.json`. To find a movie's ID:

1. Open `movies.json`
2. Search for the movie title
3. Copy the `"id"` field
4. Use it in `youtube-links.json`

### Method 3: Bulk Add from List

See `movies-needing-links.json` for a list of all movies that need links.

---

## 📝 Example

```json
{
  "interstellar_2014": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
  "se7en_1995": "https://www.youtube.com/watch?v=znmZoVkCjpI",
  "gone_girl_2014": "https://www.youtube.com/watch?v=2-_-1nJf8Vg"
}
```

---

## ⚠️ Important Notes

1. **Use full movie URLs**, not trailers
2. **Format:** `https://www.youtube.com/watch?v=VIDEO_ID`
3. **Video ID** is 11 characters (e.g., `zSWdZVtXT7E`)
4. **Run the script** after adding links to update the database

---

## 🎯 Next Steps

1. Add 10-20 links at a time to `youtube-links.json`
2. Run: `node add-youtube-links-manual.cjs`
3. Check results
4. Repeat until all movies have links

---

## 📋 Movies Still Needing Links

See `movies-needing-links.json` for the complete list with search queries.

