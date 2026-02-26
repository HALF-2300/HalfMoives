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

function generateId(title, year) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') + (year ? '_' + year : '');
}

// Function to search TMDB
function searchTMDB(title, year) {
    return new Promise((resolve, reject) => {
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
                    reject(new Error('Invalid JSON'));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
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
                    reject(new Error('Invalid JSON'));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

// 20 NEW Popular English Movies (not in database yet)
// These are popular movies that should be on JustWatch Iraq
const moviesToAdd = [
    { title: "Dune", year: 2021 },
    { title: "No Time to Die", year: 2021 },
    { title: "The Batman", year: 2022 },
    { title: "Top Gun: Maverick", year: 2022 },
    { title: "Everything Everywhere All at Once", year: 2022 },
    { title: "Parasite", year: 2019 },
    { title: "Joker", year: 2019 },
    { title: "1917", year: 2019 },
    { title: "Once Upon a Time in Hollywood", year: 2019 },
    { title: "Blade Runner 2049", year: 2017 },
    { title: "Dunkirk", year: 2017 },
    { title: "La La Land", year: 2016 },
    { title: "Mad Max: Fury Road", year: 2015 },
    { title: "Whiplash", year: 2014 },
    { title: "Gravity", year: 2013 },
    { title: "Django Unchained", year: 2012 },
    { title: "Drive", year: 2011 },
    { title: "Black Swan", year: 2010 },
    { title: "Inglourious Basterds", year: 2009 },
    { title: "No Country for Old Men", year: 2007 }
];

console.log(`\n🎬 Importing 20 NEW movies with English titles + pictures from TMDB\n`);
console.log('📝 Note: Using TMDB API to get real data (English titles + posters)\n');
console.log('🌐 These movies are popular on JustWatch Iraq\n');

if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
    console.log('⚠️  WARNING: No TMDB API key provided!');
    console.log('   The script will still run but may hit rate limits.\n');
    console.log('   Get free API key: https://www.themoviedb.org/settings/api\n');
}

const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
let added = 0;
let skipped = 0;
let errors = 0;

async function importMovies() {
    for (let i = 0; i < moviesToAdd.length; i++) {
        const movieInfo = moviesToAdd[i];
        
        // Skip if already exists
        if (existingTitles.has(movieInfo.title.toLowerCase())) {
            console.log(`⏭️  [${i+1}/20] Skipping: ${movieInfo.title} (already exists)`);
            skipped++;
            continue;
        }
        
        try {
            console.log(`📥 [${i+1}/20] Fetching: ${movieInfo.title} (${movieInfo.year})...`);
            
            // Search TMDB
            const searchResult = await searchTMDB(movieInfo.title, movieInfo.year);
            
            if (searchResult.results && searchResult.results.length > 0) {
                const tmdbMovie = searchResult.results[0];
                
                // Get full details
                const details = await getMovieDetails(tmdbMovie.id);
                
                // Build poster URL
                const posterUrl = details.poster_path 
                    ? `${TMDB_IMAGE_BASE}${details.poster_path}`
                    : `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(details.title.substring(0, 20))}`;
                
                const newMovie = {
                    id: generateId(details.title, details.release_date ? new Date(details.release_date).getFullYear() : movieInfo.year),
                    title: details.title, // English title from TMDB
                    originalTitle: details.original_title || details.title,
                    year: details.release_date ? new Date(details.release_date).getFullYear() : movieInfo.year,
                    runtimeMinutes: details.runtime || null,
                    description: details.overview || `Watch ${details.title} online.`,
                    thumbnailUrl: posterUrl,
                    posterUrl: posterUrl, // Real poster from TMDB
                    hlsUrl: null, // Need YouTube link
                    youtubeEmbed: false,
                    language: 'EN',
                    genres: details.genres ? details.genres.map(g => g.name) : ['Drama'],
                    tags: details.genres ? details.genres.map(g => g.name.toLowerCase()) : ['drama'],
                    isFeatured: false,
                    director: details.credits?.crew?.find(c => c.job === 'Director')?.name || null,
                    cast: details.credits?.cast?.slice(0, 5).map(a => a.name) || null,
                    source: {
                        name: "JustWatch Iraq + TMDB",
                        url: `https://www.justwatch.com/iq/movie/${movieInfo.title.toLowerCase().replace(/\s+/g, '-')}`
                    },
                    license: {
                        type: null,
                        url: null
                    },
                    createdAt: new Date().toISOString(),
                    needsYouTubeLink: true,
                    importedFromJustWatch: true,
                    tmdbId: tmdbMovie.id
                };

                movies.push(newMovie);
                existingTitles.add(details.title.toLowerCase());
                added++;
                console.log(`✅ Added: ${details.title} (${newMovie.year}) - With poster!`);
            } else {
                console.log(`⚠️  No results found for: ${movieInfo.title}`);
                errors++;
            }
            
            // Rate limiting (TMDB allows 40 requests per 10 seconds)
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            console.log(`❌ Error: ${movieInfo.title} - ${error.message}`);
            errors++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Import completed!`);
    console.log(`   Added: ${added} movies with English titles + real posters`);
    console.log(`   Skipped: ${skipped} movies (already exist)`);
    console.log(`   Errors: ${errors} movies`);
    console.log(`   Total in database: ${movies.length}\n`);
    console.log(`⚠️  These movies need YouTube links to be playable\n`);
}

importMovies().catch(console.error);

