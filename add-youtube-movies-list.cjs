const fs = require('fs');
const path = require('path');

// Movies data provided by user
const newMoviesData = [
  {
    "title": "MST3K: Devil Fish (FULL MOVIE)",
    "year": 2016,
    "durationSeconds": 5536,
    "youtubeUrl": "https://www.youtube.com/watch?v=N7wkKXMlKYc"
  },
  {
    "title": "MST3K: Werewolf (FULL MOVIE)",
    "year": 2024,
    "durationSeconds": 5549,
    "youtubeUrl": "https://www.youtube.com/watch?v=WwUmShhVeWE"
  },
  {
    "title": "Jim Henson's The StoryTeller & Greek Myths",
    "year": 2024,
    "durationSeconds": 42457,
    "youtubeUrl": "https://www.youtube.com/watch?v=Oqu8bKJJLzA"
  },
  {
    "title": "MST3K 910: The Final Sacrifice (FULL MOVIE)",
    "year": 2024,
    "durationSeconds": 5514,
    "youtubeUrl": "https://www.youtube.com/watch?v=l7yqX5t2R7A"
  },
  {
    "title": "Team Dark Rank the Films of Full Moon Features!",
    "year": 2023,
    "durationSeconds": 4676,
    "youtubeUrl": "https://www.youtube.com/watch?v=DDHl28IHizE"
  },
  {
    "title": "Research and Destroy: Full Moon Features",
    "year": 2018,
    "durationSeconds": 4030,
    "youtubeUrl": "https://www.youtube.com/watch?v=uz6iZhI69Tw"
  },
  {
    "title": "88Films Complete Blu Collection: Slasher Classics/Italian Collection Full Moon and More...",
    "year": 2016,
    "durationSeconds": 4246,
    "youtubeUrl": "https://www.youtube.com/watch?v=P7wqfo3CMpc"
  },
  {
    "title": "My FULL MOON FEATURES Numbered DVD Covers #3 (with Full Moon Fanatic and Producer Dustin Hubbard)",
    "year": 2024,
    "durationSeconds": 10807,
    "youtubeUrl": "https://www.youtube.com/watch?v=nfFFxAYs_Xk"
  },
  {
    "title": "Swindle - Full Movie",
    "year": 2019,
    "durationSeconds": 5719,
    "youtubeUrl": "https://www.youtube.com/watch?v=QV1pa2BgmOM"
  },
  {
    "title": "The Contract - Full Movie",
    "year": 2021,
    "durationSeconds": 5778,
    "youtubeUrl": "https://www.youtube.com/watch?v=57YMa7kaZCA"
  },
  {
    "title": "Puncture - Full Movie",
    "year": 2019,
    "durationSeconds": 5997,
    "youtubeUrl": "https://www.youtube.com/watch?v=_YCLxSHVwLA"
  },
  {
    "title": "Wilderness (2006) - Full Movie",
    "year": 2019,
    "durationSeconds": 5553,
    "youtubeUrl": "https://www.youtube.com/watch?v=-zhGK1EMaRY"
  },
  {
    "title": "Lily Dale - Full Movie",
    "year": 2023,
    "durationSeconds": 5905,
    "youtubeUrl": "https://www.youtube.com/watch?v=Y1nhqopd1zg"
  },
  {
    "title": "Killing Season - Full Movie",
    "year": 2019,
    "durationSeconds": 5458,
    "youtubeUrl": "https://www.youtube.com/watch?v=B7HM7XnSx5o"
  },
  {
    "title": "Miracle at Sage Creek - Full Movie",
    "year": 2021,
    "durationSeconds": 5015,
    "youtubeUrl": "https://www.youtube.com/watch?v=gYp_hRYT7dw"
  },
  {
    "title": "Rampart - Full Movie",
    "year": 2021,
    "durationSeconds": 6487,
    "youtubeUrl": "https://www.youtube.com/watch?v=ZJ7IzvlKNy8"
  },
  {
    "title": "Under the Mountain - Full Movie",
    "year": 2019,
    "durationSeconds": 5438,
    "youtubeUrl": "https://www.youtube.com/watch?v=XK7MqZ2P4So"
  },
  {
    "title": "Automata (2014) - Starring Antonio Banderas - Full Movie",
    "year": 2021,
    "durationSeconds": 6607,
    "youtubeUrl": "https://www.youtube.com/watch?v=AdxL9r3Wx_g"
  },
  {
    "title": "Shooting Gallery - Full Movie",
    "year": 2019,
    "durationSeconds": 6121,
    "youtubeUrl": "https://www.youtube.com/watch?v=wcyESnmVwco"
  },
  {
    "title": "The Devil's Arithmetic - Full Movie",
    "year": 2022,
    "durationSeconds": 5759,
    "youtubeUrl": "https://www.youtube.com/watch?v=oQVL-yKLw1Y"
  },
  {
    "title": "Ninja - Full Movie",
    "year": 2019,
    "durationSeconds": 5191,
    "youtubeUrl": "https://www.youtube.com/watch?v=85UxL-AJdpQ"
  },
  {
    "title": "Diary of a Serial Killer - Starring Gary Busey - Full Movie",
    "year": 2014,
    "durationSeconds": 5550,
    "youtubeUrl": "https://www.youtube.com/watch?v=cM-fM8VtSZA"
  },
  {
    "title": "Premiere STEPHEN KING'S \"STORM OF THE CENTURY\" FULL MOVIE  Terror that takes you by storm!",
    "year": 2022,
    "durationSeconds": 14907,
    "youtubeUrl": "https://www.youtube.com/watch?v=wl3FQaHxVhU"
  },
  {
    "title": "Harlequin: Broken Lullaby - Full Movie",
    "year": 2019,
    "durationSeconds": 5488,
    "youtubeUrl": "https://www.youtube.com/watch?v=UJ82Ps1sFwQ"
  },
  {
    "title": "The Vampire Next Door - Is a hilarious horror comedy- Best Movie in English",
    "year": 2024,
    "durationSeconds": 5531,
    "youtubeUrl": "https://www.youtube.com/watch?v=XASNzgLPBwo"
  },
  {
    "title": "Clawed: The Legend of Sasquatch - Full Movie",
    "year": 2019,
    "durationSeconds": 5018,
    "youtubeUrl": "https://www.youtube.com/watch?v=KdOwtBMUhc8"
  },
  {
    "title": "Animal Farm - Full Movie",
    "year": 2022,
    "durationSeconds": 5501,
    "youtubeUrl": "https://www.youtube.com/watch?v=a5JgD8AhRjs"
  },
  {
    "title": "The Couple - Full Movie",
    "year": 2019,
    "durationSeconds": 7200,
    "youtubeUrl": "https://www.youtube.com/watch?v=Td_0k9KD53Q"
  },
  {
    "title": "Charade (1963) - Full Movie starring Audrey Hepburn and Cary Grant",
    "year": 2022,
    "durationSeconds": 6809,
    "youtubeUrl": "https://www.youtube.com/watch?v=6ROvPFaUl80"
  },
  {
    "title": "Howl - Full Movie",
    "year": 2019,
    "durationSeconds": 5559,
    "youtubeUrl": "https://www.youtube.com/watch?v=1Ioc7q_26tE"
  },
  {
    "title": "Eye See You (2003) - Full Movie",
    "year": 2019,
    "durationSeconds": 5757,
    "youtubeUrl": "https://www.youtube.com/watch?v=SIKhw41Ec28"
  },
  {
    "title": "The Legend of Sleepy Hollow - Full Movie",
    "year": 2022,
    "durationSeconds": 5491,
    "youtubeUrl": "https://www.youtube.com/watch?v=KEY-aQW0NXo"
  },
  {
    "title": "Izzy & Moe - Full Movie",
    "year": 2022,
    "durationSeconds": 5531,
    "youtubeUrl": "https://www.youtube.com/watch?v=twp5ILYqpSk"
  },
  {
    "title": "Dahmer - Full Movie",
    "year": 2019,
    "durationSeconds": 6146,
    "youtubeUrl": "https://www.youtube.com/watch?v=L_-tIgyFWwc"
  },
  {
    "title": "Firepower - Full Movie",
    "year": 2021,
    "durationSeconds": 5747,
    "youtubeUrl": "https://www.youtube.com/watch?v=-DUc8N5-ASo"
  },
  {
    "title": "All Things to All Men (Free Full Movie) Crime Thriller",
    "year": 2019,
    "durationSeconds": 5499,
    "youtubeUrl": "https://www.youtube.com/watch?v=tET8UQ6QNgY"
  },
  {
    "title": "Fatal Crossing (Full Movie) Drama l Thriller",
    "year": 2020,
    "durationSeconds": 5593,
    "youtubeUrl": "https://www.youtube.com/watch?v=xVC1uhVeIdA"
  },
  {
    "title": "Beyond the Trek (Free Full Movie) Sci Fi",
    "year": 2019,
    "durationSeconds": 5406,
    "youtubeUrl": "https://www.youtube.com/watch?v=2xL-zwKVr80"
  },
  {
    "title": "Operation Neighborhood Watch (Full Movie) Adventure, Comedy, 2015",
    "year": 2021,
    "durationSeconds": 5420,
    "youtubeUrl": "https://www.youtube.com/watch?v=4z7iUWs-Ox4"
  },
  {
    "title": "Sugar Mountain (Free Full Movie)  Jason Momoa",
    "year": 2019,
    "durationSeconds": 6343,
    "youtubeUrl": "https://www.youtube.com/watch?v=GXF2zw2UOe8"
  },
  {
    "title": "The Daniel Connection (Full Movie) Thriller, Mystery, 2015",
    "year": 2021,
    "durationSeconds": 5510,
    "youtubeUrl": "https://www.youtube.com/watch?v=--1SYALseco"
  },
  {
    "title": "The Facility (Full Movie) Horror, Thriller",
    "year": 2021,
    "durationSeconds": 4984,
    "youtubeUrl": "https://www.youtube.com/watch?v=NhGe2TOHo5g"
  },
  {
    "title": "Oliver, Stoned (Full Movie) Comedy, Stoner Comedy Films",
    "year": 2021,
    "durationSeconds": 5527,
    "youtubeUrl": "https://www.youtube.com/watch?v=4BW2pCTIcv4"
  },
  {
    "title": "Teacher of the Year (Full Movie)  High school Comedy Drama",
    "year": 2017,
    "durationSeconds": 4830,
    "youtubeUrl": "https://www.youtube.com/watch?v=pMhJQ2wwuno"
  },
  {
    "title": "Duress (Full Movie) Thriller",
    "year": 2021,
    "durationSeconds": 4685,
    "youtubeUrl": "https://www.youtube.com/watch?v=T6p-zWBPh0k"
  },
  {
    "title": "Honeydripper (Full Movie) Danny Glover ",
    "year": 2016,
    "durationSeconds": 7437,
    "youtubeUrl": "https://www.youtube.com/watch?v=blwiQYfQBYU"
  },
  {
    "title": "The Sasquatch Gang (Free Full Movie) Comedy. Justin Long",
    "year": 2016,
    "durationSeconds": 5261,
    "youtubeUrl": "https://www.youtube.com/watch?v=uWtlMjwLqtY"
  },
  {
    "title": "The Beast of X Moor (Full Movie) Horror",
    "year": 2017,
    "durationSeconds": 4903,
    "youtubeUrl": "https://www.youtube.com/watch?v=5NXdbRJU6k8"
  },
  {
    "title": "Sasq-Watch (Full Movie) Comedy, 2016",
    "year": 2021,
    "durationSeconds": 5042,
    "youtubeUrl": "https://www.youtube.com/watch?v=vTALDXJ1hDg"
  },
  {
    "title": "Citadel (Full Movie) Horror, Thriller",
    "year": 2021,
    "durationSeconds": 5051,
    "youtubeUrl": "https://www.youtube.com/watch?v=V4s2xGJitBE"
  },
  {
    "title": "Djinn (Full Movie) Horror, Thriller",
    "year": 2021,
    "durationSeconds": 5132,
    "youtubeUrl": "https://www.youtube.com/watch?v=uh3--b8EJAc"
  },
  {
    "title": "Retina (Free Full Movie) Sci Fi, Thriller",
    "year": 2019,
    "durationSeconds": 5243,
    "youtubeUrl": "https://www.youtube.com/watch?v=2h6cLbbduag"
  },
  {
    "title": "Yoga Hosers (Full Movie) Johnny Depp, Justin Long, Horror, Comedy",
    "year": 2020,
    "durationSeconds": 5258,
    "youtubeUrl": "https://www.youtube.com/watch?v=xAYducrtUk4"
  },
  {
    "title": "La Soga (Free Full Movie) Crime Drama",
    "year": 2017,
    "durationSeconds": 5537,
    "youtubeUrl": "https://www.youtube.com/watch?v=UycJr53AdsQ"
  },
  {
    "title": "Under Heavy (Full Movie) Action War Drama",
    "year": 2018,
    "durationSeconds": 6940,
    "youtubeUrl": "https://www.youtube.com/watch?v=sglt5w479U0"
  },
  {
    "title": "Plague (Full Movie) post-apocalyptic Zombie Horror",
    "year": 2017,
    "durationSeconds": 5244,
    "youtubeUrl": "https://www.youtube.com/watch?v=nsu8bMPOT9s"
  },
  {
    "title": "Lake City (Full Movie) Crime Drama Drugs.  Sissy Spacek, Dave Matthews, Troy Garity, Rebecca Romijn",
    "year": 2017,
    "durationSeconds": 5542,
    "youtubeUrl": "https://www.youtube.com/watch?v=fLU_6lgUImc"
  },
  {
    "title": "Destination Planet Negro (Free Full Movie) Kevin Willmott",
    "year": 2019,
    "durationSeconds": 5927,
    "youtubeUrl": "https://www.youtube.com/watch?v=plhWisabXq4"
  },
  {
    "title": "United We Fan (Full Movie) Documentary",
    "year": 2020,
    "durationSeconds": 5846,
    "youtubeUrl": "https://www.youtube.com/watch?v=Om28iS-n1ts"
  },
  {
    "title": "The Face of an Angel (Full Movie) Crime, Drama. Kate Beckinsale",
    "year": 2017,
    "durationSeconds": 5543,
    "youtubeUrl": "https://www.youtube.com/watch?v=H6QH4B3EycQ"
  },
  {
    "title": "Life of Significant Soil (Free Full Movie) Drama, Comedy",
    "year": 2019,
    "durationSeconds": 4168,
    "youtubeUrl": "https://www.youtube.com/watch?v=7NaPPRZRbWI"
  },
  {
    "title": "Miss Nobody (Full Movie) Dark Comedy, Crime, Leslie Bibb, Brandon Routh",
    "year": 2021,
    "durationSeconds": 5364,
    "youtubeUrl": "https://www.youtube.com/watch?v=g4vJPO3LLyA"
  },
  {
    "title": "Who's Your Monkey (Free Full Movie) Comedy",
    "year": 2019,
    "durationSeconds": 4870,
    "youtubeUrl": "https://www.youtube.com/watch?v=zvzLtrYuy0s"
  }
];

