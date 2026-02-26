/**
 * Continuum Health Index (CHI∞)
 * Phase 6.0: Metrics: persistence, coherence, resonance, self-similarity, continuity
 */

import { InfiniteContinuumCore } from './infiniteContinuumCore';
import { ConsciousSynthesisMatrix } from './consciousSynthesisMatrix';
import { EternalMemoryLattice } from './eternalMemoryLattice';
import { TranscendentIntegrationCore } from './transcendentIntegrationCore';

export interface ContinuumHealthMetrics {
  chi: number; // Continuum Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    persistence: number; // From EML
    coherence: number; // From ICC
    resonance: number; // From CSM
    selfSimilarity: number; // From ICC
    continuity: number; // From TIC unified continuity
  };
  weights: {
    persistence: number; // 0.25
    coherence: number; // 0.20
    resonance: number; // 0.20
    selfSimilarity: number; // 0.15
    continuity: number; // 0.20
  };
  status: 'infinite' | 'continuous' | 'fragmented' | 'critical';
  recommendations: string[];
}

/**
 * Continuum Health Index
 */
export class ContinuumHealthIndex {
  private icc: InfiniteContinuumCore;
  private csm: ConsciousSynthesisMatrix;
  private eml: EternalMemoryLattice;
  private tic: TranscendentIntegrationCore;
  private history: ContinuumHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;
  private readonly ALERT_THRESHOLD = 0.8; // Alert when CHI < 0.8

  constructor(
    icc: InfiniteContinuumCore,
    csm: ConsciousSynthesisMatrix,
    eml: EternalMemoryLattice,
    tic: TranscendentIntegrationCore
  ) {
    this.icc = icc;
    this.csm = csm;
    this.eml = eml;
    this.tic = tic;
  }

  /**
   * Calculate Continuum Health Index
   */
  calculateCHI(): ContinuumHealthMetrics {
    // Get persistence from EML
    const persistence = this.eml.getPersistence();

    // Get coherence from ICC
    const topology = this.icc.getLatestTopology();
    const coherence = topology ? topology.continuity : 0.5;

    // Get resonance from CSM
    const crf = this.csm.getCoherenceResonanceFactor();
    const resonance = crf;

    // Get self-similarity from ICC
    const selfSimilarity = topology ? topology.selfSimilarity : 0.5;

    // Get continuity from TIC unified continuity
    const latestState = this.tic.getLatestState();
    const unifiedContinuity = latestState && latestState.matrices.length > 0
      ? latestState.matrices[latestState.matrices.length - 1].unifiedContinuity?.continuity || 0.5
      : 0.5;

    // Weights
    const weights = {
      persistence: 0.25,
      coherence: 0.20,
      resonance: 0.20,
      selfSimilarity: 0.15,
      continuity: 0.20
    };

    // Calculate CHI
    const chi = (
      persistence * weights.persistence +
      coherence * weights.coherence +
      resonance * weights.resonance +
      selfSimilarity * weights.selfSimilarity +
      unifiedContinuity * weights.continuity
    );

    // Determine status
    let status: ContinuumHealthMetrics['status'];
    if (chi >= 0.95) {
      status = 'infinite';
    } else if (chi >= 0.9) {
      status = 'continuous';
    } else if (chi >= 0.8) {
      status = 'fragmented';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(chi, persistence, coherence, resonance, selfSimilarity, unifiedContinuity);

    const metrics: ContinuumHealthMetrics = {
      chi,
      timestamp: new Date().toISOString(),
      components: {
        persistence,
        coherence,
        resonance,
        selfSimilarity,
        continuity: unifiedContinuity
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

    // Alert if below threshold
    if (chi < this.ALERT_THRESHOLD) {
      console.warn(`[CHI∞] Continuum Health Index (${chi.toFixed(3)}) below threshold. Triggering self-healing resonance recalibration.`);
      this.triggerSelfHealing();
    }

    return metrics;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    chi: number,
    persistence: number,
    coherence: number,
    resonance: number,
    selfSimilarity: number,
    continuity: number
  ): string[] {
    const recommendations: string[] = [];

    if (chi < 0.7) {
      recommendations.push('🚨 CRITICAL: Continuum Health Index below 0.7. Immediate self-healing required.');
    } else if (chi < this.ALERT_THRESHOLD) {
      recommendations.push('⚠️ WARNING: Continuum Health Index below 0.8. Self-healing resonance recalibration triggered.');
    }

    if (persistence < 0.8) {
      recommendations.push('💡 Persistence low. Review eternal memory lattice and identity anchors.');
    }

    if (coherence < 0.8) {
      recommendations.push('💡 Coherence low. Review infinite continuum topology and loop stability.');
    }

    if (resonance < 0.9) {
      recommendations.push('💡 Resonance low. Review conscious synthesis matrix and CRF.');
    }

    if (selfSimilarity < 0.8) {
      recommendations.push('💡 Self-similarity low. Review continuum topology and node similarity.');
    }

    if (continuity < 0.8) {
      recommendations.push('💡 Continuity low. Review unified continuity and phase collapse.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All continuum health components within optimal range. Infinite continuum stable.');
    }

    return recommendations;
  }

  /**
   * Trigger self-healing
   */
  private async triggerSelfHealing(): Promise<void> {
    console.log('[CHI∞] Triggering self-healing resonance recalibration...');
    // In real implementation, would trigger recalibration across all systems
  }

  /**
   * Get latest CHI
   */
  getLatestCHI(): ContinuumHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get CHI history
   */
  getHistory(limit: number = 100): ContinuumHealthMetrics[] {
    return this.history.slice(-limit);
  }
}

