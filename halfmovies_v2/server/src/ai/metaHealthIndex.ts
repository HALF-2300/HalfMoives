/**
 * Meta-Health Index (MHI)
 * Phase 4.3: Composite metric of CHI + PAI + CE-PAI + reasoning stability
 */

import { CollectiveHealthMetrics } from './collectiveHealthIndex';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { MetaCognitiveAnalysis } from './metaCognitionCore';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface MetaHealthMetrics {
  mhi: number; // Meta-Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    chi: number; // Collective Health Index
    pai: number; // Predictive Accuracy Index
    cePai: number; // Contextual-Emotional PAI
    reasoningStability: number; // Meta-cognitive stability
    // Phase 5.0: Identity and Creativity
    identityCoherence?: number; // Identity Coherence (IC)
    creativeStability?: number; // Creative Stability (CS)
  };
  weights: {
    chi: number; // 0.20
    pai: number; // 0.20
    cePai: number; // 0.20
    reasoningStability: number; // 0.20
    // Phase 5.0: Identity and Creativity
    identityCoherence?: number; // 0.10
    creativeStability?: number; // 0.10
  };
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  trends: {
    chi: 'improving' | 'stable' | 'declining';
    pai: 'improving' | 'stable' | 'declining';
    cePai: 'improving' | 'stable' | 'declining';
    reasoningStability: 'improving' | 'stable' | 'declining';
    // Phase 5.0
    identityCoherence?: 'improving' | 'stable' | 'declining';
    creativeStability?: 'improving' | 'stable' | 'declining';
  };
  recommendations: string[];
}

/**
 * Meta-Health Index
 */
export class MetaHealthIndex {
  private history: MetaHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;

