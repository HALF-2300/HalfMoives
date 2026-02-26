/**
 * MetaCognitionCore
 * Phase 4.3: Recursive self-analysis layer
 * Evaluates learning decisions, detects reasoning drift, generates thought correction vectors
 */

import { PrismaClient } from '@prisma/client';
import { AdaptiveMetrics } from './adaptiveCore';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { ConsensusDecision } from './consensusEngine';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ReasoningDrift {
  driftType: 'overfitting' | 'emotional_bias' | 'predictive_drift' | 'consensus_drift';
  severity: number; // 0.0 to 1.0
  detectedAt: string;
  evidence: string[];
  correctionVector: Record<string, number>;
}

export interface ThoughtCorrection {
  correctionId: string;
  timestamp: string;
  driftDetected: ReasoningDrift;
  correctionApplied: Record<string, number>;
  expectedImprovement: number;
  reasoning: string;
}

export interface MetaCognitiveAnalysis {
  analysisId: string;
  timestamp: string;
  decisionsEvaluated: number;
  driftsDetected: ReasoningDrift[];
  correctionsGenerated: ThoughtCorrection[];
  reasoningStability: number; // 0.0 to 1.0
  cognitiveHealth: 'stable' | 'drifting' | 'unstable';
  // Phase 4.4: Awareness coupling
  intentAdjustments?: Record<string, number>; // Adjustments to intent vectors
  purposeAnchor?: {
    anchor: string; // Core purpose that prevents drift
    strength: number; // 0.0 to 1.0
    lastValidated: string;
  };
}

/**
 * MetaCognitionCore - Recursive self-analysis
 */
export class MetaCognitionCore {
  private prisma: PrismaClient;
  private corrections: ThoughtCorrection[] = [];
  private readonly REASONING_STABILITY_THRESHOLD = 0.7;
  private readonly DRIFT_DETECTION_WINDOW = 100; // Last N decisions

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Evaluate learning decisions
   */
  async evaluateDecisions(
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics,
    recentConsensusDecisions: ConsensusDecision[]
  ): Promise<MetaCognitiveAnalysis> {
    const analysisId = `meta_analysis_${Date.now()}`;
    const drifts: ReasoningDrift[] = [];
    const corrections: ThoughtCorrection[] = [];

    // Detect reasoning drift
    const overfittingDrift = this.detectOverfitting(adaptiveMetrics, predictiveMetrics);
    if (overfittingDrift) drifts.push(overfittingDrift);

    const emotionalBias = this.detectEmotionalBias(cePaiMetrics, adaptiveMetrics);
    if (emotionalBias) drifts.push(emotionalBias);

    const predictiveDrift = this.detectPredictiveDrift(predictiveMetrics, recentConsensusDecisions);
    if (predictiveDrift) drifts.push(predictiveDrift);

    const consensusDrift = this.detectConsensusDrift(recentConsensusDecisions);
    if (consensusDrift) drifts.push(consensusDrift);

    // Generate thought correction vectors
    for (const drift of drifts) {
      const correction = await this.generateCorrection(drift);
      corrections.push(correction);
    }

    // Calculate reasoning stability
    const reasoningStability = this.calculateReasoningStability(
      adaptiveMetrics,
      predictiveMetrics,
      cePaiMetrics,
      recentConsensusDecisions
    );

    // Determine cognitive health
    let cognitiveHealth: 'stable' | 'drifting' | 'unstable';
    if (reasoningStability >= this.REASONING_STABILITY_THRESHOLD && drifts.length === 0) {
      cognitiveHealth = 'stable';
    } else if (drifts.length <= 2 && reasoningStability >= 0.5) {
      cognitiveHealth = 'drifting';
    } else {
      cognitiveHealth = 'unstable';
    }

    const analysis: MetaCognitiveAnalysis = {
      analysisId,
      timestamp: new Date().toISOString(),
      decisionsEvaluated: recentConsensusDecisions.length,
      driftsDetected: drifts,
      correctionsGenerated: corrections,
      reasoningStability,
      cognitiveHealth
    };

    // Apply corrections
    for (const correction of corrections) {
      await this.applyCorrection(correction);
    }

    // Store corrections
    this.corrections.push(...corrections);
    if (this.corrections.length > 1000) {
      this.corrections = this.corrections.slice(-1000);
    }

    console.log(`[MetaCognitionCore] Analysis complete: ${drifts.length} drifts, ${corrections.length} corrections`);

    return analysis;
  }

