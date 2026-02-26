/**
 * Report which movies are functioning (have a playable link) vs not.
 * Optionally remove movies that can't play.
 *
 * Run:
 *   node check-functioning.cjs           → list movies with no/invalid play link
 *   node check-functioning.cjs --remove  → remove those from movies.json (keeps only playable)
 *   node check-functioning.cjs --check-urls  → also HEAD-check YouTube thumbnails (sample of 50)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const moviesPath = path.join(__dirname, 'movies.json');
const checkUrls = process.argv.includes('--check-urls');
const removeNoLink = process.argv.includes('--remove');

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?\s]{11})/);
  return m ? m[1] : null;
}

function headOk(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'HEAD' },
      (res) => resolve(res.statusCode === 200)
    );
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

console.log('\n🔍 Check which movies are functioning (have a playable link)\n');
console.log('='.repeat(50));

const noLink = [];
const hasLink = [];

movies.forEach((m) => {
  const url = m.hlsUrl || m.source?.url || '';
  const id = extractYouTubeId(url);
  if (!url || !id) {
    noLink.push({ id: m.id, title: m.title, year: m.year });
  } else {
    hasLink.push({ ...m, videoId: id });
  }
});

console.log(`   Total movies: ${movies.length}`);
console.log(`   ✅ With valid YouTube link: ${hasLink.length}`);
console.log(`   ❌ No / invalid link (won’t play): ${noLink.length}\n`);

if (noLink.length > 0) {
  console.log('   Movies without a playable link:');
  noLink.slice(0, 30).forEach((m) => console.log(`      - ${m.title} (${m.year || '?'}) [${m.id}]`));
  if (noLink.length > 30) console.log(`      ... and ${noLink.length - 30} more.\n`);
}

if (removeNoLink && noLink.length > 0) {
  const noLinkIds = new Set(noLink.map((m) => m.id));
  const kept = movies.filter((m) => !noLinkIds.has(m.id));
  const backupPath = moviesPath + '.backup.' + Date.now();
  fs.copyFileSync(moviesPath, backupPath);
  fs.writeFileSync(moviesPath, JSON.stringify(kept, null, 2), 'utf8');
  console.log(`   🗑️  Removed ${noLink.length} movies without a playable link.`);
  console.log(`   📊 Total movies now: ${kept.length}`);
  console.log(`   💾 Backup: ${path.basename(backupPath)}\n`);
}

if (checkUrls && hasLink.length > 0) {
  (async () => {
    console.log('   Checking a sample of YouTube thumbnails (video likely exists if thumbnail loads)...\n');
    const sample = hasLink.slice(0, 50);
    let ok = 0;
    let fail = 0;
    for (const m of sample) {
      const thumbUrl = `https://img.youtube.com/vi/${m.videoId}/hqdefault.jpg`;
      const exists = await headOk(thumbUrl);
      if (exists) ok++; else fail++;
    }
    console.log(`   Sample of ${sample.length}: ${ok} thumbnails OK, ${fail} missing (video may be removed).\n`);
    console.log('='.repeat(50));
    console.log('✅ Done.\n');
  })();
} else {
  console.log('='.repeat(50));
  console.log('✅ Done.\n');
}
