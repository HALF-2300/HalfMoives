const fs = require('fs');
const https = require('https');
const http = require('http');

// Read movies that need links
const moviesNeedingLinks = JSON.parse(fs.readFileSync('movies-needing-links.json', 'utf8'));
const existingLinks = JSON.parse(fs.readFileSync('youtube-links.json', 'utf8'));
const existingIds = new Set(Object.keys(existingLinks));
const moviesToFind = moviesNeedingLinks.filter(m => !existingIds.has(m.id));

console.log(`\n🔍 Searching for YouTube links for ${moviesToFind.length} movies...\n`);

// Known YouTube channels that host full movies
const fullMovieChannels = [
  'FilmRise Movies',
  'Popcornflix',
  'Maverick Movies',
  'Shout! Studios',
  'Full Moon Features',
  'Gravitas Ventures',
  'Indie Rights Movies',
  'Samuel Goldwyn Films',
  'Sci-Fi Central',
  'Universal Horror',
  'Kings of Horror',
  'DUST',
  'ALTER',
  'Omeleto',
  'Short of the Week'
];

// Function to extract video ID from YouTube search results
function extractVideoIds(html) {
  const videoIds = new Set();
  
  // Multiple patterns to find video IDs
  const patterns = [
    /"videoId":"([a-zA-Z0-9_-]{11})"/g,
    /\/watch\?v=([a-zA-Z0-9_-]{11})/g,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/g,
    /"url":"\/watch\?v=([a-zA-Z0-9_-]{11})"/g
  ];
  
  patterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length === 11) {
        videoIds.add(match[1]);
      }
    }
  });
  
  return Array.from(videoIds);
}

// Search YouTube for a movie
function searchYouTube(movieTitle, year) {
  return new Promise((resolve) => {
    // Try multiple search queries
    const queries = [
      `${movieTitle} ${year} full movie`,
      `${movieTitle} ${year} complete movie`,
      `${movieTitle} full movie`,
      `${movieTitle.replace(/:/g, '')} ${year} full movie`,
      `${movieTitle.split(':')[0]} ${year} full movie`
    ];
    
    let attempts = 0;
    const maxAttempts = queries.length;
    
    function trySearch(queryIndex) {
      if (queryIndex >= maxAttempts) {
        resolve(null);
        return;
      }
      
      const query = encodeURIComponent(queries[queryIndex]);
      const url = `https://www.youtube.com/results?search_query=${query}`;
      
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };
      
      https.get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk.toString(); });
        res.on('end', () => {
          const videoIds = extractVideoIds(data);
          
          if (videoIds.length > 0) {
            // Return the first video ID found
            resolve(`https://www.youtube.com/watch?v=${videoIds[0]}`);
          } else {
            // Try next query
            setTimeout(() => trySearch(queryIndex + 1), 500);
          }
        });
      }).on('error', () => {
        // Try next query on error
        setTimeout(() => trySearch(queryIndex + 1), 500);
      });
    }
    
    trySearch(0);
  });
}

// Simple YouTube search
function searchYouTubeSimple(title, year) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(`${title} ${year} full movie`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk.toString(); });
      res.on('end', () => {
        const videoIdMatch = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (videoIdMatch && videoIdMatch[1]) {
          resolve(`https://www.youtube.com/watch?v=${videoIdMatch[1]}`);
        } else {
          const altMatch = data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
          if (altMatch && altMatch[1]) {
            resolve(`https://www.youtube.com/watch?v=${altMatch[1]}`);
          } else {
            resolve(null);
          }
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Process movies
async function findLinks() {
  const foundLinks = {};
  const batchSize = 10;
  let foundCount = 0;
  let notFoundCount = 0;
  
  for (let i = 0; i < moviesToFind.length; i += batchSize) {
    const batch = moviesToFind.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(moviesToFind.length / batchSize);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} movies)...`);
    
    for (const movie of batch) {
      process.stdout.write(`  🔎 ${movie.title.substring(0, 50)}... `);
      
      try {
        const link = await searchYouTubeSimple(movie.title, movie.year);
        if (link) {
          foundLinks[movie.id] = link;
          foundCount++;
          console.log(`✅ Found`);
        } else {
          notFoundCount++;
          console.log(`❌ Not found`);
        }
      } catch (error) {
        notFoundCount++;
        console.log(`❌ Error`);
      }
      
      // Delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Save progress after each batch
    const allLinks = { ...existingLinks, ...foundLinks };
    fs.writeFileSync('youtube-links.json', JSON.stringify(allLinks, null, 2), 'utf8');
    
    console.log(`\n  📊 Progress: ${foundCount} found, ${notFoundCount} not found`);
  }
  
  // Final merge and save
  const allLinks = { ...existingLinks, ...foundLinks };
  fs.writeFileSync('youtube-links.json', JSON.stringify(allLinks, null, 2), 'utf8');
  
  console.log(`\n✅ Complete!`);
  console.log(`   Found: ${foundCount} new links`);
  console.log(`   Not found: ${notFoundCount}`);
  console.log(`   Total links: ${Object.keys(allLinks).length}\n`);
  
  return foundLinks;
}

// Run
findLinks().catch(console.error);

