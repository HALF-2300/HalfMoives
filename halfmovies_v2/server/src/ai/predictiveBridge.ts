/**
 * Predictive Bridge - Shared Cognitive Layer
 * Phase 4.0: Anticipates user intent before interaction
 * AICore-X1 ↔ AICollab-NX Cognitive Integration
 */

import { PrismaClient } from '@prisma/client';
import { AdaptiveMetrics } from './adaptiveCore';
import { CollaborationCoordinator } from './collaborationCoordinator';

export interface ForwardLookingStateVector {
  userId: string;
  predictedActions: PredictedAction[];
  confidence: number; // 0.0 to 1.0
  contextWindow: number; // milliseconds
  timestamp: string;
  // Phase 4.1: Contextual-Emotional Payload
  contextualEmotional?: {
    contextualState: any; // ContextualState from ContextualStateEngine
    emotionalState: any; // EmotionalState from EmotionMatrix
    empathicPredictions?: any[]; // EmpathicPrediction from EmpathicLoop
    emotionalReasons?: string[];
  };
}

export interface PredictedAction {
  type: 'movie_view' | 'movie_favorite' | 'search' | 'genre_explore' | 'recommendation_request';
  movieId?: string;
  genre?: string;
  searchQuery?: string;
  confidence: number;
  predictedAt: string;
  context: Record<string, unknown>;
}

export interface PredictiveContext {
  userId: string;
  currentState: {
    recentActions: Array<{ action: string; timestamp: Date; movieId?: string }>;
    activePreferences: Record<string, number>;
    sessionDuration: number;
    timeOfDay: string;
  };
  predictedNext: PredictedAction[];
  preloadQueue: string[]; // Movie IDs to preload
  accuracyHistory: Array<{ prediction: string; actual: string; accuracy: number }>;
}

export interface PredictiveMetrics {
  totalPredictions: number;
  accuratePredictions: number;
  predictiveAccuracyIndex: number; // PAI - rolling average
  averageConfidence: number;
  preloadHitRate: number;
  latencyReduction: number;
  lastUpdated: string;
}

/**
 * Predictive Bridge - Core cognitive layer
 */
export class PredictiveBridge {
  private prisma: PrismaClient;
  private coordinator: CollaborationCoordinator;
  private predictiveContexts: Map<string, PredictiveContext> = new Map();
  private metrics: PredictiveMetrics;
  private predictionHistory: Array<{ prediction: PredictedAction; actual?: string; timestamp: string }> = [];
  private readonly PAI_WINDOW = 10; // Rolling window for PAI calculation

  constructor(prisma: PrismaClient, coordinator: CollaborationCoordinator) {
    this.prisma = prisma;
    this.coordinator = coordinator;
    this.metrics = {
      totalPredictions: 0,
      accuratePredictions: 0,
      predictiveAccuracyIndex: 0,
      averageConfidence: 0,
      preloadHitRate: 0,
      latencyReduction: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate forward-looking state vector
   * Combines telemetry + weight matrices for prediction
   */
  async generateStateVector(
    userId: string,
    metrics: AdaptiveMetrics
  ): Promise<ForwardLookingStateVector> {
    // Get user context
    const context = await this.getOrCreateContext(userId);
    
    // Analyze recent activity patterns
    const recentActions = context.currentState.recentActions.slice(-10);
    
    // Get user preferences (weight matrix)
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId }
    });

    const prefVector = (prefs?.prefVector as Record<string, number>) || {};

    // Predict next actions based on:
    // 1. Recent activity patterns
    // 2. User preferences (weight matrix)
    // 3. Time-based patterns
    // 4. Session context

    const predictions = await this.predictNextActions(
      userId,
      recentActions,
      prefVector,
      context
    );

    // Calculate overall confidence
    const confidence = this.calculateConfidence(predictions, prefVector);

