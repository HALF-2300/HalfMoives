# 🔑 How to Get a Valid YouTube Data API Key

## ❌ Problem
The API key `86674e62869c10dfe32bd32178026942` is **NOT valid** for YouTube Data API.

## ✅ Solution: Get a Real API Key

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create a New Project (or select existing)
1. Click the project dropdown at the top
2. Click "New Project"
3. Name it: "YouTube Movies" (or any name)
4. Click "Create"

### Step 3: Enable YouTube Data API v3
1. Go to: https://console.cloud.google.com/apis/library/youtube.googleapis.com
2. Click "Enable"

### Step 4: Create API Credentials
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "API Key"
3. Copy the API key (it will look like: `AIzaSy...` - much longer than what you have)

### Step 5: Restrict the API Key (Optional but Recommended)
1. Click on your new API key to edit it
2. Under "API restrictions", select "Restrict key"
3. Choose "YouTube Data API v3"
4. Click "Save"

## 🚀 Use Your New API Key

Once you have the real API key, run:

```powershell
$env:YT_API_KEY="YOUR_REAL_API_KEY_HERE"
$env:TARGET="200"
node .\make-full-movies-api.mjs
```

## 📝 Notes

- YouTube API keys start with `AIza` and are much longer (39 characters)
- Free tier: 10,000 units per day
- Each search = 100 units, each video details = 1 unit
- For 200 movies, you'll need ~20,000-30,000 units (may need to wait or upgrade)

## ⚠️ Important

The key you provided (`86674e62869c10dfe32bd32178026942`) is:
- Too short (YouTube keys are 39 characters)
- Wrong format (should start with `AIza`)
- Not a valid YouTube Data API key

You **MUST** get a real API key from Google Cloud Console.

