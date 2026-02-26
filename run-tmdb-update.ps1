# PowerShell script to update movies with TMDB API
# Usage: .\run-tmdb-update.ps1

Write-Host "`n🎬 TMDB Movie Updater`n" -ForegroundColor Cyan

# Check if API key is provided
if ($args.Count -eq 0) {
    Write-Host "❌ Please provide your TMDB API key as an argument" -ForegroundColor Red
    Write-Host "`nUsage: .\run-tmdb-update.ps1 YOUR_API_KEY_HERE`n" -ForegroundColor Yellow
    Write-Host "Or set it manually:" -ForegroundColor Yellow
    Write-Host "  `$env:TMDB_API_KEY='your_key_here'" -ForegroundColor White
    Write-Host "  node update-movies-with-tmdb-metadata.cjs`n" -ForegroundColor White
    exit 1
}

$apiKey = $args[0]
$env:TMDB_API_KEY = $apiKey

Write-Host "✅ API key set!" -ForegroundColor Green
Write-Host "📥 Starting movie update (ALL movies)...`n" -ForegroundColor Cyan

node update-all-movies-tmdb.cjs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Update complete! Rebuilding search index...`n" -ForegroundColor Green
    node rebuild-search-index.cjs
    Write-Host "`n🎉 All done! Upload movies.json and searchIndex.json to your server.`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Update failed. Check the error messages above.`n" -ForegroundColor Red
}

