/**
 * Enhanced Learning System
 * Actually learns from movie features, not just actions
 */

import { PrismaClient } from '@prisma/client';

export interface MovieFeatures {
  genres: string[];
  languages: string[];
  year?: number;
  rating?: number;
  popularity?: number;
  actors?: string[];
  directors?: string[];
}

export interface LearningSignal {
  strength: number; // 0.0 to 1.0 - how strong is this signal
  type: 'explicit' | 'implicit' | 'negative';
}

/**
 * Enhanced learning that extracts actual movie features
 */
export class EnhancedLearning {
  constructor(private prisma: PrismaClient) {}

  /**
   * Learn from a user action on a specific movie
   */
  async learnFromMovieAction(
    userId: string,
    movieId: string,
    action: string,
    signal: LearningSignal
  ): Promise<Record<string, number>> {
    // Get the actual movie with all its features
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    if (!movie) {
      console.warn(`[EnhancedLearning] Movie ${movieId} not found`);
      return {};
    }

    // Extract features
    const features: MovieFeatures = {
      genres: movie.categories.map(c => c.category.name),
      languages: [movie.language],
      year: movie.year || undefined,
      rating: movie.rating || undefined,
      popularity: movie.popularity || undefined
    };

    // Calculate weight updates based on actual features
    const weightUpdates: Record<string, number> = {};

    // Learn genre preferences
    for (const genre of features.genres) {
      const baseWeight = this.getActionWeight(action, signal);
      weightUpdates[`genre:${genre}`] = baseWeight;
    }

    // Learn language preferences
    for (const lang of features.languages) {
      const baseWeight = this.getActionWeight(action, signal) * 0.5; // Languages less important
      weightUpdates[`language:${lang}`] = baseWeight;
    }

    // Learn year preferences (prefer similar years)
    if (features.year) {
      const yearRange = this.getYearRange(features.year);
      const baseWeight = this.getActionWeight(action, signal) * 0.3;
      weightUpdates[`year_range:${yearRange}`] = baseWeight;
    }

    // Learn quality preferences (rating-based)
    if (features.rating) {
      const qualityTier = this.getQualityTier(features.rating);
      const baseWeight = this.getActionWeight(action, signal) * 0.4;
      weightUpdates[`quality:${qualityTier}`] = baseWeight;
    }

    return weightUpdates;
  }

  /**
   * Get weight based on action type and signal strength
   */
  private getActionWeight(action: string, signal: LearningSignal): number {
    // Base weights by action type
    const actionWeights: Record<string, number> = {
      favorite: 0.2,
      watch: 0.1,
      watch_complete: 0.15, // Finished watching = stronger signal
      review_positive: 0.25,
      review_negative: -0.15, // Negative signal
      click: 0.05, // Implicit
      hover: 0.02, // Weak implicit
      skip: -0.05, // Negative implicit
      search: 0.03
    };

    const baseWeight = actionWeights[action] || 0.05;

    // Adjust by signal strength
    let adjustedWeight = baseWeight * signal.strength;

    // Adjust by signal type
    if (signal.type === 'explicit') {
      adjustedWeight *= 1.5; // Explicit signals are stronger
    } else if (signal.type === 'negative') {
      adjustedWeight *= -1; // Negative signals reduce preference
    }

    return adjustedWeight;
  }

  /**
   * Group years into ranges for learning
   */
  private getYearRange(year: number): string {
    if (year >= 2020) return '2020s';
    if (year >= 2010) return '2010s';
    if (year >= 2000) return '2000s';
    if (year >= 1990) return '1990s';
    if (year >= 1980) return '1980s';
    return 'classic';
  }

  /**
   * Group ratings into quality tiers
   */
  private getQualityTier(rating: number): string {
    if (rating >= 8.0) return 'excellent';
    if (rating >= 7.0) return 'very_good';
    if (rating >= 6.0) return 'good';
    if (rating >= 5.0) return 'average';
    return 'below_average';
  }

  /**
   * Apply time decay to weights
   * Older preferences fade over time
   */
  applyTimeDecay(
    weights: Record<string, number>,
    daysSinceLastUpdate: number
  ): Record<string, number> {
    if (daysSinceLastUpdate <= 0) return weights;

    const decayRate = 0.05; // 5% decay per day
    const decayFactor = Math.exp(-decayRate * daysSinceLastUpdate);

    const decayed: Record<string, number> = {};
    for (const [key, value] of Object.entries(weights)) {
      decayed[key] = value * decayFactor;
    }

    return decayed;
  }

  /**
   * Merge new weights with existing preferences
   */
  mergeWeights(
    existing: Record<string, number>,
    newWeights: Record<string, number>,
    learningRate: number = 0.1
  ): Record<string, number> {
    const merged = { ...existing };

    for (const [key, value] of Object.entries(newWeights)) {
      // Exponential moving average
      merged[key] = (merged[key] || 0) * (1 - learningRate) + value * learningRate;
    }

    // Normalize to prevent unbounded growth
    return this.normalizeWeights(merged);
  }

  /**
   * Normalize weights to unit vector
   */
  private normalizeWeights(weights: Record<string, number>): Record<string, number> {
    const magnitude = Math.sqrt(
      Object.values(weights).reduce((sum, v) => sum + v * v, 0)
    );

    if (magnitude === 0) return weights;

    const normalized: Record<string, number> = {};
    for (const [key, value] of Object.entries(weights)) {
      normalized[key] = value / magnitude;
    }

    return normalized;
  }

  /**
   * Get top preferences from weights
   */
  getTopPreferences(
    weights: Record<string, number>,
    limit: number = 10
  ): Array<{ feature: string; weight: number }> {
    return Object.entries(weights)
      .map(([feature, weight]) => ({ feature, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }
}

