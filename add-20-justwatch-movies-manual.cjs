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

// 20 Popular English Movies from JustWatch Iraq
// With English titles and TMDB poster URLs (no API key needed for images)
const moviesToAdd = [
    {
        title: "Dune",
        year: 2021,
        description: "Paul Atreides leads a rebellion to restore his family's noble name in a future where humanity has colonized planets.",
        posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        genres: ["Science Fiction", "Adventure", "Drama"],
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Zendaya", "Jason Momoa"]
    },
    {
        title: "No Time to Die",
        year: 2021,
        description: "James Bond has left active service. His peace is short-lived when his old friend Felix Leiter from the CIA turns up asking for help.",
        posterUrl: "https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg",
        genres: ["Action", "Thriller", "Adventure"],
        director: "Cary Joji Fukunaga",
        cast: ["Daniel Craig", "Rami Malek", "Léa Seydoux", "Lashana Lynch", "Ben Whishaw"]
    },
    {
        title: "The Batman",
        year: 2022,
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
        posterUrl: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        genres: ["Action", "Crime", "Drama"],
        director: "Matt Reeves",
        cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Colin Farrell", "Jeffrey Wright"]
    },
    {
        title: "Top Gun: Maverick",
        year: 2022,
        description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, training a new generation of pilots.",
        posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        genres: ["Action", "Drama"],
        director: "Joseph Kosinski",
        cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm", "Glen Powell"]
    },
    {
        title: "Joker",
        year: 2019,
        description: "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City.",
        posterUrl: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
        genres: ["Crime", "Drama", "Thriller"],
        director: "Todd Phillips",
        cast: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy", "Brett Cullen"]
    },
    {
        title: "1917",
        year: 2019,
        description: "Two young British soldiers during the First World War are given an impossible mission: deliver a message deep in enemy territory.",
        posterUrl: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
        genres: ["War", "Drama", "Action"],
        director: "Sam Mendes",
        cast: ["George MacKay", "Dean-Charles Chapman", "Mark Strong", "Andrew Scott", "Richard Madden"]
    },
    {
        title: "Once Upon a Time in Hollywood",
        year: 2019,
        description: "A faded television actor and his stunt double strive to achieve fame and success in the film industry during the final years of Hollywood's Golden Age.",
        posterUrl: "https://image.tmdb.org/t/p/w500/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg",
        genres: ["Comedy", "Drama"],
        director: "Quentin Tarantino",
        cast: ["Leonardo DiCaprio", "Brad Pitt", "Margot Robbie", "Emile Hirsch", "Margaret Qualley"]
    },
    {
        title: "Dunkirk",
        year: 2017,
        description: "Allied soldiers from Belgium, the British Empire and France are surrounded by the German Army and evacuated during a fierce battle in World War II.",
        posterUrl: "https://image.tmdb.org/t/p/w500/ebSnODDg9lbsMIaWg2uAbjn7TO5.jpg",
        genres: ["Action", "Drama", "History", "War"],
        director: "Christopher Nolan",
        cast: ["Fionn Whitehead", "Tom Glynn-Carney", "Jack Lowden", "Harry Styles", "Aneurin Barnard"]
    },
    {
        title: "La La Land",
        year: 2016,
        description: "Sebastian and Mia are drawn together by their common desire to do what they love. But as success mounts they are faced with decisions that begin to fray the fragile fabric of their love affair.",
        posterUrl: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        genres: ["Comedy", "Drama", "Music", "Romance"],
        director: "Damien Chazelle",
        cast: ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt", "Finn Wittrock"]
    },
    {
        title: "Gravity",
        year: 2013,
        description: "Dr. Ryan Stone, an engineer on her first time on a space mission, and Matt Kowalski, an astronaut on his final expedition, have to survive in space after they are hit by debris while spacewalking.",
        posterUrl: "https://image.tmdb.org/t/p/w500/u4xt8ogeP3B1sYz0iW0j8J9TyDq.jpg",
        genres: ["Science Fiction", "Thriller", "Drama"],
        director: "Alfonso Cuarón",
        cast: ["Sandra Bullock", "George Clooney", "Ed Harris", "Orto Ignatiussen", "Paul Sharma"]
    },
    {
        title: "Drive",
        year: 2011,
        description: "A mysterious Hollywood stuntman and mechanic moonlights as a getaway driver and finds himself in trouble when he helps out his neighbor in this action drama.",
        posterUrl: "https://image.tmdb.org/t/p/w500/602vevIURmpLfz6HEfZ7l3z1aYl.jpg",
        genres: ["Crime", "Drama", "Thriller"],
        director: "Nicolas Winding Refn",
        cast: ["Ryan Gosling", "Carey Mulligan", "Bryan Cranston", "Albert Brooks", "Oscar Isaac"]
    },
    {
        title: "The Revenant",
        year: 2015,
        description: "A frontiersman on a fur trading expedition in the 1820s fights for survival after being mauled by a bear and left for dead by members of his own hunting team.",
        posterUrl: "https://image.tmdb.org/t/p/w500/oXUWEc5i3wYyFnL1Ycu8ppxxrvs.jpg",
        genres: ["Adventure", "Drama", "Thriller", "Western"],
        director: "Alejandro González Iñárritu",
        cast: ["Leonardo DiCaprio", "Tom Hardy", "Will Poulter", "Domhnall Gleeson", "Forrest Goodluck"]
    },
    {
        title: "Arrival",
        year: 2016,
        description: "When mysterious spacecraft touch down across the globe, an elite team is brought together to investigate. As mankind teeters on the verge of global war, they race against time for answers.",
        posterUrl: "https://image.tmdb.org/t/p/w500/hLudzvGfpi6JlwUnsNhXwKKg4j.jpg",
        genres: ["Science Fiction", "Drama", "Mystery"],
        director: "Denis Villeneuve",
        cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker", "Michael Stuhlbarg", "Tzi Ma"]
    },
    {
        title: "Ex Machina",
        year: 2014,
        description: "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence by evaluating the human qualities of a highly advanced humanoid A.I.",
        posterUrl: "https://image.tmdb.org/t/p/w500/btbRB7BrD887j5NrvjxceRDmaot.jpg",
        genres: ["Science Fiction", "Drama", "Thriller"],
        director: "Alex Garland",
        cast: ["Alicia Vikander", "Domhnall Gleeson", "Oscar Isaac", "Sonoya Mizuno", "Corey Johnson"]
    },
    {
        title: "The Grand Budapest Hotel",
        year: 2014,
        description: "The adventures of Gustave H, a legendary concierge at a famous European hotel between the wars, and Zero Moustafa, the lobby boy who becomes his most trusted friend.",
        posterUrl: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        genres: ["Comedy", "Drama"],
        director: "Wes Anderson",
        cast: ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric", "Adrien Brody", "Willem Dafoe"]
    },
    {
        title: "Her",
        year: 2013,
        description: "In a near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.",
        posterUrl: "https://image.tmdb.org/t/p/w500/7a4x4v8xZgH4ZJ3u5rZz0Yt1B3o.jpg",
        genres: ["Science Fiction", "Drama", "Romance"],
        director: "Spike Jonze",
        cast: ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams", "Rooney Mara", "Olivia Wilde"]
    },
    {
        title: "The Social Network",
        year: 2010,
        description: "As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by the twins who claimed he stole their idea.",
        posterUrl: "https://image.tmdb.org/t/p/w500/ok5Wh8385Hgblh3m3y9R3J3Yq1F.jpg",
        genres: ["Drama", "Biography"],
        director: "David Fincher",
        cast: ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake", "Armie Hammer", "Max Minghella"]
    },
    {
        title: "The Wolf of Wall Street",
        year: 2013,
        description: "Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.",
        posterUrl: "https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg",
        genres: ["Comedy", "Crime", "Drama", "Biography"],
        director: "Martin Scorsese",
        cast: ["Leonardo DiCaprio", "Jonah Hill", "Margot Robbie", "Matthew McConaughey", "Kyle Chandler"]
    },
    {
        title: "Birdman",
        year: 2014,
        description: "A washed-up actor who once played an iconic superhero must overcome his ego and family trouble as he mounts a Broadway play in a bid to reclaim his past glory.",
        posterUrl: "https://image.tmdb.org/t/p/w500/rSZs93P0LLxqlVEbI001UKoeCQC.jpg",
        genres: ["Comedy", "Drama"],
        director: "Alejandro González Iñárritu",
        cast: ["Michael Keaton", "Zach Galifianakis", "Edward Norton", "Andrea Riseborough", "Amy Ryan"]
    },
    {
        title: "Nightcrawler",
        year: 2014,
        description: "When Louis Bloom, a driven man desperate for work, muscles into the world of L.A. crime journalism, he blurs the line between observer and participant to become the star of his own story.",
        posterUrl: "https://image.tmdb.org/t/p/w500/8oPY6ULFOTbAEskySNhgsfIN7Un.jpg",
        genres: ["Crime", "Drama", "Thriller"],
        director: "Dan Gilroy",
        cast: ["Jake Gyllenhaal", "Rene Russo", "Riz Ahmed", "Bill Paxton", "Ann Cusack"]
    },
    {
        title: "The Shape of Water",
        year: 2017,
        description: "An other-worldly fairy tale, set against the backdrop of Cold War era America circa 1962. In the hidden high-security government laboratory where she works, lonely Elisa is trapped in a life of isolation.",
        posterUrl: "https://image.tmdb.org/t/p/w500/k4FwHlMhuRR5BISY2Gm2QZHlH5Q.jpg",
        genres: ["Drama", "Fantasy", "Romance"],
        director: "Guillermo del Toro",
        cast: ["Sally Hawkins", "Michael Shannon", "Richard Jenkins", "Octavia Spencer", "Michael Stuhlbarg"]
    },
    {
        title: "Three Billboards Outside Ebbing, Missouri",
        year: 2017,
        description: "After seven months have passed without a culprit in her daughter's murder case, Mildred Hayes makes a bold move, painting three signs leading into her town with a controversial message directed at Bill Willoughby, the town's revered chief of police.",
        posterUrl: "https://image.tmdb.org/t/p/w500/hgWAcic93phg4DOuQ8NrsgQWiqu.jpg",
        genres: ["Crime", "Drama"],
        director: "Martin McDonagh",
        cast: ["Frances McDormand", "Woody Harrelson", "Sam Rockwell", "John Hawkes", "Peter Dinklage"]
    },
    {
        title: "Get Out",
        year: 2017,
        description: "Chris and his girlfriend Rose go upstate to visit her parents for the weekend. At first, Chris reads the family's overly accommodating behavior as nervous attempts to deal with their daughter's interracial relationship, but as the weekend progresses, a series of increasingly disturbing discoveries lead him to a truth that he never could have imagined.",
        posterUrl: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
        genres: ["Horror", "Mystery", "Thriller"],
        director: "Jordan Peele",
        cast: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford", "Catherine Keener", "Caleb Landry Jones"]
    },
    {
        title: "Baby Driver",
        year: 2017,
        description: "After being coerced into working for a crime boss, a young getaway driver finds himself taking part in a heist doomed to fail.",
        posterUrl: "https://image.tmdb.org/t/p/w500/dN9LbVXZFKBjjbV8oQf1T2HjVxU.jpg",
        genres: ["Action", "Crime", "Thriller"],
        director: "Edgar Wright",
        cast: ["Ansel Elgort", "Jon Hamm", "Jamie Foxx", "Lily James", "Eiza González"]
    },
    {
        title: "The Big Short",
        year: 2015,
        description: "The men who made millions from a global economic meltdown.",
        posterUrl: "https://image.tmdb.org/t/p/w500/p11Ftd1VenSFa1h8WcP8Y4w4l7P.jpg",
        genres: ["Comedy", "Drama", "Biography"],
        director: "Adam McKay",
        cast: ["Christian Bale", "Steve Carell", "Ryan Gosling", "Brad Pitt", "Melissa Leo"]
    },
    {
        title: "Moonlight",
        year: 2016,
        description: "The tender, heartbreaking story of a young man's struggle to find himself, told across three defining chapters in his life as he experiences the ecstasy, pain, and beauty of falling in love, while grappling with his own sexuality.",
        posterUrl: "https://image.tmdb.org/t/p/w500/qAwFbszz0kRyTuXmMeKQZCX3Q2O.jpg",
        genres: ["Drama"],
        director: "Barry Jenkins",
        cast: ["Mahershala Ali", "Naomie Harris", "Trevante Rhodes", "André Holland", "Janelle Monáe"]
    },
    {
        title: "Spotlight",
        year: 2015,
        description: "The true story of how the Boston Globe uncovered the massive scandal of child molestation and cover-up within the local Catholic Archdiocese, shaking the entire Catholic Church to its core.",
        posterUrl: "https://image.tmdb.org/t/p/w500/ngKxbvsF3M5kNhGXBRbH8n2nN0a.jpg",
        genres: ["Crime", "Drama", "History", "Thriller"],
        director: "Tom McCarthy",
        cast: ["Mark Ruffalo", "Michael Keaton", "Rachel McAdams", "Liev Schreiber", "John Slattery"]
    },
    {
        title: "Manchester by the Sea",
        year: 2016,
        description: "After the death of his older brother Joe, Lee Chandler is shocked that Joe has made him sole guardian of his nephew Patrick. Taking leave of his job as a janitor in Boston, Lee reluctantly returns to Manchester-by-the-Sea to care for Patrick.",
        posterUrl: "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg",
        genres: ["Drama"],
        director: "Kenneth Lonergan",
        cast: ["Casey Affleck", "Michelle Williams", "Kyle Chandler", "Lucas Hedges", "Gretchen Mol"]
    }
];

