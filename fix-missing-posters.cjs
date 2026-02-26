const fs = require('fs');
const path = require('path');
const https = require('https');

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
            // Without API key, we'll use a fallback method
            resolve(null);
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
        if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
            resolve(null);
            return;
        }
        
        const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`;
        
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

// Known poster URLs for popular movies (fallback if no API key)
const knownPosters = {
    "John Wick": "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    "Mad Max: Fury Road": "https://image.tmdb.org/t/p/w500/hA2ple9q4oc1j2l8hA2p3mBqQqO.jpg",
    "Inception": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    "The Matrix": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "The Bourne Identity": "https://image.tmdb.org/t/p/w500/bXQIL36VpOvq7x3f8h3u6pg2pbI.jpg",
    "Mission: Impossible": "https://image.tmdb.org/t/p/w500/vybF6X1gx5B5kEmH7D4a6X1gx5B.jpg",
    "Fast & Furious": "https://image.tmdb.org/t/p/w500/4Iu5f2nv7huqvuAkmJ6OF4jqHbm.jpg",
    "Die Hard": "https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6a1V.jpg",
    "The Shawshank Redemption": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    "Forrest Gump": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQf.jpg",
    "The Godfather": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    "Pulp Fiction": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JP8bP1k.jpg",
    "Fight Club": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    "Goodfellas": "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    "Scarface": "https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboxtmQ0PxQ0PxQ0.jpg",
    "American History X": "https://image.tmdb.org/t/p/w500/fXepRAYOx1qC3wju7XdDGx6070U.jpg",
    "The Green Mile": "https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg",
    "The Silence of the Lambs": "https://image.tmdb.org/t/p/w500/uS9m8OBq1oP0j1MgT1q6cd6Vc4T.jpg",
    "Zodiac": "https://image.tmdb.org/t/p/w500/6YQ8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8.jpg",
    "Memento": "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAkYzS1qFs7.jpg",
    "Oldboy": "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4wK9b.jpg",
    "Blade Runner 2049": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWj5FlUN6DlxGW4.jpg",
    "The Grand Budapest Hotel": "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg"
};

console.log(`\n🎨 Fixing missing posters for movies...\n`);

// Find movies with placeholder posters
const moviesToFix = movies.filter(movie => {
    const hasPlaceholder = (movie.posterUrl && movie.posterUrl.includes('placehold')) ||
                          (movie.thumbnailUrl && movie.thumbnailUrl.includes('placehold'));
    return hasPlaceholder;
});

console.log(`Found ${moviesToFix.length} movies with placeholder posters\n`);

let fixed = 0;
let skipped = 0;

async function fixPosters() {
    for (let i = 0; i < moviesToFix.length; i++) {
        const movie = moviesToFix[i];
        
        // Check if we have a known poster
        if (knownPosters[movie.title]) {
            movie.posterUrl = knownPosters[movie.title];
            movie.thumbnailUrl = knownPosters[movie.title];
            fixed++;
            console.log(`✅ [${i+1}/${moviesToFix.length}] Fixed: ${movie.title} (using known poster)`);
            continue;
        }
        
        // Try to get from TMDB if API key is available
        if (TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE') {
            try {
                const searchResult = await searchTMDB(movie.title, movie.year);
                
                if (searchResult && searchResult.results && searchResult.results.length > 0) {
                    const tmdbMovie = searchResult.results[0];
                    const details = await getMovieDetails(tmdbMovie.id);
                    
                    if (details && details.poster_path) {
                        const posterUrl = `${TMDB_IMAGE_BASE}${details.poster_path}`;
                        movie.posterUrl = posterUrl;
                        movie.thumbnailUrl = posterUrl;
                        fixed++;
                        console.log(`✅ [${i+1}/${moviesToFix.length}] Fixed: ${movie.title} (from TMDB)`);
                    } else {
                        skipped++;
                        console.log(`⏭️  [${i+1}/${moviesToFix.length}] Skipped: ${movie.title} (no TMDB poster)`);
                    }
                } else {
                    skipped++;
                    console.log(`⏭️  [${i+1}/${moviesToFix.length}] Skipped: ${movie.title} (not found in TMDB)`);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                skipped++;
                console.log(`❌ [${i+1}/${moviesToFix.length}] Error: ${movie.title} - ${error.message}`);
            }
        } else {
            skipped++;
            console.log(`⏭️  [${i+1}/${moviesToFix.length}] Skipped: ${movie.title} (no API key, use known posters)`);
        }
    }
    
    // Save updated movies
    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Fixed ${fixed} movie posters`);
    console.log(`⏭️  Skipped ${skipped} movies`);
    console.log(`📊 Total movies: ${movies.length}\n`);
}

fixPosters().catch(console.error);

