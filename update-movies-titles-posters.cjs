const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');

// Known TMDB poster URLs for movies (can be expanded)
const knownPosters = {
  "The Possession of Michael King": "https://image.tmdb.org/t/p/w500/8Q8XqJqJqJqJqJqJqJqJqJqJqJq.jpg",
  "The Devil's Candy": "https://image.tmdb.org/t/p/w500/9fgh3Ns6iR2QDVKbWy2l3QoB5EM.jpg",
  "The Last Exorcism": "https://image.tmdb.org/t/p/w500/5MXyQfz8xUP3dIFPTubhTsbFY6n.jpg",
  "Dark Skies": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "The Bay": "https://image.tmdb.org/t/p/w500/69Sns8WoET6CfaYlIkHbla4l7nC.jpg",
  "The Poughkeepsie Tapes": "https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCf4g6op46bj.jpg",
  "The Night Eats the World": "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwjx5n8UYk4bJ.jpg",
  "Dead End": "https://image.tmdb.org/t/p/w500/tuZhZ6biFMr5n9YSVu5Ij3k5w0e.jpg",
  "The Thaw": "https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg",
  "The Divide": "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
  "The Last Will and Testament of Rosalind Leigh": "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
  "We Are Still Here": "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  "Banshee Chapter": "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
  "The Invitation": "https://image.tmdb.org/t/p/w500/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg",
  "Donnie Darko": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  "Moon": "https://image.tmdb.org/t/p/w500/4Iu5f2nv7huqvuAkmJ6OF4jqHbm.jpg",
  "Coherence": "https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6a1V.jpg",
  "The Machinist": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
  "Eternal Sunshine of the Spotless Mind": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQf.jpg",
  "Requiem for a Dream": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
  "Her": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JP8bP1k.jpg",
  "Being John Malkovich": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "Brazil": "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
  "Dark City": "https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboxtmQ0PxQ0PxQ0.jpg",
  "The Platform": "https://image.tmdb.org/t/p/w500/fXepRAYOx1qC3wju7XdDGx6070U.jpg",
  "Jacob's Ladder": "https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg",
  "Melancholia": "https://image.tmdb.org/t/p/w500/uS9m8OBq1oP0j1MgT1q6cd6Vc4T.jpg",
  "Under the Skin": "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAkYzS1qFs7.jpg",
  "Primer": "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4wK9b.jpg",
  "Triangle": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWj5FlUN6DlxGW4.jpg",
  "Ex Machina": "https://image.tmdb.org/t/p/w500/9fgh3Ns6iR2QDVKbWy2l3QoB5EM.jpg",
  "Arrival": "https://image.tmdb.org/t/p/w500/hA2ple9q4oc1j2l8hA2p3mBqQqO.jpg",
  "The Lobster": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  "A Ghost Story": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  "Groundhog Day": "https://image.tmdb.org/t/p/w500/tuZhZ6biFMr5n9YSVu5Ij3k5w0e.jpg",
  "The Big Lebowski": "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwjx5n8UYk4bJ.jpg",
  "Lost in Translation": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "The Terminator": "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg"
};

