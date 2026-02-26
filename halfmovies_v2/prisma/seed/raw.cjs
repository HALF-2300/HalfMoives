#!/usr/bin/env node
const { Client } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = ['Action', 'Drama', 'Sci-Fi', 'Family', 'Comedy', 'Thriller'];
  for (const name of categories) {
    await client.query(
      `INSERT INTO "Category" (id, name) VALUES (gen_random_uuid(), $1) ON CONFLICT (name) DO NOTHING`,
      [name]
    );
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Helper: get category id by name
  async function getCategoryIdByName(name) {
    const res = await client.query('SELECT id FROM "Category" WHERE name=$1', [name]);
    return res.rows[0]?.id || null;
  }

  // Seed featured movies
  const movies = [
    {
      title: 'Edge of Tomorrow',
      overview: 'A soldier relives a deadly battle to change fate.',
      language: 'en',
      rating: 8.0,
      popularity: 95,
      isFeatured: true,
      categories: ['Action', 'Sci-Fi']
    },
    {
      title: 'Inception',
      overview: 'A mind-bending heist within dream layers.',
      language: 'en',
      rating: 8.8,
      popularity: 99,
      isFeatured: true,
      categories: ['Sci-Fi', 'Thriller']
    },
    {
      title: 'Coco',
      overview: 'A boy embarks on a journey in the Land of the Dead.',
      language: 'es',
      rating: 8.4,
      popularity: 90,
      isFeatured: true,
      categories: ['Family', 'Comedy']
    },
    {
      title: 'Wadjda',
      overview: 'A Saudi girl dreams of owning a bicycle.',
      language: 'ar',
      rating: 7.6,
      popularity: 70,
      isFeatured: true,
      categories: ['Drama', 'Family']
    },
    {
      title: 'The Pursuit of Happyness',
      overview: 'A struggling salesman fights for a better life.',
      language: 'en',
      rating: 8.0,
      popularity: 85,
      isFeatured: true,
      categories: ['Drama']
    }
  ];

  for (const m of movies) {
    const existing = await client.query('SELECT id FROM "Movie" WHERE title=$1', [m.title]);
    let movieId = existing.rows[0]?.id;
    if (!movieId) {
      const ins = await client.query(
        'INSERT INTO "Movie" (id, title, overview, language, rating, popularity, "isFeatured") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING id',
        [m.title, m.overview, m.language, m.rating, m.popularity, m.isFeatured]
      );
      movieId = ins.rows[0].id;
      console.log(`🎬 Inserted movie: ${m.title} (id: ${movieId})`);
    } else {
      console.log(`ℹ️ Movie exists: ${m.title} (id: ${movieId})`);
    }

    // Link categories
    for (const catName of m.categories) {
      const catId = await getCategoryIdByName(catName);
      if (!catId) {
        console.warn(`⚠️ Category not found: ${catName}`);
        continue;
      }
      await client.query(
        'INSERT INTO "CategoryOnMovies" ("movieId", "categoryId") VALUES ($1, $2) ON CONFLICT ("movieId", "categoryId") DO NOTHING',
        [movieId, catId]
      );
    }
  }

  // Create sample users with preferences
  const users = [
    {
      email: 'action.fan@halfmovies.com',
      name: 'Action Fan',
      password: await bcrypt.hash('password123', 10),
      prefs: { moods: ['excited', 'energetic'], favoriteGenres: ['Action', 'Sci-Fi'], languages: ['en'], prefVector: { action: 0.9, scifi: 0.8 } }
    },
    {
      email: 'arabic.viewer@halfmovies.com',
      name: 'Arabic Viewer',
      password: await bcrypt.hash('password123', 10),
      prefs: { moods: ['reflective', 'warm'], favoriteGenres: ['Drama', 'Family'], languages: ['ar'], prefVector: { drama: 0.9, family: 0.85 } }
    },
    {
      email: 'multi.lang@halfmovies.com',
      name: 'Multilingual User',
      password: await bcrypt.hash('password123', 10),
      prefs: { moods: ['curious', 'adventurous'], favoriteGenres: ['Sci-Fi', 'Thriller', 'Comedy'], languages: ['en', 'es', 'ar'], prefVector: { scifi: 0.7, thriller: 0.6 } }
    }
  ];

  for (const { email, name, password, prefs } of users) {
    const res = await client.query(
      `INSERT INTO "User" (id, email, name, "passwordHash") VALUES (gen_random_uuid(), $1, $2, $3) ON CONFLICT (email) DO UPDATE SET name=$2 RETURNING id`,
      [email, name, password]
    );
    const userId = res.rows[0].id;
    await client.query(
      `INSERT INTO "UserPreferences" (id, "userId", moods, "favoriteGenres", languages, "prefVector", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) ON CONFLICT ("userId") DO NOTHING`,
      [userId, prefs.moods, prefs.favoriteGenres, prefs.languages, JSON.stringify(prefs.prefVector)]
    );
    console.log(`✅ Created user: ${email} (id: ${userId})`);
  }

  console.log('🎉 Seeding complete!');
  await client.end();
}

main().catch(console.error);
