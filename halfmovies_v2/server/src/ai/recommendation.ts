import { PrismaClient } from '@prisma/client';
import { redis } from '../services/redis';
import { getAdaptiveCore } from './adaptiveCore';

export interface UserProfile {
  userId: string;
  moods: string[];
  favoriteGenres: string[];
  languages: string[];
  prefVector?: Record<string, number>;
}

export interface MovieVector {
  id: string;
  title: string;
  overview?: string;
  poster?: string;
  language: string;
  year?: number;
  rating?: number;
  popularity?: number;
  genres: string[];
}

export interface RecommendationResult {
  recommendations: MovieVector[];
  strategy: string;
  cached: boolean;
  latency: number;
}

export class RecommendationEngine {
  constructor(private prisma: PrismaClient) {}

  async recommend(userId: string): Promise<RecommendationResult> {
    const start = Date.now();
    const cacheKey = `rec_${userId}`;
    const adaptiveCore = getAdaptiveCore(this.prisma);

    // Check cache first
    let cacheHit = false;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        cacheHit = true;
        await adaptiveCore.updateCacheHitRate(true);
        const data = JSON.parse(cached);
        return { ...data, cached: true, latency: Date.now() - start };
      }
      await adaptiveCore.updateCacheHitRate(false);
    }

    // Fetch user preferences
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId }
    });

    let movies: any[];
    let strategy = 'curated';

    if (prefs && (prefs.favoriteGenres.length > 0 || prefs.languages.length > 0)) {
      // Personalized recommendations
      strategy = 'personalized';
      
      // Get categories matching user's favorite genres
      const categoryIds = await this.prisma.category.findMany({
        where: {
          name: { in: prefs.favoriteGenres }
        },
        select: { id: true }
      });

      const categoryIdList = categoryIds.map((c) => c.id);

      // Find movies with matching categories and languages
      movies = await this.prisma.movie.findMany({
        where: {
          AND: [
            prefs.languages.length > 0
              ? { language: { in: prefs.languages } }
              : {},
            categoryIdList.length > 0
              ? {
                  categories: {
                    some: {
                      categoryId: { in: categoryIdList }
                    }
                  }
                }
              : {}
          ]
        },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy: [{ popularity: 'desc' }, { rating: 'desc' }],
        take: 5
      });
    } else {
      // Fallback to featured content
      movies = await this.prisma.movie.findMany({
        where: { isFeatured: true },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy: [{ popularity: 'desc' }, { rating: 'desc' }],
        take: 5
      });
    }

    // Transform to MovieVector format
    const recommendations: MovieVector[] = movies.map((m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview ?? undefined,
      poster: m.poster ?? undefined,
      language: m.language,
      year: m.year ?? undefined,
      rating: m.rating ?? undefined,
      popularity: m.popularity ?? undefined,
      genres: m.categories.map((c: any) => c.category.name)
    }));

    const latency = Date.now() - start;
    const result: RecommendationResult = {
      recommendations,
      strategy,
      cached: false,
      latency
    };

    // Cache the result with adaptive TTL
    if (redis) {
      const ttl = await redis.get('adaptive:cache:ttl');
      const cacheTTL = ttl ? parseInt(ttl) : 3600;
      await redis.set(cacheKey, JSON.stringify(result), { ex: cacheTTL });
    }

    // Log the call
    await this.logAiCall(userId, recommendations.length, latency);

    // Learn from this recommendation event
    await adaptiveCore.learnFromActivity({
      userId,
      action: 'recommendation',
      metadata: {
        strategy,
        count: recommendations.length,
        latency
      }
    });

    return result;
  }

  private async logAiCall(userId: string, count: number, latency: number): Promise<void> {
    try {
      await this.prisma.aiLog.create({
        data: {
          userId,
          count,
          latency
        }
      });

      // Log warning if latency exceeds threshold
      if (latency > 500) {
        console.warn(`[AI] High latency detected: ${latency}ms for user ${userId}`);
      }
    } catch (err) {
      console.error('[AI] Failed to log AI call:', err);
    }
  }
}
