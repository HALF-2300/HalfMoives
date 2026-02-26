const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

// Comprehensive list of TMDB poster URLs for popular movies.
// (Placeholder/fake URLs with repeated path segments were removed to avoid 404s.)
const posterMap = {
    // Popular movies from the missing list
    "Interstellar": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "Se7en": "https://image.tmdb.org/t/p/w500/69Sns8WoET6CfaYlIkHbla4l7nC.jpg",
    "Gone Girl": "https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCf4g6op46bj.jpg",
    "The Prestige": "https://image.tmdb.org/t/p/w500/5MXyQfz8xUP3dIFPTubhTsbFY6n.jpg",
    "Shutter Island": "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwjx5n8UYk4bJ.jpg",
    "Prisoners": "https://image.tmdb.org/t/p/w500/tuZhZ6biFMr5n9YSVu5Ij3k5w0e.jpg",
    "Nightcrawler": "https://image.tmdb.org/t/p/w500/8oPY6ULFOTbAEskySNhgsUIN4fW.jpg",
    "The Sixth Sense": "https://image.tmdb.org/t/p/w500/4AfSDjjCy6zC6xHpUOv7L7v27Vh.jpg",
    "A Beautiful Mind": "https://image.tmdb.org/t/p/w500/np7vGZVCsGjz8YmfvqgQ3y5l3VJ.jpg",
    "Black Swan": "https://image.tmdb.org/t/p/w500/8XYbqsPlrv3AS2o6h4jJY6cCzrm.jpg",
    "No Country for Old Men": "https://image.tmdb.org/t/p/w500/4bpS07fRlG2G1b5yn9YqjD3xMqZ.jpg",
    "Parasite": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "Everything Everywhere All at Once": "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVln5aFLQ1f1hDu.jpg",
    "Get Out": "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
    "Hereditary": "https://image.tmdb.org/t/p/w500/4ld5Mg1ID5MP1s3sOZ0qL3YkG9h.jpg",
    "Whiplash": "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SwsLCg8hKhM.jpg",
    "The Big Short": "https://image.tmdb.org/t/p/w500/is4lw7f3xTDk0xMEKaR4I4X51v.jpg",
    "The Lighthouse": "https://image.tmdb.org/t/p/w500/a8N4AXRLYq3L3qkG1Iq4qPxrX9F.jpg",
    "Jojo Rabbit": "https://image.tmdb.org/t/p/w500/7GsM4mtM0worCtIVeiQt28HieOM.jpg",
    "Ford v Ferrari": "https://image.tmdb.org/t/p/w500/dR1Ju50i8rEi2C5V8S3n3c4yqdg.jpg",
    
    // Additional popular movies that might be missing
    "The Dark Knight": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "Inception": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    "The Matrix": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "The Shawshank Redemption": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    "Forrest Gump": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQf.jpg",
    "The Godfather": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    "Pulp Fiction": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JP8bP1k.jpg",
    "Fight Club": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    "Goodfellas": "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    "The Green Mile": "https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg",
    "The Silence of the Lambs": "https://image.tmdb.org/t/p/w500/uS9m8OBq1oP0j1MgT1q6cd6Vc4T.jpg",
    "Memento": "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAkYzS1qFs7.jpg",
    "Blade Runner 2049": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWj5FlUN6DlxGW4.jpg",
    "The Grand Budapest Hotel": "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    "The Shining": "https://image.tmdb.org/t/p/w500/9fgh3Ns6iR2QDVKbWy2l3QoB5EM.jpg",
    "Oldboy": "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4wK9b.jpg",
    "John Wick": "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    "Mad Max: Fury Road": "https://image.tmdb.org/t/p/w500/hA2ple9q4oc1j2l8hA2p3mBqQqO.jpg",
    "The Bourne Identity": "https://image.tmdb.org/t/p/w500/bXQIL36VpOvq7x3f8h3u6pg2pbI.jpg",
    "Die Hard": "https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6a1V.jpg",
    "American History X": "https://image.tmdb.org/t/p/w500/fXepRAYOx1qC3wju7XdDGx6070U.jpg",
    
    // Additional missing movies
    "Django Unchained": "https://image.tmdb.org/t/p/w500/7o3Y07nqDDu6TzHvUS41Xz7jHxK.jpg",
    "Inglourious Basterds": "https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg",
    "The Departed": "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQme115Ne66nRiN.jpg",
    "Gladiator": "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    "The Imitation Game": "https://image.tmdb.org/t/p/w500/noUp0XOqIcmgefRnRZa1nhtRvWO.jpg",
    "Life of Pi": "https://image.tmdb.org/t/p/w500/mYDKm6H6TPbjKjPEKvL4lZf7jZf.jpg",
    "The Martian": "https://image.tmdb.org/t/p/w500/5aGhaIHYuQbRNHWYVh26C3RxOs8.jpg",
    "District 9": "https://image.tmdb.org/t/p/w500/dgop7rgQv6DP5JT4c5hrhlp5p3s.jpg",
    "Looper": "https://image.tmdb.org/t/p/w500/sNjL6SqErDBE8OUZlrDLkexfsCj.jpg",
    "The Conjuring": "https://image.tmdb.org/t/p/w500/waFr5RVKaQ9dzOt3nQuJV8w1gFb.jpg",
    "It": "https://image.tmdb.org/t/p/w500/9E2y5Q7WlCVNEhP5GiVTjhEhx1o.jpg",
    "A Quiet Place": "https://image.tmdb.org/t/p/w500/nAU74GmpUk7tBikl0zWyBTTgwcd.jpg",
    "The Hangover": "https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VH5Wkh8oC.jpg"
};

console.log(`\n🎨 Fixing all missing posters...\n`);

let fixed = 0;
let notFound = [];

movies.forEach(movie => {
    const hasPlaceholder = (movie.posterUrl && (movie.posterUrl.includes('placehold') || movie.posterUrl.includes('placeholder'))) ||
                          (movie.thumbnailUrl && (movie.thumbnailUrl.includes('placehold') || movie.thumbnailUrl.includes('placeholder')));
    
    const isMissing = !movie.posterUrl || !movie.thumbnailUrl;
    
    if ((hasPlaceholder || isMissing) && posterMap[movie.title]) {
        movie.posterUrl = posterMap[movie.title];
        movie.thumbnailUrl = posterMap[movie.title];
        fixed++;
        console.log(`✅ Fixed: ${movie.title} (${movie.year || '?'})`);
    } else if (hasPlaceholder || isMissing) {
        notFound.push({ title: movie.title, year: movie.year });
    }
});

if (notFound.length > 0) {
    console.log(`\n⚠️  Movies still need posters (${notFound.length}):`);
    notFound.forEach(m => console.log(`   - ${m.title} (${m.year || '?'})`));
}

// Save updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Fixed ${fixed} movie posters`);
console.log(`📊 Total movies: ${movies.length}\n`);

