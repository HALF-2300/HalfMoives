# 🚀 Quick Start: Update ALL Movies with TMDB

## You have your API key? Great! Here's what to do:

### Option 1: PowerShell Script (Easiest)

```powershell
.\run-tmdb-update.ps1 YOUR_API_KEY_HERE
```

### Option 2: Manual Steps

**Step 1:** Set the API key in PowerShell:
```powershell
$env:TMDB_API_KEY="your_api_key_here"
```

**Step 2:** Run the update script (updates ALL movies that need it):
```powershell
node update-all-movies-tmdb.cjs
```

**Step 3:** Rebuild search index:
```powershell
node rebuild-search-index.cjs
```

**Step 4:** Upload to server:
- `movies.json`
- `searchIndex.json`

---

## What Will Happen?

✅ **~365 movies** will be updated (out of 653 total) with:
- Proper titles
- High-quality TMDB posters (w500 resolution)
- Full descriptions
- Director and cast information
- Correct genres
- Runtime information

⏱️ **Time:** ~15-20 minutes (due to rate limiting - 300ms delay between requests)

📊 **Current Status:**
- Total movies: **653**
- Need updates: **365**
- Already good: **288**

---

## Example Output

```
📚 Updating 164 movies with TMDB metadata...

📥 [1/164] Fetching: The Possession of Michael King (2014)...
   ✅ Updated: The Possession of Michael King (2014)
📥 [2/164] Fetching: The Devil's Candy (2015)...
   ✅ Updated: The Devil's Candy (2015)
...

✅ Update complete!
   Updated: 150
   Skipped: 10
   Not found: 4
```

---

## Troubleshooting

**Error: "TMDB API key not set"**
- Make sure you set the environment variable correctly
- Or edit the script and put your key directly in line 8

**Error: "Request timeout"**
- TMDB might be slow, the script will retry
- Check your internet connection

**Some movies not found:**
- Normal! Some obscure movies might not be in TMDB
- They'll keep their existing data

