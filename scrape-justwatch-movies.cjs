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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
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

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Function to extract movie data from JustWatch HTML
function parseJustWatchMovie(html, movieUrl) {
    try {
        // Try to extract JSON-LD structured data (if available)
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
        if (jsonLdMatch) {
            try {
                const jsonData = JSON.parse(jsonLdMatch[1]);
                if (jsonData['@type'] === 'Movie' || jsonData['@type'] === 'VideoObject') {
                    return {
                        title: jsonData.name || jsonData.headline,
                        year: jsonData.datePublished ? new Date(jsonData.datePublished).getFullYear() : null,
                        description: jsonData.description || jsonData.about,
                        genres: jsonData.genre || [],
                        image: jsonData.image || null
                    };
                }
            } catch (e) {
                console.log('Failed to parse JSON-LD');
            }
        }

        // Fallback: Try to extract from meta tags
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
        const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)"/i);
        const ogDescMatch = html.match(/<meta property="og:description" content="(.*?)"/i);
        const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)"/i);

        return {
            title: ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1].split('|')[0].trim() : null),
            year: null, // Hard to extract from HTML without structured data
            description: ogDescMatch ? ogDescMatch[1] : (descMatch ? descMatch[1] : null),
            genres: [],
            image: ogImageMatch ? ogImageMatch[1] : null
        };
    } catch (error) {
        console.error('Error parsing HTML:', error.message);
        return null;
    }
}

// Popular movies to fetch from JustWatch Iraq
const moviesToFetch = [
    { title: "John Wick", year: 2014, slug: "john-wick" },
    { title: "The Matrix", year: 1999, slug: "the-matrix" },
    { title: "Inception", year: 2010, slug: "inception" },
    { title: "Interstellar", year: 2014, slug: "interstellar" },
    { title: "The Dark Knight", year: 2008, slug: "the-dark-knight" },
    { title: "Mad Max: Fury Road", year: 2015, slug: "mad-max-fury-road" },
    { title: "Gladiator", year: 2000, slug: "gladiator" },
    { title: "The Shawshank Redemption", year: 1994, slug: "the-shawshank-redemption" },
    { title: "Forrest Gump", year: 1994, slug: "forrest-gump" },
    { title: "Pulp Fiction", year: 1994, slug: "pulp-fiction" },
    { title: "Fight Club", year: 1999, slug: "fight-club" },
    { title: "The Godfather", year: 1972, slug: "the-godfather" },
    { title: "Goodfellas", year: 1990, slug: "goodfellas" },
    { title: "The Departed", year: 2006, slug: "the-departed" },
    { title: "Scarface", year: 1983, slug: "scarface" },
    { title: "Se7en", year: 1995, slug: "se7en" },
    { title: "The Silence of the Lambs", year: 1991, slug: "the-silence-of-the-lambs" },
    { title: "Shutter Island", year: 2010, slug: "shutter-island" },
    { title: "Gone Girl", year: 2014, slug: "gone-girl" },
    { title: "Zodiac", year: 2007, slug: "zodiac" },
    { title: "Memento", year: 2000, slug: "memento" },
    { title: "The Prestige", year: 2006, slug: "the-prestige" },
    { title: "No Country for Old Men", year: 2007, slug: "no-country-for-old-men" },
    { title: "Oldboy", year: 2003, slug: "oldboy" },
    { title: "Parasite", year: 2019, slug: "parasite" },
    { title: "Blade Runner 2049", year: 2017, slug: "blade-runner-2049" },
    { title: "The Martian", year: 2015, slug: "the-martian" },
    { title: "Arrival", year: 2016, slug: "arrival" },
    { title: "Ex Machina", year: 2014, slug: "ex-machina" },
    { title: "District 9", year: 2009, slug: "district-9" },
    { title: "Children of Men", year: 2006, slug: "children-of-men" },
    { title: "Her", year: 2013, slug: "her" },
    { title: "Edge of Tomorrow", year: 2014, slug: "edge-of-tomorrow" },
    { title: "Looper", year: 2012, slug: "looper" },
    { title: "The Shining", year: 1980, slug: "the-shining" },
    { title: "Get Out", year: 2017, slug: "get-out" },
    { title: "Hereditary", year: 2018, slug: "hereditary" },
    { title: "The Conjuring", year: 2013, slug: "the-conjuring" },
    { title: "It", year: 2017, slug: "it" },
    { title: "A Quiet Place", year: 2018, slug: "a-quiet-place" },
    { title: "The Exorcist", year: 1973, slug: "the-exorcist" },
    { title: "The Ring", year: 2002, slug: "the-ring" },
    { title: "Saw", year: 2004, slug: "saw" },
    { title: "The Babadook", year: 2014, slug: "the-babadook" },
    { title: "The Grand Budapest Hotel", year: 2014, slug: "the-grand-budapest-hotel" },
    { title: "Superbad", year: 2007, slug: "superbad" },
    { title: "The Hangover", year: 2009, slug: "the-hangover" },
    { title: "Borat", year: 2006, slug: "borat" },
    { title: "Step Brothers", year: 2008, slug: "step-brothers" }
];