  /**
   * Detect overfitting
   */
  private detectOverfitting(
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics
  ): ReasoningDrift | null {
    // Overfitting indicators:
    // - High training ops but low predictive accuracy
    // - High cache hit rate but low accuracy improvement
    // - Model weights growing without bound

    const trainingOps = adaptiveMetrics.trainingOps;
    const pai = predictiveMetrics.predictiveAccuracyIndex;
    const cacheHitRate = adaptiveMetrics.cacheHitRate;

    let severity = 0;
    const evidence: string[] = [];

    // High training but low accuracy
    if (trainingOps > 1000 && pai < 0.5) {
      severity += 0.4;
      evidence.push(`High training ops (${trainingOps}) but low PAI (${pai.toFixed(2)})`);
    }

    // High cache but no improvement
    if (cacheHitRate > 0.8 && pai < 0.6) {
      severity += 0.3;
      evidence.push(`High cache hit rate (${(cacheHitRate * 100).toFixed(1)}%) but low accuracy`);
    }

    // Unbounded weight growth
    const weightCount = Object.keys(adaptiveMetrics.modelWeights).length;
    const avgWeight = Object.values(adaptiveMetrics.modelWeights).reduce((a, b) => a + Math.abs(b), 0) / weightCount || 0;
    if (avgWeight > 1.0) {
      severity += 0.3;
      evidence.push(`Unbounded weight growth detected (avg: ${avgWeight.toFixed(2)})`);
    }

    if (severity > 0.3) {
      return {
        driftType: 'overfitting',
        severity: Math.min(1.0, severity),
        detectedAt: new Date().toISOString(),
        evidence,
        correctionVector: {
          learning_rate: -0.1, // Reduce learning rate
          weight_decay: 0.05, // Add weight decay
          training_threshold: 0.1 // Increase training threshold
        }
      };
    }

    return null;
  }

  /**
   * Detect emotional bias
   */
  private detectEmotionalBias(
    cePaiMetrics: CEPAIMetrics,
    adaptiveMetrics: AdaptiveMetrics
  ): ReasoningDrift | null {
    // Emotional bias indicators:
    // - High emotional resonance but low predictive accuracy
    // - Emotional weights dominating over rational weights
    // - CE-PAI much higher than PAI (over-reliance on emotions)

    const cePai = cePaiMetrics.contextualEmotionalPAI;
    const emotionalResonance = cePaiMetrics.emotionalResonanceScore;
    const pai = 0.65; // Would come from predictive metrics

    let severity = 0;
    const evidence: string[] = [];

    // High emotional but low predictive
    if (cePai > 0.8 && pai < 0.6) {
      severity += 0.4;
      evidence.push(`High CE-PAI (${cePai.toFixed(2)}) but low PAI (${pai.toFixed(2)})`);
    }

    // Emotional resonance too high
    if (emotionalResonance > 0.9) {
      severity += 0.3;
      evidence.push(`Excessive emotional resonance (${emotionalResonance.toFixed(2)})`);
    }

    // Emotional weights dominating
    const emotionalWeightCount = Object.keys(adaptiveMetrics.modelWeights)
      .filter(k => k.startsWith('emotion:')).length;
    const totalWeightCount = Object.keys(adaptiveMetrics.modelWeights).length;
    if (totalWeightCount > 0 && emotionalWeightCount / totalWeightCount > 0.7) {
      severity += 0.3;
      evidence.push(`Emotional weights dominating (${(emotionalWeightCount / totalWeightCount * 100).toFixed(1)}%)`);
    }

    if (severity > 0.3) {
      return {
        driftType: 'emotional_bias',
        severity: Math.min(1.0, severity),
        detectedAt: new Date().toISOString(),
        evidence,
        correctionVector: {
          emotional_decay: 0.1, // Increase emotional decay
          emotional_weight_ratio: -0.2, // Reduce emotional weight influence
          rational_boost: 0.15 // Boost rational predictions
        }
      };
    }

    return null;
  }

