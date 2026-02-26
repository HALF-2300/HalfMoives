/**
 * Contextual-Emotional Predictive Accuracy Index (CE-PAI)
 * Phase 4.1: Tracks prediction accuracy with contextual and emotional factors
 */

import { EmpathicPrediction } from './empathicLoop';
import { ContextualState } from './contextualStateEngine';
import { EmotionalState } from './emotionMatrix';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface CEPAIMetrics {
  totalContextualPredictions: number;
  accurateContextualPredictions: number;
  contextualEmotionalPAI: number; // CE-PAI
  averageEmotionalLikelihood: number;
  averageEmotionalResonance: number;
  contextualAdaptationScore: number; // +40% target
  emotionalResonanceScore: number;
  lastUpdated: string;
}

export interface CEPAISnapshot {
  timestamp: string;
  metrics: CEPAIMetrics;
  contextualState: Partial<ContextualState>;
  emotionalState: Partial<EmotionalState>;
  cycle: number;
}

/**
 * CE-PAI Tracker
 */
export class ContextualEmotionalPAI {
  private metrics: CEPAIMetrics;
  private snapshots: CEPAISnapshot[] = [];
  private readonly CE_PAI_WINDOW = 10; // Rolling window for CE-PAI
  private cycleCount: number = 0;
  private metricsPath: string;

  constructor() {
    this.metricsPath = join(process.cwd(), 'docs', 'ai', 'contextual-metrics.json');
    this.metrics = {
      totalContextualPredictions: 0,
      accurateContextualPredictions: 0,
      contextualEmotionalPAI: 0,
      averageEmotionalLikelihood: 0,
      averageEmotionalResonance: 0,
      contextualAdaptationScore: 0,
      emotionalResonanceScore: 0,
      lastUpdated: new Date().toISOString()
    };
    this.initializeMetricsFile();
  }

  /**
   * Initialize metrics file
   */
  private async initializeMetricsFile(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.metricsPath).then(() => true).catch(() => false);
      if (!exists) {
        await fs.writeFile(
          this.metricsPath,
          JSON.stringify({ snapshots: [], metrics: this.metrics }, null, 2)
        );
      }
    } catch (error) {
      console.error('[CE-PAI] Failed to initialize:', error);
    }
  }

  /**
   * Record empathic prediction result
   */
  async recordPredictionResult(
    prediction: EmpathicPrediction,
    wasAccurate: boolean,
    contextualState: ContextualState,
    emotionalState: EmotionalState
  ): Promise<void> {
    this.cycleCount++;
    this.metrics.totalContextualPredictions++;

    if (wasAccurate) {
      this.metrics.accurateContextualPredictions++;
    }

    // Update emotional averages
    const total = this.metrics.totalContextualPredictions;
    this.metrics.averageEmotionalLikelihood = 
      (this.metrics.averageEmotionalLikelihood * (total - 1) + prediction.emotionalLikelihood) / total;
    this.metrics.averageEmotionalResonance = 
      (this.metrics.averageEmotionalResonance * (total - 1) + prediction.emotionalResonance) / total;

    // Calculate CE-PAI (rolling window)
    this.updateCEPAI();

    // Calculate contextual adaptation score
    this.updateContextualAdaptationScore(contextualState);

    // Calculate emotional resonance score
    this.updateEmotionalResonanceScore(prediction, emotionalState);

    // Record snapshot
    await this.recordSnapshot(contextualState, emotionalState);

    this.metrics.lastUpdated = new Date().toISOString();
  }

  /**
   * Update CE-PAI
   */
  private updateCEPAI(): void {
    // Use rolling window
    const recentSnapshots = this.snapshots.slice(-this.CE_PAI_WINDOW);
    
    if (recentSnapshots.length === 0) {
      // Calculate from total metrics
      if (this.metrics.totalContextualPredictions > 0) {
        this.metrics.contextualEmotionalPAI = 
          this.metrics.accurateContextualPredictions / this.metrics.totalContextualPredictions;
      }
      return;
    }

    // Calculate from recent snapshots
    const recentAccurate = recentSnapshots.filter(s => 
      s.metrics.accurateContextualPredictions > 0
    ).length;
    
    this.metrics.contextualEmotionalPAI = recentAccurate / recentSnapshots.length;
  }

  /**
   * Update contextual adaptation score
   */
  private updateContextualAdaptationScore(contextualState: ContextualState): void {
    // Score based on how well we adapt to context
    // Factors: mood confidence, behavioral pattern recognition, anomaly detection
    
    let score = 0;

    // Mood confidence contributes
    score += contextualState.mood.confidence * 0.4;

    // Behavioral pattern recognition
    if (contextualState.behavioral.recentActivityPattern !== 'casual') {
      score += 0.3; // We recognized a pattern
    }

    // Anomaly detection (lower anomaly = better adaptation)
    score += (1 - contextualState.behavioral.anomalyScore) * 0.3;

    this.metrics.contextualAdaptationScore = Math.min(1.0, score);
  }

  /**
   * Update emotional resonance score
   */
  private updateEmotionalResonanceScore(
    prediction: EmpathicPrediction,
    emotionalState: EmotionalState
  ): void {
    // Score based on emotional resonance
    const resonance = prediction.emotionalResonance;
    const likelihood = prediction.emotionalLikelihood;
    
    // Combined emotional score
    this.metrics.emotionalResonanceScore = (resonance + likelihood) / 2;
  }

  /**
   * Record snapshot
   */
  private async recordSnapshot(
    contextualState: ContextualState,
    emotionalState: EmotionalState
  ): Promise<void> {
    const snapshot: CEPAISnapshot = {
      timestamp: new Date().toISOString(),
      metrics: { ...this.metrics },
      contextualState: {
        temporal: contextualState.temporal,
        mood: contextualState.mood
      },
      emotionalState: {
        primary: emotionalState.primary,
        intensity: emotionalState.intensity,
        valence: emotionalState.valence,
        arousal: emotionalState.arousal
      },
      cycle: this.cycleCount
    };

    this.snapshots.push(snapshot);

    // Keep only last 1000 snapshots
    if (this.snapshots.length > 1000) {
      this.snapshots = this.snapshots.slice(-1000);
    }

    // Save to file
    try {
      const data = {
        snapshots: this.snapshots.slice(-100), // Keep last 100 in file
        metrics: this.metrics,
        lastUpdated: new Date().toISOString()
      };
      await fs.writeFile(this.metricsPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[CE-PAI] Failed to save snapshot:', error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): CEPAIMetrics {
    return { ...this.metrics };
  }

  /**
   * Get CE-PAI trend
   */
  getTrend(): 'improving' | 'stable' | 'declining' {
    if (this.snapshots.length < 5) return 'stable';

    const recent = this.snapshots.slice(-5);
    const older = this.snapshots.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, s) => sum + s.metrics.contextualEmotionalPAI, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.metrics.contextualEmotionalPAI, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }
}

