let moviesData = [];

// Extract YouTube video ID from embed URL
function extractYouTubeId(url) {
    if (!url) return null;
    // Handle embed URLs: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) return embedMatch[1];
    // Handle watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return watchMatch[1];
    // Handle youtu.be URLs: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) return shortMatch[1];
    return null;
}

// Format runtime from minutes to hours and minutes
function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
}

// Escape HTML to prevent XSS and rendering issues
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load movies from API (uses main movies.json)
async function loadMovies() {
    try {
        console.log('Loading /api/movies...');
        const response = await fetch('/api/movies');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', Array.isArray(data) ? `Array with ${data.length} items` : `Object`);
        
        // Handle both array format and object with movies property
        moviesData = Array.isArray(data) ? data : (data.movies || []);
        console.log(`Loaded ${moviesData.length} movies`);
        
        if (moviesData.length > 0) {
            console.log('First movie:', {
                title: moviesData[0].title,
                world: moviesData[0].world,
                synopsis: moviesData[0].synopsis ? moviesData[0].synopsis.substring(0, 50) + '...' : 'N/A'
            });
        }
        
        displayMovies(moviesData);
    } catch (error) {
        console.error('Error loading movies:', error);
        const errorMsg = error.message || 'Unknown error';
        document.getElementById('moviesContainer').innerHTML = 
            '<p style="color: white; text-align: center; padding: 2rem;">Error loading movies<br><small>' + escapeHtml(errorMsg) + '</small><br><br><small>Make sure the server is running (e.g. port 1636).</small></p>';
    }
}

// Extract link from synopsis HTML
function extractLinkFromSynopsis(synopsis) {
    if (!synopsis) return null;
    const match = synopsis.match(/href=["']([^"']+)["']/);
    return match ? match[1] : null;
}

