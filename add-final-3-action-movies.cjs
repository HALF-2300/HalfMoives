const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

function generateId(title, year) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') + (year ? '_' + year : '');
}

function extractVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
}

// Final 3 Action Movies to complete the 10
const newMovies = [
    {
        title: "Road House",
        year: 1989,
        url: "https://www.youtube.com/watch?v=example_roadhouse",
        desc: "A bouncer with a cool head and lethal moves is hired to clean up a rowdy bar in Missouri. Patrick Swayze stars in this classic action film about maintaining order against a brutal crime boss.",
        genres: ["Action", "Crime", "Drama"],
        tags: ["bouncer", "bar", "patrick swayze", "80s", "classic"]
    },
    {
        title: "Starship Troopers",
        year: 1997,
        url: "https://www.youtube.com/watch?v=example_starship",
        desc: "Earth battles giant alien bugs in this cult-favorite sci-fi action film. Follows Johnny Rico as he enlists to fight in a tough space war, full of explosive combat and thrilling battles.",
        genres: ["Action", "Sci-Fi", "Thriller"],
        tags: ["aliens", "space", "war", "sci-fi", "cult classic"]
    },
    {
        title: "The Departed",
        year: 2006,
        url: "https://www.youtube.com/watch?v=example_departed",
        desc: "A gritty crime thriller set in Boston, featuring Leonardo DiCaprio and Matt Damon as two undercover operatives on opposing sides of the law. Tense atmosphere and star-studded cast.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["undercover", "boston", "crime", "thriller", "oscar winner"]
    }
];

// Check for duplicates
const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
const toAdd = newMovies.filter(m => !existingTitles.has(m.title.toLowerCase()));

if (toAdd.length === 0) {
    console.log('⚠️  All movies already exist in database');
    process.exit(0);
}

console.log(`\n📽️  Adding final ${toAdd.length} action movies...\n`);

let added = 0;
let skipped = 0;

toAdd.forEach(movie => {
    const videoId = extractVideoId(movie.url);
    
    if (movie.url.includes('example') || !videoId) {
        console.log(`⚠️  Skipping ${movie.title} (${movie.year}) - needs real YouTube URL`);
        console.log(`   Search YouTube for: "${movie.title} ${movie.year} full movie"`);
        skipped++;
        return;
    }

    const hlsUrl = `https://www.youtube.com/embed/${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const posterUrl = thumbnailUrl;

    const newMovie = {
        id: generateId(movie.title, movie.year),
        title: movie.title,
        originalTitle: movie.title,
        year: movie.year,
        runtimeMinutes: null,
        description: movie.desc,
        thumbnailUrl: thumbnailUrl,
        posterUrl: posterUrl,
        hlsUrl: hlsUrl,
        youtubeEmbed: true,
        language: 'EN',
        genres: movie.genres,
        tags: movie.tags,
        isFeatured: false,
        director: null,
        cast: null,
        source: {
            name: 'Official YouTube Channel',
            url: movie.url
        },
        license: {
            type: null,
            url: null
        },
        createdAt: new Date().toISOString()
    };

    movies.push(newMovie);
    console.log(`✅ Added: ${movie.title} (${movie.year})`);
    added++;
});

// Write updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Successfully added ${added} action movies!`);
if (skipped > 0) {
    console.log(`⚠️  Skipped ${skipped} movies - need to find YouTube links`);
}
console.log(`📊 Total movies in database: ${movies.length}\n`);

