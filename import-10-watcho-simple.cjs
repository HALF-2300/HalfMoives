const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

function generateId(title, year) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') + (year ? '_' + year : '');
}

// Function to fetch HTML from Watcho
function fetchWatchoPage(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive'
            }
        };

        const client = urlObj.protocol === 'https:' ? https : http;
        const req = client.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

// Function to extract movie data from Watcho HTML
function parseWatchoMovie(html, movieUrl) {
    try {
        // Try JSON-LD
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
        if (jsonLdMatches) {
            for (const match of jsonLdMatches) {
                try {
                    const jsonStr = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '');
                    const jsonData = JSON.parse(jsonStr);
                    if (jsonData['@type'] === 'Movie' || jsonData['@type'] === 'VideoObject') {
                        return {
                            title: jsonData.name || jsonData.headline,
                            year: jsonData.datePublished ? new Date(jsonData.datePublished).getFullYear() : null,
                            description: jsonData.description || null,
                            genres: Array.isArray(jsonData.genre) ? jsonData.genre : (jsonData.genre ? [jsonData.genre] : []),
                            image: (jsonData.image && typeof jsonData.image === 'string') ? jsonData.image :
                                  (jsonData.image && jsonData.image.url) ? jsonData.image.url : null,
                            director: jsonData.director?.name || null,
                            cast: Array.isArray(jsonData.actor) ? jsonData.actor.map(a => a.name || a) : []
                        };
                    }
                } catch (e) {}
            }
        }

        // Extract from meta tags
        const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
        const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        
        let year = null;
        const yearMatch = html.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            const y = parseInt(yearMatch[0]);
            if (y >= 1900 && y <= new Date().getFullYear() + 1) year = y;
        }

        return {
            title: ogTitleMatch ? ogTitleMatch[1].split('|')[0].trim() : 
                  (titleMatch ? titleMatch[1].replace(' - Watcho', '').trim() : null),
            year: year,
            description: ogDescMatch ? ogDescMatch[1] : null,
            genres: [],
            image: ogImageMatch ? ogImageMatch[1] : null,
            director: null,
            cast: []
        };
    } catch (error) {
        return null;
    }
}

// ============================================
// ADD YOUR 10 WATCHO MOVIE URLs HERE:
// ============================================
const watchoMovies = [
    // Format: { url: "https://www.watcho.com/movie/movie-slug" }
    // Example:
    // { url: "https://www.watcho.com/movie/some-movie" },
    // Add 10 real URLs from watcho.com here
];

console.log(`\n🎬 Importing 10 movies from Watcho.com (METADATA ONLY)\n`);

if (watchoMovies.length === 0) {
    console.log('❌ ERROR: No movie URLs provided!');
    console.log('\n📝 Instructions:');
    console.log('   1. Go to: https://www.watcho.com/lang/ENG');
    console.log('   2. Browse movies and copy 10 movie URLs');
    console.log('   3. Add them to the watchoMovies array in this script');
    console.log('   4. Run the script again\n');
    process.exit(1);
}

const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
let added = 0;
let errors = 0;

async function importMovies() {
    for (let i = 0; i < watchoMovies.length; i++) {
        const movieInfo = watchoMovies[i];
        
        try {
            console.log(`📥 [${i+1}/${watchoMovies.length}] Fetching: ${movieInfo.url}...`);
            
            const html = await fetchWatchoPage(movieInfo.url);
            const movieData = parseWatchoMovie(html, movieInfo.url);
            
            if (movieData && movieData.title) {
                if (existingTitles.has(movieData.title.toLowerCase())) {
                    console.log(`⏭️  Skipping: ${movieData.title} (already exists)`);
                    continue;
                }
                
                const newMovie = {
                    id: generateId(movieData.title, movieData.year),
                    title: movieData.title,
                    originalTitle: movieData.title,
                    year: movieData.year,
                    runtimeMinutes: null,
                    description: movieData.description || `Watch ${movieData.title} on Watcho.com - free streaming platform.`,
                    thumbnailUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieData.title.substring(0, 20))}`,
                    posterUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieData.title.substring(0, 20))}`,
                    hlsUrl: null,
                    youtubeEmbed: false,
                    language: 'EN',
                    genres: movieData.genres.length > 0 ? movieData.genres : ['Drama'],
                    tags: movieData.genres.map(g => g.toLowerCase()),
                    isFeatured: false,
                    director: movieData.director,
                    cast: movieData.cast,
                    source: {
                        name: "Watcho.com",
                        url: movieInfo.url
                    },
                    license: {
                        type: null,
                        url: null
                    },
                    createdAt: new Date().toISOString(),
                    needsYouTubeLink: true,
                    importedFromWatcho: true
                };

                movies.push(newMovie);
                existingTitles.add(movieData.title.toLowerCase());
                added++;
                console.log(`✅ Added: ${movieData.title} (${movieData.year || 'N/A'})`);
            } else {
                console.log(`⚠️  Could not parse data from: ${movieInfo.url}`);
                errors++;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            errors++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Import completed!`);
    console.log(`   Added: ${added} movies (METADATA ONLY)`);
    console.log(`   Errors: ${errors} movies`);
    console.log(`   Total in database: ${movies.length}\n`);
    console.log(`⚠️  These movies need YouTube links to be playable\n`);
}

importMovies().catch(console.error);

