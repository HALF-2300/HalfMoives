/**
 * YouTube Feeds Loader
 * Fetches RSS feeds from feeds.valid.json and converts to movie format
 */

// Parse RSS XML to extract video data
function parseRSSFeed(xmlText, channelName) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.warn(`Failed to parse RSS for ${channelName}:`, parserError.textContent);
    return [];
  }
  
  const entries = xmlDoc.querySelectorAll('entry');
  const videos = [];
  
  entries.forEach((entry, index) => {
    try {
      const title = entry.querySelector('title')?.textContent || 'Untitled';
      const link = entry.querySelector('link')?.getAttribute('href') || '';
      const published = entry.querySelector('published')?.textContent || '';
      const updated = entry.querySelector('updated')?.textContent || '';
      const author = entry.querySelector('author name')?.textContent || channelName;
      
      // Try different ways to get description
      let description = '';
      const mediaDesc = entry.querySelector('media\\:description');
      const desc = entry.querySelector('description');
      if (mediaDesc) {
        description = mediaDesc.textContent || '';
      } else if (desc) {
        description = desc.textContent || '';
      }
      
      // Try different ways to get thumbnail
      let thumbnail = '';
      const mediaThumb = entry.querySelector('media\\:thumbnail');
      const groupThumb = entry.querySelector('media\\:group media\\:thumbnail');
      if (mediaThumb) {
        thumbnail = mediaThumb.getAttribute('url') || '';
      } else if (groupThumb) {
        thumbnail = groupThumb.getAttribute('url') || '';
      }
      
      // Extract YouTube video ID from link
      let videoId = '';
      if (link.includes('youtube.com/watch?v=')) {
        videoId = link.split('watch?v=')[1].split('&')[0];
      } else if (link.includes('youtu.be/')) {
        videoId = link.split('youtu.be/')[1].split('?')[0];
      }
      
      if (!videoId) return; // Skip if no valid video ID
      
      // Create movie object (matching your existing movie format)
      const movie = {
        id: `youtube_${channelName.toLowerCase().replace(/\s+/g, '_')}_${videoId}`,
        title: title,
        originalTitle: title,
        year: published ? new Date(published).getFullYear() : null,
        runtimeMinutes: null,
        description: description || `Video from ${channelName}`,
        thumbnailUrl: thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        posterUrl: thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        hlsUrl: `https://www.youtube.com/embed/${videoId}`,
        youtubeEmbed: true,
        language: 'EN',
        genres: ['Video', channelName],
        tags: [channelName.toLowerCase().replace(/\s+/g, '-'), 'youtube', 'video'],
        isFeatured: false,
        director: null,
        cast: null,
        source: {
          name: channelName,
          url: link
        },
        license: {
          type: null,
          url: null
        },
        createdAt: published || new Date().toISOString(),
        needsYouTubeLink: false,
        fromYouTubeFeed: true,
        channelName: channelName,
        logline: description ? description.substring(0, 100) : `Watch on ${channelName}`,
        is_original: false
      };
      
      videos.push(movie);
    } catch (error) {
      console.warn(`Error parsing entry ${index} from ${channelName}:`, error);
    }
  });
  
  return videos;
}

// Fetch RSS feed (with CORS handling)
async function fetchRSSFeed(feedUrl, channelName) {
  try {
    // Try direct fetch first (might fail due to CORS)
    const response = await fetch(feedUrl, {
      mode: 'cors',
      headers: {
        'Accept': 'application/xml, text/xml, */*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xmlText = await response.text();
    return parseRSSFeed(xmlText, channelName);
  } catch (error) {
    // If CORS fails, try via proxy endpoint (if available)
    console.warn(`Direct fetch failed for ${channelName} (CORS?), trying proxy:`, error.message);
    
    try {
      const proxyUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy HTTP ${response.status}`);
      }
      
      const xmlText = await response.text();
      return parseRSSFeed(xmlText, channelName);
    } catch (proxyError) {
      // If proxy also fails, return empty array (don't break the site)
      console.warn(`⚠️ Failed to fetch RSS for ${channelName} (CORS blocked, no proxy available):`, proxyError.message);
      return [];
    }
  }
}

// Load all videos from YouTube feeds (channels + playlists)
async function loadYouTubeFeeds() {
  try {
    const cacheBuster = `?v=${Date.now()}`;
    const allVideos = [];
    
    // Load channel feeds
    try {
      const feedsRes = await fetch(`feeds.valid.json${cacheBuster}`);
      if (feedsRes.ok) {
        const feeds = await feedsRes.json();
        console.log(`📺 Loading ${feeds.length} YouTube channel feeds...`);
        
        // Limit to avoid too many CORS errors
        const maxFeeds = 5;
        const feedsToLoad = feeds.slice(0, maxFeeds);
        
        for (let i = 0; i < feedsToLoad.length; i++) {
          const feed = feedsToLoad[i];
          try {
            console.log(`📥 [${i + 1}/${feedsToLoad.length}] Loading channel: ${feed.name}...`);
            const videos = await fetchRSSFeed(feed.feedUrl, feed.name);
            if (videos.length > 0) {
              allVideos.push(...videos);
              console.log(`✅ Loaded ${videos.length} videos from ${feed.name}`);
            }
            
            // Rate limiting
            if (i < feedsToLoad.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (error) {
            console.warn(`⚠️ Error loading channel ${feed.name}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('feeds.valid.json not found or error loading:', error.message);
    }
    
    // Load playlist feeds
    try {
      const playlistsRes = await fetch(`playlists-feeds.json${cacheBuster}`);
      if (playlistsRes.ok) {
        const playlists = await playlistsRes.json();
        console.log(`📋 Loading ${playlists.length} YouTube playlists...`);
        
        // Limit playlists too
        const maxPlaylists = 6; // Load all 6 playlists
        const playlistsToLoad = playlists.slice(0, maxPlaylists);
        
        for (let i = 0; i < playlistsToLoad.length; i++) {
          const playlist = playlistsToLoad[i];
          try {
            console.log(`📥 [${i + 1}/${playlistsToLoad.length}] Loading playlist: ${playlist.name}...`);
            const videos = await fetchRSSFeed(playlist.feedUrl, playlist.name);
            if (videos.length > 0) {
              allVideos.push(...videos);
              console.log(`✅ Loaded ${videos.length} videos from ${playlist.name}`);
            }
            
            // Rate limiting
            if (i < playlistsToLoad.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (error) {
            console.warn(`⚠️ Error loading playlist ${playlist.name}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('playlists-feeds.json not found or error loading:', error.message);
    }
    
    console.log(`✅ Total videos loaded: ${allVideos.length}`);
    return allVideos;
  } catch (error) {
    console.error('Error loading YouTube feeds:', error);
    return [];
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.loadYouTubeFeeds = loadYouTubeFeeds;
  window.parseRSSFeed = parseRSSFeed;
  window.fetchRSSFeed = fetchRSSFeed;
}

