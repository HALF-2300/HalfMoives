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

// Function to fetch HTML from JustWatch
function fetchJustWatchPage(url) {
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
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Referer': 'https://www.justwatch.com/'
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

// Function to extract movie data from JustWatch HTML
function parseJustWatchMovie(html, movieUrl) {
    try {
        // Method 1: Try JSON-LD structured data
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
        if (jsonLdMatches) {
            for (const match of jsonLdMatches) {
                try {
                    const jsonStr = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '');
                    const jsonData = JSON.parse(jsonStr);
                    if (jsonData['@type'] === 'Movie' || jsonData['@type'] === 'VideoObject' || jsonData['@type'] === 'TVMovie') {
                        return {
                            title: jsonData.name || jsonData.headline,
                            year: jsonData.datePublished ? new Date(jsonData.datePublished).getFullYear() : null,
                            description: jsonData.description || jsonData.about?.description || null,
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

        // Method 2: Extract from meta tags
        const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
        const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        
        // Try to extract year
        let year = null;
        const yearMatch = html.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            const y = parseInt(yearMatch[0]);
            if (y >= 1900 && y <= new Date().getFullYear() + 1) year = y;
        }

        return {
            title: ogTitleMatch ? ogTitleMatch[1].split('|')[0].trim() : 
                  (titleMatch ? titleMatch[1].split('|')[0].trim().replace(' - JustWatch', '').trim() : null),
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

// 20 Popular English Movies from JustWatch Iraq
const justWatchMovies = [
    { url: "https://www.justwatch.com/iq/movie/the-matrix" },
    { url: "https://www.justwatch.com/iq/movie/inception" },
    { url: "https://www.justwatch.com/iq/movie/interstellar" },
    { url: "https://www.justwatch.com/iq/movie/the-dark-knight" },
    { url: "https://www.justwatch.com/iq/movie/gladiator" },
    { url: "https://www.justwatch.com/iq/movie/the-shawshank-redemption" },
    { url: "https://www.justwatch.com/iq/movie/forrest-gump" },
    { url: "https://www.justwatch.com/iq/movie/pulp-fiction" },
    { url: "https://www.justwatch.com/iq/movie/fight-club" },
    { url: "https://www.justwatch.com/iq/movie/the-godfather" },
    { url: "https://www.justwatch.com/iq/movie/goodfellas" },
    { url: "https://www.justwatch.com/iq/movie/the-departed" },
    { url: "https://www.justwatch.com/iq/movie/scarface" },
    { url: "https://www.justwatch.com/iq/movie/se7en" },
    { url: "https://www.justwatch.com/iq/movie/the-silence-of-the-lambs" },
    { url: "https://www.justwatch.com/iq/movie/shutter-island" },
    { url: "https://www.justwatch.com/iq/movie/gone-girl" },
    { url: "https://www.justwatch.com/iq/movie/zodiac" },
    { url: "https://www.justwatch.com/iq/movie/memento" },
    { url: "https://www.justwatch.com/iq/movie/the-prestige" }
];

console.log(`\n🎬 Importing 20 movies from JustWatch Iraq (English titles + pictures)\n`);

if (justWatchMovies.length === 0) {
    console.log('❌ No movie URLs provided!');
    console.log('   Add 20 JustWatch movie URLs to the justWatchMovies array\n');
    process.exit(1);
}

const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
let added = 0;
let errors = 0;

async function importMovies() {
    for (let i = 0; i < justWatchMovies.length; i++) {
        const movieInfo = justWatchMovies[i];
        
        try {
            console.log(`📥 [${i+1}/${justWatchMovies.length}] Fetching: ${movieInfo.url}...`);
            
            const html = await fetchJustWatchPage(movieInfo.url);
            const movieData = parseJustWatchMovie(html, movieInfo.url);
            
            if (movieData && movieData.title) {
                // Check for duplicates
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
                    description: movieData.description || `Watch ${movieData.title} on JustWatch Iraq. Find where to stream this movie legally.`,
                    thumbnailUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieData.title.substring(0, 20))}`,
                    posterUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieData.title.substring(0, 20))}`,
                    hlsUrl: null, // Need YouTube link
                    youtubeEmbed: false,
                    language: 'EN',
                    genres: movieData.genres.length > 0 ? movieData.genres : ['Drama'],
                    tags: movieData.genres.map(g => g.toLowerCase()),
                    isFeatured: false,
                    director: movieData.director,
                    cast: movieData.cast,
                    source: {
                        name: "JustWatch Iraq",
                        url: movieInfo.url
                    },
                    license: {
                        type: null,
                        url: null
                    },
                    createdAt: new Date().toISOString(),
                    needsYouTubeLink: true,
                    importedFromJustWatch: true
                };

                movies.push(newMovie);
                existingTitles.add(movieData.title.toLowerCase());
                added++;
                console.log(`✅ Added: ${movieData.title} (${movieData.year || 'N/A'}) - ${movieData.image ? 'With poster' : 'No poster'}`);
            } else {
                console.log(`⚠️  Could not parse data from: ${movieInfo.url}`);
                errors++;
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            errors++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Import completed!`);
    console.log(`   Added: ${added} movies with English titles and pictures`);
    console.log(`   Errors: ${errors} movies`);
    console.log(`   Total in database: ${movies.length}\n`);
    console.log(`⚠️  These movies need YouTube links to be playable\n`);
}

importMovies().catch(console.error);

