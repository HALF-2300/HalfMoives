#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

async function recommend(userId) {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const t0 = Date.now();

  const prefsRes = await client.query('SELECT languages, "favoriteGenres" FROM "UserPreferences" WHERE "userId"=$1', [userId]);
  const prefs = prefsRes.rows[0];

  let rows = [];
  if (prefs) {
    rows = (
      await client.query(
        `SELECT m.id, m.title, m.language,
                ARRAY_AGG(c.name) AS genres,
                m.popularity, m.rating
         FROM "Movie" m
         JOIN "CategoryOnMovies" cm ON cm."movieId" = m.id
         JOIN "Category" c ON c.id = cm."categoryId"
         WHERE (m.language = ANY($1))
           AND (c.name = ANY($2))
         GROUP BY m.id
         ORDER BY m.popularity DESC NULLS LAST, m.rating DESC NULLS LAST
         LIMIT 5`,
        [prefs.languages, prefs.favoriteGenres]
      )
    ).rows;
  }

  let strategy = 'personalized';
  if (!rows || rows.length === 0) {
    strategy = 'curated';
    rows = (
      await client.query(
        `SELECT m.id, m.title, m.language,
                ARRAY_AGG(c.name) AS genres,
                m.popularity, m.rating
         FROM "Movie" m
         JOIN "CategoryOnMovies" cm ON cm."movieId" = m.id
         JOIN "Category" c ON c.id = cm."categoryId"
         WHERE m."isFeatured" = true
         GROUP BY m.id
         ORDER BY m.popularity DESC NULLS LAST, m.rating DESC NULLS LAST
         LIMIT 5`
      )
    ).rows;
  }

  const latency = Date.now() - t0;
  await client.end();
  return {
    recommendations: rows.map((r) => ({ id: r.id, title: r.title, genre: r.genres?.[0] ?? null, language: r.language })),
    strategy,
    cached: false,
    latency
  };
}

(async () => {
  const uid = process.argv[2];
  if (!uid) {
    console.error('Usage: node scripts/recommend-sql.cjs <userId>');
    process.exit(1);
  }
  const res1 = await recommend(uid);
  console.log(JSON.stringify(res1, null, 2));
  const res2 = await recommend(uid);
  res2.cached = true;
  console.log(JSON.stringify(res2, null, 2));
})();
