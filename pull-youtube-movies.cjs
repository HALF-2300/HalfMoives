/**
 * Pull new movies from YouTube channel & playlist feeds into movies.json
 * Run: node pull-youtube-movies.cjs
 * Uses feeds.valid.json and playlists-feeds.json (no CORS; runs server-side)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const moviesPath = path.join(__dirname, 'movies.json');
const feedsPath = path.join(__dirname, 'feeds.valid.json');
const playlistsPath = path.join(__dirname, 'playlists-feeds.json');

// ---------- Helpers ----------
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/xml, text/xml, */*' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractVideoId(link) {
  if (!link) return null;
  const m = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]{11})/);
  return m ? m[1] : null;
}

// Parse YouTube RSS XML (no DOM; simple regex extraction)
function parseRSS(xmlText, sourceName) {
  const videos = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;
  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entry = match[1];
    const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = entry.match(/<link[^>]*href=["']([^"']+)["']/i);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/i);
    const thumbMatch = entry.match(/(?:media:thumbnail|yt:videoId)[^>]*(?:url=["']([^"']+)["']|>([^<]+)<)/i)
      || entry.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : 'Untitled';
    const link = linkMatch ? linkMatch[1].trim() : '';
    const videoId = extractVideoId(link);
    if (!videoId) continue;
    const published = publishedMatch ? publishedMatch[1].trim() : null;
    const year = published ? new Date(published).getFullYear() : null;
    const thumb = thumbMatch ? (thumbMatch[1] || thumbMatch[2] || '').trim() : '';
    const posterUrl = thumb || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    videos.push({
      videoId,
      title,
      link,
      year,
      posterUrl,
      sourceName,
      published
    });
  }
  return videos;
}

function generateId(title, year, videoId) {
  const slug = (title || 'movie')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return `${slug}${year ? '_' + year : ''}_${videoId}`;
}

// ---------- Main ----------
async function main() {
  console.log('\n📺 Pull new movies from YouTube feeds\n');
  console.log('='.repeat(50));

  let movies = [];
  if (fs.existsSync(moviesPath)) {
    const raw = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
    movies = JSON.parse(raw);
  }
  const existingIds = new Set();
  movies.forEach((m) => {
    const url = m.hlsUrl || m.source?.url || '';
    const id = url.match(/(?:embed\/|v=|youtu\.be\/)([^&?\s]{11})/)?.[1];
    if (id) existingIds.add(id);
  });
  console.log(`   Existing movies: ${movies.length} (${existingIds.size} with YouTube IDs)\n`);

  const feedList = [];
  if (fs.existsSync(feedsPath)) {
    const channels = JSON.parse(fs.readFileSync(feedsPath, 'utf8'));
    feedList.push(...channels.map((c) => ({ name: c.name, feedUrl: c.feedUrl })));
  }
  if (fs.existsSync(playlistsPath)) {
    const playlists = JSON.parse(fs.readFileSync(playlistsPath, 'utf8'));
    feedList.push(...playlists.map((p) => ({ name: p.name, feedUrl: p.feedUrl })));
  }

  if (feedList.length === 0) {
    console.log('⚠️  No feeds found. Add feeds.valid.json and/or playlists-feeds.json\n');
    process.exit(0);
  }

  console.log(`   Feeds to fetch: ${feedList.length}\n`);
  let added = 0;
  let totalFromFeeds = 0;

  for (const { name, feedUrl } of feedList) {
    try {
      const xml = await get(feedUrl);
      const videos = parseRSS(xml, name);
      totalFromFeeds += videos.length;
      let newFromFeed = 0;
      for (const v of videos) {
        if (existingIds.has(v.videoId)) continue;
        existingIds.add(v.videoId);
        const movie = {
          id: generateId(v.title, v.year, v.videoId),
          title: v.title,
          originalTitle: v.title,
          year: v.year,
          runtimeMinutes: null,
          description: `Watch ${v.title} on YouTube.`,
          thumbnailUrl: v.posterUrl,
          posterUrl: v.posterUrl,
          hlsUrl: `https://www.youtube.com/embed/${v.videoId}`,
          youtubeEmbed: true,
          language: 'EN',
          genres: ['Movie', name],
          tags: ['youtube', 'free', name.toLowerCase().replace(/\s+/g, '-')],
          isFeatured: false,
          director: null,
          cast: null,
          source: { name: name, url: v.link },
          license: { type: null, url: null },
          createdAt: v.published || new Date().toISOString(),
          logline: `Watch ${v.title} on YouTube.`,
          fromYouTubeFeed: true
        };
        movies.push(movie);
        added++;
        newFromFeed++;
        console.log(`   ✅ ${v.title} (${name})`);
      }
      const skipped = videos.length - newFromFeed;
      console.log(`   📋 ${name}: ${videos.length} in feed → ${newFromFeed} new, ${skipped} already in DB`);
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.warn(`   ⚠️  ${name}: ${err.message}`);
    }
  }

  if (added > 0) {
    const backupPath = moviesPath + '.backup.' + Date.now();
    if (fs.existsSync(moviesPath)) fs.copyFileSync(moviesPath, backupPath);
    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2), 'utf8');
    console.log(`\n   💾 Saved ${movies.length} movies (backup: ${path.basename(backupPath)})`);
  }

  console.log(`\n   📊 New movies added: ${added}`);
  if (added === 0 && totalFromFeeds > 0) {
    console.log(`   💡 All ${totalFromFeeds} videos from the feeds are already in movies.json.`);
    console.log(`   💡 Run again later when channels add new videos, or add more feeds to feeds.valid.json / playlists-feeds.json`);
  } else if (added === 0 && totalFromFeeds === 0) {
    console.log(`   💡 No videos parsed from feeds. Check feed URLs and RSS format.`);
  }
  console.log('='.repeat(50));
  console.log('✅ Done.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
