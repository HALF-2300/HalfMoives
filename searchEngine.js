/**
 * HalfMovies Smart Search Engine
 * Supports: Normal search, Easter Eggs, Intent-based fallback
 */

let searchIndex = null;
let moviesData = [];

// Initialize search engine
async function initSearchEngine() {
  try {
    // Add cache-busting parameter to force fresh data
    const cacheBuster = `?v=${Date.now()}`;
    
    // Load search index
    const indexRes = await fetch(`searchIndex.json${cacheBuster}`);
    if (indexRes.ok) {
      searchIndex = await indexRes.json();
    }

    // Load movies data
    const moviesRes = await fetch(`/api/movies${cacheBuster}`);
    if (!moviesRes.ok) {
      // Fallback to movies.json
      const fallbackRes = await fetch(`movies.json${cacheBuster}`);
      if (fallbackRes.ok) {
        moviesData = await fallbackRes.json();
      }
    } else {
      moviesData = await moviesRes.json();
    }
    
    // Store in window object for access
    if (typeof window !== 'undefined' && window.searchEngine) {
      window.searchEngine.moviesData = moviesData;
      window.searchEngine.searchIndex = searchIndex;
    }
  } catch (error) {
    console.error('Failed to initialize search engine:', error);
  }
}

/**
 * Normalize query string
 */
function normalizeQuery(query) {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Remove extra spaces
    .replace(/[^\w\s-]/g, ''); // Remove special chars except hyphens
}

/**
 * Check for Easter Eggs
 */
function checkEasterEggs(query) {
  if (!searchIndex || !searchIndex.easterEggs) return null;
  
  const normalized = normalizeQuery(query);
  
  for (const egg of searchIndex.easterEggs) {
    const eggKeyword = normalizeQuery(egg.secretKeyword);
    
    // Exact match or contains match
    if (normalized === eggKeyword || normalized.includes(eggKeyword)) {
      // Check auth requirement
      if (egg.requiresAuth) {
        // For now, we'll allow it but could add auth check here
        // return { ...egg, requiresAuth: true };
      }
      
      return egg;
    }
  }
  
  return null;
}

/**
 * Execute Easter Egg action
 */
function executeEasterEggAction(egg) {
  if (!egg) return false;
  
  switch (egg.action) {
    case 'redirect':
      if (egg.target.startsWith('#')) {
        // Scroll to section
        const section = document.querySelector(egg.target);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to page
        window.location.href = egg.target;
      }
      return true;
      
    case 'theme':
      if (typeof applyCardTheme === 'function') {
        applyCardTheme(egg.target, { fromUser: true });
        if (typeof updateActiveThemeButton === 'function') {
          updateActiveThemeButton(egg.target);
        }
      }
      return true;
      
    case 'toggle':
      if (egg.target === 'ai-mode' && typeof toggleAIMode === 'function') {
        toggleAIMode();
      }
      return true;
      
    default:
      return false;
  }
}

/**
 * Score a movie against query
 */
function scoreMovie(movie, query, queryWords) {
  let score = 0;
  const normalizedQuery = query.toLowerCase();
  
  // Title match (highest weight)
  if (movie.title) {
    const titleLower = movie.title.toLowerCase();
    if (titleLower === normalizedQuery) score += 100;
    else if (titleLower.includes(normalizedQuery)) score += 50;
    else if (queryWords.some(word => titleLower.includes(word))) score += 30;
  }
  
  // Original title match
  if (movie.originalTitle) {
    const origLower = movie.originalTitle.toLowerCase();
    if (origLower.includes(normalizedQuery)) score += 40;
    else if (queryWords.some(word => origLower.includes(word))) score += 20;
  }
  
  // Genre match
  if (movie.genres && Array.isArray(movie.genres)) {
    movie.genres.forEach(genre => {
      const genreLower = genre.toLowerCase();
      if (genreLower === normalizedQuery) score += 30;
      else if (genreLower.includes(normalizedQuery)) score += 15;
      else if (queryWords.some(word => genreLower.includes(word))) score += 10;
    });
  }
  
  // Tags match
  if (movie.tags && Array.isArray(movie.tags)) {
    movie.tags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (tagLower === normalizedQuery) score += 25;
      else if (tagLower.includes(normalizedQuery)) score += 12;
      else if (queryWords.some(word => tagLower.includes(word))) score += 8;
    });
  }
  
  // Hidden tags (if available)
  if (movie.hiddenTags && Array.isArray(movie.hiddenTags)) {
    movie.hiddenTags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(normalizedQuery)) score += 15;
      else if (queryWords.some(word => tagLower.includes(tag))) score += 5;
    });
  }
  
  // Description match (lower weight)
  if (movie.description) {
    const descLower = movie.description.toLowerCase();
    if (queryWords.some(word => descLower.includes(word))) score += 5;
  }
  
  // Year match
  if (movie.year && query.match(/\d{4}/)) {
    const queryYear = parseInt(query.match(/\d{4}/)[0]);
    if (movie.year === queryYear) score += 20;
  }
  
  return score;
}

