# 🔍 How to Find YouTube Links for Movies

## ⚠️ Important Note

**Many popular movies (like LOTR, Mank, etc.) are NOT available as full movies on YouTube** due to copyright restrictions. These movies are typically only available on:
- Netflix
- Amazon Prime
- HBO Max
- Disney+
- Other paid streaming services

---

## ✅ Movies That ARE Available on YouTube

These types of movies are commonly found on YouTube:
- **Older/Classic films** (pre-2000s)
- **Independent films**
- **Public domain movies**
- **Movies from official channels** (like FilmRise, Popcornflix, etc.)
- **Documentaries**
- **Short films**

---

## 🔍 How to Search for YouTube Links

### Step 1: Search YouTube

1. Go to **YouTube.com**
2. Search: `"[Movie Title] [Year] full movie"`
3. Look for:
   - ✅ Videos that are 1+ hours long
   - ✅ Official channel uploads
   - ✅ Videos with "Full Movie" in title
   - ❌ Avoid trailers (usually < 5 minutes)

### Step 2: Verify It's a Full Movie

- Check video duration (should be 60+ minutes for feature films)
- Read comments to confirm it's the full movie
- Check if it's from an official/trusted channel

### Step 3: Copy the URL

- Copy the full YouTube URL
- Format: `https://www.youtube.com/watch?v=VIDEO_ID`

### Step 4: Add to `youtube-links.json`

```json
{
  "movie_id_here": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### Step 5: Run Update Script

```powershell
node add-youtube-links-manual.cjs
```

---

## 📋 Movies That Need Links

See `movies-needing-links.json` for the complete list.

**Popular examples:**
- The Lord of the Rings trilogy
- Mank (2020)
- The Shawshank Redemption
- Forrest Gump
- The Godfather
- And 250+ more...

---

## 💡 Alternative Solutions

### Option 1: Link to Streaming Services

Instead of YouTube, you could:
- Link to Netflix, Amazon Prime, etc.
- Use JustWatch links (already in database)
- Show "Available on [Platform]" message

### Option 2: Use Trailers

For movies not available as full movies:
- Use official trailers
- Add note: "Full movie available on [Platform]"
- Link to streaming service

### Option 3: Remove from Database

If a movie can't be found anywhere:
- Remove it from the database
- Or mark it as "Coming Soon"

---

## 🚀 Quick Tips

1. **Search multiple variations:**
   - `"[Title] full movie"`
   - `"[Title] [Year] complete"`
   - `"[Title] free movie"`

2. **Check official channels:**
   - FilmRise Movies
   - Popcornflix
   - Shout! Studios
   - Full Moon Features

3. **Use the movie ID:**
   - Find ID in `movies.json`
   - Use it in `youtube-links.json`

---

## 📊 Current Status

- **Total movies:** 653
- **With YouTube links:** 398
- **Without links:** 255
- **Need manual search:** ~200+ (popular movies not on YouTube)

---

## ⚡ Quick Add Script

To add links quickly:

1. Open `youtube-links.json`
2. Add entries: `"movie_id": "youtube_url"`
3. Run: `node add-youtube-links-manual.cjs`

Repeat until all possible movies have links!