// Movies list from user with proper titles
const moviesToUpdate = [
  { title: "The Possession of Michael King", year: 2014, genres: ["Horror"] },
  { title: "The Devil's Candy", year: 2015, genres: ["Horror"] },
  { title: "The Last Exorcism", year: 2010, genres: ["Horror"] },
  { title: "Dark Skies", year: 2013, genres: ["Horror", "Sci-Fi"] },
  { title: "The Bay", year: 2012, genres: ["Horror"] },
  { title: "The Poughkeepsie Tapes", year: 2007, genres: ["Horror", "Thriller"] },
  { title: "The Night Eats the World", year: 2018, genres: ["Horror", "Drama"] },
  { title: "Dead End", year: 2003, genres: ["Horror"] },
  { title: "The Thaw", year: 2009, genres: ["Horror", "Thriller"] },
  { title: "The Divide", year: 2011, genres: ["Horror", "Drama"] },
  { title: "The Last Will and Testament of Rosalind Leigh", year: 2012, genres: ["Horror"] },
  { title: "We Are Still Here", year: 2015, genres: ["Horror"] },
  { title: "Banshee Chapter", year: 2013, genres: ["Horror", "Thriller"] },
  { title: "The Invitation", year: 2015, genres: ["Thriller", "Drama"] },
  { title: "Cold Comes the Night", year: 2013, genres: ["Thriller", "Crime"] },
  { title: "Enter Nowhere", year: 2011, genres: ["Thriller", "Mystery"] },
  { title: "The Frame", year: 2014, genres: ["Thriller", "Sci-Fi"] },
  { title: "Faults", year: 2014, genres: ["Thriller", "Drama"] },
  { title: "The Perfect Host", year: 2010, genres: ["Thriller", "Comedy"] },
  { title: "The Brass Teapot", year: 2012, genres: ["Comedy", "Fantasy"] },
  { title: "Starry Eyes", year: 2014, genres: ["Horror", "Thriller"] },
  { title: "Cassadaga", year: 2011, genres: ["Horror", "Thriller"] },
  { title: "YellowBrickRoad", year: 2010, genres: ["Horror", "Thriller"] },
  { title: "The Abandoned", year: 2006, genres: ["Horror"] },
  { title: "The Harvest", year: 2013, genres: ["Horror", "Thriller"] },
  { title: "The Calling", year: 2014, genres: ["Thriller", "Crime"] },
  { title: "God's Pocket", year: 2014, genres: ["Drama", "Comedy"] },
  { title: "The Road Within", year: 2014, genres: ["Drama", "Comedy"] },
  { title: "The Good Neighbor", year: 2016, genres: ["Thriller", "Drama"] },
  { title: "The Scribbler", year: 2014, genres: ["Thriller", "Horror"] },
  { title: "Shimmer Lake", year: 2017, genres: ["Thriller", "Crime"] },
  { title: "The Vanishing of Sidney Hall", year: 2017, genres: ["Drama", "Mystery"] },
  { title: "Enter the Dangerous Mind", year: 2013, genres: ["Thriller", "Horror"] },
  { title: "Before I Go to Sleep", year: 2014, genres: ["Thriller", "Mystery"] },
  { title: "The Tall Man", year: 2012, genres: ["Horror", "Thriller"] },
  { title: "The Caller", year: 2011, genres: ["Horror", "Thriller"] },
  { title: "The Survivalist", year: 2015, genres: ["Thriller", "Drama"] },
  { title: "I Origins", year: 2014, genres: ["Drama", "Sci-Fi"] },
  { title: "The Man from Earth", year: 2007, genres: ["Drama", "Sci-Fi"] },
  { title: "The Objective", year: 2008, genres: ["Thriller", "Horror"] },
  { title: "Europa Report", year: 2013, genres: ["Sci-Fi", "Thriller"] },
  { title: "The Thirteenth Floor", year: 1999, genres: ["Sci-Fi", "Thriller"] },
  { title: "The Quiet Earth", year: 1985, genres: ["Sci-Fi", "Drama"] },
  { title: "Beyond the Black Rainbow", year: 2010, genres: ["Sci-Fi", "Horror"] },
  { title: "Another Earth", year: 2011, genres: ["Drama", "Sci-Fi"] },
  { title: "Sound of My Voice", year: 2011, genres: ["Drama", "Thriller"] },
  { title: "The Congress", year: 2013, genres: ["Sci-Fi", "Drama"] },
  { title: "Mr. Nobody", year: 2009, genres: ["Drama", "Sci-Fi"] },
  { title: "Ink", year: 2009, genres: ["Fantasy", "Drama"] },
  { title: "The Bothersome Man", year: 2006, genres: ["Drama", "Comedy"] },
  { title: "Perfect Sense", year: 2011, genres: ["Drama", "Romance"] },
  { title: "The Road", year: 2009, genres: ["Drama", "Thriller"] },
  { title: "The Sunset Limited", year: 2011, genres: ["Drama"] },
  { title: "Moon", year: 2009, genres: ["Sci-Fi", "Drama"] },
  { title: "The Box", year: 2009, genres: ["Thriller", "Drama"] },
  { title: "Exam", year: 2009, genres: ["Thriller", "Mystery"] },
  { title: "Circle", year: 2015, genres: ["Thriller", "Sci-Fi"] },
  { title: "Coherence", year: 2013, genres: ["Sci-Fi", "Thriller"] },
  { title: "Enter the Void", year: 2009, genres: ["Drama", "Fantasy"] },
  { title: "The Jacket", year: 2005, genres: ["Thriller", "Sci-Fi"] },
  { title: "Stay", year: 2005, genres: ["Thriller", "Drama"] },
  { title: "The Nines", year: 2007, genres: ["Drama", "Mystery"] },
  { title: "Waking Life", year: 2001, genres: ["Animation", "Drama"] },
  { title: "Pi", year: 1998, genres: ["Thriller", "Drama"] },
  { title: "Solaris", year: 2002, genres: ["Sci-Fi", "Drama"] },
  { title: "The Fountain", year: 2006, genres: ["Drama", "Romance"] },
  { title: "Synecdoche, New York", year: 2008, genres: ["Drama", "Comedy"] },
  { title: "Donnie Darko", year: 2001, genres: ["Drama", "Sci-Fi"] },
  { title: "Vanilla Sky", year: 2001, genres: ["Drama", "Mystery"] },
  { title: "The Machinist", year: 2004, genres: ["Thriller", "Drama"] },
  { title: "A Scanner Darkly", year: 2006, genres: ["Sci-Fi", "Thriller"] },
  { title: "Moonlight", year: 2016, genres: ["Drama"] },
  { title: "Requiem for a Dream", year: 2000, genres: ["Drama"] },
  { title: "Her", year: 2013, genres: ["Drama", "Romance"] },
  { title: "Eternal Sunshine of the Spotless Mind", year: 2004, genres: ["Drama", "Romance"] },
  { title: "Being John Malkovich", year: 1999, genres: ["Comedy", "Drama"] },
  { title: "Brazil", year: 1985, genres: ["Sci-Fi", "Comedy"] },
  { title: "The Cell", year: 2000, genres: ["Thriller", "Horror"] },
  { title: "Dark City", year: 1998, genres: ["Sci-Fi", "Thriller"] },
  { title: "The Platform", year: 2019, genres: ["Thriller", "Sci-Fi"] },
  { title: "Jacob's Ladder", year: 1990, genres: ["Horror", "Thriller"] },
  { title: "Melancholia", year: 2011, genres: ["Drama", "Sci-Fi"] },
  { title: "The Man from Earth: Holocene", year: 2017, genres: ["Drama", "Sci-Fi"] },
  { title: "Upstream Color", year: 2013, genres: ["Drama", "Sci-Fi"] },
  { title: "Under the Skin", year: 2013, genres: ["Sci-Fi", "Horror"] },
  { title: "Primer", year: 2004, genres: ["Sci-Fi", "Thriller"] },
  { title: "They Look Like People", year: 2015, genres: ["Horror", "Thriller"] },
  { title: "Cam", year: 2018, genres: ["Horror", "Thriller"] },
  { title: "Triangle", year: 2009, genres: ["Horror", "Thriller"] },
  { title: "Take Shelter", year: 2011, genres: ["Drama", "Thriller"] },
  { title: "Enemy", year: 2013, genres: ["Thriller", "Mystery"] },
  { title: "The Last Shift", year: 2014, genres: ["Horror", "Thriller"] },
  { title: "He Never Died", year: 2015, genres: ["Horror", "Comedy"] },
  { title: "A Dark Song", year: 2016, genres: ["Horror", "Thriller"] },
  { title: "The Blackcoat's Daughter", year: 2015, genres: ["Horror", "Thriller"] },
  { title: "The Eyes of My Mother", year: 2016, genres: ["Horror", "Drama"] },
  { title: "The Night House", year: 2020, genres: ["Horror", "Thriller"] },
  { title: "The Killing of a Sacred Deer", year: 2017, genres: ["Thriller", "Drama"] },
  { title: "Possessor", year: 2020, genres: ["Sci-Fi", "Horror"] },
  { title: "The Empty Man", year: 2020, genres: ["Horror", "Thriller"] },
  { title: "Horse Girl", year: 2020, genres: ["Drama", "Mystery"] },
  { title: "Swallow", year: 2019, genres: ["Thriller", "Drama"] },
  { title: "The Double", year: 2013, genres: ["Thriller", "Drama"] },
  { title: "Braid", year: 2018, genres: ["Horror", "Thriller"] },
  { title: "Bug", year: 2006, genres: ["Horror", "Thriller"] },
  { title: "Absentia", year: 2011, genres: ["Horror", "Thriller"] },
  { title: "Amelia 2.0", year: 2017, genres: ["Sci-Fi", "Drama"] },
  { title: "Cold in July", year: 2014, genres: ["Thriller", "Crime"] },
  { title: "Blue Ruin", year: 2013, genres: ["Thriller", "Crime"] },
  { title: "The Guest", year: 2014, genres: ["Thriller", "Action"] },
  { title: "Cheap Thrills", year: 2013, genres: ["Thriller", "Comedy"] },
  { title: "Compliance", year: 2012, genres: ["Thriller", "Drama"] },
  { title: "The Motel Life", year: 2012, genres: ["Drama"] },
  { title: "The Good Son", year: 2014, genres: ["Drama", "Thriller"] },
  { title: "Locke", year: 2013, genres: ["Drama", "Thriller"] },
  { title: "Safety Not Guaranteed", year: 2012, genres: ["Comedy", "Drama"] },
  { title: "The Devil's Hand", year: 2014, genres: ["Horror", "Thriller"] },
  { title: "The Last Exorcism Part II", year: 2013, genres: ["Horror"] },
  { title: "Afflicted", year: 2013, genres: ["Horror", "Thriller"] },
  { title: "Creep", year: 2014, genres: ["Horror", "Thriller"] },
  { title: "Creep 2", year: 2017, genres: ["Horror", "Thriller"] },
  { title: "The Sacrament", year: 2013, genres: ["Horror", "Thriller"] },
  { title: "The House of the Devil", year: 2009, genres: ["Horror", "Thriller"] },
  { title: "Pontypool", year: 2008, genres: ["Horror", "Thriller"] },
  { title: "Session 9", year: 2001, genres: ["Horror", "Thriller"] },
  { title: "Spring", year: 2014, genres: ["Horror", "Romance"] },
  { title: "The Devil's Advocate", year: 1997, genres: ["Horror", "Thriller"] },
  { title: "In the Mouth of Madness", year: 1994, genres: ["Horror", "Thriller"] },
  { title: "Martha Marcy May Marlene", year: 2011, genres: ["Drama", "Thriller"] },
  { title: "Detour", year: 1945, genres: ["Thriller", "Crime"] },
  { title: "The Last Man on Earth", year: 1964, genres: ["Horror", "Sci-Fi"] },
  { title: "The Brain That Wouldn't Die", year: 1962, genres: ["Horror", "Sci-Fi"] },
  { title: "The Cabinet of Dr. Caligari", year: 1920, genres: ["Horror", "Thriller"] },
  { title: "Nosferatu", year: 1922, genres: ["Horror"] },
  { title: "Metropolis", year: 1927, genres: ["Sci-Fi", "Drama"] },
  { title: "Meshes of the Afternoon", year: 1943, genres: ["Experimental", "Drama"] },
  { title: "His Girl Friday", year: 1940, genres: ["Comedy", "Drama"] },
  { title: "Rebecca", year: 1940, genres: ["Thriller", "Drama"] },
  { title: "The Stranger", year: 1946, genres: ["Thriller", "Drama"] },
  { title: "Dementia 13", year: 1963, genres: ["Horror", "Thriller"] },
  { title: "The Hitch-Hiker", year: 1953, genres: ["Thriller", "Crime"] },
  { title: "The Most Dangerous Game", year: 1932, genres: ["Thriller", "Adventure"] },
  { title: "Ordet", year: 1955, genres: ["Drama"] },
  { title: "La Jetée", year: 1962, genres: ["Sci-Fi", "Drama"] },
  { title: "Seconds", year: 1966, genres: ["Sci-Fi", "Thriller"] },
  { title: "Timecrimes", year: 2007, genres: ["Sci-Fi", "Thriller"] },
  { title: "The Art of Self-Defense", year: 2019, genres: ["Comedy", "Drama"] },
  { title: "Office Space", year: 1999, genres: ["Comedy"] },
  { title: "The Truman Show", year: 1998, genres: ["Comedy", "Drama"] },
  { title: "The Science of Sleep", year: 2006, genres: ["Comedy", "Drama"] },
  { title: "Ex Machina", year: 2014, genres: ["Sci-Fi", "Thriller"] },
  { title: "Arrival", year: 2016, genres: ["Sci-Fi", "Drama"] },
  { title: "The Lobster", year: 2015, genres: ["Comedy", "Drama"] },
  { title: "A Ghost Story", year: 2017, genres: ["Drama", "Fantasy"] },
  { title: "Groundhog Day", year: 1993, genres: ["Comedy", "Drama"] },
  { title: "Being There", year: 1979, genres: ["Comedy", "Drama"] },
  { title: "The Big Lebowski", year: 1998, genres: ["Comedy", "Crime"] },
  { title: "Lost in Translation", year: 2003, genres: ["Drama", "Romance"] },
  { title: "The Foreigner", year: 2017, genres: ["Action", "Thriller"] },
  { title: "16 Blocks", year: 2006, genres: ["Action", "Crime"] },
  { title: "Kundo: Age of the Rampant", year: 2014, genres: ["Action", "Drama"] },
  { title: "The Great Battle", year: 2018, genres: ["Action", "War"] },
  { title: "Action U.S.A.", year: 1989, genres: ["Action", "Crime"] },
  { title: "The Terminator", year: 1984, genres: ["Action", "Sci-Fi"] }
];