/**
 * Search movies
 */
function searchMovies(query, limit = 20) {
  if (!query || !moviesData || moviesData.length === 0) return [];
  
  const normalized = normalizeQuery(query);
  const queryWords = normalized.split(' ').filter(w => w.length > 0);
  
  if (queryWords.length === 0) return [];
  
  // Score all movies
  const scored = moviesData.map(movie => ({
    movie,
    score: scoreMovie(movie, normalized, queryWords)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  .map(item => item.movie);
  
  return scored;
}

/**
 * Search worlds
 */
function searchWorlds(query) {
  if (!searchIndex || !searchIndex.worlds) return [];
  
  const normalized = normalizeQuery(query);
  const queryWords = normalized.split(' ').filter(w => w.length > 0);
  
  const results = searchIndex.worlds.filter(world => {
    const searchable = [
      world.name,
      world.displayName,
      world.description,
      ...(world.tags || []),
      ...(world.hiddenTags || [])
    ].join(' ').toLowerCase();
    
    return queryWords.some(word => searchable.includes(word)) ||
           searchable.includes(normalized);
  });
  
  return results;
}

/**
 * Intent-based fallback
 */
function intentFallback(query) {
  if (!searchIndex || !searchIndex.intents) return null;
  
  const normalized = normalizeQuery(query);
  const queryWords = normalized.split(' ').filter(w => w.length > 0);
  
  // Find matching intent
  for (const intent of searchIndex.intents) {
    const intentKeywords = intent.keywords.map(k => normalizeQuery(k));
    
    // Check if any query word matches intent keywords
    const hasMatch = queryWords.some(qw => 
      intentKeywords.some(ik => ik.includes(qw) || qw.includes(ik))
    ) || intentKeywords.some(ik => normalized.includes(ik));
    
    if (hasMatch) {
      // Get recommended movies based on intent
      const recommendations = {
        movies: [],
        worlds: intent.recommendations.worlds || []
      };
      
      // Filter movies by intent recommendations
      if (intent.recommendations.genres && intent.recommendations.genres.length > 0) {
        recommendations.movies = moviesData.filter(movie => {
          if (!movie.genres) return false;
          return intent.recommendations.genres.some(genre =>
            movie.genres.some(g => g.toLowerCase() === genre.toLowerCase())
          );
        }).slice(0, 6);
      }
      
      // If no genre match, get movies by mood tags
      if (recommendations.movies.length === 0 && intent.recommendations.moodTags) {
        recommendations.movies = moviesData.filter(movie => {
          if (!movie.tags) return false;
          return intent.recommendations.moodTags.some(mood =>
            movie.tags.some(t => t.toLowerCase().includes(mood.toLowerCase()))
          );
        }).slice(0, 6);
      }
      
      // Fallback: get random movies if still empty
      if (recommendations.movies.length === 0) {
        recommendations.movies = moviesData.slice(0, 6);
      }
      
      return {
        intent,
        recommendations,
        message: intent.fallbackMessage || intent.response
      };
    }
  }
  
  return null;
}

/**
 * Main search function
 */
async function performSearch(query) {
  const normalized = normalizeQuery(query);
  
  if (!normalized || normalized.length < 1) {
    return {
      type: 'empty',
      results: { movies: [], worlds: [] }
    };
  }
  
  // 1. Check Easter Eggs first
  const easterEgg = checkEasterEggs(normalized);
  if (easterEgg) {
    const executed = executeEasterEggAction(easterEgg);
    return {
      type: 'easter-egg',
      egg: easterEgg,
      executed,
      message: easterEgg.message
    };
  }
  
  // 2. Search movies and worlds
  const movies = searchMovies(normalized, 20);
  const worlds = searchWorlds(normalized);
  
  // 3. If we have results, return them
  if (movies.length > 0 || worlds.length > 0) {
    return {
      type: 'results',
      results: { movies, worlds },
      query: normalized
    };
  }
  
  // 4. Intent fallback
  const intent = intentFallback(normalized);
  if (intent) {
    return {
      type: 'intent',
      intent: intent.intent,
      recommendations: intent.recommendations,
      message: intent.message,
      query: normalized
    };
  }
  
  // 5. Ultimate fallback - show curated suggestions
  return {
    type: 'fallback',
    results: {
      movies: moviesData.slice(0, 6),
      worlds: searchIndex?.worlds || []
    },
    message: "We think you're looking for something special. Here are some curated selections.",
    query: normalized
  };
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.searchEngine = {
    init: initSearchEngine,
    search: performSearch,
    normalizeQuery,
    checkEasterEggs,
    executeEasterEggAction,
    searchIndex: null,
    moviesData: []
  };
  
  // Make searchIndex accessible
  Object.defineProperty(window.searchEngine, 'searchIndex', {
    get: () => searchIndex,
    set: (val) => { searchIndex = val; }
  });
}

