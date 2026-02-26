const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const moviesPath = path.join(__dirname, 'movies.json');
const outputPath = path.join(__dirname, 'youtube-movies-found.json');

// Read existing movies
let movies = [];
if (fs.existsSync(moviesPath)) {
    const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
    movies = JSON.parse(data);
}

const existingTitles = new Set(movies.map(m => m.title?.toLowerCase().trim()));
const existingUrls = new Set(movies.map(m => m.source?.url || m.hlsUrl || ''));

// Known YouTube channels that post free full movies
const freeMovieChannels = [
    {
        name: "Public Domain Movies",
        rss: "https://www.youtube.com/feeds/videos.xml?channel_id=UC3szblotLne2-ws0XpRe8Gg",
        searchTerms: ["full movie", "complete movie", "free movie"]
    },
    {
        name: "Classic Movies",
        searchUrl: "https://www.youtube.com/results?search_query=classic+movies+full+free",
        searchTerms: ["classic", "full movie"]
    }
];

// YouTube search URLs for finding free movies
const searchUrls = [
    "https://www.youtube.com/results?search_query=free+full+movie",
    "https://www.youtube.com/results?search_query=public+domain+movies+full",
    "https://www.youtube.com/results?search_query=classic+movies+free+full",
    "https://www.youtube.com/results?search_query=complete+movie+free",
    "https://www.youtube.com/results?search_query=full+movie+free+youtube",
    "https://www.youtube.com/results?search_query=action+movie+free+full",
    "https://www.youtube.com/results?search_query=comedy+movie+free+full",
    "https://www.youtube.com/results?search_query=drama+movie+free+full",
    "https://www.youtube.com/results?search_query=horror+movie+free+full",
    "https://www.youtube.com/results?search_query=sci-fi+movie+free+full"
];

function extractVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
}

function generateId(title, year) {
    return `movie_${title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')}${year ? '_' + year : ''}_${Date.now().toString(36)}`;
}

