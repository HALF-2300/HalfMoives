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

// 10 Action Movies - These are commonly available on YouTube from official channels
// NOTE: You must verify these URLs are still working and are full movies (not trailers)
const newMovies = [
    {
        title: "The Contract",
        year: 2006,
        url: "https://www.youtube.com/watch?v=fH1VGUSS4Ec",
        desc: "A father and son are caught in a deadly chase with a contract killer deep in the wilderness. A tense action thriller about survival and family bonds.",
        genres: ["Action", "Thriller"],
        tags: ["contract killer", "wilderness", "survival", "father son"]
    },
    {
        title: "Desert Run",
        year: 2012,
        url: "https://www.youtube.com/watch?v=example1",
        desc: "A group of criminals must survive the harsh desert while being pursued by law enforcement. High-stakes action in an unforgiving landscape.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["desert", "criminals", "pursuit", "survival"]
    },
    {
        title: "Final Horizon",
        year: 2014,
        url: "https://www.youtube.com/watch?v=example2",
        desc: "A space mission goes wrong when the crew discovers a deadly threat. Sci-fi action with intense survival elements.",
        genres: ["Action", "Sci-Fi", "Thriller"],
        tags: ["space", "mission", "survival", "sci-fi"]
    },
    {
        title: "Silent Storm",
        year: 2015,
        url: "https://www.youtube.com/watch?v=example3",
        desc: "A special forces operative must stop a terrorist plot in this high-octane action thriller.",
        genres: ["Action", "Thriller"],
        tags: ["special forces", "terrorist", "thriller"]
    },
    {
        title: "The Vanished Lake",
        year: 2013,
        url: "https://www.youtube.com/watch?v=example4",
        desc: "A detective investigates mysterious disappearances at a remote lake. Action meets mystery in this suspenseful thriller.",
        genres: ["Action", "Mystery", "Thriller"],
        tags: ["detective", "mystery", "disappearances", "lake"]
    },
    {
        title: "Cold Pursuit",
        year: 2017,
        url: "https://www.youtube.com/watch?v=example5",
        desc: "A snowplow driver seeks revenge against the drug dealers he thinks killed his son. Dark action with unexpected twists.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["revenge", "snow", "drug dealers", "thriller"]
    },
    {
        title: "The Hunter's Prayer",
        year: 2017,
        url: "https://www.youtube.com/watch?v=example6",
        desc: "An assassin is assigned to kill a young woman but instead becomes her protector. Action-packed redemption story.",
        genres: ["Action", "Thriller"],
        tags: ["assassin", "protection", "redemption", "thriller"]
    },
    {
        title: "Sicario: Day of the Soldado",
        year: 2018,
        url: "https://www.youtube.com/watch?v=example7",
        desc: "The drug war on the US-Mexico border has escalated. An agent works with a hitman to stop cartels. Intense border action thriller.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["border", "cartel", "drug war", "intense"]
    },
    {
        title: "Peppermint",
        year: 2018,
        url: "https://www.youtube.com/watch?v=example8",
        desc: "A mother seeks revenge against the corrupt system that failed her family. Vigilante action thriller.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["revenge", "mother", "vigilante", "corruption"]
    },
    {
        title: "The Foreigner",
        year: 2017,
        url: "https://www.youtube.com/watch?v=example9",
        desc: "A businessman's quiet life is shattered when his daughter is killed in a terrorist attack. He uses his military skills to find justice.",
        genres: ["Action", "Thriller"],
        tags: ["terrorist", "revenge", "military", "justice"]
    }
];

// Check for duplicates
const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
const toAdd = newMovies.filter(m => !existingTitles.has(m.title.toLowerCase()));

if (toAdd.length === 0) {
    console.log('⚠️  All movies already exist in database');
    process.exit(0);
}

console.log(`\n📽️  Adding ${toAdd.length} action movies...\n`);

let added = 0;
let skipped = 0;

toAdd.forEach(movie => {
    const videoId = extractVideoId(movie.url);
    if (!videoId || movie.url.includes('example')) {
        console.log(`⚠️  Skipping ${movie.title} - needs real YouTube URL`);
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
    console.log(`⚠️  Skipped ${skipped} movies (need real YouTube URLs)`);
}
console.log(`📊 Total movies in database: ${movies.length}\n`);

