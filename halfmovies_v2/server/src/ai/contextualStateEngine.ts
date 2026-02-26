/**
 * ContextualStateEngine
 * Phase 4.1: Interpret environmental and temporal context
 * Detects time-based patterns, adapts to mood, learns from anomalies
 */

import { PrismaClient } from '@prisma/client';

export interface ContextualState {
  userId: string;
  temporal: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    hour: number;
    isWeekend: boolean;
    season?: string;
  };
  behavioral: {
    sessionDuration: number;
    recentActivityPattern: 'browsing' | 'focused' | 'exploring' | 'casual';
    interactionVelocity: number; // Actions per minute
    anomalyScore: number; // 0.0 to 1.0 - how unusual current behavior is
  };
  mood: {
    inferred: 'energetic' | 'relaxed' | 'curious' | 'nostalgic' | 'adventurous' | 'contemplative';
    confidence: number; // 0.0 to 1.0
    factors: string[]; // What contributed to this mood inference
  };
  contextual: {
    deviceType?: string;
    location?: string;
    socialContext?: 'alone' | 'with_others';
  };
  timestamp: string;
}

export interface TimeBasedPattern {
  timeRange: string; // "20:00-23:00"
  preferredGenres: string[];
  preferredMoods: string[];
  averageSessionDuration: number;
  typicalBehavior: string;
  confidence: number;
}

export interface AnomalyLearning {
  anomalyType: string;
  context: ContextualState;
  userResponse: 'positive' | 'negative' | 'neutral';
  learnedAdjustment: Record<string, number>;
  timestamp: string;
}

/**
 * ContextualStateEngine - Interprets environmental and temporal context
 */
export class ContextualStateEngine {
  private prisma: PrismaClient;
  private userPatterns: Map<string, TimeBasedPattern[]> = new Map();
  private anomalyHistory: AnomalyLearning[] = [];
  private readonly MOOD_DECAY_CONSTANT = 0.1; // How quickly mood confidence decays

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Analyze current contextual state for user
   */
  async analyzeContext(userId: string): Promise<ContextualState> {
    const now = new Date();
    
    // Get recent activities
    const recentActivities = await this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Temporal context
    const temporal = this.analyzeTemporal(now);

    // Behavioral context
    const behavioral = this.analyzeBehavioral(recentActivities, now);

    // Mood inference
    const mood = await this.inferMood(userId, recentActivities, temporal, behavioral);

    // Contextual factors
    const contextual = this.analyzeContextual(recentActivities);

    return {
      userId,
      temporal,
      behavioral,
      mood,
      contextual,
      timestamp: now.toISOString()
    };
  }

  /**
   * Analyze temporal patterns
   */
  private analyzeTemporal(now: Date): ContextualState['temporal'] {
    const hour = now.getHours();
    const day = now.getDay();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Determine season (simplified - northern hemisphere)
    const month = now.getMonth();
    let season: string;
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';

    return {
      timeOfDay,
      dayOfWeek: dayNames[day],
      hour,
      isWeekend: day === 0 || day === 6,
      season
    };
  }

  /**
   * Analyze behavioral patterns
   */
  private analyzeBehavioral(
    activities: Array<{ createdAt: Date; action: string }>,
    now: Date
  ): ContextualState['behavioral'] {
    if (activities.length === 0) {
      return {
        sessionDuration: 0,
        recentActivityPattern: 'casual',
        interactionVelocity: 0,
        anomalyScore: 0
      };
    }

    const firstActivity = activities[activities.length - 1];
    const sessionDuration = (now.getTime() - firstActivity.createdAt.getTime()) / (1000 * 60); // minutes

    // Calculate interaction velocity (actions per minute)
    const timeSpan = Math.max(1, sessionDuration);
    const interactionVelocity = activities.length / timeSpan;

    // Determine activity pattern
    let recentActivityPattern: 'browsing' | 'focused' | 'exploring' | 'casual';
    if (interactionVelocity > 3) {
      recentActivityPattern = 'browsing';
    } else if (activities.some(a => a.action === 'favorite' || a.action === 'watch')) {
      recentActivityPattern = 'focused';
    } else if (activities.some(a => a.action === 'search')) {
      recentActivityPattern = 'exploring';
    } else {
      recentActivityPattern = 'casual';
    }

    // Calculate anomaly score (how unusual is this behavior?)
    const anomalyScore = this.calculateAnomalyScore(activities, interactionVelocity);

    return {
      sessionDuration,
      recentActivityPattern,
      interactionVelocity,
      anomalyScore
    };
  }