    return {
      userId,
      predictedActions: predictions,
      confidence,
      contextWindow: 5 * 60 * 1000, // 5 minutes
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Predict next user actions
   * Phase 4.1: Extended with contextual-emotional factors
   */
  private async predictNextActions(
    userId: string,
    recentActions: Array<{ action: string; timestamp: Date; movieId?: string }>,
    prefVector: Record<string, number>,
    context: PredictiveContext,
    contextualEmotional?: {
      contextualState: any;
      emotionalState: any;
      empathicPredictions?: any[];
    }
  ): Promise<PredictedAction[]> {
    const predictions: PredictedAction[] = [];
    const now = new Date();

    // Pattern 1: If user recently viewed movies, predict they'll want recommendations
    if (recentActions.some(a => a.action === 'movie_view')) {
      const viewCount = recentActions.filter(a => a.action === 'movie_view').length;
      predictions.push({
        type: 'recommendation_request',
        confidence: Math.min(0.9, 0.5 + viewCount * 0.1),
        predictedAt: now.toISOString(),
        context: { trigger: 'recent_views', count: viewCount }
      });
    }

    // Pattern 2: If user has strong genre preferences, predict genre exploration
    const topGenres = this.getTopPreferences(prefVector, 'genre:', 3);
    if (topGenres.length > 0) {
      topGenres.forEach(({ feature, weight }) => {
        const genre = feature.replace('genre:', '');
        predictions.push({
          type: 'genre_explore',
          genre,
          confidence: Math.min(0.8, weight * 2),
          predictedAt: now.toISOString(),
          context: { trigger: 'preference_strength', weight }
        });
      });
    }

    // Pattern 3: If user recently searched, predict similar searches
    const recentSearches = recentActions.filter(a => a.action === 'search');
    if (recentSearches.length > 0) {
      const lastSearch = recentSearches[recentSearches.length - 1];
      predictions.push({
        type: 'search',
        searchQuery: lastSearch.movieId || 'similar',
        confidence: 0.6,
        predictedAt: now.toISOString(),
        context: { trigger: 'search_pattern' }
      });
    }

    // Pattern 4: Time-based predictions
    const hour = now.getHours();
    if (hour >= 20 || hour < 6) {
      // Evening/night - predict horror/thriller
      predictions.push({
        type: 'genre_explore',
        genre: 'Horror',
        confidence: 0.5,
        predictedAt: now.toISOString(),
        context: { trigger: 'time_of_day', hour }
      });
    }

    // Pattern 5: If user has favorites, predict viewing similar movies
    const recentFavorites = recentActions.filter(a => a.action === 'favorite');
    if (recentFavorites.length > 0 && recentFavorites[0].movieId) {
      // Predict viewing similar movies
      const similarMovies = await this.findSimilarMovies(recentFavorites[0].movieId);
      similarMovies.slice(0, 3).forEach(movieId => {
        predictions.push({
          type: 'movie_view',
          movieId,
          confidence: 0.7,
          predictedAt: now.toISOString(),
          context: { trigger: 'similarity', source: recentFavorites[0].movieId }
        });
      });
    }

    // Phase 4.1: Adjust predictions based on contextual-emotional factors
    if (contextualEmotional?.empathicPredictions && contextualEmotional.empathicPredictions.length > 0) {
      // Use empathic predictions if available (they have adjusted confidence)
      const ep = contextualEmotional.empathicPredictions;
      const empathic = ep
        .map((e: any) => e.prediction)
        .sort((a: PredictedAction, b: PredictedAction) => {
          const aEp = ep.find((e: any) => e.prediction === a);
          const bEp = ep.find((e: any) => e.prediction === b);
          const aConf = aEp?.adjustedConfidence || a.confidence;
          const bConf = bEp?.adjustedConfidence || b.confidence;
          return bConf - aConf;
        })
        .slice(0, 5);
      
      return empathic;
    }

    // Sort by confidence and return top 5
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Get or create predictive context for user
   */
  async getOrCreateContext(userId: string): Promise<PredictiveContext> {
    if (this.predictiveContexts.has(userId)) {
      return this.predictiveContexts.get(userId)!;
    }

    // Get recent activities
    const recentActivities = await this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Get preferences
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId }
    });

    const context: PredictiveContext = {
      userId,
      currentState: {
        recentActions: recentActivities.map(a => ({
          action: a.action,
          timestamp: a.createdAt,
          movieId: a.metadata?.['movieId'] as string | undefined
        })),
        activePreferences: (prefs?.prefVector as Record<string, number>) || {},
        sessionDuration: 0, // Will be calculated
        timeOfDay: this.getTimeOfDay()
      },
      predictedNext: [],
      preloadQueue: [],
      accuracyHistory: []
    };

