# ⚠️ YouTube Data API v3 Not Enabled

## Problem
Your API key is **valid**, but **YouTube Data API v3 is disabled** in your Google Cloud project.

## Quick Fix

### Option 1: Direct Link (Easiest)
Click this link to enable it:
**https://console.developers.google.com/apis/api/youtube.googleapis.com/overview?project=822996732142**

Then click the **"Enable"** button.

### Option 2: Manual Steps
1. Go to: https://console.cloud.google.com/
2. Make sure project **822996732142** is selected
3. Go to: **APIs & Services** → **Library**
4. Search for: **"YouTube Data API v3"**
5. Click **"Enable"**

### Wait
After enabling, wait **1-2 minutes** for Google to activate it.

### Then Run Again
```powershell
$env:YT_API_KEY="AIzaSyDtGAhvBI9T5CdqLMt1XZRq5zFsiBOpv-s"
$env:TARGET="200"
node .\make-full-movies-api.mjs
```

---

**Status:** API key is valid ✅, but API is disabled ❌