// Helper functions
function generateId(title, year) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '') + (year ? '_' + year : '');
}

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

function cleanTitle(title) {
  // Remove common suffixes like "(FULL MOVIE)", "- Full Movie", etc.
  return title
    .replace(/\s*\(FULL MOVIE\)/gi, '')
    .replace(/\s*- Full Movie/gi, '')
    .replace(/\s*\(Free Full Movie\)/gi, '')
    .replace(/\s*\(Full Movie\)/gi, '')
    .replace(/\s*FULL MOVIE/gi, '')
    .replace(/\s*Full Movie/gi, '')
    .trim();
}

function extractYearFromTitle(title) {
  // Try to extract year from title like "Wilderness (2006)"
  const yearMatch = title.match(/\((\d{4})\)/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
}

function inferGenres(title, description) {
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combined = titleLower + ' ' + descLower;
  
  const genres = [];
  
  if (combined.match(/\b(horror|scary|zombie|vampire|werewolf|ghost|demon|killer|slasher)\b/)) {
    genres.push('Horror');
  }
  if (combined.match(/\b(comedy|funny|humor|stoner)\b/)) {
    genres.push('Comedy');
  }
  if (combined.match(/\b(action|war|fight|shoot|explosion|ninja)\b/)) {
    genres.push('Action');
  }
  if (combined.match(/\b(thriller|suspense|mystery|crime|criminal)\b/)) {
    genres.push('Thriller');
  }
  if (combined.match(/\b(drama|emotional|serious)\b/)) {
    genres.push('Drama');
  }
  if (combined.match(/\b(sci[\s-]?fi|science fiction|space|alien|robot|futuristic)\b/)) {
    genres.push('Sci-Fi');
  }
  if (combined.match(/\b(documentary|docu)\b/)) {
    genres.push('Documentary');
  }
  
  return genres.length > 0 ? genres : ['Movie'];
}

// Load existing movies
const moviesPath = path.join(__dirname, 'movies.json');
const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

console.log(`📚 Current movies in database: ${movies.length}\n`);

// Process new movies
const moviesToAdd = [];
const skipped = [];

for (const movieData of newMoviesData) {
  const videoId = extractVideoId(movieData.youtubeUrl);
  if (!videoId) {
    console.warn(`⚠️  Could not extract video ID from: ${movieData.youtubeUrl}`);
    skipped.push({ title: movieData.title, reason: 'Invalid YouTube URL' });
    continue;
  }
  
  // Clean title
  let cleanedTitle = cleanTitle(movieData.title);
  
  // Extract year from title if not provided or override
  let year = movieData.year;
  const titleYear = extractYearFromTitle(movieData.title);
  if (titleYear && (!year || titleYear !== year)) {
    // Use year from title if it makes more sense
    if (titleYear < 2020 || year > 2020) {
      year = titleYear;
    }
  }
  
  // Generate ID
  const movieId = generateId(cleanedTitle, year);
  
  // Check for duplicates (by ID or by YouTube URL)
  const existingById = movies.find(m => m.id === movieId);
  const existingByUrl = movies.find(m => {
    if (m.hlsUrl && m.hlsUrl.includes(videoId)) return true;
    if (m.source && m.source.url && m.source.url.includes(videoId)) return true;
    return false;
  });
  
  if (existingById || existingByUrl) {
    skipped.push({ 
      title: cleanedTitle, 
      reason: existingById ? 'Duplicate ID' : 'Duplicate YouTube URL' 
    });
    continue;
  }
  
  // Convert duration
  const runtimeMinutes = Math.round(movieData.durationSeconds / 60);
  
  // Infer genres
  const genres = inferGenres(movieData.title, '');
  
  // Create movie object
  const movie = {
    id: movieId,
    title: cleanedTitle,
    originalTitle: cleanedTitle,
    year: year,
    runtimeMinutes: runtimeMinutes,
    description: `Watch ${cleanedTitle}${year ? ` (${year})` : ''} on YouTube.`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    posterUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hlsUrl: `https://www.youtube.com/embed/${videoId}`,
    youtubeEmbed: true,
    language: 'EN',
    genres: genres,
    tags: genres.map(g => g.toLowerCase()).concat(['youtube', 'full-movie']),
    isFeatured: false,
    director: null,
    cast: null,
    source: {
      name: 'YouTube',
      url: movieData.youtubeUrl
    },
    license: {
      type: null,
      url: null
    },
    createdAt: new Date().toISOString(),
    needsYouTubeLink: false,
    logline: `Watch ${cleanedTitle}${year ? ` (${year})` : ''} - ${genres.join(', ')}`,
    is_original: false
  };
  
  moviesToAdd.push(movie);
}

// Add new movies
movies.push(...moviesToAdd);

// Save updated movies
fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 4), 'utf8');

console.log(`✅ Added ${moviesToAdd.length} new movies`);
console.log(`⏭️  Skipped ${skipped.length} movies (duplicates or invalid)\n`);

if (skipped.length > 0) {
  console.log('Skipped movies:');
  skipped.forEach(s => console.log(`  - ${s.title}: ${s.reason}`));
  console.log('');
}

console.log(`📊 Total movies in database: ${movies.length}\n`);

if (moviesToAdd.length > 0) {
  console.log('Newly added movies:');
  moviesToAdd.forEach(m => {
    console.log(`  - ${m.title} (${m.year || 'N/A'}) - ${m.genres.join(', ')}`);
  });
}

