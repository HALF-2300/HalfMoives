const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read movies that need links
const moviesNeedingLinks = JSON.parse(fs.readFileSync('movies-needing-links.json', 'utf8'));
const existingLinks = JSON.parse(fs.readFileSync('youtube-links.json', 'utf8'));

// Movies we already have links for
const existingIds = new Set(Object.keys(existingLinks));

// Filter out movies we already have
const moviesToFind = moviesNeedingLinks.filter(m => !existingIds.has(m.id));

console.log(`\n🔍 Searching for YouTube links for ${moviesToFind.length} movies...\n`);

// YouTube search function using web scraping
function searchYouTube(movieTitle, year) {
  return new Promise((resolve) => {
    const searchQuery = encodeURIComponent(`${movieTitle} ${year} full movie`);
    const url = `https://www.youtube.com/results?search_query=${searchQuery}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Extract video IDs from YouTube search results
        const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        const matches = [...data.matchAll(videoIdRegex)];
        const videoIds = [...new Set(matches.map(m => m[1]))].slice(0, 5);
        
        // Try to find the best match (longer videos are more likely to be full movies)
        if (videoIds.length > 0) {
          resolve(`https://www.youtube.com/watch?v=${videoIds[0]}`);
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Alternative: Use YouTube oEmbed API to search
async function findYouTubeLink(movie) {
  const searchQuery = `${movie.title} ${movie.year} full movie`;
  
  // Try multiple search strategies
  const strategies = [
    searchYouTube(movie.title, movie.year),
    searchYouTube(movie.title.replace(/:/g, ''), movie.year),
    searchYouTube(movie.title.split(':')[0], movie.year),
  ];
  
  for (const strategy of strategies) {
    const link = await strategy;
    if (link) {
      return link;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return null;
}

// Process movies in batches
async function processMovies() {
  const foundLinks = {};
  const batchSize = 10;
  
  for (let i = 0; i < moviesToFind.length; i += batchSize) {
    const batch = moviesToFind.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(moviesToFind.length / batchSize)}...`);
    
    for (const movie of batch) {
      process.stdout.write(`  🔎 ${movie.title} (${movie.year})... `);
      
      try {
        const link = await findYouTubeLink(movie);
        if (link) {
          foundLinks[movie.id] = link;
          console.log(`✅ Found: ${link}`);
        } else {
          console.log(`❌ Not found`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Merge with existing links
  const allLinks = { ...existingLinks, ...foundLinks };
  
  // Save updated links
  fs.writeFileSync('youtube-links.json', JSON.stringify(allLinks, null, 2), 'utf8');
  
  console.log(`\n✅ Found ${Object.keys(foundLinks).length} new links!`);
  console.log(`📊 Total links: ${Object.keys(allLinks).length}\n`);
  
  return foundLinks;
}

// Run the search
processMovies().catch(console.error);

