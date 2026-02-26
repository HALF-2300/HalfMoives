const fs = require('fs');
const path = require('path');
const https = require('https');

const moviesPath = path.join(__dirname, 'movies.json');

// Helper to safely write file with retries
function safeWriteFile(filePath, data, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Try to write
            fs.writeFileSync(filePath, data, { encoding: 'utf8', flag: 'w' });
            return true;
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error; // Last attempt failed
            }
            // Wait a bit and retry
            const waitTime = (i + 1) * 500; // 500ms, 1000ms, 1500ms
            console.log(`   ⏳ File locked, waiting ${waitTime}ms... (attempt ${i + 1}/${maxRetries})`);
            const start = Date.now();
            while (Date.now() - start < waitTime) {
                // Busy wait
            }
        }
    }
    return false;
}

// Read existing movies
let movies = [];
if (fs.existsSync(moviesPath)) {
    const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
    movies = JSON.parse(data);
}

// Get existing movie titles to avoid duplicates
const existingTitles = new Set(movies.map(m => m.title?.toLowerCase().trim()));

function generateId(title, year) {
    return `movie_${title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')}${year ? '_' + year : ''}_${Date.now().toString(36)}`;
}

function extractVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
}

// Search terms for finding free movies on YouTube
const searchTerms = [
    'free full movie',
    'full movie free',
    'free movie',
    'full movie',
    'complete movie',
    'movie free online'
];

// Popular movie titles to search for (you can modify this list)
const moviesToSearch = [
    // Add your movie titles here, or we can search by genre/keywords
];

// If you have a PowerShell script that finds movies, you can import results here
// Format: { title: "Movie Title", year: 2020, url: "https://youtube.com/..." }
function importFromPowerShellResults(resultsFile) {
    if (!fs.existsSync(resultsFile)) {
        console.log(`⚠️  Results file not found: ${resultsFile}`);
        return [];
    }
    
    try {
        const data = fs.readFileSync(resultsFile, 'utf8');
        const results = JSON.parse(data);
        console.log(`✅ Loaded ${results.length} results from PowerShell\n`);
        return results;
    } catch (e) {
        console.error(`❌ Error reading results file: ${e.message}`);
        return [];
    }
}

// Generate YouTube search URLs for a movie
function generateSearchUrls(title, year = null) {
    const queries = [
        `${title} ${year ? year : ''} full movie free`,
        `${title} ${year ? year : ''} free movie`,
        `${title} ${year ? year : ''} complete movie`
    ];
    
    return queries.map(query => {
        const encoded = encodeURIComponent(query);
        return `https://www.youtube.com/results?search_query=${encoded}`;
    });
}

// Add a movie from YouTube URL
function addMovieFromYouTube(title, year, url, description = null, genres = ['Movie'], tags = []) {
    // Check if already exists
    if (existingTitles.has(title.toLowerCase().trim())) {
        console.log(`⚠️  Skipping "${title}" - already exists`);
        return false;
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        console.log(`⚠️  Skipping "${title}" - invalid YouTube URL: ${url}`);
        return false;
    }
    
    const hlsUrl = `https://www.youtube.com/embed/${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const posterUrl = thumbnailUrl;
    
    const newMovie = {
        id: generateId(title, year),
        title: title,
        originalTitle: title,
        year: year || null,
        runtimeMinutes: null,
        description: description || `Watch ${title}${year ? ` (${year})` : ''} free on YouTube.`,
        thumbnailUrl: thumbnailUrl,
        posterUrl: posterUrl,
        hlsUrl: hlsUrl,
        youtubeEmbed: true,
        language: 'EN',
        genres: genres,
        tags: [...tags, 'youtube', 'free'],
        isFeatured: false,
        director: null,
        cast: null,
        source: {
            name: 'YouTube',
            url: url
        },
        license: {
            type: null,
            url: null
        },
        createdAt: new Date().toISOString()
    };
    
    movies.push(newMovie);
    existingTitles.add(title.toLowerCase().trim());
    console.log(`✅ Added: ${title}${year ? ` (${year})` : ''}`);
    return true;
}

// Main function
async function main() {
    console.log('\n🎬 Finding Free YouTube Movies\n');
    console.log('='.repeat(50));
    
    // Option 1: Import from PowerShell results file
    const powershellResults = process.argv[2] || 'youtube-movies-found.json';
    const imported = importFromPowerShellResults(powershellResults);
    
    if (imported.length > 0) {
        console.log(`\n📥 Importing ${imported.length} movies from PowerShell results...\n`);
        let added = 0;
        imported.forEach(movie => {
            if (addMovieFromYouTube(
                movie.title,
                movie.year,
                movie.url,
                movie.description,
                movie.genres || ['Movie'],
                movie.tags || []
            )) {
                added++;
            }
        });
        console.log(`\n✅ Successfully added ${added} new movies`);
    } else {
        console.log('\n💡 No PowerShell results found.');
        console.log('   To use this script:');
        console.log('   1. Run your PowerShell script to find YouTube movies');
        console.log('   2. Save results as JSON file: youtube-movies-found.json');
        console.log('   3. Run: node find-free-youtube-movies.cjs\n');
        
        // Option 2: Manual list
        console.log('📝 You can also add movies manually in the script.\n');
        console.log('   Edit find-free-youtube-movies.cjs and add to moviesToSearch array:');
        console.log('   const moviesToSearch = [');
        console.log('       { title: "Movie Title", year: 2020, url: "https://youtube.com/..." },');
        console.log('       ...');
        console.log('   ];\n');
    }
    
    // Save updated movies
    if (movies.length > 0) {
        try {
            // Create backup first
            if (fs.existsSync(moviesPath)) {
                const backupPath = moviesPath + '.backup.' + Date.now();
                fs.copyFileSync(moviesPath, backupPath);
                console.log(`📦 Backup created: ${path.basename(backupPath)}`);
            }
            
            // Write with retry logic
            const jsonData = JSON.stringify(movies, null, 2);
            console.log(`\n💾 Saving ${movies.length} movies to movies.json...`);
            safeWriteFile(moviesPath, jsonData);
            console.log(`✅ Successfully saved to movies.json`);
        } catch (error) {
            console.error(`\n❌ Error saving movies.json: ${error.message}`);
            console.error(`\n⚠️  Make sure movies.json is CLOSED in:`);
            console.error(`   • VS Code / Notepad / Any editor`);
            console.error(`   • File Explorer (close preview pane)`);
            console.error(`   • Any other program viewing the file`);
            console.error(`\n   Then run the script again.`);
            process.exit(1);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Done!\n');
}

// Run
main().catch(console.error);

