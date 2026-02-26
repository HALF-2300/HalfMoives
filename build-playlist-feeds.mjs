/**
 * Build Playlist Feeds
 * Converts YouTube playlist URLs to RSS feed URLs
 */

import fs from 'fs';

const playlistsPath = './playlists.movies.json';
const outputPath = './playlists-feeds.json';

// Read playlists
const playlists = JSON.parse(fs.readFileSync(playlistsPath, 'utf8'));

console.log(`\n📋 Processing ${playlists.length} playlists...\n`);

const playlistFeeds = playlists.map(playlist => {
  // Extract playlist ID from URL
  // Format: https://www.youtube.com/playlist?list=PLBrrfZs-ew7Pk7PPMeAEOCcCdW_Lqo3HX
  const match = playlist.playlistUrl.match(/[?&]list=([^&]+)/);
  
  if (!match || !match[1]) {
    console.warn(`⚠️  Could not extract playlist ID from: ${playlist.playlistUrl}`);
    return null;
  }
  
  const playlistId = match[1];
  
  // YouTube playlist RSS feed format
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  
  return {
    name: playlist.name,
    playlistUrl: playlist.playlistUrl,
    playlistId: playlistId,
    feedUrl: feedUrl
  };
}).filter(Boolean); // Remove null entries

// Save to file
fs.writeFileSync(outputPath, JSON.stringify(playlistFeeds, null, 2), 'utf8');

console.log(`✅ Generated ${playlistFeeds.length} playlist feeds`);
console.log(`📄 Saved to: ${outputPath}\n`);

// Display summary
playlistFeeds.forEach((feed, index) => {
  console.log(`${index + 1}. ${feed.name}`);
  console.log(`   Feed: ${feed.feedUrl}\n`);
});

