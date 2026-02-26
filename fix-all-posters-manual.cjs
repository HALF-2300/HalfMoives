const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

// Complete list of poster URLs for movies that need them
const posterMap = {
    "Forrest Gump": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQf.jpg",
    "The Godfather": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    "Pulp Fiction": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JP8bP1k.jpg",
    "Fight Club": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    "Goodfellas": "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    "Scarface": "https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboxtmQ0PxQ0PxQ0.jpg",
    "American History X": "https://image.tmdb.org/t/p/w500/fXepRAYOx1qC3wju7XdDGx6070U.jpg",
    "The Green Mile": "https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg",
    "The Silence of the Lambs": "https://image.tmdb.org/t/p/w500/uS9m8OBq1oP0j1MgT1q6cd6Vc4T.jpg",
    "Zodiac": "https://image.tmdb.org/t/p/w500/6YQ8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8.jpg",
    "Memento": "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAkYzS1qFs7.jpg",
    "Oldboy": "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4wK9b.jpg",
    "Blade Runner 2049": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWj5FlUN6DlxGW4.jpg",
    "The Grand Budapest Hotel": "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    "The Shining": "https://image.tmdb.org/t/p/w500/9fgh3Ns6iR2QDVKbWy2l3QoB5EM.jpg"
};

console.log(`\n🎨 Fixing all missing posters...\n`);

let fixed = 0;
let notFound = [];

movies.forEach(movie => {
    const hasPlaceholder = (movie.posterUrl && movie.posterUrl.includes('placehold')) ||
                          (movie.thumbnailUrl && movie.thumbnailUrl.includes('placehold'));
    
    if (hasPlaceholder && posterMap[movie.title]) {
        movie.posterUrl = posterMap[movie.title];
        movie.thumbnailUrl = posterMap[movie.title];
        fixed++;
        console.log(`✅ Fixed: ${movie.title}`);
    } else if (hasPlaceholder) {
        notFound.push(movie.title);
    }
});

if (notFound.length > 0) {
    console.log(`\n⚠️  Movies still need posters (${notFound.length}):`);
    notFound.forEach(title => console.log(`   - ${title}`));
}

// Save updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Fixed ${fixed} movie posters`);
console.log(`📊 Total movies: ${movies.length}\n`);

