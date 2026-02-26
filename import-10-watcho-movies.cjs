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
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.watcho.com/'
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

// Function to extract movie data from Watcho HTML
function parseWatchoMovie(html, movieUrl) {
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
                            genres: Array.isArray(jsonData.genre) ? jsonData.genre : 
                                   (jsonData.genre ? [jsonData.genre] : []),
                            image: (jsonData.image && typeof jsonData.image === 'string') ? jsonData.image :
                                  (jsonData.image && jsonData.image.url) ? jsonData.image.url : null,
                            director: jsonData.director?.name || null,
                            cast: Array.isArray(jsonData.actor) ? jsonData.actor.map(a => a.name || a) : []
                        };
                    }
                } catch (e) {
                    // Continue
                }
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
            const potentialYear = parseInt(yearMatch[0]);
            if (potentialYear >= 1900 && potentialYear <= new Date().getFullYear() + 1) {
                year = potentialYear;
            }
        }

        return {
            title: ogTitleMatch ? ogTitleMatch[1].split('|')[0].trim() : 
                  (titleMatch ? titleMatch[1].split('|')[0].trim().replace(' - Watcho', '').trim() : null),
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

// Function to extract movie URLs from Watcho page
async function getWatchoMovieUrls() {
    const movieUrls = [];
    
    try {
        console.log('📥 Fetching movie list from Watcho homepage...');
        const html = await fetchWatchoPage('https://www.watcho.com/lang/ENG');
        
        // Try to find movie links in HTML
        const linkMatches = html.match(/href="[^"]*\/movie\/[^"]*"/g) || 
                           html.match(/href="[^"]*\/watch\/[^"]*"/g) ||
                           html.match(/data-movie-id="[^"]*"/g);
        
        if (linkMatches) {
            const uniqueUrls = [...new Set(linkMatches.map(match => {
                const urlMatch = match.match(/href="([^"]+)"/);
                if (urlMatch) {
                    const path = urlMatch[1];
                    if (path.startsWith('http')) return path;
                    if (path.startsWith('/')) return `https://www.watcho.com${path}`;
                    return `https://www.watcho.com/movie/${path}`;
                }
                return null;
            }).filter(Boolean))];
            
            return uniqueUrls.slice(0, 10); // Get first 10
        }
    } catch (error) {
        console.log(`⚠️  Could not auto-extract movie URLs: ${error.message}`);
    }
    
    return [];
}

console.log(`\n🎬 Importing 10 movies from Watcho.com (METADATA ONLY)\n`);

let watchoMovies = [];

async function startImport() {
    // Try to get movie URLs automatically
    const autoUrls = await getWatchoMovieUrls();
    
    if (autoUrls.length > 0) {
        watchoMovies = autoUrls.map(url => ({ url, title: null, year: null }));
        console.log(`✅ Found ${autoUrls.length} movie URLs automatically\n`);
    } else {
        console.log('⚠️  Could not auto-extract movie URLs from Watcho');
        console.log('   Watcho uses JavaScript to load content dynamically\n');
        console.log('📝 Alternative: Please provide 10 Watcho movie URLs manually');
        console.log('   Update the watchoMovies array in the script with real URLs\n');
        
        // Example manual URLs (you need to replace these with real ones)
        watchoMovies = [
            // Add 10 real Watcho movie URLs here, example format:
            // { url: "https://www.watcho.com/movie/movie-slug", title: "Movie Title", year: 2020 },
        ];
        
        if (watchoMovies.length === 0) {
            console.log('❌ No movie URLs provided. Please add URLs to the script.\n');
            process.exit(1);
        }
    }
    
    if (watchoMovies.length < 10) {
        console.log(`⚠️  Only ${watchoMovies.length} movies found. Continuing with available movies...\n`);
    }

    const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
    let added = 0;
    let errors = 0;

    async function importMovies() {
    for (let i = 0; i < watchoMovies.length; i++) {
        const movieInfo = watchoMovies[i];
        
        try {
            console.log(`📥 [${i+1}/10] Fetching: ${movieInfo.url}...`);
            
            const html = await fetchWatchoPage(movieInfo.url);
            const movieData = parseWatchoMovie(html, movieInfo.url);
            
            if (movieData && movieData.title) {
                // Check for duplicates
                if (existingTitles.has(movieData.title.toLowerCase())) {
                    console.log(`⏭️  Skipping: ${movieData.title} (already exists)`);
                    continue;
                }
                
                const newMovie = {
                    id: generateId(movieData.title, movieData.year || movieInfo.year),
                    title: movieData.title,
                    originalTitle: movieData.title,
                    year: movieData.year || movieInfo.year,
                    runtimeMinutes: null,
                    description: movieData.description || `Watch ${movieData.title} on Watcho.com - free streaming platform.`,
                    thumbnailUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieData.title.substring(0, 20))}`,
                    posterUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieData.title.substring(0, 20))}`,
                    hlsUrl: null, // NO VIDEO LINK - You need to find YouTube or other legal source
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
            
            // Rate limiting - wait 2 seconds between requests
            if (i < watchoMovies.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
        } catch (error) {
            console.log(`❌ Error: ${movieInfo.url} - ${error.message}`);
            errors++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Save movies
    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Import completed!`);
    console.log(`   Added: ${added} movies (METADATA ONLY)`);
    console.log(`   Errors: ${errors} movies`);
    console.log(`   Total in database: ${movies.length}\n`);
        console.log(`⚠️  IMPORTANT: These movies need YouTube links to be playable`);
        console.log(`   NO VIDEO FILES were downloaded\n`);
    }

    // Run import
    await importMovies();
}

// Start the import process
startImport().catch(console.error);

