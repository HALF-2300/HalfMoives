#!/usr/bin/env python3
import json
import os

# Read the movies.json file
print("Reading movies.json...")
with open('movies.json', 'r', encoding='utf-8') as f:
    movies_data = json.load(f)

print(f"Found {len(movies_data)} movies")

# Read the HTML template
with open('index.html', 'r', encoding='utf-8') as f:
    html_template = f.read()

# Read the CSS
with open('styles.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Read the JavaScript
with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace the loadMovies function to use embedded data
js_modified = js_modified = js_content.replace(
    '''// Load movies from JSON file
async function loadMovies() {
    try {
        console.log('Attempting to load movies.json...');
        const response = await fetch('movies.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw data received:', Array.isArray(data) ? `Array with ${data.length} items` : `Object with keys: ${Object.keys(data).join(', ')}`);
        
        // Handle both array format and object with movies property
        moviesData = Array.isArray(data) ? data : (data.movies || []);
        console.log(`Loaded ${moviesData.length} movies into moviesData`);
        
        if (moviesData.length > 0) {
            console.log('First movie sample:', {
                title: moviesData[0].title,
                hlsUrl: moviesData[0].hlsUrl,
                youtubeId: moviesData[0].youtubeId,
                source: moviesData[0].source
            });
        }
        
        displayMovies(moviesData);
    } catch (error) {
        console.error('Error loading movies:', error);
        const errorMsg = error.message || 'Unknown error';
        document.getElementById('moviesContainer').innerHTML = 
            '<p style="color: white; text-align: center; padding: 2rem;">Error loading movies. Please check movies.json file.<br><small>' + escapeHtml(errorMsg) + '</small><br><small>Make sure you are running this from a web server (not file://). Try: python -m http.server 8000</small></p>';
    }
}''',
    '''// Load movies from embedded data
function loadMovies() {
    try {
        console.log('Loading embedded movies data...');
        // Movies data is embedded in the page
        moviesData = window.embeddedMoviesData || [];
        console.log(`Loaded ${moviesData.length} movies into moviesData`);
        
        if (moviesData.length > 0) {
            console.log('First movie sample:', {
                title: moviesData[0].title,
                hlsUrl: moviesData[0].hlsUrl,
                youtubeId: moviesData[0].youtubeId,
                source: moviesData[0].source
            });
        }
        
        displayMovies(moviesData);
    } catch (error) {
        console.error('Error loading movies:', error);
        const errorMsg = error.message || 'Unknown error';
        document.getElementById('moviesContainer').innerHTML = 
            '<p style="color: white; text-align: center; padding: 2rem;">Error loading movies.<br><small>' + escapeHtml(errorMsg) + '</small></p>';
    }
}'''
)

# Create the standalone HTML file
standalone_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Watch free movies from YouTube">
    <title>WorldStreamMax - Free Movies Collection</title>
    <style>
{css_content}
    </style>
</head>
<body>
    <header>
        <h1>🎬 WorldStreamMax</h1>
        <p>Watch free movies from YouTube</p>
    </header>

    <main>
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Search movies..." />
        </div>

        <div id="moviesContainer" class="movies-grid">
            <p style="color: white; text-align: center; padding: 2rem;">Loading movies...</p>
        </div>

        <div id="noResults" class="no-results" style="display: none;">
            <p>No movies found. Try a different search term.</p>
        </div>
    </main>

    <!-- Video Modal -->
    <div id="videoModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <div class="video-container">
                <iframe id="videoPlayer" src="" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; 2024 WorldStreamMax. All content from YouTube.</p>
    </footer>

    <script>
        // Embed movies data directly
        window.embeddedMoviesData = {json.dumps(movies_data, ensure_ascii=False, indent=2)};
    </script>
    <script>
{js_modified}
    </script>
</body>
</html>'''

# Write the standalone HTML file
script_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(script_dir, 'index-standalone.html')

try:
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(standalone_html)
except Exception as e:
    print(f"Error writing file: {e}")
    # Try without path join
    with open('index-standalone.html', 'w', encoding='utf-8') as f:
        f.write(standalone_html)
    output_file = 'index-standalone.html'

print(f"✅ Created {output_file} with {len(movies_data)} movies embedded!")
print(f"   Just open {output_file} in your browser - no server needed!")

