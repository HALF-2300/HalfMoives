/**
 * PredictiveContext Module
 * Phase 4.0: Anticipates next actions, preloads assets, tracks accuracy
 */

import { PredictiveBridge, PredictedAction, PredictiveContext } from './predictiveBridge';
import { AdaptiveMetrics } from './adaptiveCore';
import { redis } from '../services/redis';

export class PredictiveContextModule {
  private bridge: PredictiveBridge;
  private preloadCache: Map<string, { data: unknown; timestamp: Date }> = new Map();
  private readonly PRELOAD_TTL = 10 * 60 * 1000; // 10 minutes

  constructor(bridge: PredictiveBridge) {
    this.bridge = bridge;
  }

  /**
   * Anticipate next user action and prepare
   */
  async anticipate(userId: string, metrics: AdaptiveMetrics): Promise<{
    predictions: PredictedAction[];
    preloaded: string[];
    confidence: number;
  }> {
    // Generate forward-looking state vector
    const stateVector = await this.bridge.generateStateVector(userId, metrics);

    // Preload assets based on predictions
    const preloaded = await this.bridge.preloadAssets(userId, stateVector.predictedActions);

    // Cache preloaded data
    await this.cachePreloadedAssets(preloaded);

    return {
      predictions: stateVector.predictedActions,
      preloaded,
      confidence: stateVector.confidence
    };
  }

  /**
   * Preload movie data into cache
   */
  private async cachePreloadedAssets(movieIds: string[]): Promise<void> {
    for (const movieId of movieIds) {
      try {
        // Check if already cached
        if (this.preloadCache.has(movieId)) {
          const cached = this.preloadCache.get(movieId)!;
          const age = Date.now() - cached.timestamp.getTime();
          if (age < this.PRELOAD_TTL) {
            continue; // Still fresh
          }
        }

        // Fetch movie data
        const movie = await this.bridge['prisma'].movie.findUnique({
          where: { id: movieId },
          include: {
            categories: {
              include: { category: true }
            }
          }
        });

        if (movie) {
          // Cache in memory
          this.preloadCache.set(movieId, {
            data: movie,
            timestamp: new Date()
          });

          // Also cache in Redis if available
          if (redis) {
            await redis.set(
              `preload:${movieId}`,
              JSON.stringify(movie),
              { ex: 600 } // 10 minutes
            );
          }
        }
      } catch (error) {
        console.error(`[PredictiveContext] Failed to preload ${movieId}:`, error);
      }
    }
  }

  /**
   * Get preloaded asset (if available)
   */
  async getPreloaded(movieId: string): Promise<unknown | null> {
    // Check memory cache
    if (this.preloadCache.has(movieId)) {
      const cached = this.preloadCache.get(movieId)!;
      const age = Date.now() - cached.timestamp.getTime();
      if (age < this.PRELOAD_TTL) {
        return cached.data;
      }
    }

    // Check Redis
    if (redis) {
      try {
        const cached = await redis.get(`preload:${movieId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error(`[PredictiveContext] Failed to get from Redis:`, error);
      }
    }

    return null;
  }

  /**
   * Record actual action and update accuracy
   */
  async recordActual(
    userId: string,
    actualAction: string,
    movieId?: string
  ): Promise<void> {
    await this.bridge.updateContextWithActual(userId, actualAction, movieId);
  }

  /**
   * Get predictive context for user
   */
  getContext(userId: string): PredictiveContext | undefined {
    return this.bridge.getContext(userId);
  }

  /**
   * Clear old preload cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.preloadCache.entries()) {
      const age = now - value.timestamp.getTime();
      if (age > this.PRELOAD_TTL) {
        this.preloadCache.delete(key);
      }
    }
  }
}

