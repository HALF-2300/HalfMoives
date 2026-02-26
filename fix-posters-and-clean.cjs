/**
 * Fix movies that don't have a picture: assign YouTube thumbnail, TMDB poster, or placeholder.
 * Optionally remove movies that still have no valid image.
 *
 * Run:
 *   node fix-posters-and-clean.cjs           → fix all, keep every movie
 *   node fix-posters-and-clean.cjs --remove  → fix all, then remove movies still without a picture
 */

const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, 'movies.json');
const removeNoPoster = process.argv.includes('--remove');

// Same TMDB poster map as fix-all-missing-posters.cjs (only real URLs)
const posterMap = {
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

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?\s]{11})/);
  return m ? m[1] : null;
}

function hasValidPicture(movie) {
  const p = (movie.posterUrl || '').trim();
  const t = (movie.thumbnailUrl || '').trim();
  if (!p && !t) return false;
  const bad = /placehold|placeholder|4X4X4X|5X5X5X|Y8Y8Y8|N3N3N3|X3X3X3|p3p3p3|z4z4z4|QZ7QZ7|PxQ0PxQ0/i;
  if (bad.test(p) || bad.test(t)) return false;
  const ok = /(image\.tmdb\.org|img\.youtube\.com|youtube\.com\/vi\/)/i;
  return ok.test(p) || ok.test(t);
}

function getYouTubeThumbnail(movie) {
  const url = movie.hlsUrl || movie.source?.url || '';
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function getPlaceholderUrl(movie) {
  const title = (movie.title || 'Film').substring(0, 30).replace(/[^a-zA-Z0-9\s]/g, '');
  return `https://placehold.co/300x450/0f172a/a6b0d8?text=${encodeURIComponent(title || 'Movie')}`;
}

// ---

const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
let movies = JSON.parse(data);

console.log('\n🎨 Fix posters: get a picture for every movie (or remove if --remove)\n');
console.log('='.repeat(50));
console.log(`   Total movies: ${movies.length}\n`);

let fixed = 0;
let removed = 0;
const stillNoPicture = [];

movies.forEach((movie) => {
  if (hasValidPicture(movie)) return;

  let posterUrl = null;
  const title = movie.title || '';

  if (posterMap[title]) {
    posterUrl = posterMap[title];
  }
  if (!posterUrl) {
    const yt = getYouTubeThumbnail(movie);
    if (yt) posterUrl = yt;
  }
  if (!posterUrl) {
    posterUrl = getPlaceholderUrl(movie);
  }

  movie.posterUrl = posterUrl;
  movie.thumbnailUrl = posterUrl;
  fixed++;

  if (!posterMap[title] && !getYouTubeThumbnail(movie)) {
    stillNoPicture.push({ id: movie.id, title: movie.title, year: movie.year });
  }
});

let toWrite = movies;

if (removeNoPoster && stillNoPicture.length > 0) {
  const removeIds = new Set(stillNoPicture.map((m) => m.id));
  toWrite = movies.filter((m) => !removeIds.has(m.id));
  removed = movies.length - toWrite.length;
  console.log(`   🗑️  Removed ${removed} movies that had no real picture (only placeholder):`);
  stillNoPicture.slice(0, 15).forEach((m) => console.log(`      - ${m.title} (${m.year || '?'})`));
  if (stillNoPicture.length > 15) console.log(`      ... and ${stillNoPicture.length - 15} more`);
  console.log('');
}

const backupPath = moviesPath + '.backup.' + Date.now();
fs.copyFileSync(moviesPath, backupPath);
fs.writeFileSync(moviesPath, JSON.stringify(toWrite, null, 2), 'utf8');

console.log(`   ✅ Fixed ${fixed} movie posters (assigned YouTube thumb or TMDB or placeholder)`);
console.log(`   📊 Total movies now: ${toWrite.length}`);
if (removed > 0) console.log(`   🗑️  Removed: ${removed} (backup: ${path.basename(backupPath)})`);
if (!removeNoPoster && stillNoPicture.length > 0) {
  console.log(`   💡 ${stillNoPicture.length} movies have only a text placeholder. Run with --remove to remove them.`);
}
console.log('='.repeat(50));
console.log('✅ Done.\n');
