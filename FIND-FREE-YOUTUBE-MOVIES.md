# 🎬 Find Free YouTube Movies - Guide

## 📋 Overview

This tool helps you find free movies on YouTube and add them to your website automatically.

---

## 🚀 Quick Start

### Method 1: Use Your PowerShell Script

1. **Run your PowerShell method** to find YouTube movies
2. **Save results** as `youtube-movies-found.json` with this format:

```json
[
  {
    "title": "Movie Title",
    "year": 2020,
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "description": "Optional description",
    "genres": ["Action", "Thriller"],
    "tags": ["free", "youtube"]
  }
]
```

3. **Run the import script:**
```bash
node find-free-youtube-movies.cjs
```

4. **Done!** Movies are added to `movies.json`

---

### Method 2: Manual Entry

1. **Edit** `youtube-movies-found.json`
2. **Add movie objects** with title, year, and YouTube URL
3. **Run:**
```bash
node find-free-youtube-movies.cjs
```

---

## 📝 JSON Format

Each movie needs:
- `title` (required) - Movie title
- `year` (optional) - Release year
- `url` (required) - Full YouTube URL (e.g., `https://www.youtube.com/watch?v=...`)

Optional fields:
- `description` - Movie description
- `genres` - Array of genres (e.g., `["Action", "Thriller"]`)
- `tags` - Array of tags (e.g., `["free", "youtube"]`)

---

## 🔍 Finding Movies on YouTube

### Search Terms That Work:
- "free full movie"
- "full movie free youtube"
- "complete movie free"
- "public domain movies"
- "classic movies free"

### Channels That Often Have Free Movies:
- Public domain movie channels
- Official studio channels (sometimes)
- Film festival channels
- Independent filmmaker channels

---

## ⚠️ Important Notes

1. **Verify the video** is actually a full movie (not a trailer)
2. **Check copyright** - only use legally free content
3. **Test the URL** - make sure the video is still available
4. **Avoid duplicates** - script will skip movies that already exist

---

## 🛠️ Troubleshooting

**"Skipping - already exists"**
- Movie with same title already in database

**"Skipping - invalid YouTube URL"**
- URL format is wrong. Use: `https://www.youtube.com/watch?v=VIDEO_ID`

**"No PowerShell results found"**
- Make sure `youtube-movies-found.json` exists and has valid JSON

---

## 📊 Example PowerShell Output

If your PowerShell script finds movies, export them like this:

```powershell
$movies = @(
    @{
        title = "The Matrix"
        year = 1999
        url = "https://www.youtube.com/watch?v=VIDEO_ID"
    }
)

$movies | ConvertTo-Json | Out-File "youtube-movies-found.json"
```

---

## ✅ Success!

After running the script, you'll see:
- ✅ Added: Movie Title (Year)
- 💾 Saved X total movies to movies.json

Movies are now in your database and will appear on the website!

