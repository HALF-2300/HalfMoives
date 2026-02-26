/**
 * Empathic Loop Protocol
 * Phase 4.1: Predict not only *what* the user wants, but *why*
 * Adjust cache and prefetch priorities based on emotional likelihood
 */

import { ContextualState, ContextualStateEngine } from './contextualStateEngine';
import { EmotionMatrix, EmotionalState, EmotionWeightedPrediction } from './emotionMatrix';
import { PredictedAction } from './predictiveBridge';
import { CollectiveNodeMesh } from './collectiveNodeMesh';
import { PrismaClient } from '@prisma/client';

export interface EmpathicPrediction {
  prediction: PredictedAction;
  emotionalReason: string; // Why the user might want this
  emotionalLikelihood: number;
  emotionalResonance: number;
  adjustedConfidence: number;
  priority: number; // 0.0 to 1.0 - for cache/prefetch
}

export interface EmpathicContext {
  userId: string;
  contextualState: ContextualState;
  emotionalState: EmotionalState;
  predictions: EmpathicPrediction[];
  cachePriorities: Map<string, number>; // movieId -> priority
  prefetchQueue: Array<{ movieId: string; priority: number; reason: string }>;
}

/**
 * Empathic Loop - Predicts "why" not just "what"
 */
export class EmpathicLoop {
  private contextualEngine: ContextualStateEngine;
  private emotionMatrix: EmotionMatrix;
  private prisma: PrismaClient;
  private empathicContexts: Map<string, EmpathicContext> = new Map();
  // Phase 4.2: ERS Protocol
  private collectiveMesh: CollectiveNodeMesh;
  private emotionalWeights: Map<string, number> = new Map(); // Shared emotional weights

  constructor(
    contextualEngine: ContextualStateEngine,
    emotionMatrix: EmotionMatrix,
    prisma: PrismaClient,
    collectiveMesh?: CollectiveNodeMesh
  ) {
    this.contextualEngine = contextualEngine;
    this.emotionMatrix = emotionMatrix;
    this.prisma = prisma;
    this.collectiveMesh = collectiveMesh || null as any; // Will be set if available
  }

  /**
   * Phase 4.2: Set collective mesh for ERS Protocol
   */
  setCollectiveMesh(mesh: CollectiveNodeMesh): void {
    this.collectiveMesh = mesh;
  }

  /**
   * Generate empathic predictions (what + why)
   */
  async generateEmpathicPredictions(
    userId: string,
    basePredictions: PredictedAction[]
  ): Promise<EmpathicPrediction[]> {
    // Get contextual state
    const contextualState = await this.contextualEngine.analyzeContext(userId);

    // Infer emotional state from context
    const emotionalState = this.inferEmotionalStateFromContext(contextualState);

    // Generate empathic predictions
    const empathicPredictions: EmpathicPrediction[] = [];

    for (const prediction of basePredictions) {
      // Get emotional profile if it's a movie prediction
      let contentProfile = null;
      if (prediction.movieId) {
        contentProfile = await this.emotionMatrix.getEmotionalProfile(prediction.movieId);
      }

      // Fuse sentiment with prediction
      const weighted = contentProfile
        ? await this.emotionMatrix.fuseSentimentWithPrediction(
            prediction,
            emotionalState,
            contentProfile
          )
        : {
            prediction,
            emotionalLikelihood: 0.5,
            emotionalResonance: 0.5,
            adjustedConfidence: prediction.confidence
          };

      // Determine emotional reason (why)
      const emotionalReason = this.determineEmotionalReason(
        prediction,
        contextualState,
        emotionalState,
        contentProfile
      );

      // Calculate priority for cache/prefetch
      const priority = this.calculatePriority(weighted, contextualState);

      empathicPredictions.push({
        prediction,
        emotionalReason,
        emotionalLikelihood: weighted.emotionalLikelihood,
        emotionalResonance: weighted.emotionalResonance,
        adjustedConfidence: weighted.adjustedConfidence,
        priority
      });
    }

    // Sort by priority
    empathicPredictions.sort((a, b) => b.priority - a.priority);

    // Update empathic context
    await this.updateEmpathicContext(userId, contextualState, emotionalState, empathicPredictions);

    return empathicPredictions;
  }

