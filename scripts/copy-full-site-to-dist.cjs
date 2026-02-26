/**
 * After Vite build: copy all other HTML pages and static assets into dist/
 * so the deployed site has the full website (movie, signup, login, etc.), not just index.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.warn('dist/ not found; run vite build first.');
  process.exit(1);
}

const htmlFiles = [
  'movie.html',
  'signup.html',
  'login.html',
  'verify-email.html',
  'admin.html',
  'search-results.html',
  'movies-gallery.html',
  'robots.txt',
  'sitemap.xml',
];

const singleFiles = ['favicon.svg', 'og-image.svg', 'script.js', 'styles.css', 'youtube-feeds-loader.js', 'searchEngine.js'];

for (const name of htmlFiles) {
  const src = path.join(root, name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, name));
    console.log('  +', name);
  }
}

for (const name of singleFiles) {
  const src = path.join(root, name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, name));
    console.log('  +', name);
  }
}

const postersDir = path.join(root, 'posters');
const distPosters = path.join(dist, 'posters');
if (fs.existsSync(postersDir)) {
  if (!fs.existsSync(distPosters)) fs.mkdirSync(distPosters, { recursive: true });
  for (const name of fs.readdirSync(postersDir)) {
    const src = path.join(postersDir, name);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(distPosters, name));
    }
  }
  console.log('  + posters/');
}

console.log('Copied full site assets into dist/.');
