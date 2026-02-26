/**
 * Copy movies.json into public/ so Vite includes it in dist/ for static deploy.
 * Run before: npm run build
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'movies.json');
const publicDir = path.join(root, 'public');
const dest = path.join(publicDir, 'movies.json');

if (!fs.existsSync(src)) {
  console.warn('movies.json not found; static deploy may have no movie list.');
  process.exit(0);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.copyFileSync(src, dest);
console.log('Copied movies.json to public/ for build.');
