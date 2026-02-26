/**
 * Intentional Health Index (IHI)
 * Phase 4.4: Measure coherence between intent, prediction, empathy, and reasoning
 */

import { IntentionalSynthesis } from './intentSynthesisEngine';
import { ConsciousState } from './consciousStateManager';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { MetaCognitiveAnalysis } from './metaCognitionCore';
import { CollectiveHealthMetrics } from './collectiveHealthIndex';

export interface IntentionalHealthMetrics {
  ihi: number; // Intentional Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    intentAlignment: number; // How well aligned with intent
    predictiveCoherence: number; // Predictive alignment with intent
    empathicCoherence: number; // Empathic alignment with intent
    reasoningCoherence: number; // Reasoning alignment with intent
    stateCoherence: number; // Conscious state coherence
  };
  weights: {
    intent: number; // 0.25
    predictive: number; // 0.20
    empathic: number; // 0.20
    reasoning: number; // 0.20
    state: number; // 0.15
  };
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: string[];
}

/**
 * Intentional Health Index
 */
export class IntentionalHealthIndex {
  private history: IntentionalHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;

  /**
   * Calculate Intentional Health Index
   */
  calculateIHI(
    synthesis: IntentionalSynthesis,
    consciousState: ConsciousState,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics,
    metaAnalysis: MetaCognitiveAnalysis,
    collectiveMetrics: CollectiveHealthMetrics
  ): IntentionalHealthMetrics {
    // Component values
    const intentAlignment = synthesis.intentAlignment.overall;
    const predictiveCoherence = this.calculatePredictiveCoherence(
      synthesis,
      predictiveMetrics
    );
    const empathicCoherence = this.calculateEmpathicCoherence(
      synthesis,
      cePaiMetrics
    );
    const reasoningCoherence = this.calculateReasoningCoherence(
      synthesis,
      metaAnalysis
    );
    const stateCoherence = consciousState.coherence;

    // Weights
    const weights = {
      intent: 0.25,
      predictive: 0.20,
      empathic: 0.20,
      reasoning: 0.20,
      state: 0.15
    };

    // Calculate IHI
    const ihi = (
      intentAlignment * weights.intent +
      predictiveCoherence * weights.predictive +
      empathicCoherence * weights.empathic +
      reasoningCoherence * weights.reasoning +
      stateCoherence * weights.state
    );

    // Determine status
    let status: IntentionalHealthMetrics['status'];
    if (ihi >= 0.8) {
      status = 'excellent';
    } else if (ihi >= 0.7) {
      status = 'good';
    } else if (ihi >= 0.6) {
      status = 'fair';
    } else if (ihi >= 0.5) {
      status = 'poor';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      ihi,
      intentAlignment,
      predictiveCoherence,
      empathicCoherence,
      reasoningCoherence,
      stateCoherence
    );

    const metrics: IntentionalHealthMetrics = {
      ihi,
      timestamp: new Date().toISOString(),
      components: {
        intentAlignment,
        predictiveCoherence,
        empathicCoherence,
        reasoningCoherence,
        stateCoherence
      },
      weights,
      status,
      recommendations
    };

    // Store in history
    this.history.push(metrics);
    if (this.history.length > this.HISTORY_LIMIT) {
      this.history = this.history.slice(-this.HISTORY_LIMIT);
    }

    return metrics;
  }

  /**
   * Get latest IHI
   */
  getLatestIHI(): IntentionalHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get IHI history
   */
  getHistory(limit: number = 100): IntentionalHealthMetrics[] {
    return this.history.slice(-limit);
  }

  /**
   * Calculate predictive coherence with intent
   */
  private calculatePredictiveCoherence(
    synthesis: IntentionalSynthesis,
    predictiveMetrics: PredictiveMetrics
  ): number {
    // How well predictive metrics align with operational focus
    let coherence = 0.5;

    if (synthesis.operationalFocus.secondary.includes('predictive_accuracy')) {
      // System is focusing on predictive accuracy
      coherence = predictiveMetrics.predictiveAccuracyIndex;
    } else {
      // General alignment
      coherence = predictiveMetrics.predictiveAccuracyIndex * 0.8;
    }

    return coherence;
  }

  /**
   * Calculate empathic coherence with intent
   */
  private calculateEmpathicCoherence(
    synthesis: IntentionalSynthesis,
    cePaiMetrics: CEPAIMetrics
  ): number {
    // How well empathic metrics align with operational focus
    let coherence = 0.5;

    if (synthesis.operationalFocus.secondary.includes('empathic_resonance')) {
      // System is focusing on empathic resonance
      coherence = cePaiMetrics.contextualEmotionalPAI;
    } else {
      // General alignment
      coherence = cePaiMetrics.contextualEmotionalPAI * 0.8;
    }

    return coherence;
  }

  /**
   * Calculate reasoning coherence with intent
   */
  private calculateReasoningCoherence(
    synthesis: IntentionalSynthesis,
    metaAnalysis: MetaCognitiveAnalysis
  ): number {
    // How well reasoning aligns with intent
    let coherence = metaAnalysis.reasoningStability;

    // Boost if purpose anchor is strong
    if (metaAnalysis.purposeAnchor && metaAnalysis.purposeAnchor.strength > 0.7) {
      coherence += 0.1;
    }

    // Reduce if cognitive health is unstable
    if (metaAnalysis.cognitiveHealth === 'unstable') {
      coherence *= 0.7;
    }

    return Math.min(1.0, coherence);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    ihi: number,
    intentAlignment: number,
    predictiveCoherence: number,
    empathicCoherence: number,
    reasoningCoherence: number,
    stateCoherence: number
  ): string[] {
    const recommendations: string[] = [];

    if (ihi < 0.5) {
      recommendations.push('🚨 CRITICAL: Intentional Health Index below 0.5. Immediate realignment required.');
    } else if (ihi < 0.6) {
      recommendations.push('⚠️ WARNING: Intentional Health Index below 0.6. Review intent alignment.');
    }

    if (intentAlignment < 0.6) {
      recommendations.push('💡 Intent alignment low. Review goal priorities and target metrics.');
    }

    if (predictiveCoherence < 0.6) {
      recommendations.push('💡 Predictive coherence low. Align predictive operations with intent.');
    }

    if (empathicCoherence < 0.6) {
      recommendations.push('💡 Empathic coherence low. Align empathic operations with intent.');
    }

    if (reasoningCoherence < 0.6) {
      recommendations.push('💡 Reasoning coherence low. Review meta-cognitive stability.');
    }

    if (stateCoherence < 0.6) {
      recommendations.push('💡 State coherence low. Resolve conflicts and rebalance priorities.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All intentional health components within optimal range.');
    }

    return recommendations;
  }
}

