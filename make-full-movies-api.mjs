import fs from 'fs';
import { setTimeout as sleep } from 'timers/promises';

// Configuration
const API_KEY = process.env.YT_API_KEY;
const TARGET = parseInt(process.env.TARGET || '200', 10);
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!API_KEY) {
  console.error('❌ Error: YT_API_KEY environment variable is not set');
  console.error('   Run: $env:YT_API_KEY="YOUR_API_KEY"');
  process.exit(1);
}

// Search queries
const SEARCH_QUERIES = [
  "full movie 2001", "full movie 2003", "full movie 2005", "full movie 2007",
  "full movie 2009", "full movie 2011", "full movie 2013", "full movie 2015",
  "full movie 2017", "full movie 2019", "full movie 2021", "full movie 2023",
  "full movie thriller 2012", "full movie action 2014", "full movie drama 2016",
  "full movie sci-fi 2018", "full movie crime 2010", "full movie mystery 2011",
  "FilmRise full movie", "Shout Studios full movie", "Full Moon Features full movie",
  "Popcornflix full movie", "Troma full movie"
];

// Exclusion keywords
const EXCLUDE_KEYWORDS = ['trailer', 'clip', 'shorts', 'teaser', 'preview', 'behind the scenes'];

// Storage
const seenVideoIds = new Set();
const results = [];

// Parse ISO 8601 duration (PT#H#M#S) to seconds
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Extract year from publishedAt
function extractYear(publishedAt) {
  if (!publishedAt) return 0;
  return parseInt(publishedAt.substring(0, 4), 10);
}

// Check if title should be excluded
function shouldExclude(title) {
  const lowerTitle = title.toLowerCase();
  return EXCLUDE_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

// Search YouTube
async function searchVideos(query, maxResults = 50, pageToken = null) {
  const params = new URLSearchParams({
    part: 'id',
    q: query,
    type: 'video',
    maxResults: Math.min(maxResults, 50).toString(),
    key: API_KEY,
    videoDuration: 'long', // Only long videos (>= 20 minutes)
    order: 'relevance'
  });
  
  if (pageToken) {
    params.append('pageToken', pageToken);
  }
  
  const url = `${BASE_URL}/search?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`  ⚠️  Search error for "${query}":`, error.message);
    return null;
  }
}

// Get video details
async function getVideoDetails(videoIds) {
  const ids = videoIds.join(',');
  const params = new URLSearchParams({
    part: 'snippet,contentDetails,status',
    id: ids,
    key: API_KEY
  });
  
  const url = `${BASE_URL}/videos?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`  ⚠️  Details error:`, error.message);
    return null;
  }
}

// Process a video
function processVideo(video) {
  const videoId = video.id;
  
  // Skip if already seen
  if (seenVideoIds.has(videoId)) {
    return false;
  }
  
  // Check privacy status
  if (video.status?.privacyStatus !== 'public') {
    return false;
  }
  
  // Parse duration
  const durationSeconds = parseDuration(video.contentDetails?.duration || 'PT0S');
  
  // Filter: must be >= 1 hour
  if (durationSeconds < 3600) {
    return false;
  }
  
  // Extract year from publishedAt
  const year = extractYear(video.snippet?.publishedAt);
  
  // Filter: year >= 2000
  if (year < 2000) {
    return false;
  }
  
  // Get title
  const title = video.snippet?.title || '';
  
  // Exclude trailers/clips/shorts
  if (shouldExclude(title)) {
    return false;
  }
  
  // Add to results
  seenVideoIds.add(videoId);
  results.push({
    title: title,
    year: year,
    durationSeconds: durationSeconds,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
  });
  
  return true;
}

// Main search function
async function searchAndProcess(query) {
  console.log(`\n🔍 Searching: "${query}"`);
  
  let pageToken = null;
  let totalProcessed = 0;
  let pagesSearched = 0;
  const maxPages = 3; // Limit pages per query to avoid quota issues
  
  do {
    if (results.length >= TARGET) {
      console.log(`  ✅ Target reached (${results.length}/${TARGET})`);
      break;
    }
    
    pagesSearched++;
    if (pagesSearched > maxPages) {
      console.log(`  ⏸️  Max pages reached for this query`);
      break;
    }
    
    // Search
    const searchData = await searchVideos(query, 50, pageToken);
    if (!searchData || !searchData.items || searchData.items.length === 0) {
      console.log(`  ℹ️  No more results`);
      break;
    }
    
    const videoIds = searchData.items.map(item => item.id.videoId).filter(Boolean);
    
    if (videoIds.length === 0) {
      break;
    }
    
    console.log(`  📥 Found ${videoIds.length} videos, fetching details...`);
    
    // Get details in batches of 50
    for (let i = 0; i < videoIds.length; i += 50) {
      if (results.length >= TARGET) break;
      
      const batch = videoIds.slice(i, i + 50);
      const detailsData = await getVideoDetails(batch);
      
      if (detailsData && detailsData.items) {
        let added = 0;
        for (const video of detailsData.items) {
          if (results.length >= TARGET) break;
          
          if (processVideo(video)) {
            added++;
            totalProcessed++;
          }
        }
        
        console.log(`    ✅ Added ${added} movies (${results.length}/${TARGET} total)`);
      }
      
      // Be gentle with API
      await sleep(150);
    }
    
    pageToken = searchData.nextPageToken;
    
    // Small delay between pages
    await sleep(200);
    
  } while (pageToken && results.length < TARGET);
  
  console.log(`  📊 Query complete: ${totalProcessed} movies added from this query`);
}

// Main execution
async function main() {
  console.log(`\n🎬 YouTube Full Movies Finder`);
  console.log(`   Target: ${TARGET} movies`);
  console.log(`   API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`   Queries: ${SEARCH_QUERIES.length}\n`);
  
  // Process each query
  for (const query of SEARCH_QUERIES) {
    if (results.length >= TARGET) {
      console.log(`\n✅ Target reached! Stopping search.`);
      break;
    }
    
    await searchAndProcess(query);
    
    // Delay between queries
    await sleep(200);
  }
  
  // Final results
  console.log(`\n📊 Final Results:`);
  console.log(`   Total movies found: ${results.length}`);
  console.log(`   Target: ${TARGET}`);
  
  if (results.length > 0) {
    // Write output file
    const filename = `full-movies.${TARGET}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n✅ Saved to: ${filename}`);
    
    // Show sample
    console.log(`\n📋 Sample (first 3):`);
    results.slice(0, 3).forEach((movie, i) => {
      console.log(`   ${i + 1}. ${movie.title} (${movie.year}) - ${Math.floor(movie.durationSeconds / 60)} min`);
    });
  } else {
    console.log(`\n❌ No movies found. Check API key and quota.`);
  }
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

