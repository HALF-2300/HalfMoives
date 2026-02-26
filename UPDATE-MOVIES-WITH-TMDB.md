# 🎬 Update Movies with TMDB API

## Step 1: Set Your API Key

### Option A: Environment Variable (Recommended)
```bash
# Windows PowerShell
$env:TMDB_API_KEY="your_api_key_here"
node update-movies-with-tmdb-metadata.cjs

# Windows CMD
set TMDB_API_KEY=your_api_key_here
node update-movies-with-tmdb-metadata.cjs
```

### Option B: Edit Script Directly
Open `update-movies-with-tmdb-metadata.cjs` and replace:
```javascript
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE';
```
with:
```javascript
const TMDB_API_KEY = 'your_actual_api_key_here';
```

## Step 2: Run the Script

```bash
node update-movies-with-tmdb-metadata.cjs
```

## What It Does

✅ Fetches proper titles from TMDB
✅ Gets high-quality posters (w500 resolution)
✅ Updates descriptions
✅ Adds director and cast information
✅ Updates genres
✅ Adds runtime information

## Expected Output

```
📚 Updating 164 movies with TMDB metadata...

📥 [1/164] Fetching: The Possession of Michael King (2014)...
   ✅ Updated: The Possession of Michael King (2014)
📥 [2/164] Fetching: The Devil's Candy (2015)...
   ✅ Updated: The Devil's Candy (2015)
...
✅ Update complete!
   Updated: 150+
   Skipped: 10
   Not found: 4
```

## Step 3: Rebuild Search Index

```bash
node rebuild-search-index.cjs
```

## Step 4: Upload to Server

Upload these updated files:
- `movies.json`
- `searchIndex.json`

## Notes

- ⏱️ Script includes rate limiting (300ms delay between requests)
- 🔄 If a movie already has a TMDB poster, it will be skipped
- ⚠️ Some movies might not be found in TMDB (especially obscure ones)
- 📸 All posters will be high-quality TMDB images

