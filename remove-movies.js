const fs = require('fs');

// Read the movies.json file
const movies = JSON.parse(fs.readFileSync('movies.json', 'utf8'));

// List of movie titles or IDs to remove (add the ones that are not available)
const moviesToRemove = [
  // Add movie titles or IDs here, for example:
  // "Beyond the Reach",
  // "The Contract",
  // "beyond_the_reach_2014",
];

// Filter out movies to remove
const remainingMovies = movies.filter(movie => {
  const titleMatch = moviesToRemove.includes(movie.title);
  const idMatch = moviesToRemove.includes(movie.id);
  return !titleMatch && !idMatch;
});

// Save the updated file
fs.writeFileSync('movies.json', JSON.stringify(remainingMovies, null, 2));

console.log(`Removed ${movies.length - remainingMovies.length} movie(s)`);
console.log(`Remaining movies: ${remainingMovies.length}`);

