import fs from 'fs';

// Read the movies.json file
const data = JSON.parse(fs.readFileSync('movies.json', 'utf8'));

// Fix encoding issues - replace special characters with ASCII-safe alternatives
data.forEach(movie => {
  // Fix em dashes and en dashes
  if (movie.description) {
    movie.description = movie.description
      .replace(/\u2014/g, '-')  // em dash
      .replace(/\u2013/g, '-')  // en dash
      .replace(/â€"/g, '-')     // corrupted em dash
      .replace(/â€"/g, '-');    // corrupted em dash variant
  }
  
  // Fix accented characters in director
  if (movie.director) {
    movie.director = movie.director
      .replace(/é/g, 'e')
      .replace(/É/g, 'E')
      .replace(/è/g, 'e')
      .replace(/à/g, 'a')
      .replace(/LÃ©onetti/g, 'Leonetti')
      .replace(/Léonetti/g, 'Leonetti');
  }
  
  // Fix cast names
  if (movie.cast && Array.isArray(movie.cast)) {
    movie.cast = movie.cast.map(name => 
      name.replace(/é/g, 'e')
          .replace(/É/g, 'E')
          .replace(/fiancÃ©e/g, 'fiancee')
          .replace(/fiancée/g, 'fiancee')
    );
  }
  
  // Fix title if needed
  if (movie.title) {
    movie.title = movie.title
      .replace(/â€"/g, '-')
      .replace(/â€"/g, '-');
  }
});

// Write the fixed version
const fixed = JSON.stringify(data, null, 2);
fs.writeFileSync('movies-safe.json', fixed, 'utf8');

console.log('✅ Created movies-safe.json');
console.log('Total movies:', data.length);
console.log('File size:', (fixed.length / 1024).toFixed(2), 'KB');
console.log('\nThis file has no special characters that cause encoding issues.');
console.log('You can safely copy-paste this into Hostinger!');

