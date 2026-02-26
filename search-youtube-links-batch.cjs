const fs = require('fs');
const https = require('https');

// Read movies
const moviesNeedingLinks = JSON.parse(fs.readFileSync('movies-needing-links.json', 'utf8'));
const existingLinks = JSON.parse(fs.readFileSync('youtube-links.json', 'utf8'));
const existingIds = new Set(Object.keys(existingLinks));
const moviesToFind = moviesNeedingLinks.filter(m => !existingIds.has(m.id));

console.log(`\n🔍 Will search for ${moviesToFind.length} movies...\n`);

// Test with first 10 movies
const testMovies = moviesToFind.slice(0, 10);

console.log(`Testing with ${testMovies.length} movies first:\n`);

// Simple YouTube search using their search page
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
        // Look for video IDs in the HTML
        const videoIdMatch = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (videoIdMatch && videoIdMatch[1]) {
          resolve(`https://www.youtube.com/watch?v=${videoIdMatch[1]}`);
        } else {
          // Try alternative pattern
          const altMatch = data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
          if (altMatch && altMatch[1]) {
            resolve(`https://www.youtube.com/watch?v=${altMatch[1]}`);
          } else {
            resolve(null);
          }
        }
      });
    }).on('error', (err) => {
      console.error(`  Error searching: ${err.message}`);
      resolve(null);
    });
  });
}

// Process test movies
async function testSearch() {
  const foundLinks = {};
  
  for (const movie of testMovies) {
    process.stdout.write(`🔎 ${movie.title.substring(0, 40).padEnd(40)}... `);
    
    try {
      const link = await searchYouTubeSimple(movie.title, movie.year);
      if (link) {
        foundLinks[movie.id] = link;
        console.log(`✅ ${link}`);
      } else {
        console.log(`❌ Not found`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Merge and save
  const allLinks = { ...existingLinks, ...foundLinks };
  fs.writeFileSync('youtube-links.json', JSON.stringify(allLinks, null, 2), 'utf8');
  
  console.log(`\n✅ Test complete!`);
  console.log(`   Found: ${Object.keys(foundLinks).length} links`);
  console.log(`   Total links now: ${Object.keys(allLinks).length}\n`);
  
  if (Object.keys(foundLinks).length > 0) {
    console.log('✅ Script works! Run it on all movies with:');
    console.log('   node find-and-add-youtube-links.cjs\n');
  }
}

testSearch().catch(console.error);

