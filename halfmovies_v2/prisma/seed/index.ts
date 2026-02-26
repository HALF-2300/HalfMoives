import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = ['Action', 'Drama', 'Sci-Fi', 'Family', 'Comedy', 'Thriller'];
  const categoryRecords = await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );
  console.log(`✅ Created ${categoryRecords.length} categories`);

  // Create sample movies
  const movies = [
    {
      title: 'Edge of Tomorrow',
      overview: 'A soldier relives the same day, improving skills to stop an alien invasion.',
      poster: 'https://image.tmdb.org/t/p/w500/uUHvlkLavotfGsNtosDy8ShsIYF.jpg',
      language: 'en',
      year: 2014,
      rating: 7.9,
      popularity: 95,
      isFeatured: true,
      genres: ['Action', 'Sci-Fi']
    },
    {
      title: 'The Pursuit of Happyness',
      overview: 'A struggling salesman takes custody of his son as he is on the verge of a life-changing opportunity.',
      poster: 'https://image.tmdb.org/t/p/w500/lPsD10PP4rgUGiGR4CCXA6iY0QQ.jpg',
      language: 'en',
      year: 2006,
      rating: 8.0,
      popularity: 90,
      isFeatured: true,
      genres: ['Drama', 'Family']
    },
    {
      title: 'Inception',
      overview: 'A thief who steals corporate secrets through dream-sharing technology.',
      poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      language: 'en',
      year: 2010,
      rating: 8.8,
      popularity: 100,
      isFeatured: true,
      genres: ['Action', 'Sci-Fi', 'Thriller']
    },
    {
      title: 'Coco',
      overview: 'A young boy enters the Land of the Dead to find his great-great-grandfather.',
      poster: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
      language: 'es',
      year: 2017,
      rating: 8.4,
      popularity: 92,
      isFeatured: true,
      genres: ['Family', 'Comedy']
    },
    {
      title: 'Wadjda',
      overview: 'An enterprising Saudi girl signs up for her school\'s Quran recitation competition.',
      poster: 'https://image.tmdb.org/t/p/w500/mJmHzZsLKrBiHH3nCc3MjFDCqnZ.jpg',
      language: 'ar',
      year: 2012,
      rating: 7.5,
      popularity: 75,
      isFeatured: true,
      genres: ['Drama', 'Family']
    }
  ];

  for (const movieData of movies) {
    const { genres, ...data } = movieData;
    const movie = await prisma.movie.create({ data });

    // Link categories
    for (const genreName of genres) {
      const category = categoryRecords.find((c) => c.name === genreName);
      if (category) {
        await prisma.categoryOnMovies.create({
          data: {
            movieId: movie.id,
            categoryId: category.id
          }
        });
      }
    }
  }
  console.log(`✅ Created ${movies.length} movies`);

  // Create 3 sample users with different preferences
  const users = [
    {
      email: 'action.fan@halfmovies.com',
      name: 'Action Fan',
      password: 'password123',
      prefs: {
        moods: ['excited', 'energetic'],
        favoriteGenres: ['Action', 'Sci-Fi'],
        languages: ['en'],
        prefVector: { action: 0.9, scifi: 0.8, drama: 0.2 }
      }
    },
    {
      email: 'arabic.viewer@halfmovies.com',
      name: 'Arabic Viewer',
      password: 'password123',
      prefs: {
        moods: ['reflective', 'warm'],
        favoriteGenres: ['Drama', 'Family'],
        languages: ['ar'],
        prefVector: { drama: 0.9, family: 0.85, action: 0.1 }
      }
    },
    {
      email: 'multi.lang@halfmovies.com',
      name: 'Multilingual User',
      password: 'password123',
      prefs: {
        moods: ['curious', 'adventurous'],
        favoriteGenres: ['Sci-Fi', 'Thriller', 'Comedy'],
        languages: ['en', 'es', 'ar'],
        prefVector: { scifi: 0.7, thriller: 0.6, comedy: 0.5 }
      }
    }
  ];

  for (const userData of users) {
    const { password, prefs, ...data } = userData;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash
      }
    });

    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        ...prefs
      }
    });

    console.log(`✅ Created user: ${user.email} (id: ${user.id})`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
