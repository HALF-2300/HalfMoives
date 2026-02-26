const https = require('https');
const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// YouTube Data API v3 Key (optional - get from https://console.cloud.google.com/)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// Read movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

// Helper function to extract video ID from URL
function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

// Search YouTube using API
function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    if (!YOUTUBE_API_KEY) {
      resolve(null);
      return;
    }
    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items && json.items.length > 0) {
            // Return first result
            resolve(json.items[0]);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

// Manual links mapping (you can add links here)
const manualLinks = {
  // Add YouTube links here manually
  // Format: "Movie Title (Year)": "https://www.youtube.com/watch?v=VIDEO_ID"
  // Example:
  // "Interstellar (2014)": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
  // "Se7en (1995)": "https://www.youtube.com/watch?v=znmZoVkCjpI",
};

// Find movies without links
const moviesWithoutLinks = movies.filter(movie => {
  const hasLink = movie.hlsUrl && (
    movie.hlsUrl.includes('youtube.com/embed') ||
    movie.hlsUrl.includes('youtube.com/watch') ||
    movie.hlsUrl.includes('youtu.be/')
  );
  return !hasLink || movie.needsYouTubeLink === true;
});

console.log(`\n📊 Found ${moviesWithoutLinks.length} movies without YouTube links\n`);

let updated = 0;
let notFound = 0;
let skipped = 0;

async function addLinks() {
  // First, check manual links
  for (const movie of moviesWithoutLinks) {
    const key = `${movie.title} (${movie.year || 'N/A'})`;
    
    if (manualLinks[key]) {
      const videoId = extractVideoId(manualLinks[key]);
      if (videoId) {
        movie.hlsUrl = `https://www.youtube.com/embed/${videoId}`;
        movie.youtubeEmbed = true;
        movie.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        if (!movie.posterUrl || movie.posterUrl.includes('placehold')) {
          movie.posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        movie.needsYouTubeLink = false;
        updated++;
        console.log(`✅ Updated from manual link: ${movie.title}`);
        continue;
      }
    }
    
    // Try YouTube API search if available
    if (YOUTUBE_API_KEY) {
      try {
        const searchQuery = `${movie.title} ${movie.year || ''} full movie`;
        console.log(`🔍 Searching YouTube: ${searchQuery}...`);
        
        const result = await searchYouTube(searchQuery);
        
        if (result && result.id && result.id.videoId) {
          const videoId = result.id.videoId;
          movie.hlsUrl = `https://www.youtube.com/embed/${videoId}`;
          movie.youtubeEmbed = true;
          movie.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          if (!movie.posterUrl || movie.posterUrl.includes('placehold')) {
            movie.posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
          movie.needsYouTubeLink = false;
          updated++;
          console.log(`   ✅ Found: ${result.snippet.title}`);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          notFound++;
          console.log(`   ⚠️  Not found`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        notFound++;
      }
    } else {
      skipped++;
    }
  }
  
  // Save updated movies
  fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
  
  console.log(`\n✅ Update complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Skipped (no API key): ${skipped}\n`);
  
  if (!YOUTUBE_API_KEY && skipped > 0) {
    console.log(`💡 To use YouTube API search:`);
    console.log(`   1. Get API key from: https://console.cloud.google.com/`);
    console.log(`   2. Enable YouTube Data API v3`);
    console.log(`   3. Set: $env:YOUTUBE_API_KEY="your_key_here"`);
    console.log(`   4. Or add links manually in the script\n`);
  }
}

// If no API key, show instructions
if (!YOUTUBE_API_KEY) {
  console.log(`\n⚠️  No YouTube API key found.\n`);
  console.log(`Options:`);
  console.log(`1. Add links manually in the script (see manualLinks object)`);
  console.log(`2. Get YouTube API key and set it as environment variable\n`);
  console.log(`For now, showing movies that need links...\n`);
}

addLinks().catch(console.error);

