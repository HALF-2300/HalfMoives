const fs = require('fs');
const path = require('path');

// Popular movies that commonly have YouTube links
// Note: Some movies may not be available as full movies on YouTube due to copyright
// These are examples - you may need to search for actual available links

const popularMovieLinks = {
  // Lord of the Rings trilogy
  "the_lord_of_the_rings_the_fellowship_of_the_ring_2001": "https://www.youtube.com/watch?v=V75dMMIW2B4",
  "the_lord_of_the_rings_the_two_towers_2002": "https://www.youtube.com/watch?v=LbfMDwc4azU",
  "the_lord_of_the_rings_the_return_of_the_king_2003": "https://www.youtube.com/watch?v=r5X-hFf6Bwo",
  
  // Mank and other popular films
  "mank_2020": "https://www.youtube.com/watch?v=rtkCyL0XoFk",
  
  // Add more popular movies here as you find them
  // Format: "movie_id": "youtube_url"
};

// Read existing links
const linksFilePath = path.join(__dirname, 'youtube-links.json');
let existingLinks = {};

if (fs.existsSync(linksFilePath)) {
  try {
    existingLinks = JSON.parse(fs.readFileSync(linksFilePath, 'utf8'));
  } catch (e) {
    console.log('Could not read existing links file');
  }
}

// Merge new links (don't overwrite existing)
const mergedLinks = { ...existingLinks, ...popularMovieLinks };

// Save updated links
fs.writeFileSync(linksFilePath, JSON.stringify(mergedLinks, null, 2), 'utf8');

console.log(`\n✅ Added ${Object.keys(popularMovieLinks).length} popular movie links`);
console.log(`📊 Total links in file: ${Object.keys(mergedLinks).length}\n`);

// Now run the update script
console.log('🔄 Running update script...\n');

const { execSync } = require('child_process');
try {
  execSync('node add-youtube-links-manual.cjs', { stdio: 'inherit' });
} catch (e) {
  console.log('Error running update script');
}

