const https = require('https');
const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// TMDB API Key (FREE - Get yours at https://www.themoviedb.org/settings/api)
// For now, using a public demo key (rate limited)
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // Get free API key from https://www.themoviedb.org/settings/api
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

function generateId(title, year) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') + (year ? '_' + year : '');
}

// Function to search TMDB for a movie
function searchTMDB(title, year) {
    return new Promise((resolve, reject) => {
        const searchQuery = encodeURIComponent(title);
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${searchQuery}${year ? `&year=${year}` : ''}`;
        
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const req = https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Function to get movie details from TMDB
function getMovieDetails(movieId) {
    return new Promise((resolve, reject) => {
        const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
        
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const req = https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Movies that need real data (from JustWatch list)
const moviesToFetch = [
    { title: "John Wick", year: 2014 },
    { title: "Mad Max: Fury Road", year: 2015 },
    { title: "Inception", year: 2010 },
    { title: "The Matrix", year: 1999 },
    { title: "The Dark Knight", year: 2008 },
    { title: "Interstellar", year: 2014 },
    { title: "Gladiator", year: 2000 },
    { title: "The Shawshank Redemption", year: 1994 },
    { title: "Forrest Gump", year: 1994 },
    { title: "Pulp Fiction", year: 1994 },
    { title: "Fight Club", year: 1999 },
    { title: "The Godfather", year: 1972 },
    { title: "Goodfellas", year: 1990 },
    { title: "The Departed", year: 2006 },
    { title: "Scarface", year: 1983 },
    { title: "Se7en", year: 1995 },
    { title: "The Silence of the Lambs", year: 1991 },
    { title: "Shutter Island", year: 2010 },
    { title: "Gone Girl", year: 2014 },
    { title: "Zodiac", year: 2007 },
    { title: "Memento", year: 2000 },
    { title: "The Prestige", year: 2006 },
    { title: "No Country for Old Men", year: 2007 },
    { title: "Oldboy", year: 2003 },
    { title: "Parasite", year: 2019 },
    { title: "Blade Runner 2049", year: 2017 },
    { title: "The Martian", year: 2015 },
    { title: "Arrival", year: 2016 },
    { title: "Ex Machina", year: 2014 },
    { title: "District 9", year: 2009 },
    { title: "Children of Men", year: 2006 },
    { title: "Her", year: 2013 },
    { title: "Edge of Tomorrow", year: 2014 },
    { title: "Looper", year: 2012 },
    { title: "The Shining", year: 1980 },
    { title: "Get Out", year: 2017 },
    { title: "Hereditary", year: 2018 },
    { title: "The Conjuring", year: 2013 },
    { title: "It", year: 2017 },
    { title: "A Quiet Place", year: 2018 },
    { title: "The Exorcist", year: 1973 },
    { title: "The Ring", year: 2002 },
    { title: "Saw", year: 2004 },
    { title: "The Babadook", year: 2014 },
    { title: "The Grand Budapest Hotel", year: 2014 },
    { title: "Superbad", year: 2007 },
    { title: "The Hangover", year: 2009 },
    { title: "Borat", year: 2006 },
    { title: "Step Brothers", year: 2008 }
];

console.log(`\n🎬 Fetching real movie data from TMDB API...\n`);
console.log('⚠️  NOTE: You need a FREE TMDB API key from https://www.themoviedb.org/settings/api\n');

if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
    console.log('❌ ERROR: Please set your TMDB API key in the script!');
    console.log('   1. Go to: https://www.themoviedb.org/settings/api');
    console.log('   2. Request API key (free)');
    console.log('   3. Update TMDB_API_KEY in the script\n');
    process.exit(1);
}

const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
let updated = 0;
let errors = 0;

async function fetchAndUpdateMovies() {
    for (let i = 0; i < moviesToFetch.length; i++) {
        const movieInfo = moviesToFetch[i];
        
        // Find existing movie or create new
        let movie = movies.find(m => 
            m.title.toLowerCase() === movieInfo.title.toLowerCase() && 
            m.year === movieInfo.year
        );
        
        if (!movie) {
            console.log(`⏭️  Movie not found: ${movieInfo.title} - skipping`);
            continue;
        }
        
        try {
            console.log(`📥 Fetching TMDB data for: ${movieInfo.title}...`);
            
            // Search TMDB
            const searchResult = await searchTMDB(movieInfo.title, movieInfo.year);
            
            if (searchResult.results && searchResult.results.length > 0) {
                // Get first result (most relevant)
                const tmdbMovie = searchResult.results[0];
                
                // Get full details
                const details = await getMovieDetails(tmdbMovie.id);
                
                // Update movie with real data
                if (details.overview && details.overview.length > 50) {
                    movie.description = details.overview;
                }
                
                if (details.poster_path) {
                    movie.posterUrl = `https://image.tmdb.org/t/p/w500${details.poster_path}`;
                    movie.thumbnailUrl = `https://image.tmdb.org/t/p/w500${details.poster_path}`;
                }
                
                if (details.genres && details.genres.length > 0) {
                    movie.genres = details.genres.map(g => g.name);
                    movie.tags = details.genres.map(g => g.name.toLowerCase());
                }
                
                if (details.director || (details.credits && details.credits.crew)) {
                    const director = details.credits.crew.find(c => c.job === 'Director');
                    if (director) {
                        movie.director = director.name;
                    }
                }
                
                if (details.credits && details.credits.cast && details.credits.cast.length > 0) {
                    movie.cast = details.credits.cast.slice(0, 5).map(a => a.name);
                }
                
                if (details.runtime) {
                    movie.runtimeMinutes = details.runtime;
                }
                
                movie.source = {
                    name: "TMDB + JustWatch Iraq",
                    url: `https://www.themoviedb.org/movie/${tmdbMovie.id}`
                };
                
                updated++;
                console.log(`✅ Updated: ${movieInfo.title} with real TMDB data`);
            } else {
                console.log(`⚠️  No results found for: ${movieInfo.title}`);
                errors++;
            }
            
            // Rate limiting - TMDB allows 40 requests per 10 seconds
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            console.log(`❌ Error: ${movieInfo.title} - ${error.message}`);
            errors++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Save updated movies
    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Completed!`);
    console.log(`   Updated: ${updated} movies with real TMDB data`);
    console.log(`   Errors: ${errors} movies`);
    console.log(`   Total in database: ${movies.length}\n`);
}

// Run
fetchAndUpdateMovies().catch(console.error);