console.log(`\n🔍 Fetching ${moviesToFetch.length} movies from JustWatch Iraq...\n`);
console.log('⚠️  NOTE: This may take a while and may hit rate limits.\n');

const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
let added = 0;
let skipped = 0;
let errors = 0;

async function fetchAndAddMovies() {
    for (let i = 0; i < moviesToFetch.length; i++) {
        const movieInfo = moviesToFetch[i];
        
        // Skip if already exists
        if (existingTitles.has(movieInfo.title.toLowerCase())) {
            console.log(`⏭️  Skipping ${movieInfo.title} - already exists`);
            skipped++;
            continue;
        }

        const justWatchUrl = `https://www.justwatch.com/iq/movie/${movieInfo.slug}`;
        
        try {
            console.log(`📥 Fetching: ${movieInfo.title}...`);
            
            const html = await fetchJustWatchPage(justWatchUrl);
            const movieData = parseJustWatchMovie(html, justWatchUrl);
            
            if (movieData && movieData.title) {
                const newMovie = {
                    id: generateId(movieInfo.title, movieInfo.year),
                    title: movieInfo.title,
                    originalTitle: movieData.title !== movieInfo.title ? movieData.title : movieInfo.title,
                    year: movieInfo.year || movieData.year,
                    runtimeMinutes: null,
                    description: movieData.description || `Watch ${movieInfo.title} on JustWatch Iraq.`,
                    thumbnailUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieInfo.title.substring(0, 20))}`,
                    posterUrl: movieData.image || `https://placehold.co/300x450/0f172a/ffffff?text=${encodeURIComponent(movieInfo.title.substring(0, 20))}`,
                    hlsUrl: null, // Still need YouTube link
                    youtubeEmbed: false,
                    language: 'EN',
                    genres: movieData.genres.length > 0 ? movieData.genres : ['Drama'],
                    tags: movieData.genres.map(g => g.toLowerCase()),
                    isFeatured: false,
                    director: null,
                    cast: null,
                    source: {
                        name: "JustWatch Iraq",
                        url: justWatchUrl
                    },
                    license: {
                        type: null,
                        url: null
                    },
                    createdAt: new Date().toISOString(),
                    needsYouTubeLink: true,
                    scrapedFromJustWatch: true
                };

                movies.push(newMovie);
                added++;
                console.log(`✅ Added: ${movieInfo.title} (${movieInfo.year})`);
            } else {
                console.log(`⚠️  Could not parse data for: ${movieInfo.title}`);
                errors++;
            }
            
            // Rate limiting - wait 2 seconds between requests
            if (i < moviesToFetch.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
        } catch (error) {
            console.log(`❌ Error fetching ${movieInfo.title}: ${error.message}`);
            errors++;
            
            // Wait longer on error
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Save all movies
    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');
    
    console.log(`\n✅ Completed!`);
    console.log(`   Added: ${added} movies`);
    console.log(`   Skipped: ${skipped} movies (already exist)`);
    console.log(`   Errors: ${errors} movies`);
    console.log(`   Total in database: ${movies.length}\n`);
}

// Run the scraper
fetchAndAddMovies().catch(console.error);