    this.predictiveContexts.set(userId, context);
    return context;
  }

  /**
   * Update context with actual action (for accuracy tracking)
   */
  async updateContextWithActual(
    userId: string,
    actualAction: string,
    movieId?: string
  ): Promise<void> {
    const context = await this.getOrCreateContext(userId);
    
    // Add to recent actions
    context.currentState.recentActions.unshift({
      action: actualAction,
      timestamp: new Date(),
      movieId
    });

    // Keep only last 20
    if (context.currentState.recentActions.length > 20) {
      context.currentState.recentActions = context.currentState.recentActions.slice(0, 20);
    }

    // Check if we predicted this action
    const recentPrediction = context.predictedNext.find(
      p => p.type === actualAction || 
           (p.type === 'movie_view' && p.movieId === movieId)
    );

    if (recentPrediction) {
      // We predicted correctly!
      const accuracy = recentPrediction.confidence;
      context.accuracyHistory.push({
        prediction: recentPrediction.type,
        actual: actualAction,
        accuracy
      });

      // Update metrics
      this.metrics.totalPredictions++;
      this.metrics.accuratePredictions++;
      this.updatePAI();
    } else {
      // We didn't predict this
      this.metrics.totalPredictions++;
      this.updatePAI();
    }

    // Update context
    this.predictiveContexts.set(userId, context);
  }

  /**
   * Preload assets based on predictions
   */
  async preloadAssets(userId: string, predictions: PredictedAction[]): Promise<string[]> {
    const preloadQueue: string[] = [];

    for (const prediction of predictions) {
      if (prediction.type === 'movie_view' && prediction.movieId) {
        preloadQueue.push(prediction.movieId);
      } else if (prediction.type === 'genre_explore' && prediction.genre) {
        // Preload top movies in this genre
        const genreMovies = await this.getTopMoviesByGenre(prediction.genre, 5);
        preloadQueue.push(...genreMovies.map(m => m.id));
      }
    }

    // Update context preload queue
    const context = await this.getOrCreateContext(userId);
    context.preloadQueue = [...new Set(preloadQueue)]; // Deduplicate

    return context.preloadQueue;
  }

  /**
   * Calculate confidence in predictions
   */
  private calculateConfidence(
    predictions: PredictedAction[],
    prefVector: Record<string, number>
  ): number {
    if (predictions.length === 0) return 0;

    // Average confidence weighted by preference strength
    const totalConfidence = predictions.reduce((sum, p) => {
      // Boost confidence if prediction aligns with preferences
      let boost = 1.0;
      if (p.genre) {
        const genreKey = `genre:${p.genre}`;
        if (prefVector[genreKey]) {
          boost = 1.0 + prefVector[genreKey];
        }
      }
      return sum + (p.confidence * boost);
    }, 0);

    return Math.min(1.0, totalConfidence / predictions.length);
  }

  /**
   * Update Predictive Accuracy Index (PAI)
   */
  private updatePAI(): void {
    // Calculate PAI over last N predictions (rolling window)
    const recentHistory = this.predictionHistory.slice(-this.PAI_WINDOW);
    
    if (recentHistory.length === 0) {
      this.metrics.predictiveAccuracyIndex = 0;
      return;
    }

    const accurate = recentHistory.filter(h => h.actual !== undefined).length;
    this.metrics.predictiveAccuracyIndex = accurate / recentHistory.length;

    // Update average confidence
    const allPredictions = this.predictionHistory
      .filter(h => h.prediction)
      .map(h => h.prediction.confidence);
    
    if (allPredictions.length > 0) {
      this.metrics.averageConfidence = 
        allPredictions.reduce((a, b) => a + b, 0) / allPredictions.length;
    }

    this.metrics.lastUpdated = new Date().toISOString();
  }

  /**
   * Get top preferences from weight vector
   */
  private getTopPreferences(
    prefVector: Record<string, number>,
    prefix: string,
    limit: number
  ): Array<{ feature: string; weight: number }> {
    return Object.entries(prefVector)
      .filter(([key]) => key.startsWith(prefix))
      .map(([feature, weight]) => ({ feature, weight }))
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, limit);
  }

  /**
   * Find similar movies
   */
  private async findSimilarMovies(movieId: string): Promise<string[]> {
    // Simplified - in production, use proper similarity algorithm
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        categories: {
          include: { category: true }
        }
      }
    });

    if (!movie) return [];

    const genreIds = movie.categories.map(c => c.categoryId);
    
    const similar = await this.prisma.movie.findMany({
      where: {
        AND: [
          { id: { not: movieId } },
          {
            categories: {
              some: {
                categoryId: { in: genreIds }
              }
            }
          }
        ]
      },
      take: 5,
      select: { id: true }
    });

    return similar.map(m => m.id);
  }

  /**
   * Get top movies by genre
   */
  private async getTopMoviesByGenre(genre: string, limit: number): Promise<Array<{ id: string }>> {
    const category = await this.prisma.category.findUnique({
      where: { name: genre }
    });

    if (!category) return [];

    const movies = await this.prisma.movie.findMany({
      where: {
        categories: {
          some: {
            categoryId: category.id
          }
        }
      },
      orderBy: { popularity: 'desc' },
      take: limit,
      select: { id: true }
    });

    return movies;
  }

  /**
   * Get time of day category
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Get predictive metrics
   */
  getMetrics(): PredictiveMetrics {
    // Calculate preload hit rate (simplified - in production, track actual hits)
    // For now, estimate based on prediction accuracy
    this.metrics.preloadHitRate = this.metrics.predictiveAccuracyIndex * 0.8;
    
    // Calculate latency reduction (better predictions = more preloading = lower latency)
    // Target: 50-70% reduction as per Phase 4.0 objectives
    this.metrics.latencyReduction = Math.min(0.7, this.metrics.predictiveAccuracyIndex * 0.7);
    
    return { ...this.metrics };
  }

  /**
   * Get predictive context for user
   */
  getContext(userId: string): PredictiveContext | undefined {
    return this.predictiveContexts.get(userId);
  }
}

