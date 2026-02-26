# YouTube Full Movies API - Complete PowerShell Commands
# Run these commands in order:

# A) Set API Key
$env:YT_API_KEY="86674e62869c10dfe32bd32178026942"

# B) Set Target and Run Script
$env:TARGET="200"
node .\make-full-movies-api.mjs

# C) Verify Results
Write-Host "`n✅ Verification:" -ForegroundColor Green
$count = ( Get-Content .\full-movies.200.json -Raw | ConvertFrom-Json ).Count
Write-Host "   Found $count movies in full-movies.200.json" -ForegroundColor Cyan