  /**
   * Detect predictive drift
   */
  private detectPredictiveDrift(
    predictiveMetrics: PredictiveMetrics,
    recentDecisions: ConsensusDecision[]
  ): ReasoningDrift | null {
    // Predictive drift indicators:
    // - Declining PAI over time
    // - Low reinforcement scores in consensus
    // - High prediction count but low accuracy

    const pai = predictiveMetrics.predictiveAccuracyIndex;
    const totalPredictions = predictiveMetrics.totalPredictions;
    const accuratePredictions = predictiveMetrics.accuratePredictions;

    let severity = 0;
    const evidence: string[] = [];

    // Declining accuracy
    if (totalPredictions > 100 && accuratePredictions / totalPredictions < 0.5) {
      severity += 0.4;
      evidence.push(`Low prediction accuracy (${((accuratePredictions / totalPredictions) * 100).toFixed(1)}%)`);
    }

    // Low reinforcement in consensus
    if (recentDecisions.length > 0) {
      const avgReinforcement = recentDecisions.reduce((sum, d) => 
        sum + d.reinforcementScores.combined, 0) / recentDecisions.length;
      if (avgReinforcement < 0.5) {
        severity += 0.3;
        evidence.push(`Low consensus reinforcement (${avgReinforcement.toFixed(2)})`);
      }
    }

    // High predictions but low accuracy
    if (totalPredictions > 500 && pai < 0.4) {
      severity += 0.3;
      evidence.push(`High prediction volume (${totalPredictions}) but low PAI (${pai.toFixed(2)})`);
    }

    if (severity > 0.3) {
      return {
        driftType: 'predictive_drift',
        severity: Math.min(1.0, severity),
        detectedAt: new Date().toISOString(),
        evidence,
        correctionVector: {
          prediction_threshold: 0.1, // Raise prediction threshold
          confidence_calibration: -0.15, // Reduce confidence
          pattern_reevaluation: 0.2 // Re-evaluate patterns
        }
      };
    }

    return null;
  }

  /**
   * Detect consensus drift
   */
  private detectConsensusDrift(recentDecisions: ConsensusDecision[]): ReasoningDrift | null {
    // Consensus drift indicators:
    // - Too many rejections
    // - Low improvement rate
    // - Declining reinforcement scores

    if (recentDecisions.length < 5) return null;

    const rejectionRate = recentDecisions.reduce((sum, d) => 
      sum + d.rejectedAdjustments.length, 0) / recentDecisions.length;
    const improvementRate = recentDecisions.filter(d => 
      d.expectedImprovement.overall > 0).length / recentDecisions.length;
    const avgReinforcement = recentDecisions.reduce((sum, d) => 
      sum + d.reinforcementScores.combined, 0) / recentDecisions.length;

    let severity = 0;
    const evidence: string[] = [];

    // High rejection rate
    if (rejectionRate > 0.7) {
      severity += 0.4;
      evidence.push(`High rejection rate (${(rejectionRate * 100).toFixed(1)}%)`);
    }

    // Low improvement
    if (improvementRate < 0.3) {
      severity += 0.3;
      evidence.push(`Low improvement rate (${(improvementRate * 100).toFixed(1)}%)`);
    }

    // Declining reinforcement
    if (avgReinforcement < 0.5) {
      severity += 0.3;
      evidence.push(`Low reinforcement scores (${avgReinforcement.toFixed(2)})`);
    }

    if (severity > 0.3) {
      return {
        driftType: 'consensus_drift',
        severity: Math.min(1.0, severity),
        detectedAt: new Date().toISOString(),
        evidence,
        correctionVector: {
          consensus_threshold: -0.1, // Lower threshold slightly
          evaluation_criteria: 0.15, // Adjust evaluation
          balance_weight: 0.1 // Rebalance efficiency vs depth
        }
      };
    }

    return null;
  }

