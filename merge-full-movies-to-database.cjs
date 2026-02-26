const fs = require('fs');
const path = require('path');

console.log('\n🎬 Merging Full Movies into Database\n');

// Read existing movies
const moviesPath = path.join(__dirname, 'movies.json');
const existingMovies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));
console.log(`📊 Existing movies: ${existingMovies.length}`);

// Read new movies from API
const newMoviesPath = path.join(__dirname, 'full-movies.200.json');
if (!fs.existsSync(newMoviesPath)) {
  console.error('❌ full-movies.200.json not found!');
  process.exit(1);
}

const newMovies = JSON.parse(fs.readFileSync(newMoviesPath, 'utf8'));
console.log(`📥 New movies from API: ${newMovies.length}`);

// Create sets for duplicate checking
const existingUrls = new Set();
const existingIds = new Set();

existingMovies.forEach(movie => {
  if (movie.hlsUrl) {
    // Extract video ID from various YouTube URL formats
    const url = movie.hlsUrl;
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
      existingUrls.add(videoIdMatch[1]);
    }
  }
  if (movie.id) {
    existingIds.add(movie.id);
  }
});

console.log(`🔍 Checking for duplicates...`);

// Helper function to generate movie ID from title and year
function generateId(title, year) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50) + '_' + year;
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Convert new movies to database format
const moviesToAdd = [];
let duplicates = 0;
let added = 0;

newMovies.forEach(newMovie => {
  const videoId = extractVideoId(newMovie.youtubeUrl);
  
  // Skip if video ID already exists
  if (videoId && existingUrls.has(videoId)) {
    duplicates++;
    return;
  }
  
  // Generate ID and check for conflicts
  let movieId = generateId(newMovie.title, newMovie.year);
  let counter = 1;
  while (existingIds.has(movieId)) {
    movieId = generateId(newMovie.title, newMovie.year) + '_' + counter;
    counter++;
  }
  
  // Create movie object in database format
  const movie = {
    id: movieId,
    title: newMovie.title,
    originalTitle: newMovie.title,
    year: newMovie.year,
    runtimeMinutes: Math.floor(newMovie.durationSeconds / 60),
    description: `${newMovie.title} (${newMovie.year}) - Full movie available on YouTube.`,
    thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
    posterUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
    hlsUrl: newMovie.youtubeUrl.replace('watch?v=', 'embed/'),
    youtubeEmbed: true,
    language: "EN",
    genres: [],
    tags: [],
    isFeatured: false,
    director: null,
    cast: [],
    source: {
      name: "YouTube Full Movie",
      url: newMovie.youtubeUrl
    },
    license: {
      type: null,
      url: null
    },
    createdAt: new Date().toISOString(),
    logline: `${newMovie.title} (${newMovie.year}) - Full movie`
  };
  
  moviesToAdd.push(movie);
  if (videoId) existingUrls.add(videoId);
  existingIds.add(movieId);
  added++;
});

console.log(`\n✅ Results:`);
console.log(`   Added: ${added} new movies`);
console.log(`   Duplicates skipped: ${duplicates}`);

// Merge movies
const allMovies = [...existingMovies, ...moviesToAdd];

console.log(`\n📊 Final count: ${allMovies.length} movies`);
console.log(`   (was ${existingMovies.length}, now ${allMovies.length})`);

// Backup existing file
const backupPath = path.join(__dirname, `movies.backup.${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(existingMovies, null, 2), 'utf8');
console.log(`\n💾 Backup saved: ${path.basename(backupPath)}`);

// Save updated movies
fs.writeFileSync(moviesPath, JSON.stringify(allMovies, null, 2), 'utf8');
console.log(`✅ Updated: movies.json\n`);

// Rebuild search index
console.log('🔄 Rebuilding search index...');
try {
  const { execSync } = require('child_process');
  execSync('node rebuild-search-index.cjs', { stdio: 'inherit' });
  console.log('✅ Search index rebuilt\n');
} catch (e) {
  console.log('⚠️  Could not rebuild search index automatically');
  console.log('   Run: node rebuild-search-index.cjs\n');
}

