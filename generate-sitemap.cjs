const fs = require('fs');

const moviesPath = 'movies.json';
const sitemapPath = 'sitemap.xml';
const baseUrl = 'https://halfmovies.com';

const data = fs.readFileSync(moviesPath, 'utf8').replace(/^\uFEFF/, '');
const movies = JSON.parse(data);

const playableMovies = movies.filter(m => {
    const v = m.hlsUrl || m.url || '';
    return v && (v.includes('youtube.com') || v.includes('youtu.be'));
});

let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
sitemap += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>\n`;
sitemap += `  <url><loc>${baseUrl}/search-results.html</loc><priority>0.8</priority></url>\n`;

playableMovies.forEach(m => {
    sitemap += `  <url><loc>${baseUrl}/movie.html?id=${encodeURIComponent(m.id)}</loc><priority>0.7</priority></url>\n`;
});

sitemap += '</urlset>';

fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log(`✅ Sitemap generated: ${playableMovies.length + 2} URLs`);