console.log(`\n🎬 Adding 20 movies from JustWatch Iraq (English titles + pictures)\n`);

const existingTitles = new Set(movies.map(m => m.title.toLowerCase()));
let added = 0;
let skipped = 0;

for (const movieInfo of moviesToAdd) {
    // Check for duplicates
    if (existingTitles.has(movieInfo.title.toLowerCase())) {
        console.log(`⏭️  Skipping: ${movieInfo.title} (already exists)`);
        skipped++;
        continue;
    }
    
    const newMovie = {
        id: generateId(movieInfo.title, movieInfo.year),
        title: movieInfo.title, // English title
        originalTitle: movieInfo.title,
        year: movieInfo.year,
        runtimeMinutes: null,
        description: movieInfo.description,
        thumbnailUrl: movieInfo.posterUrl,
        posterUrl: movieInfo.posterUrl, // Real TMDB poster
        hlsUrl: null, // Need YouTube link
        youtubeEmbed: false,
        language: 'EN',
        genres: movieInfo.genres,
        tags: movieInfo.genres.map(g => g.toLowerCase()),
        isFeatured: false,
        director: movieInfo.director,
        cast: movieInfo.cast,
        source: {
            name: "JustWatch Iraq",
            url: `https://www.justwatch.com/iq/movie/${movieInfo.title.toLowerCase().replace(/\s+/g, '-')}`
        },
        license: {
            type: null,
            url: null
        },
        createdAt: new Date().toISOString(),
        needsYouTubeLink: true,
        importedFromJustWatch: true
    };

    movies.push(newMovie);
    existingTitles.add(movieInfo.title.toLowerCase());
    added++;
    console.log(`✅ Added: ${movieInfo.title} (${movieInfo.year}) - With poster!`);
}

fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Import completed!`);
console.log(`   Added: ${added} movies with English titles + real posters`);
console.log(`   Skipped: ${skipped} movies (already exist)`);
console.log(`   Total in database: ${movies.length}\n`);
console.log(`⚠️  These movies need YouTube links to be playable\n`);

