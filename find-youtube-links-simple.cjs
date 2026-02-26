const fs = require('fs');
const https = require('https');

// This script uses a simpler approach: direct YouTube search URLs
// You can manually visit these URLs to find the actual video links

const moviesNeedingLinks = JSON.parse(fs.readFileSync('movies-needing-links.json', 'utf8'));
const existingLinks = JSON.parse(fs.readFileSync('youtube-links.json', 'utf8'));
const existingIds = new Set(Object.keys(existingLinks));
const moviesToFind = moviesNeedingLinks.filter(m => !existingIds.has(m.id));

console.log(`\n📋 Generating YouTube search URLs for ${moviesToFind.length} movies...\n`);

// Generate search URLs
const searchUrls = moviesToFind.map(movie => {
  const query = encodeURIComponent(`${movie.title} ${movie.year} full movie`);
  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    searchUrl: `https://www.youtube.com/results?search_query=${query}`
  };
});

// Save to file for manual review
fs.writeFileSync('youtube-search-urls.json', JSON.stringify(searchUrls, null, 2), 'utf8');

console.log(`✅ Generated ${searchUrls.length} search URLs`);
console.log(`📄 Saved to: youtube-search-urls.json\n`);

// Also create a simple HTML file to open all searches
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>YouTube Movie Searches</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .movie { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>YouTube Search Links for Movies</h1>
  <p>Click each link to search YouTube, then copy the video URL and add it to youtube-links.json</p>
  ${searchUrls.map(m => `
    <div class="movie">
      <strong>${m.title} (${m.year})</strong><br>
      <a href="${m.searchUrl}" target="_blank">Search YouTube</a> | 
      ID: <code>${m.id}</code>
    </div>
  `).join('')}
</body>
</html>`;

fs.writeFileSync('youtube-searches.html', htmlContent, 'utf8');
console.log(`🌐 Also created: youtube-searches.html`);
console.log(`   Open this file in your browser to access all search links!\n`);

