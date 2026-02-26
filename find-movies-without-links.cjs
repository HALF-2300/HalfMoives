const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Read movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

// Find movies without YouTube links
const moviesWithoutLinks = movies.filter(movie => {
  const hasLink = movie.hlsUrl && (
    movie.hlsUrl.includes('youtube.com/embed') ||
    movie.hlsUrl.includes('youtube.com/watch') ||
    movie.hlsUrl.includes('youtu.be/')
  );
  
  // Include movies that need YouTube links
  return !hasLink || movie.needsYouTubeLink === true;
});

console.log(`\n📊 Movies Analysis:\n`);
console.log(`Total movies: ${movies.length}`);
console.log(`Movies without YouTube links: ${moviesWithoutLinks.length}\n`);

// Group by whether they have posters
const withPosters = moviesWithoutLinks.filter(m => 
  m.posterUrl && !m.posterUrl.includes('placehold')
);
const withoutPosters = moviesWithoutLinks.filter(m => 
  !m.posterUrl || m.posterUrl.includes('placehold')
);

console.log(`Movies with posters but no links: ${withPosters.length}`);
console.log(`Movies without posters or links: ${withoutPosters.length}\n`);

// Show first 30 movies that need links
console.log(`\n📋 First 30 movies needing YouTube links:\n`);
withPosters.slice(0, 30).forEach((movie, i) => {
  console.log(`${i + 1}. ${movie.title} (${movie.year || 'N/A'})`);
  if (movie.posterUrl) {
    console.log(`   Poster: ${movie.posterUrl.substring(0, 60)}...`);
  }
  console.log(`   Search: "${movie.title} ${movie.year || ''} full movie"`);
  console.log('');
});

// Save list to file
const listPath = path.join(__dirname, 'movies-needing-links.json');
fs.writeFileSync(listPath, JSON.stringify(withPosters.map(m => ({
  id: m.id,
  title: m.title,
  year: m.year,
  posterUrl: m.posterUrl,
  searchQuery: `${m.title} ${m.year || ''} full movie`
})), null, 2), 'utf8');

console.log(`\n✅ List saved to: movies-needing-links.json\n`);