  /**
   * Infer emotional state from contextual state
   */
  private inferEmotionalStateFromContext(context: ContextualState): EmotionalState {
    // Map mood to emotional state
    const moodToEmotion: Record<string, Partial<EmotionalState>> = {
      energetic: {
        primary: 'excitement',
        valence: 0.7,
        arousal: 0.8
      },
      relaxed: {
        primary: 'calm',
        valence: 0.6,
        arousal: 0.3
      },
      curious: {
        primary: 'curiosity',
        valence: 0.5,
        arousal: 0.6
      },
      nostalgic: {
        primary: 'nostalgia',
        valence: 0.4,
        arousal: 0.4
      },
      adventurous: {
        primary: 'adventure',
        valence: 0.8,
        arousal: 0.9
      },
      contemplative: {
        primary: 'contemplation',
        valence: 0.3,
        arousal: 0.3
      }
    };

    const moodMapping = moodToEmotion[context.mood.inferred] || {
      primary: 'neutral',
      valence: 0.5,
      arousal: 0.5
    };

    return {
      primary: moodMapping.primary || 'neutral',
      secondary: [],
      intensity: context.mood.confidence,
      valence: moodMapping.valence || 0.5,
      arousal: moodMapping.arousal || 0.5
    };
  }

  /**
   * Determine emotional reason (why user might want this)
   */
  private determineEmotionalReason(
    prediction: PredictedAction,
    context: ContextualState,
    emotionalState: EmotionalState,
    contentProfile: any
  ): string {
    const reasons: string[] = [];

    // Time-based reasons
    if (context.temporal.timeOfDay === 'night') {
      reasons.push('Evening viewing preference');
    }

    // Mood-based reasons
    if (context.mood.inferred === 'nostalgic') {
      reasons.push('Matches nostalgic mood');
    } else if (context.mood.inferred === 'energetic') {
      reasons.push('Aligns with energetic state');
    }

    // Behavioral reasons
    if (context.behavioral.recentActivityPattern === 'exploring') {
      reasons.push('Supports exploration behavior');
    }

    // Emotional resonance
    if (contentProfile) {
      const emotionalMatch = contentProfile.emotionalStates.some(
        (state: any) => state.primary === emotionalState.primary
      );
      if (emotionalMatch) {
        reasons.push(`Emotional resonance: ${emotionalState.primary}`);
      }
    }

    // Default reason
    if (reasons.length === 0) {
      reasons.push('General interest prediction');
    }

    return reasons.join('; ');
  }

  /**
   * Calculate priority for cache/prefetch
   */
  private calculatePriority(
    weighted: EmotionWeightedPrediction,
    context: ContextualState
  ): number {
    let priority = weighted.adjustedConfidence;

    // Boost priority based on emotional likelihood
    priority += weighted.emotionalLikelihood * 0.2;

    // Boost priority based on emotional resonance
    priority += weighted.emotionalResonance * 0.2;

    // Boost if high mood confidence
    priority += context.mood.confidence * 0.1;

    // Boost if focused behavior (more likely to act on prediction)
    if (context.behavioral.recentActivityPattern === 'focused') {
      priority += 0.15;
    }

    // Reduce if anomaly (less predictable)
    priority -= context.behavioral.anomalyScore * 0.2;

    return Math.max(0, Math.min(1.0, priority));
  }

  /**
   * Update empathic context
   */
  private async updateEmpathicContext(
    userId: string,
    contextualState: ContextualState,
    emotionalState: EmotionalState,
    predictions: EmpathicPrediction[]
  ): Promise<void> {
    // Build cache priorities map
    const cachePriorities = new Map<string, number>();
    const prefetchQueue: Array<{ movieId: string; priority: number; reason: string }> = [];

    predictions.forEach(empathic => {
      if (empathic.prediction.movieId) {
        cachePriorities.set(empathic.prediction.movieId, empathic.priority);
        prefetchQueue.push({
          movieId: empathic.prediction.movieId,
          priority: empathic.priority,
          reason: empathic.emotionalReason
        });
      }
    });

    const context: EmpathicContext = {
      userId,
      contextualState,
      emotionalState,
      predictions,
      cachePriorities,
      prefetchQueue
    };

    this.empathicContexts.set(userId, context);
  }

  /**
   * Get empathic context for user
   */
  getEmpathicContext(userId: string): EmpathicContext | undefined {
    return this.empathicContexts.get(userId);
  }

  /**
   * Get cache priorities
   */
  getCachePriorities(userId: string): Map<string, number> {
    const context = this.empathicContexts.get(userId);
    return context?.cachePriorities || new Map();
  }

  /**
   * Get prefetch queue
   */
  getPrefetchQueue(userId: string): Array<{ movieId: string; priority: number; reason: string }> {
    const context = this.empathicContexts.get(userId);
    return context?.prefetchQueue || [];
  }
}

