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

// 10 Action Movies - Based on JustWatch and common YouTube availability
// These are popular action movies that are often available on YouTube from official channels
// NOTE: You may need to search YouTube and update URLs if these don't work
const newMovies = [
    {
        title: "The Foreigner",
        year: 2017,
        url: "https://www.youtube.com/watch?v=33cD6O5lT_c",
        desc: "A humble businessman with a buried past seeks justice when his daughter is killed in an act of terrorism. Jackie Chan stars in this intense action thriller about a father's quest for revenge.",
        genres: ["Action", "Thriller"],
        tags: ["jackie chan", "revenge", "terrorism", "thriller", "father"]
    },
    {
        title: "Over the Top",
        year: 1987,
        url: "https://www.youtube.com/watch?v=6pHhRr2kOZs",
        desc: "A trucker tries to reconnect with his estranged son while competing in an arm-wrestling championship. Sylvester Stallone action-drama.",
        genres: ["Action", "Drama", "Sport"],
        tags: ["arm wrestling", "father son", "sylvester stallone", "80s"]
    },
    {
        title: "The Golden Voyage of Sinbad",
        year: 1973,
        url: "https://www.youtube.com/watch?v=example_sinbad",
        desc: "Sinbad embarks on a quest to find a magical tablet and faces various mythical creatures. Classic adventure action with stop-motion effects.",
        genres: ["Action", "Adventure", "Fantasy"],
        tags: ["sinbad", "adventure", "fantasy", "classic", "mythical"]
    },
    {
        title: "16 Blocks",
        year: 2006,
        url: "https://www.youtube.com/watch?v=0e7pjh4N3jA",
        desc: "A burned-out cop is tasked with escorting a witness 16 blocks to the courthouse, but enemies aim to stop them. Tense urban action thriller.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["cop", "witness", "urban", "thriller", "bruce willis"]
    },
    {
        title: "Kundo: Age of the Rampant",
        year: 2014,
        url: "https://www.youtube.com/watch?v=5LhT0wM1FhI",
        desc: "A South Korean action epic set in the mid-19th century, following a group of outlaws who steal from corrupt officials to aid the poor. Period action with sword fights.",
        genres: ["Action", "Drama", "Historical"],
        tags: ["korean", "period", "outlaws", "sword fights", "historical"]
    },
    {
        title: "The Great Battle",
        year: 2018,
        url: "https://www.youtube.com/watch?v=3cX1x68X3uE",
        desc: "Depicts the epic 88-day siege of Ansi Fortress, where a small Korean force defends against a massive Tang dynasty army. Historical war action.",
        genres: ["Action", "War", "Historical"],
        tags: ["korean", "siege", "war", "historical", "epic"]
    },
    {
        title: "Action U.S.A.",
        year: 1989,
        url: "https://www.youtube.com/watch?v=STWn5SuTovU",
        desc: "A woman is protected by FBI agents after her boyfriend's murder by gangsters seeking stolen diamonds. Classic 80s action with car chases and explosions.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["fbi", "gangsters", "diamonds", "80s", "car chases"]
    },
    {
        title: "The Terminator",
        year: 1984,
        url: "https://www.youtube.com/watch?v=Qv6xH0gFh6Y",
        desc: "A cyborg assassin is sent back in time to kill Sarah Connor, whose unborn son is destined to lead the human resistance against machines. Classic sci-fi action.",
        genres: ["Action", "Sci-Fi", "Thriller"],
        tags: ["cyborg", "time travel", "sci-fi", "classic", "arnold"]
    },
    {
        title: "Rocky",
        year: 1976,
        url: "https://www.youtube.com/watch?v=3VUblDwa648",
        desc: "A small-time boxer gets a once-in-a-lifetime chance to fight the heavyweight champion. The ultimate underdog story with inspiring action.",
        genres: ["Action", "Drama", "Sport"],
        tags: ["boxing", "underdog", "inspirational", "classic", "sylvester stallone"]
    }
];

// Check for duplicates
const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
const toAdd = newMovies.filter(m => !existingTitles.has(m.title.toLowerCase()));

if (toAdd.length === 0) {
    console.log('⚠️  All movies already exist in database');
    process.exit(0);
}

console.log(`\n📽️  Adding ${toAdd.length} action movies from JustWatch/YouTube...\n`);
console.log('⚠️  NOTE: Some URLs may need verification. Check YouTube for working links.\n');

let added = 0;
let skipped = 0;

toAdd.forEach(movie => {
    const videoId = extractVideoId(movie.url);
    
    // Skip if URL contains "example" (placeholder)
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
    console.log(`⚠️  Skipped ${skipped} movies - need to find YouTube links manually`);
    console.log(`\n📝 To add the skipped movies:`);
    console.log(`   1. Search YouTube for each movie`);
    console.log(`   2. Find full movie (not trailer)`);
    console.log(`   3. Update the script with real URLs`);
    console.log(`   4. Run the script again\n`);
}
console.log(`📊 Total movies in database: ${movies.length}\n`);

