const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Helper function to extract video ID from URL
function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

// Read movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

// Load manual links from file (create this file with your links)
const linksFilePath = path.join(__dirname, 'youtube-links.json');

let manualLinks = {};
if (fs.existsSync(linksFilePath)) {
  try {
    manualLinks = JSON.parse(fs.readFileSync(linksFilePath, 'utf8'));
    console.log(`✅ Loaded ${Object.keys(manualLinks).length} links from youtube-links.json\n`);
  } catch (e) {
    console.log(`⚠️  Could not load youtube-links.json, creating template...\n`);
    // Create template
    const template = {
      "interstellar_2014": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      "se7en_1995": "https://www.youtube.com/watch?v=znmZoVkCjpI",
      "gone_girl_2014": "https://www.youtube.com/watch?v=2-_-1nJf8Vg",
      // Add more links here...
      // Format: "movie_id": "youtube_url"
    };
    fs.writeFileSync(linksFilePath, JSON.stringify(template, null, 2), 'utf8');
    console.log(`📝 Created template file: youtube-links.json`);
    console.log(`   Add your YouTube links there and run this script again.\n`);
    process.exit(0);
  }
}

// Find movies without links
const moviesWithoutLinks = movies.filter(movie => {
  const hasLink = movie.hlsUrl && (
    movie.hlsUrl.includes('youtube.com/embed') ||
    movie.hlsUrl.includes('youtube.com/watch') ||
    movie.hlsUrl.includes('youtu.be/')
  );
  return !hasLink || movie.needsYouTubeLink === true;
});

console.log(`📊 Found ${moviesWithoutLinks.length} movies without YouTube links\n`);

let updated = 0;
let notFound = 0;

// Update movies with manual links
for (const movie of moviesWithoutLinks) {
  // Try to find link by ID
  if (manualLinks[movie.id]) {
    const videoId = extractVideoId(manualLinks[movie.id]);
    if (videoId) {
      movie.hlsUrl = `https://www.youtube.com/embed/${videoId}`;
      movie.youtubeEmbed = true;
      movie.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      if (!movie.posterUrl || movie.posterUrl.includes('placehold')) {
        movie.posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      movie.needsYouTubeLink = false;
      updated++;
      console.log(`✅ Updated: ${movie.title} (${movie.year || 'N/A'})`);
      continue;
    }
  }
  
  // Try to find by title + year
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
      console.log(`✅ Updated: ${movie.title} (${movie.year || 'N/A'})`);
      continue;
    }
  }
  
  notFound++;
}

// Save updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Update complete!`);
console.log(`   Updated: ${updated}`);
console.log(`   Still need links: ${notFound}\n`);

if (notFound > 0) {
  console.log(`💡 To add more links:`);
  console.log(`   1. Open: youtube-links.json`);
  console.log(`   2. Add entries in format: "movie_id": "youtube_url"`);
  console.log(`   3. Run this script again\n`);
  
  // Show some examples
  console.log(`📋 Example movies still needing links:`);
  moviesWithoutLinks.slice(0, 10).forEach((m, i) => {
    if (!m.hlsUrl || m.needsYouTubeLink) {
      console.log(`   ${i + 1}. ${m.title} (${m.year || 'N/A'}) - ID: ${m.id}`);
    }
  });
  console.log('');
}