  /**
   * Calculate Meta-Health Index
   */
  calculateMHI(
    chi: CollectiveHealthMetrics,
    pai: PredictiveMetrics,
    cePai: CEPAIMetrics,
    reasoningStability: number,
    cognitiveHealth: string
  ): MetaHealthMetrics {
    // Component values
    const chiValue = chi.chi;
    const paiValue = pai.predictiveAccuracyIndex;
    const cePaiValue = cePai.contextualEmotionalPAI;
    const stabilityValue = reasoningStability;
    const icValue = identityCoherence ?? 0.5; // Default if not provided
    const csValue = creativeStability ?? 0.5; // Default if not provided

    // Weights (adjusted for Phase 5.0)
    const weights = {
      chi: 0.20,
      pai: 0.20,
      cePai: 0.20,
      reasoningStability: 0.20,
      identityCoherence: 0.10,
      creativeStability: 0.10
    };

    // Calculate MHI
    const mhi = (
      chiValue * weights.chi +
      paiValue * weights.pai +
      cePaiValue * weights.cePai +
      stabilityValue * weights.reasoningStability +
      icValue * weights.identityCoherence +
      csValue * weights.creativeStability
    );

    // Determine status
    let status: MetaHealthMetrics['status'];
    if (mhi >= 0.8) {
      status = 'excellent';
    } else if (mhi >= 0.7) {
      status = 'good';
    } else if (mhi >= 0.6) {
      status = 'fair';
    } else if (mhi >= 0.5) {
      status = 'poor';
    } else {
      status = 'critical';
    }

    // Calculate trends
    const trends = this.calculateTrends(chiValue, paiValue, cePaiValue, stabilityValue, icValue, csValue);

    // Generate recommendations
    const recommendations = this.generateRecommendations(mhi, chiValue, paiValue, cePaiValue, stabilityValue, cognitiveHealth, icValue, csValue);

    const metrics: MetaHealthMetrics = {
      mhi,
      timestamp: new Date().toISOString(),
      components: {
        chi: chiValue,
        pai: paiValue,
        cePai: cePaiValue,
        reasoningStability: stabilityValue,
        identityCoherence: icValue,
        creativeStability: csValue
      },
      weights,
      status,
      trends,
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
   * Calculate trends
   */
  private calculateTrends(
    chi: number,
    pai: number,
    cePai: number,
    stability: number,
    identityCoherence?: number,
    creativeStability?: number
  ): MetaHealthMetrics['trends'] {
    if (this.history.length < 5) {
      return {
        chi: 'stable',
        pai: 'stable',
        cePai: 'stable',
        reasoningStability: 'stable',
        identityCoherence: 'stable',
        creativeStability: 'stable'
      };
    }

    const recent = this.history.slice(-5);
    const older = this.history.slice(-10, -5);

    if (older.length === 0) {
      return {
        chi: 'stable',
        pai: 'stable',
        cePai: 'stable',
        reasoningStability: 'stable',
        identityCoherence: 'stable',
        creativeStability: 'stable'
      };
    }

    const getTrend = (recentVals: number[], olderVals: number[]): 'improving' | 'stable' | 'declining' => {
      const recentAvg = recentVals.reduce((a, b) => a + b, 0) / recentVals.length;
      const olderAvg = olderVals.reduce((a, b) => a + b, 0) / olderVals.length;
      const diff = recentAvg - olderAvg;
      
      if (diff > 0.05) return 'improving';
      if (diff < -0.05) return 'declining';
      return 'stable';
    };

    return {
      chi: getTrend(
        recent.map(m => m.components.chi),
        older.map(m => m.components.chi)
      ),
      pai: getTrend(
        recent.map(m => m.components.pai),
        older.map(m => m.components.pai)
      ),
      cePai: getTrend(
        recent.map(m => m.components.cePai),
        older.map(m => m.components.cePai)
      ),
      reasoningStability: getTrend(
        recent.map(m => m.components.reasoningStability),
        older.map(m => m.components.reasoningStability)
      ),
      identityCoherence: identityCoherence !== undefined ? getTrend(
        recent.map(m => m.components.identityCoherence || 0.5),
        older.map(m => m.components.identityCoherence || 0.5)
      ) : 'stable',
      creativeStability: creativeStability !== undefined ? getTrend(
        recent.map(m => m.components.creativeStability || 0.5),
        older.map(m => m.components.creativeStability || 0.5)
      ) : 'stable'
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    mhi: number,
    chi: number,
    pai: number,
    cePai: number,
    stability: number,
    cognitiveHealth: string,
    identityCoherence?: number,
    creativeStability?: number
  ): string[] {
    const recommendations: string[] = [];

    if (mhi < 0.5) {
      recommendations.push('🚨 CRITICAL: Meta-Health Index below 0.5. Immediate intervention required.');
    } else if (mhi < 0.6) {
      recommendations.push('⚠️ WARNING: Meta-Health Index below 0.6. Review system performance.');
    }

    if (chi < 0.6) {
      recommendations.push('💡 Collective health low. Review mesh connectivity and consensus quality.');
    }

    if (pai < 0.5) {
      recommendations.push('💡 Predictive accuracy low. Review prediction algorithms and patterns.');
    }

    if (cePai < 0.5) {
      recommendations.push('💡 Empathic accuracy low. Review emotional modeling and resonance.');
    }

    if (stability < 0.6) {
      recommendations.push('💡 Reasoning stability low. Review meta-cognitive analysis and corrections.');
    }

    if (cognitiveHealth === 'unstable') {
      recommendations.push('⚠️ Cognitive health unstable. Multiple drifts detected. Apply corrections immediately.');
    }

    // Phase 5.0: Identity and Creativity recommendations
    if (identityCoherence !== undefined && identityCoherence < 0.6) {
      recommendations.push('💡 Identity coherence low. Review identity synthesis and purpose alignment.');
    }

    if (creativeStability !== undefined && creativeStability < 0.6) {
      recommendations.push('💡 Creative stability low. Review creative outputs and safeguard decisions.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All meta-health components within optimal range.');
    }

    return recommendations;
  }

  /**
   * Get latest MHI
   */
  getLatestMHI(): MetaHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get MHI history
   */
  getHistory(limit: number = 100): MetaHealthMetrics[] {
    return this.history.slice(-limit);
  }

  /**
   * Get MHI trend
   */
  getTrend(): 'improving' | 'stable' | 'declining' {
    if (this.history.length < 5) return 'stable';

    const recent = this.history.slice(-5);
    const older = this.history.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, m) => sum + m.mhi, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.mhi, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }
}