// Display movies in the grid
function displayMovies(movies) {
    const container = document.getElementById('moviesContainer');
    const noResults = document.getElementById('noResults');
    
    console.log(`Displaying ${movies.length} movies`);
    
    if (movies.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    let validMovies = 0;
    let skippedMovies = 0;
    
    container.innerHTML = movies.map((movie, index) => {
        // Check if this is the new format (has synopsis with link) or old format (has YouTube ID)
        const isNewFormat = movie.synopsis && (movie.synopsis.includes('href=') || movie.world);
        const youtubeId = movie.youtubeId || extractYouTubeId(movie.hlsUrl) || extractYouTubeId(movie.source?.url);
        const linkUrl = isNewFormat ? extractLinkFromSynopsis(movie.synopsis) : null;
        
        // For new format, require a link; for old format, require YouTube ID
        if (isNewFormat && !linkUrl) {
            skippedMovies++;
            if (index < 10) {
                console.log(`Skipping movie ${index} (${movie.title || 'Untitled'}): No link in synopsis`);
            }
            return '';
        } else if (!isNewFormat && !youtubeId) {
            skippedMovies++;
            if (index < 10) {
                console.log(`Skipping movie ${index} (${movie.title || 'Untitled'}): No YouTube ID. hlsUrl: ${movie.hlsUrl}, source.url: ${movie.source?.url}`);
            }
            return '';
        }
        
        validMovies++;
        if (validMovies <= 3) {
            console.log(`Displaying movie ${validMovies}: ${movie.title || 'Untitled'}`);
        }
        
        if (isNewFormat) {
            // New format: world, mood, rating, synopsis with HTML
            const title = escapeHtml(movie.title || 'Untitled');
            const year = movie.year ? ` (${movie.year})` : '';
            const world = escapeHtml(movie.world || '');
            const mood = escapeHtml(movie.mood || '');
            const rating = movie.rating ? movie.rating.toFixed(1) : '';
            // Synopis contains HTML, so don't escape it
            const synopsis = movie.synopsis || '';
            
            return `
            <div class="movie-card" onclick="window.open('${escapeHtml(linkUrl)}', '_blank', 'noopener,noreferrer')">
                <div class="thumbnail-container">
                    <img src="https://via.placeholder.com/400x200?text=${encodeURIComponent(title)}" alt="${title}" class="movie-thumbnail" 
                         onerror="this.src='https://via.placeholder.com/400x200?text=No+Thumbnail'">
                    <div class="play-button">▶</div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${title}${year}</h3>
                    <div class="movie-meta">
                        ${world ? `<span class="movie-genre">${world}</span>` : ''}
                        ${mood ? `<span class="movie-genre">${mood}</span>` : ''}
                        ${rating ? `<span>⭐ ${rating}</span>` : ''}
                    </div>
                    <div class="movie-description">${synopsis}</div>
                </div>
            </div>
            `;
        } else {
            // Old format: YouTube embed
            const thumbnail = movie.thumbnailUrl || 
                             movie.posterUrl || 
                             (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '');
            const title = escapeHtml(movie.title || movie.originalTitle || 'Untitled');
            const description = escapeHtml(movie.description || movie.logline || '');
            const year = movie.year ? ` (${movie.year})` : '';
            const runtime = movie.runtimeMinutes ? formatRuntime(movie.runtimeMinutes) : 
                           (movie.duration || '');
            const genres = Array.isArray(movie.genres) ? escapeHtml(movie.genres.join(', ')) : 
                          escapeHtml(movie.genres || movie.genre || '');
            const thumbnailEscaped = escapeHtml(thumbnail);
            
            return `
            <div class="movie-card" onclick="openMovie('${escapeHtml(youtubeId)}')">
                <div class="thumbnail-container">
                    <img src="${thumbnailEscaped}" alt="${title}" class="movie-thumbnail" 
                         onerror="this.src='https://via.placeholder.com/400x200?text=No+Thumbnail'">
                    <div class="play-button">▶</div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${title}${year}</h3>
                    <p class="movie-description">${description}</p>
                    <div class="movie-meta">
                        ${runtime ? `<span>${escapeHtml(runtime)}</span>` : ''}
                        ${genres ? `<span class="movie-genre">${genres}</span>` : ''}
                    </div>
                </div>
            </div>
            `;
        }
    }).filter(html => html !== '').join('');
    
    console.log(`Displayed ${validMovies} valid movies, skipped ${skippedMovies} movies`);
    
    if (validMovies === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">No movies found. Please check /api/movies and movies.json.</p>';
        noResults.style.display = 'block';
    }
}

// Open movie in modal
function openMovie(youtubeId) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoPlayer');
    
    iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoPlayer');
    
    modal.classList.remove('active');
    iframe.src = '';
    document.body.style.overflow = 'auto';
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayMovies(moviesData);
        return;
    }
    
    const filtered = moviesData.filter(movie => {
        // New format fields
        const title = (movie.title || movie.originalTitle || '').toLowerCase();
        const synopsis = (movie.synopsis || '').toLowerCase();
        const world = (movie.world || '').toLowerCase();
        const mood = (movie.mood || '').toLowerCase();
        
        // Old format fields
        const description = (movie.description || movie.logline || '').toLowerCase();
        const genres = Array.isArray(movie.genres) ? movie.genres.join(' ').toLowerCase() : 
                      (movie.genres || movie.genre || '').toLowerCase();
        const director = (movie.director || '').toLowerCase();
        const cast = Array.isArray(movie.cast) ? movie.cast.join(' ').toLowerCase() : '';
        const year = movie.year ? movie.year.toString() : '';
        
        return title.includes(searchTerm) ||
               synopsis.includes(searchTerm) ||
               world.includes(searchTerm) ||
               mood.includes(searchTerm) ||
               description.includes(searchTerm) ||
               genres.includes(searchTerm) ||
               director.includes(searchTerm) ||
               cast.includes(searchTerm) ||
               year.includes(searchTerm);
    });
    
    displayMovies(filtered);
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('videoModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Load movies when page loads
loadMovies();