// Create a helper HTML file to manually find movies
function createSearchHelper() {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>YouTube Movie Finder - Multiple Searches</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #1a1a1a;
            color: #fff;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #ff0000;
        }
        .search-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .search-card {
            background: #2a2a2a;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #444;
        }
        .search-card a {
            color: #4CAF50;
            text-decoration: none;
            font-weight: bold;
            display: block;
            margin-bottom: 10px;
        }
        .search-card a:hover {
            color: #66BB6A;
        }
        .instructions {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #4CAF50;
        }
        .instructions ol {
            line-height: 1.8;
        }
        .copy-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        .copy-btn:hover {
            background: #66BB6A;
        }
        .json-output {
            background: #1a1a1a;
            border: 1px solid #444;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
        }
        .found-movies {
            margin-top: 20px;
        }
        .movie-item {
            background: #2a2a2a;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 3px solid #4CAF50;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 YouTube Movie Finder - Find Multiple Movies</h1>
        
        <div class="instructions">
            <h2>📋 Instructions:</h2>
            <ol>
                <li>Click each search link below to open YouTube</li>
                <li>Find full movies (not trailers) - look for videos 60+ minutes</li>
                <li>Copy the YouTube URL of each movie</li>
                <li>Fill in the form below with: Title, Year, URL</li>
                <li>Click "Add Movie" for each one</li>
                <li>When done, copy the JSON output and save to <code>youtube-movies-found.json</code></li>
                <li>Run: <code>node find-free-youtube-movies.cjs</code></li>
            </ol>
        </div>

        <h2>🔍 Search Links (Click to open in new tab):</h2>
        <div class="search-grid">
            ${searchUrls.map((url, i) => `
                <div class="search-card">
                    <a href="${url}" target="_blank">Search ${i + 1}: ${url.split('search_query=')[1]?.replace(/\+/g, ' ') || 'Free Movies'}</a>
                </div>
            `).join('')}
        </div>

        <div class="found-movies">
            <h2>📝 Add Movies Found:</h2>
            <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <input type="text" id="movieTitle" placeholder="Movie Title" style="width: 100%; padding: 10px; margin: 5px 0; background: #1a1a1a; color: #fff; border: 1px solid #444; border-radius: 4px;">
                <input type="number" id="movieYear" placeholder="Year (optional)" style="width: 100%; padding: 10px; margin: 5px 0; background: #1a1a1a; color: #fff; border: 1px solid #444; border-radius: 4px;">
                <input type="text" id="movieUrl" placeholder="YouTube URL (https://youtube.com/watch?v=...)" style="width: 100%; padding: 10px; margin: 5px 0; background: #1a1a1a; color: #fff; border: 1px solid #444; border-radius: 4px;">
                <button class="copy-btn" onclick="addMovie()">Add Movie</button>
                <button class="copy-btn" onclick="clearMovies()" style="background: #f44336; margin-left: 10px;">Clear All</button>
            </div>

            <div id="moviesList" style="margin-top: 20px;"></div>

            <h3>📄 JSON Output (Copy this to youtube-movies-found.json):</h3>
            <div class="json-output" id="jsonOutput">[]</div>
            <button class="copy-btn" onclick="copyJSON()">Copy JSON</button>
        </div>
    </div>

    <script>
        let foundMovies = [];

        function addMovie() {
            const title = document.getElementById('movieTitle').value.trim();
            const year = document.getElementById('movieYear').value;
            const url = document.getElementById('movieUrl').value.trim();

            if (!title || !url) {
                alert('Please fill in Title and URL!');
                return;
            }

            // Extract video ID to verify it's a valid YouTube URL
            const videoIdMatch = url.match(/(?:youtube\\.com\\/(?:[^/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?/\\s]{11})/);
            if (!videoIdMatch) {
                alert('Invalid YouTube URL! Use format: https://youtube.com/watch?v=VIDEO_ID');
                return;
            }

            const movie = {
                title: title,
                year: year ? parseInt(year) : null,
                url: url,
                description: \`Watch \${title}\${year ? \` (\${year})\` : ''} free on YouTube.\`,
                genres: ["Movie"],
                tags: ["free", "youtube"]
            };

            foundMovies.push(movie);
            updateDisplay();
            
            // Clear inputs
            document.getElementById('movieTitle').value = '';
            document.getElementById('movieYear').value = '';
            document.getElementById('movieUrl').value = '';
            document.getElementById('movieTitle').focus();
        }

        function clearMovies() {
            if (confirm('Clear all movies?')) {
                foundMovies = [];
                updateDisplay();
            }
        }

        function updateDisplay() {
            const listDiv = document.getElementById('moviesList');
            const jsonDiv = document.getElementById('jsonOutput');
            
            // Update list
            if (foundMovies.length === 0) {
                listDiv.innerHTML = '<p style="color: #888;">No movies added yet. Use the form above to add movies.</p>';
            } else {
                listDiv.innerHTML = '<h3>✅ Found Movies (' + foundMovies.length + '):</h3>' +
                    foundMovies.map((m, i) => \`
                        <div class="movie-item">
                            <strong>\${m.title}\${m.year ? \` (\${m.year})\` : ''}</strong><br>
                            <a href="\${m.url}" target="_blank" style="color: #4CAF50;">\${m.url}</a>
                            <button onclick="removeMovie(\${i})" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; float: right;">Remove</button>
                        </div>
                    \`).join('');
            }
            
            // Update JSON
            jsonDiv.textContent = JSON.stringify(foundMovies, null, 2);
        }

        function removeMovie(index) {
            foundMovies.splice(index, 1);
            updateDisplay();
        }

        function copyJSON() {
            const json = document.getElementById('jsonOutput').textContent;
            navigator.clipboard.writeText(json).then(() => {
                alert('JSON copied to clipboard! Now save it to youtube-movies-found.json');
            });
        }

        // Allow Enter key to add movie
        document.getElementById('movieUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addMovie();
            }
        });
    </script>
</body>
</html>`;

    const htmlPath = path.join(__dirname, 'find-movies-helper.html');
    try {
        fs.writeFileSync(htmlPath, html, 'utf8');
    } catch (error) {
        console.error('Error writing HTML file:', error.message);
        throw error;
    }
    console.log('✅ Created find-movies-helper.html');
    console.log('   Open this file in your browser to find multiple movies easily!\n');
}

// Main function
function main() {
    console.log('\n🎬 YouTube Movie Finder - Multiple Movies\n');
    console.log('='.repeat(50));
    console.log('\n📋 Creating helper tool...\n');
    
    createSearchHelper();
    
    console.log('💡 How to use:');
    console.log('   1. Open find-movies-helper.html in your browser');
    console.log('   2. Click search links to find movies on YouTube');
    console.log('   3. Add each movie using the form');
    console.log('   4. Copy the JSON output');
    console.log('   5. Save it to youtube-movies-found.json');
    console.log('   6. Run: node find-free-youtube-movies.cjs\n');
    console.log('='.repeat(50));
    console.log('✅ Done!\n');
}

main();

