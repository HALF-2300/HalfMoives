const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

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
                'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none'
            }
        };

        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Function to extract movie data from JustWatch HTML
function parseJustWatchMovie(html, movieUrl) {
    try {
        // Method 1: Try to extract JSON-LD structured data
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
        if (jsonLdMatches) {
            for (const match of jsonLdMatches) {
                try {
                    const jsonStr = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '');
                    const jsonData = JSON.parse(jsonStr);
                    if (jsonData['@type'] === 'Movie' || jsonData['@type'] === 'VideoObject' || jsonData['@type'] === 'TVMovie') {
                        return {
                            title: jsonData.name || jsonData.headline,
                            year: jsonData.datePublished ? new Date(jsonData.datePublished).getFullYear() : 
                                  (jsonData.temporalCoverage ? parseInt(jsonData.temporalCoverage) : null),
                            description: jsonData.description || jsonData.about?.description || null,
                            genres: Array.isArray(jsonData.genre) ? jsonData.genre : 
                                   (jsonData.genre ? [jsonData.genre] : []),
                            image: (jsonData.image && typeof jsonData.image === 'string') ? jsonData.image :
                                  (jsonData.image && jsonData.image.url) ? jsonData.image.url : null,
                            director: jsonData.director?.name || null,
                            cast: Array.isArray(jsonData.actor) ? jsonData.actor.map(a => a.name) : []
                        };
                    }
                } catch (e) {
                    // Continue to next method
                }
            }
        }

        // Method 2: Extract from meta tags
        const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
        const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        
        // Try to extract year from title or URL
        let year = null;
        const yearMatch = html.match(/(\d{4})/);
        if (yearMatch) {
            const potentialYear = parseInt(yearMatch[1]);
            if (potentialYear >= 1900 && potentialYear <= new Date().getFullYear() + 1) {
                year = potentialYear;
            }
        }

        return {
            title: ogTitleMatch ? ogTitleMatch[1].split('|')[0].trim() : 
                  (titleMatch ? titleMatch[1].split('|')[0].trim() : null),
            year: year,
            description: ogDescMatch ? ogDescMatch[1] : null,
            genres: [],
            image: ogImageMatch ? ogImageMatch[1] : null,
            director: null,
            cast: []
        };
    } catch (error) {
        console.error('Error parsing HTML:', error.message);
        return null;
    }
}

// Find movies that need updating (have needsYouTubeLink flag or scrapedFromJustWatch)
const moviesToUpdate = movies.filter(m => 
    m.needsYouTubeLink === true || 
    m.scrapedFromJustWatch === true ||
    (m.source && m.source.name === "JustWatch Iraq" && !m.hlsUrl)
);

console.log(`\n🔍 Found ${moviesToUpdate.length} movies to update with real JustWatch data...\n`);

if (moviesToUpdate.length === 0) {
    console.log('✅ No movies need updating. All movies already have data.\n');
    process.exit(0);
}

let updated = 0;
let errors = 0;

async function updateMovies() {
    for (let i = 0; i < moviesToUpdate.length; i++) {
        const movie = moviesToUpdate[i];
        
        // Build JustWatch URL from source or generate from title
        let justWatchUrl;
        if (movie.source && movie.source.url && movie.source.url.includes('justwatch.com')) {
            justWatchUrl = movie.source.url;
        } else {
            // Generate URL from title
            const slug = movie.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            justWatchUrl = `https://www.justwatch.com/iq/movie/${slug}`;
        }
        
        try {
            console.log(`📥 Fetching real data for: ${movie.title}...`);
            
            const html = await fetchJustWatchPage(justWatchUrl);
            const movieData = parseJustWatchMovie(html, justWatchUrl);
            
            if (movieData && movieData.title) {
                // Update movie with real data
                if (movieData.description && movieData.description.length > 50) {
                    movie.description = movieData.description;
                }
                
                if (movieData.image) {
                    movie.thumbnailUrl = movieData.image;
                    movie.posterUrl = movieData.image;
                }
                
                if (movieData.genres && movieData.genres.length > 0) {
                    movie.genres = movieData.genres;
                    movie.tags = movieData.genres.map(g => g.toLowerCase());
                }
                
                if (movieData.director) {
                    movie.director = movieData.director;
                }
                
                if (movieData.cast && movieData.cast.length > 0) {
                    movie.cast = movieData.cast;
                }
                
                if (!movie.year && movieData.year) {
                    movie.year = movieData.year;
                }
                
                movie.scrapedFromJustWatch = true;
                movie.source = {
                    name: "JustWatch Iraq",
                    url: justWatchUrl
                };
                
                updated++;
                console.log(`✅ Updated: ${movie.title}`);
            } else {
                console.log(`⚠️  Could not extract data for: ${movie.title}`);
                errors++;
            }
            
            // Rate limiting - wait 2-3 seconds between requests
            if (i < moviesToUpdate.length - 1) {
                const delay = 2000 + Math.random() * 1000; // 2-3 seconds
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
        } catch (error) {
            console.log(`❌ Error updating ${movie.title}: ${error.message}`);
            errors++;
            
            // Wait longer on error
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }

    // Save updated movies
    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Update completed!`);
    console.log(`   Updated: ${updated} movies with real JustWatch data`);
    console.log(`   Errors: ${errors} movies`);
    console.log(`   Total in database: ${movies.length}\n`);
    console.log(`⚠️  NOTE: Movies still need YouTube links to be playable\n`);
}

// Run the updater
updateMovies().catch(console.error);

