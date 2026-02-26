# Quick script to find YouTube movies
# Run this from your project directory!

# Navigate to project directory
$projectPath = "C:\Users\abesa\OneDrive\Documents\WorldStreamMaxSite"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "✅ Changed to project directory: $projectPath`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Project directory not found. Make sure you're in the right folder.`n" -ForegroundColor Yellow
}

# Function to encode URL (PowerShell native)
function Encode-Url {
    param([string]$text)
    return [uri]::EscapeDataString($text)
}

# Search queries
$searchQueries = @(
    "free full movie",
    "full movie free youtube",
    "complete movie free",
    "public domain movies",
    "classic movies free"
)

Write-Host "🔍 Generating YouTube search URLs...`n" -ForegroundColor Cyan

$results = @()
foreach ($query in $searchQueries) {
    $encoded = Encode-Url $query
    $searchUrl = "https://www.youtube.com/results?search_query=$encoded"
    
    $results += [PSCustomObject]@{
        Query = $query
        SearchUrl = $searchUrl
    }
    
    Write-Host "  • $query" -ForegroundColor Gray
}

# Save to file in project directory
$outputFile = Join-Path $projectPath "youtube-search-urls.json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "`n✅ Search URLs saved to: youtube-search-urls.json`n" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Open youtube-search-urls.json to see search URLs" -ForegroundColor White
Write-Host "   2. Visit each URL in your browser" -ForegroundColor White
Write-Host "   3. Find full movies (not trailers)" -ForegroundColor White
Write-Host "   4. Copy the YouTube video URLs" -ForegroundColor White
Write-Host "   5. Add them to youtube-movies-found.json" -ForegroundColor White
Write-Host "   6. Run: node find-free-youtube-movies.cjs`n" -ForegroundColor Cyan

