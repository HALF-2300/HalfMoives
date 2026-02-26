const https = require('https');
const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// TMDB API Key - Get free from https://www.themoviedb.org/settings/api
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

// Function to search TMDB
function searchTMDB(title, year) {
  return new Promise((resolve, reject) => {
    if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
      reject(new Error('TMDB API key not set'));
      return;
    }
    
    const query = encodeURIComponent(title);
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}${year ? `&year=${year}` : ''}`;
    
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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

// Function to get movie details
function getMovieDetails(movieId) {
  return new Promise((resolve, reject) => {
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    
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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

// Check if movie needs updating
function needsUpdate(movie) {
  // Needs update if:
  // 1. No poster or placeholder poster
  const hasBadPoster = !movie.posterUrl || 
                       movie.posterUrl.includes('placehold.co') || 
                       movie.posterUrl.includes('img.youtube.com');
  
  // 2. No description or generic description
  const hasBadDescription = !movie.description || 
                            movie.description.length < 50 || 
                            movie.description.includes('Watch on') ||
                            movie.description.includes('Watch ') && movie.description.length < 100;
  
  // 3. No director or cast
  const missingInfo = !movie.director || !movie.cast || movie.cast.length === 0;
  
  return hasBadPoster || hasBadDescription || missingInfo;
}

// Main update function
let updated = 0;
let skipped = 0;
let notFound = 0;
let errors = 0;

async function updateAllMovies() {
  console.log(`\n📚 Analyzing ${movies.length} movies...\n`);
  
  if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
    console.log('❌ ERROR: TMDB API key not set!');
    console.log('   Set it as environment variable: TMDB_API_KEY=your_key_here');
    console.log('   Or get a free key from: https://www.themoviedb.org/settings/api\n');
    return;
  }
  
  // Filter movies that need updating
  const moviesToUpdate = movies.filter(needsUpdate);
  
  console.log(`📊 Movies needing updates: ${moviesToUpdate.length} out of ${movies.length}\n`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(moviesToUpdate.length * 0.4 / 60)} minutes\n`);
  
  for (let i = 0; i < moviesToUpdate.length; i++) {
    const movie = moviesToUpdate[i];
    
    // Skip if already has good TMDB poster
    if (movie.posterUrl && 
        movie.posterUrl.includes('tmdb.org') && 
        !movie.posterUrl.includes('placehold') &&
        movie.description && 
        movie.description.length > 50) {
      console.log(`⏭️  [${i+1}/${moviesToUpdate.length}] Already has TMDB data: ${movie.title}`);
      skipped++;
      continue;
    }
    
    // Skip if no title
    if (!movie.title || movie.title.length < 3) {
      console.log(`⏭️  [${i+1}/${moviesToUpdate.length}] Skipping: No valid title`);
      skipped++;
      continue;
    }
    
    try {
      console.log(`📥 [${i+1}/${moviesToUpdate.length}] Fetching: ${movie.title} (${movie.year || 'N/A'})...`);
      
      // Search TMDB
      const searchResult = await searchTMDB(movie.title, movie.year);
      
      if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
        console.log(`   ⚠️  Not found in TMDB`);
        notFound++;
        continue;
      }
      
      // Get first result
      const tmdbMovie = searchResult.results[0];
      
      // Get full details
      const details = await getMovieDetails(tmdbMovie.id);
      
      if (!details) {
        console.log(`   ⚠️  Could not get details`);
        notFound++;
        continue;
      }
      
      // Update movie
      let changed = false;
      
      // Update title if better
      if (details.title && details.title !== movie.title) {
        movie.title = details.title;
        movie.originalTitle = details.original_title || movie.title;
        changed = true;
      }
      
      // Update description
      if (details.overview && details.overview.length > 50) {
        if (!movie.description || movie.description.length < details.overview.length) {
          movie.description = details.overview;
          changed = true;
        }
      }
      
      // Update poster
      if (details.poster_path) {
        const newPosterUrl = `${TMDB_IMAGE_BASE}${details.poster_path}`;
        if (!movie.posterUrl || movie.posterUrl.includes('placehold') || movie.posterUrl.includes('img.youtube.com')) {
          movie.posterUrl = newPosterUrl;
          movie.thumbnailUrl = newPosterUrl;
          changed = true;
        }
      }
      
      // Update genres
      if (details.genres && details.genres.length > 0) {
        const newGenres = details.genres.map(g => g.name);
        if (!movie.genres || movie.genres.length === 0 || JSON.stringify(movie.genres) !== JSON.stringify(newGenres)) {
          movie.genres = newGenres;
          movie.tags = newGenres.map(g => g.toLowerCase());
          changed = true;
        }
      }
      
      // Update director
      if (details.credits && details.credits.crew) {
        const director = details.credits.crew.find(c => c.job === 'Director');
        if (director && (!movie.director || movie.director !== director.name)) {
          movie.director = director.name;
          changed = true;
        }
      }
      
      // Update cast
      if (details.credits && details.credits.cast && details.credits.cast.length > 0) {
        const newCast = details.credits.cast.slice(0, 5).map(a => a.name);
        if (!movie.cast || movie.cast.length === 0 || JSON.stringify(movie.cast) !== JSON.stringify(newCast)) {
          movie.cast = newCast;
          changed = true;
        }
      }
      
      // Update runtime
      if (details.runtime && (!movie.runtimeMinutes || movie.runtimeMinutes !== details.runtime)) {
        movie.runtimeMinutes = details.runtime;
        changed = true;
      }
      
      // Update year if missing
      if (details.release_date && !movie.year) {
        const releaseYear = new Date(details.release_date).getFullYear();
        if (releaseYear) {
          movie.year = releaseYear;
          changed = true;
        }
      }
      
      // Update logline
      if (movie.description) {
        movie.logline = movie.description.substring(0, 100);
      }
      
      if (changed) {
        updated++;
        console.log(`   ✅ Updated: ${movie.title} (${movie.year || 'N/A'})`);
      } else {
        skipped++;
        console.log(`   ⏭️  No changes needed`);
      }
      
      // Rate limiting (300ms delay)
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errors++;
    }
  }
  
  // Save updated movies
  fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
  
  console.log(`\n✅ Update complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n📊 Total movies in database: ${movies.length}\n`);
}

updateAllMovies().catch(console.error);

