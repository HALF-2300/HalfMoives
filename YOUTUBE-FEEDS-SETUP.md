# 🎬 YouTube Feeds Setup - Complete Package

## ✅ Files Created

1. ✅ `channels.movies.json` - Your YouTube channels list (25 channels)
2. ✅ `youtube.mjs` - Converter + Validator
3. ✅ `build-site-feeds.mjs` - Clean site-feeds.json builder

---

## 🚀 Quick Start

### Step 1: Convert Channels to Feeds

```powershell
node youtube.mjs
```

This will create:
- ✅ `feeds.valid.json` (valid feeds)
- ❌ `feeds.invalid.json` (invalid feeds)

### Step 2: Build Clean Site File (Optional)

```powershell
node build-site-feeds.mjs
```

This creates:
- ✅ `site-feeds.json` (clean format for website)

---

## 📋 What You'll Get

After running `youtube.mjs`, you'll have:

**`feeds.valid.json`** - Contains:
```json
[
  {
    "name": "Movieclips",
    "url": "https://www.youtube.com/@movieclips",
    "channelId": "UC...",
    "feedUrl": "https://www.youtube.com/feeds/videos.xml?channel_id=UC..."
  },
  ...
]
```

**`site-feeds.json`** - Contains (after running build-site-feeds.mjs):
```json
[
  {
    "name": "Movieclips",
    "feedUrl": "https://www.youtube.com/feeds/videos.xml?channel_id=UC..."
  },
  ...
]
```

---

## 🌐 Website Integration

Your website needs to:

1. **Fetch the feeds list** (`site-feeds.json` or `feeds.valid.json`)
2. **Fetch each RSS feed** (via `/api/rss` endpoint - CORS protection)
3. **Parse RSS XML** and extract video data
4. **Display in your movie grid**

### ⚠️ Important: CORS Issue

Browsers **cannot** fetch YouTube RSS feeds directly (CORS blocks it).

**Solution:** You need a server endpoint like `/api/rss?url=ENCODED_FEED_URL`

---

## 🔧 Next Step: Tell Me Your Hosting

To provide the exact `/api/rss` endpoint code, I need to know:

**Where is HalfMovies hosted?**

1. **Netlify**
2. **Vercel**
3. **Hostinger**
4. **VPS / Node server**
5. **Static only (no backend)**

Reply with the number, and I'll create the exact working `/api/rss` file for your setup.

---

## 📝 Notes

- The scripts use ES modules (`.mjs` files)
- Rate limiting: 250ms delay between requests
- Progress shown every 10 channels
- Invalid channels saved to `feeds.invalid.json` for review

---

## 🎯 After Setup

Once you have:
- ✅ `feeds.valid.json` or `site-feeds.json`
- ✅ `/api/rss` endpoint (I'll provide this)

Your website will:
1. Load feeds list
2. Fetch videos from all feeds
3. Merge into one "Movies" library
4. Display in your grid

---

**Ready to test?** Run `node youtube.mjs` and let me know your hosting type!

