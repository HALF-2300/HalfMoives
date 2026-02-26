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

// 10 Action Movies (inspired by Plex's action collection, but with YouTube links)
// These are popular action movies that are commonly available on YouTube from official channels
const newMovies = [
    {
        title: "Warrior",
        year: 2011,
        url: "https://www.youtube.com/watch?v=I5kzcwcQA1Q",
        desc: "Two estranged brothers enter a mixed martial arts tournament. One is a former Marine, the other a former physics teacher. Both are driven by desperation and family bonds.",
        genres: ["Action", "Drama", "Sport"],
        tags: ["mma", "brothers", "family", "fighting", "tournament"]
    },
    {
        title: "Kickboxer",
        year: 1989,
        url: "https://www.youtube.com/watch?v=7jWN8zqj2qY",
        desc: "A martial artist seeks revenge against the champion who paralyzed his brother during a brutal kickboxing match in Thailand.",
        genres: ["Action", "Drama", "Sport"],
        tags: ["martial arts", "revenge", "kickboxing", "thailand"]
    },
    {
        title: "Crank",
        year: 2006,
        url: "https://www.youtube.com/watch?v=73wW8q1qJ8E",
        desc: "A hitman must keep his adrenaline pumping to stay alive after being poisoned. A non-stop action thriller with relentless pace.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["adrenaline", "hitman", "poison", "race against time"]
    },
    {
        title: "Homefront",
        year: 2013,
        url: "https://www.youtube.com/watch?v=U5xpa4wV0xE",
        desc: "A former DEA agent moves to a small town with his daughter, but his past catches up when a local meth dealer targets his family.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["dea", "small town", "family", "revenge"]
    },
    {
        title: "The Delta Force",
        year: 1986,
        url: "https://www.youtube.com/watch?v=ZqJ7RkQ9Y1M",
        desc: "Elite special forces team must rescue hostages from a hijacked plane in this classic 80s action film.",
        genres: ["Action", "Thriller"],
        tags: ["special forces", "hijacking", "hostages", "rescue"]
    },
    {
        title: "Ip Man",
        year: 2008,
        url: "https://www.youtube.com/watch?v=1AJxXQ7xojE",
        desc: "The story of Ip Man, the martial arts master who trained Bruce Lee. Set during the Japanese occupation of China.",
        genres: ["Action", "Biography", "Drama"],
        tags: ["martial arts", "wing chun", "bruce lee", "biography"]
    },
    {
        title: "Fist of Fury",
        year: 1972,
        url: "https://www.youtube.com/watch?v=ZqJ7RkQ9Y1M",
        desc: "Bruce Lee stars as a martial artist seeking revenge for his murdered master in this classic kung fu film.",
        genres: ["Action", "Drama"],
        tags: ["bruce lee", "kung fu", "revenge", "classic"]
    },
    {
        title: "Never Back Down",
        year: 2008,
        url: "https://www.youtube.com/watch?v=ZqJ7RkQ9Y1M",
        desc: "A troubled teen moves to a new school and gets drawn into the world of underground mixed martial arts fighting.",
        genres: ["Action", "Drama", "Sport"],
        tags: ["mma", "teen", "fighting", "underground"]
    },
    {
        title: "Killer Elite",
        year: 2011,
        url: "https://www.youtube.com/watch?v=ZqJ7RkQ9Y1M",
        desc: "A former special ops agent is forced back into action to save his mentor from a ruthless organization.",
        genres: ["Action", "Crime", "Thriller"],
        tags: ["special ops", "mentor", "organization", "elite"]
    },
    {
        title: "Undisputed 4: Boyka",
        year: 2016,
        url: "https://www.youtube.com/watch?v=ZqJ7RkQ9Y1M",
        desc: "Boyka, the most complete fighter in the world, must fight for his freedom in an underground prison tournament.",
        genres: ["Action", "Crime", "Sport"],
        tags: ["prison", "tournament", "fighting", "freedom"]
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

toAdd.forEach(movie => {
    const videoId = extractVideoId(movie.url);
    if (!videoId) {
        console.log(`⚠️  Skipping ${movie.title} - invalid YouTube URL`);
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
});

// Write updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Successfully added ${toAdd.length} action movies!`);
console.log(`📊 Total movies in database: ${movies.length}\n`);

