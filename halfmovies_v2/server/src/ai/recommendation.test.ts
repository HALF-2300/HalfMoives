import { PrismaClient } from '@prisma/client';
import { RecommendationEngine } from '../recommendation';

const prisma = new PrismaClient();

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;
  let testUserId: string;

  beforeAll(async () => {
    engine = new RecommendationEngine(prisma);

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@halfmovies.com',
        name: 'Test User'
      }
    });
    testUserId = user.id;

    // Create test categories
    const actionCat = await prisma.category.create({
      data: { name: 'Action' }
    });
    const dramacat = await prisma.category.create({
      data: { name: 'Drama' }
    });

    // Create test movies
    const movie1 = await prisma.movie.create({
      data: {
        title: 'Test Movie 1',
        overview: 'Action packed adventure',
        language: 'en',
        rating: 8.5,
        popularity: 100,
        isFeatured: true
      }
    });

    const movie2 = await prisma.movie.create({
      data: {
        title: 'Test Movie 2',
        overview: 'Dramatic story',
        language: 'ar',
        rating: 7.8,
        popularity: 80,
        isFeatured: false
      }
    });

    // Link categories
    await prisma.categoryOnMovies.createMany({
      data: [
        { movieId: movie1.id, categoryId: actionCat.id },
        { movieId: movie2.id, categoryId: dramacat.id }
      ]
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.categoryOnMovies.deleteMany({});
    await prisma.aiLog.deleteMany({});
    await prisma.userPreferences.deleteMany({});
    await prisma.movie.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should return recommendations for valid user', async () => {
    const result = await engine.recommend(testUserId);
    expect(result).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
    expect(result.strategy).toBe('curated');
    expect(result.cached).toBe(false);
  });

  it('should use personalized strategy when preferences exist', async () => {
    // Create user preferences
    await prisma.userPreferences.create({
      data: {
        userId: testUserId,
        favoriteGenres: ['Action'],
        languages: ['en']
      }
    });

    const result = await engine.recommend(testUserId);
    expect(result.strategy).toBe('personalized');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should cache recommendations', async () => {
    const firstCall = await engine.recommend(testUserId);
    const secondCall = await engine.recommend(testUserId);
    
    expect(firstCall.cached).toBe(false);
    expect(secondCall.cached).toBe(true);
    expect(secondCall.latency).toBeLessThan(50);
  });

  it('should log AI calls', async () => {
    await engine.recommend(testUserId);
    
    const logs = await prisma.aiLog.findMany({
      where: { userId: testUserId }
    });
    
    expect(logs.length).toBeGreaterThan(0);
  });

  it('should throw 404 for invalid user', async () => {
    await expect(engine.recommend('invalid-user-id')).rejects.toThrow();
  });
});