  /**
   * Infer user mood from context
   */
  private async inferMood(
    userId: string,
    activities: Array<{ createdAt: Date; action: string; metadata?: any }>,
    temporal: ContextualState['temporal'],
    behavioral: ContextualState['behavioral']
  ): Promise<ContextualState['mood']> {
    const factors: string[] = [];
    let moodScores: Record<string, number> = {};

    // Factor 1: Time of day
    if (temporal.timeOfDay === 'night') {
      moodScores.nostalgic = 0.3;
      moodScores.contemplative = 0.4;
      factors.push('night_time');
    } else if (temporal.timeOfDay === 'morning') {
      moodScores.energetic = 0.3;
      factors.push('morning_time');
    } else if (temporal.timeOfDay === 'afternoon') {
      moodScores.adventurous = 0.2;
      factors.push('afternoon_time');
    } else {
      moodScores.relaxed = 0.3;
      factors.push('evening_time');
    }

    // Factor 2: Behavioral pattern
    if (behavioral.recentActivityPattern === 'exploring') {
      moodScores.curious = (moodScores.curious || 0) + 0.4;
      factors.push('exploring_behavior');
    } else if (behavioral.recentActivityPattern === 'focused') {
      moodScores.contemplative = (moodScores.contemplative || 0) + 0.3;
      factors.push('focused_behavior');
    } else if (behavioral.recentActivityPattern === 'browsing') {
      moodScores.curious = (moodScores.curious || 0) + 0.2;
      factors.push('browsing_behavior');
    }

    // Factor 3: Session duration
    if (behavioral.sessionDuration > 30) {
      moodScores.relaxed = (moodScores.relaxed || 0) + 0.2;
      factors.push('long_session');
    } else if (behavioral.sessionDuration < 5) {
      moodScores.energetic = (moodScores.energetic || 0) + 0.2;
      factors.push('short_session');
    }

    // Factor 4: Weekend vs weekday
    if (temporal.isWeekend) {
      moodScores.relaxed = (moodScores.relaxed || 0) + 0.2;
      factors.push('weekend');
    }

    // Factor 5: Recent favorites (nostalgic if old movies)
    const favorites = activities.filter(a => a.action === 'favorite');
    if (favorites.length > 0) {
      // Check if favorites are old movies (would need movie data)
      moodScores.nostalgic = (moodScores.nostalgic || 0) + 0.2;
      factors.push('recent_favorites');
    }

    // Get top mood
    const topMood = Object.entries(moodScores)
      .sort((a, b) => b[1] - a[1])[0];

    const inferred = (topMood?.[0] || 'curious') as ContextualState['mood']['inferred'];
    const confidence = Math.min(1.0, (topMood?.[1] || 0.5) + 0.2); // Boost confidence slightly

    return {
      inferred,
      confidence,
      factors
    };
  }

  /**
   * Analyze contextual factors
   */
  private analyzeContextual(
    activities: Array<{ metadata?: any }>
  ): ContextualState['contextual'] {
    // Extract from activity metadata if available
    // For now, return defaults
    return {
      socialContext: 'alone' // Would need to detect from metadata
    };
  }

