# 🎬 How to Add Action Movies from Plex

## ⚠️ Important Note

I cannot directly scrape or import from Plex. However, you can add movies manually using this guide.

---

## 📋 Method 1: Use the Script (with real YouTube links)

1. **Find 10 action movies** from Plex that you want to add
2. **Find their YouTube links** (must be full movies, not trailers)
3. **Edit `add-plex-action-movies.cjs`** and replace the URLs with real ones
4. **Run:** `node add-plex-action-movies.cjs`

---

## 📋 Method 2: Manual Addition Template

For each movie, provide this information:

```json
{
  "title": "Movie Title",
  "year": 2011,
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "desc": "Full description of the movie",
  "genres": ["Action", "Thriller"],
  "tags": ["tag1", "tag2"]
}
```

---

## 🎯 Popular Action Movies on Plex (Reference)

Based on Plex's action collection, here are some popular titles you might want to add:

1. **Warrior** (2011)
2. **Kickboxer** (1989)
3. **Crank** (2006)
4. **Homefront** (2013)
5. **The Delta Force** (1986)
6. **Ip Man** (2008)
7. **Fist of Fury** (1972)
8. **Never Back Down** (2008)
9. **Killer Elite** (2011)
10. **Undisputed 4: Boyka** (2016)

**Next Steps:**
- Find YouTube links for these movies
- Verify they are full movies (not trailers)
- Add them using the script or manually

---

## 🔍 Finding YouTube Links

1. Go to Plex and note the movie titles
2. Search YouTube for: `"[Movie Title] [Year] full movie"`
3. Verify it's a full movie (check duration)
4. Copy the YouTube URL
5. Add to the script or provide to me

---

## ✅ Ready to Add?

If you provide me with:
- Movie titles
- Years
- YouTube URLs
- Descriptions (optional - I can generate)

I can add them to your database immediately!