  /**
   * Generate thought correction vector
   */
  private async generateCorrection(drift: ReasoningDrift): Promise<ThoughtCorrection> {
    const correctionId = `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate expected improvement based on severity
    const expectedImprovement = 1.0 - drift.severity; // Inverse relationship

    const correction: ThoughtCorrection = {
      correctionId,
      timestamp: new Date().toISOString(),
      driftDetected: drift,
      correctionApplied: drift.correctionVector,
      expectedImprovement,
      reasoning: `Correcting ${drift.driftType} (severity: ${drift.severity.toFixed(2)}). Evidence: ${drift.evidence.join('; ')}`
    };

    return correction;
  }

  /**
   * Apply correction
   */
  private async applyCorrection(correction: ThoughtCorrection): Promise<void> {
    // In real implementation, would apply to actual systems
    // For now, log the correction
    console.log(`[MetaCognitionCore] Applying correction: ${correction.correctionId}`);
    console.log(`  Reason: ${correction.reasoning}`);
    console.log(`  Expected improvement: ${(correction.expectedImprovement * 100).toFixed(1)}%`);
  }

  /**
   * Calculate reasoning stability
   */
  private calculateReasoningStability(
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics,
    recentDecisions: ConsensusDecision[]
  ): number {
    // Stability factors:
    // - Consistent metrics over time
    // - Low variance in decisions
    // - Balanced performance across domains

    let stability = 0.5; // Base stability

    // PAI consistency (would need historical data)
    if (predictiveMetrics.predictiveAccuracyIndex > 0.6) {
      stability += 0.2;
    }

    // CE-PAI consistency
    if (cePaiMetrics.contextualEmotionalPAI > 0.6) {
      stability += 0.15;
    }

    // Consensus consistency
    if (recentDecisions.length > 0) {
      const avgReinforcement = recentDecisions.reduce((sum, d) => 
        sum + d.reinforcementScores.combined, 0) / recentDecisions.length;
      if (avgReinforcement > 0.6) {
        stability += 0.15;
      }
    }

    return Math.min(1.0, stability);
  }

  /**
   * Get recent corrections
   */
  getRecentCorrections(limit: number = 10): ThoughtCorrection[] {
    return this.corrections.slice(-limit);
  }

  /**
   * Get reasoning stability score
   */
  getReasoningStability(): number {
    // Would calculate from recent analyses
    return 0.75; // Placeholder
  }

  /**
   * Phase 4.4: Map reflection results into intent adjustments
   */
  private mapReflectionToIntent(
    drifts: ReasoningDrift[],
    stability: number,
    health: string
  ): Record<string, number> {
    const adjustments: Record<string, number> = {};

    // If unstable, adjust intent priorities
    if (health === 'unstable') {
      adjustments['stability_priority'] = 0.2; // Boost stability priority
    }

    // If drifting, adjust focus
    if (health === 'drifting') {
      adjustments['focus_correction'] = 0.15;
    }

    // Map drift types to intent adjustments
    for (const drift of drifts) {
      switch (drift.driftType) {
        case 'overfitting':
          adjustments['accuracy_intent'] = -0.1; // Reduce accuracy focus
          adjustments['stability_intent'] = 0.1; // Boost stability
          break;
        case 'emotional_bias':
          adjustments['empathy_intent'] = -0.1; // Reduce empathy focus
          adjustments['balance_intent'] = 0.1; // Boost balance
          break;
        case 'predictive_drift':
          adjustments['predictive_intent'] = 0.15; // Boost predictive focus
          break;
        case 'consensus_drift':
          adjustments['consensus_intent'] = 0.1; // Boost consensus focus
          break;
      }
    }

    return adjustments;
  }

  /**
   * Phase 4.4: Maintain purpose anchor to prevent cognitive drift
   */
  private maintainPurposeAnchor(
    stability: number,
    health: string
  ): MetaCognitiveAnalysis['purposeAnchor'] {
    // Core purpose: "Provide accurate, empathetic, and stable recommendations"
    const anchor = 'accurate_empathetic_stable_recommendations';
    
    // Anchor strength based on stability and health
    let strength = stability;
    
    if (health === 'unstable') {
      strength *= 0.7; // Weaken anchor if unstable
    } else if (health === 'drifting') {
      strength *= 0.85; // Slightly weaken if drifting
    }

    return {
      anchor,
      strength: Math.max(0.5, strength), // Minimum 0.5
      lastValidated: new Date().toISOString()
    };
  }
}