  /**
   * Calculate anomaly score
   */
  private calculateAnomalyScore(
    activities: Array<{ action: string }>,
    interactionVelocity: number
  ): number {
    // Anomaly detection: unusual patterns
    // High velocity + many searches = unusual (exploring)
    // Very low velocity = unusual (idle)
    // Mix of actions = normal

    const searchCount = activities.filter(a => a.action === 'search').length;
    const favoriteCount = activities.filter(a => a.action === 'favorite').length;
    const viewCount = activities.filter(a => a.action === 'movie_view').length;

    let anomaly = 0;

    // High search ratio = exploring (slight anomaly)
    if (searchCount > activities.length * 0.5) {
      anomaly += 0.3;
    }

    // Very high velocity = unusual
    if (interactionVelocity > 5) {
      anomaly += 0.3;
    }

    // Very low velocity = unusual
    if (interactionVelocity < 0.1 && activities.length > 5) {
      anomaly += 0.2;
    }

    // All favorites, no views = unusual
    if (favoriteCount > 0 && viewCount === 0) {
      anomaly += 0.2;
    }

    return Math.min(1.0, anomaly);
  }

  /**
   * Learn from anomaly
   */
  async learnFromAnomaly(
    userId: string,
    anomalyType: string,
    context: ContextualState,
    userResponse: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    const learnedAdjustment: Record<string, number> = {};

    // Learn adjustments based on response
    if (userResponse === 'positive') {
      // User liked the anomaly - reinforce this pattern
      learnedAdjustment[`anomaly_${anomalyType}_positive`] = 0.1;
    } else if (userResponse === 'negative') {
      // User didn't like - reduce this pattern
      learnedAdjustment[`anomaly_${anomalyType}_negative`] = -0.1;
    }

    const learning: AnomalyLearning = {
      anomalyType,
      context,
      userResponse,
      learnedAdjustment,
      timestamp: new Date().toISOString()
    };

    this.anomalyHistory.push(learning);

    // Keep only last 1000 anomalies
    if (this.anomalyHistory.length > 1000) {
      this.anomalyHistory = this.anomalyHistory.slice(-1000);
    }

    console.log(`[ContextualStateEngine] Learned from anomaly: ${anomalyType} (${userResponse})`);
  }

  /**
   * Get time-based patterns for user
   */
  async getTimeBasedPatterns(userId: string): Promise<TimeBasedPattern[]> {
    if (this.userPatterns.has(userId)) {
      return this.userPatterns.get(userId)!;
    }

    // Analyze historical data to build patterns
    // For now, return default patterns
    const patterns: TimeBasedPattern[] = [
      {
        timeRange: '20:00-23:00',
        preferredGenres: ['Horror', 'Thriller'],
        preferredMoods: ['nostalgic', 'contemplative'],
        averageSessionDuration: 45,
        typicalBehavior: 'focused',
        confidence: 0.6
      },
      {
        timeRange: '14:00-18:00',
        preferredGenres: ['Action', 'Adventure'],
        preferredMoods: ['adventurous', 'energetic'],
        averageSessionDuration: 30,
        typicalBehavior: 'exploring',
        confidence: 0.5
      }
    ];

    this.userPatterns.set(userId, patterns);
    return patterns;
  }

  /**
   * Adapt recommendations based on context
   */
  adaptRecommendationsToContext(
    recommendations: Array<{ id: string; genres: string[] }>,
    context: ContextualState
  ): Array<{ id: string; score: number }> {
    // Score recommendations based on contextual fit
    return recommendations.map(rec => {
      let score = 1.0;

      // Boost if genres match time-based preferences
      const timePatterns = this.userPatterns.get(context.userId) || [];
      const currentPattern = timePatterns.find(p => {
        const [start, end] = p.timeRange.split('-');
        const [startHour] = start.split(':').map(Number);
        const [endHour] = end.split(':').map(Number);
        return context.temporal.hour >= startHour && context.temporal.hour < endHour;
      });

      if (currentPattern) {
        const genreMatch = rec.genres.some(g => currentPattern.preferredGenres.includes(g));
        if (genreMatch) {
          score += 0.3;
        }
      }

      // Boost if matches inferred mood
      // (Would need mood-to-genre mapping)

      return { id: rec.id, score };
    });
  }
}

