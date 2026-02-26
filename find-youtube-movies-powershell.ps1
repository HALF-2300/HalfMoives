# PowerShell Script to Find Free Movies on YouTube
# This script searches YouTube for free full movies and exports results

# Search queries for finding free movies
$searchQueries = @(
    "free full movie",
    "full movie free youtube",
    "complete movie free",
    "free movie online",
    "public domain movies",
    "classic movies free"
)

# You can also search for specific genres
$genreQueries = @(
    "action movie free full",
    "comedy movie free full",
    "drama movie free full",
    "horror movie free full",
    "sci-fi movie free full"
)

# Function to search YouTube (using web scraping or API)
function Search-YouTubeMovies {
    param(
        [string]$Query,
        [int]$MaxResults = 10
    )
    
    # Encode the query (PowerShell native method)
    $encodedQuery = [uri]::EscapeDataString($Query)
    $searchUrl = "https://www.youtube.com/results?search_query=$encodedQuery"
    
    Write-Host "🔍 Searching: $Query" -ForegroundColor Cyan
    
    # Note: This is a template. You'll need to:
    # 1. Use YouTube API (requires API key)
    # 2. Or use web scraping (may violate ToS)
    # 3. Or manually visit URLs and extract video IDs
    
    # For now, return search URLs that you can visit manually
    return @{
        Query = $Query
        SearchUrl = $searchUrl
    }
}

# Collect results
$results = @()

Write-Host "`n🎬 Finding Free YouTube Movies`n" -ForegroundColor Green
Write-Host ("=" * 50)

# Search for each query
foreach ($query in $searchQueries) {
    $result = Search-YouTubeMovies -Query $query
    $results += $result
}

# Export results to JSON
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath "youtube-search-results.json" -Encoding UTF8

Write-Host "`n✅ Search URLs saved to: youtube-search-results.json" -ForegroundColor Green
Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Visit the search URLs in your browser" -ForegroundColor White
Write-Host "   2. Find full movies (not trailers)" -ForegroundColor White
Write-Host "   3. Copy the YouTube video URLs" -ForegroundColor White
Write-Host "   4. Create youtube-movies-found.json with format:" -ForegroundColor White
Write-Host "      [" -ForegroundColor Gray
Write-Host "        {" -ForegroundColor Gray
Write-Host "          `"title`": `"Movie Title`"," -ForegroundColor Gray
Write-Host "          `"year`": 2020," -ForegroundColor Gray
Write-Host "          `"url`": `"https://youtube.com/watch?v=...`"" -ForegroundColor Gray
Write-Host "        }" -ForegroundColor Gray
Write-Host "      ]" -ForegroundColor Gray
Write-Host "`n   5. Run: node find-free-youtube-movies.cjs`n" -ForegroundColor Cyan

