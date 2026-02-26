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

// 50 Popular Movies from JustWatch Iraq - Force Add (No YouTube links yet)
// These are popular movies that would be available on JustWatch
const newMovies = [
    // Action Movies
    { title: "John Wick", year: 2014, genres: ["Action", "Crime", "Thriller"], desc: "An ex-hitman comes out of retirement to track down the gangsters that killed his dog and stole his car." },
    { title: "Mad Max: Fury Road", year: 2015, genres: ["Action", "Adventure", "Sci-Fi"], desc: "In a post-apocalyptic wasteland, Max teams up with a mysterious woman to escape from a tyrannical warlord." },
    { title: "The Dark Knight", year: 2008, genres: ["Action", "Crime", "Drama"], desc: "Batman faces the Joker, a criminal mastermind who seeks to undermine Batman's influence and create chaos." },
    { title: "Inception", year: 2010, genres: ["Action", "Sci-Fi", "Thriller"], desc: "A thief who steals corporate secrets through dream-sharing technology is given a chance at redemption." },
    { title: "The Matrix", year: 1999, genres: ["Action", "Sci-Fi"], desc: "A computer hacker learns about the true nature of reality and his role in the war against its controllers." },
    { title: "Gladiator", year: 2000, genres: ["Action", "Adventure", "Drama"], desc: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family." },
    { title: "The Bourne Identity", year: 2002, genres: ["Action", "Mystery", "Thriller"], desc: "A man is picked up by a fishing boat, bullet-riddled and suffering from amnesia, before racing to elude assassins." },
    { title: "Mission: Impossible", year: 1996, genres: ["Action", "Adventure", "Thriller"], desc: "An American agent, under false suspicion of disloyalty, must discover and expose the real spy." },
    { title: "Fast & Furious", year: 2009, genres: ["Action", "Crime", "Thriller"], desc: "Brian O'Conner, now working for the FBI, teams up with Dominic Toretto to bring down a heroin importer." },
    { title: "Die Hard", year: 1988, genres: ["Action", "Thriller"], desc: "A New York City police officer tries to save his estranged wife and several others taken hostage by terrorists." },
    
    // Drama Movies
    { title: "The Shawshank Redemption", year: 1994, genres: ["Drama"], desc: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency." },
    { title: "Forrest Gump", year: 1994, genres: ["Drama", "Romance"], desc: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold through the perspective of an Alabama man." },
    { title: "The Godfather", year: 1972, genres: ["Crime", "Drama"], desc: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son." },
    { title: "Pulp Fiction", year: 1994, genres: ["Crime", "Drama"], desc: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence." },
    { title: "Fight Club", year: 1999, genres: ["Drama"], desc: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much bigger." },
    { title: "Goodfellas", year: 1990, genres: ["Biography", "Crime", "Drama"], desc: "The story of Henry Hill and his life in the mob, covering his relationship with his wife and his partners." },
    { title: "The Departed", year: 2006, genres: ["Crime", "Drama", "Thriller"], desc: "An undercover cop and a mole in the police force attempt to identify each other while infiltrating an Irish gang." },
    { title: "Scarface", year: 1983, genres: ["Crime", "Drama"], desc: "In 1980 Miami, a determined Cuban immigrant takes over a drug cartel and succumbs to greed." },
    { title: "American History X", year: 1998, genres: ["Drama"], desc: "A former neo-nazi skinhead tries to prevent his younger brother from going down the same wrong path that he did." },
    { title: "The Green Mile", year: 1999, genres: ["Crime", "Drama", "Fantasy"], desc: "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder." },
    
    // Thriller Movies
    { title: "Se7en", year: 1995, genres: ["Crime", "Drama", "Mystery"], desc: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives." },
    { title: "The Silence of the Lambs", year: 1991, genres: ["Crime", "Drama", "Thriller"], desc: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer." },
    { title: "Shutter Island", year: 2010, genres: ["Mystery", "Thriller"], desc: "In 1954, a U.S. Marshal investigates the disappearance of a murderess who escaped from a hospital for the criminally insane." },
    { title: "Gone Girl", year: 2014, genres: ["Drama", "Mystery", "Thriller"], desc: "With his wife's disappearance having become the focus of the media, a man sees the spotlight turned on him when it's suspected that he killed her." },
    { title: "Zodiac", year: 2007, genres: ["Crime", "Drama", "Mystery"], desc: "Between 1968 and 1983, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer." },
    { title: "Memento", year: 2000, genres: ["Mystery", "Thriller"], desc: "A man with short-term memory loss attempts to track down his wife's murderer." },
    { title: "The Prestige", year: 2006, genres: ["Drama", "Mystery", "Thriller"], desc: "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything." },
    { title: "No Country for Old Men", year: 2007, genres: ["Crime", "Drama", "Thriller"], desc: "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash." },
    { title: "Oldboy", year: 2003, genres: ["Action", "Drama", "Mystery"], desc: "After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released, only to find that he must find his captor in five days." },
    { title: "Parasite", year: 2019, genres: ["Comedy", "Drama", "Thriller"], desc: "A poor family schemes to become employed by a wealthy family by infiltrating their household and posing as unrelated, highly qualified individuals." },
    
    // Sci-Fi Movies
    { title: "Interstellar", year: 2014, genres: ["Adventure", "Drama", "Sci-Fi"], desc: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
    { title: "Blade Runner 2049", year: 2017, genres: ["Action", "Drama", "Mystery"], desc: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard." },
    { title: "The Martian", year: 2015, genres: ["Adventure", "Drama", "Sci-Fi"], desc: "An astronaut becomes stranded on Mars after his team assume him dead, and must rely on his ingenuity to find a way to signal Earth." },
    { title: "Arrival", year: 2016, genres: ["Drama", "Sci-Fi", "Thriller"], desc: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world." },
    { title: "Ex Machina", year: 2014, genres: ["Drama", "Sci-Fi", "Thriller"], desc: "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence by evaluating the human qualities of a highly advanced humanoid A.I." },
    { title: "District 9", year: 2009, genres: ["Action", "Sci-Fi", "Thriller"], desc: "Violence ensues after an extraterrestrial race forced to live in slum-like conditions on Earth finds a kindred spirit in a government agent." },
    { title: "Children of Men", year: 2006, genres: ["Drama", "Sci-Fi", "Thriller"], desc: "In 2027, in a chaotic world in which women have become somehow infertile, a former activist agrees to help transport a miraculously pregnant woman to a sanctuary at sea." },
    { title: "Her", year: 2013, genres: ["Drama", "Romance", "Sci-Fi"], desc: "In a near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need." },
    { title: "Edge of Tomorrow", year: 2014, genres: ["Action", "Adventure", "Sci-Fi"], desc: "A soldier fighting aliens gets to relive the same day over and over again, the day restarting every time he dies." },
    { title: "Looper", year: 2012, genres: ["Action", "Crime", "Sci-Fi"], desc: "In 2074, when the mob wants to get rid of someone, the target is sent into the past, where a hired gun awaits." },
    
    // Horror Movies
    { title: "The Shining", year: 1980, genres: ["Drama", "Horror"], desc: "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence." },
    { title: "Get Out", year: 2017, genres: ["Horror", "Mystery", "Thriller"], desc: "A young African-American visits his white girlfriend's parents for the weekend, where his uneasiness about their reception of him eventually reaches a boiling point." },
    { title: "Hereditary", year: 2018, genres: ["Drama", "Horror", "Mystery"], desc: "A grieving family is haunted by tragic and disturbing occurrences." },
    { title: "The Conjuring", year: 2013, genres: ["Horror", "Mystery", "Thriller"], desc: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse." },
    { title: "It", year: 2017, genres: ["Horror"], desc: "In the summer of 1989, a group of bullied kids band together to destroy a shape-shifting monster, which disguises itself as a clown." },
    { title: "A Quiet Place", year: 2018, genres: ["Drama", "Horror", "Sci-Fi"], desc: "In a post-apocalyptic world, a family is forced to live in silence while hiding from monsters with ultra-sensitive hearing." },
    { title: "The Exorcist", year: 1973, genres: ["Horror"], desc: "When a 12-year-old girl is possessed by a mysterious entity, her mother seeks the help of two priests to save her." },
    { title: "The Ring", year: 2002, genres: ["Horror", "Mystery"], desc: "A journalist must investigate a mysterious videotape which seems to cause the death of anyone one week to the day after they view it." },
    { title: "Saw", year: 2004, genres: ["Horror", "Mystery", "Thriller"], desc: "Two strangers awaken in a room with no memory of how they got there, and soon discover they're pawns in a deadly game." },
    { title: "The Babadook", year: 2014, genres: ["Drama", "Horror", "Thriller"], desc: "A single mother and her child fall into a deep well of paranoia when an eerie children's book titled 'Mister Babadook' manifests in their home." },
    
    // Comedy Movies
    { title: "The Grand Budapest Hotel", year: 2014, genres: ["Adventure", "Comedy", "Drama"], desc: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years." },
    { title: "Superbad", year: 2007, genres: ["Comedy"], desc: "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry." },
    { title: "The Hangover", year: 2009, genres: ["Comedy"], desc: "Three buddies wake up from a bachelor party in Las Vegas, with no memory of the previous night and the bachelor missing." },
    { title: "Borat", year: 2006, genres: ["Comedy"], desc: "Kazakh TV talking head Borat is dispatched to America to report on the greatest country in the world." },
    { title: "Step Brothers", year: 2008, genres: ["Comedy"], desc: "Two aimless middle-aged losers still living at home are forced against their will to become roommates when their parents marry." }
];

// Check for duplicates
const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
const toAdd = newMovies.filter(m => !existingTitles.has(m.title.toLowerCase()));

if (toAdd.length === 0) {
    console.log('⚠️  All movies already exist in database');
    process.exit(0);
}

console.log(`\n📽️  Force Adding ${toAdd.length} movies from JustWatch (No YouTube links yet)...\n`);

toAdd.forEach(movie => {
    const newMovie = {
        id: generateId(movie.title, movie.year),
        title: movie.title,
        originalTitle: movie.title,
        year: movie.year,
        runtimeMinutes: null,
        description: movie.desc,
        thumbnailUrl: "https://placehold.co/300x450/0f172a/ffffff?text=" + encodeURIComponent(movie.title.substring(0, 20)),
        posterUrl: "https://placehold.co/300x450/0f172a/ffffff?text=" + encodeURIComponent(movie.title.substring(0, 20)),
        hlsUrl: null, // No YouTube link yet - will be added later
        youtubeEmbed: false,
        language: 'EN',
        genres: movie.genres,
        tags: movie.genres.map(g => g.toLowerCase()),
        isFeatured: false,
        director: null,
        cast: null,
        source: {
            name: "JustWatch Iraq",
            url: `https://www.justwatch.com/iq/movie/${movie.title.toLowerCase().replace(/\s+/g, '-')}`
        },
        license: {
            type: null,
            url: null
        },
        createdAt: new Date().toISOString(),
        needsYouTubeLink: true // Flag to indicate YouTube link needs to be added
    };

    movies.push(newMovie);
    console.log(`✅ Added: ${movie.title} (${movie.year}) - [YouTube link needed]`);
});

// Write updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Successfully force added ${toAdd.length} movies!`);
console.log(`⚠️  NOTE: These movies need YouTube links to be playable`);
console.log(`📊 Total movies in database: ${movies.length}\n`);

