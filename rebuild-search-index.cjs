const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');
const searchIndexPath = path.join(__dirname, 'searchIndex.json');

console.log('\n🔍 Rebuilding searchIndex.json...\n');

// Read movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

console.log(`📊 Total movies in database: ${movies.length}`);

// Build search index
const searchIndex = {
    movies: movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.year || null,
        genres: movie.genres || []
    })),
    worlds: [] // Add worlds if you have them
};

// Write search index
fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 4), 'utf8');

console.log(`✅ Rebuilt searchIndex.json`);
console.log(`   Movies indexed: ${searchIndex.movies.length}`);
console.log(`   Worlds indexed: ${searchIndex.worlds.length}`);
console.log(`\n📤 Ready to upload to server!\n`);