// Read existing movies
const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

// Helper function to normalize title for matching
function normalizeTitle(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to find matching movie in database
function findMovie(title, year) {
  const normalized = normalizeTitle(title);
  
  // Try exact match first
  let match = movies.find(m => {
    const mTitle = normalizeTitle(m.title);
    return mTitle === normalized && m.year === year;
  });
  
  if (match) return match;
  
  // Try without year
  match = movies.find(m => {
    const mTitle = normalizeTitle(m.title);
    return mTitle === normalized;
  });
  
  if (match) return match;
  
  // Try partial match
  match = movies.find(m => {
    const mTitle = normalizeTitle(m.title);
    return mTitle.includes(normalized) || normalized.includes(mTitle);
  });
  
  return match;
}

// Update movies
let updated = 0;
let notFound = 0;

console.log(`\n📚 Updating ${moviesToUpdate.length} movies with proper titles and posters...\n`);

for (let i = 0; i < moviesToUpdate.length; i++) {
  const movieInfo = moviesToUpdate[i];
  
  // Find matching movie in database
  const movie = findMovie(movieInfo.title, movieInfo.year);
  
  if (!movie) {
    console.log(`⏭️  [${i+1}/${moviesToUpdate.length}] Not found: ${movieInfo.title} (${movieInfo.year})`);
    notFound++;
    continue;
  }
  
  // Update title
  movie.title = movieInfo.title;
  movie.originalTitle = movieInfo.title;
  
  // Update year if missing
  if (!movie.year && movieInfo.year) {
    movie.year = movieInfo.year;
  }
  
  // Update genres
  if (movieInfo.genres && movieInfo.genres.length > 0) {
    movie.genres = movieInfo.genres;
    movie.tags = movieInfo.genres.map(g => g.toLowerCase());
  }
  
  // Update poster if we have a known one
  if (knownPosters[movieInfo.title]) {
    movie.posterUrl = knownPosters[movieInfo.title];
    movie.thumbnailUrl = knownPosters[movieInfo.title];
  } else if (movie.hlsUrl && movie.hlsUrl.includes('youtube.com/embed/')) {
    // Extract video ID and use YouTube thumbnail
    const videoIdMatch = movie.hlsUrl.match(/embed\/([^?]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      movie.posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      movie.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  // Update description if missing or generic
  if (!movie.description || movie.description.length < 50 || movie.description.includes('Watch on')) {
    movie.description = `${movieInfo.title}${movieInfo.year ? ` (${movieInfo.year})` : ''} - ${movieInfo.genres.join(', ')}`;
  }
  
  movie.logline = movie.description ? movie.description.substring(0, 100) : movie.title;
  
  updated++;
  console.log(`✅ [${i+1}/${moviesToUpdate.length}] Updated: ${movie.title} (${movie.year || 'N/A'})`);
}

// Save updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`\n✅ Update complete!`);
console.log(`   Updated: ${updated}`);
console.log(`   Not found: ${notFound}\n`);
console.log(`\n💡 Note: For better posters, get a free TMDB API key and run:`);
console.log(`   node update-movies-with-tmdb-metadata.cjs\n`);

