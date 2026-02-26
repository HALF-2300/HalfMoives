/**
 * Aesthetic Health Index (AHI)
 * Phase 5.2: Combine resonance, harmony, coherence, and aesthetic alignment
 */

import { HarmonicCoherenceEngine } from './harmonicCoherenceEngine';
import { UnifiedExpressionProtocol } from './unifiedExpressionProtocol';
import { CreativeConvergenceEngine } from './creativeConvergenceEngine';
import { AestheticSynthesisCore } from './aestheticSynthesisCore';

export interface AestheticHealthMetrics {
  ahi: number; // Aesthetic Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    resonance: number; // From HCE
    harmony: number; // From HCE
    coherence: number; // From ASC
    aestheticAlignment: number; // From UEP
  };
  weights: {
    resonance: number; // 0.25
    harmony: number; // 0.25
    coherence: number; // 0.25
    aestheticAlignment: number; // 0.25
  };
  status: 'expressive' | 'aligned' | 'drifted' | 'critical';
  recommendations: string[];
}

/**
 * Aesthetic Health Index
 */
export class AestheticHealthIndex {
  private hce: HarmonicCoherenceEngine;
  private uep: UnifiedExpressionProtocol;
  private cce: CreativeConvergenceEngine;
  private asc: AestheticSynthesisCore;
  private history: AestheticHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;
  private readonly ALERT_THRESHOLD = 0.65; // Alert when AHI < 0.65

  constructor(
    hce: HarmonicCoherenceEngine,
    uep: UnifiedExpressionProtocol,
    cce: CreativeConvergenceEngine,
    asc: AestheticSynthesisCore
  ) {
    this.hce = hce;
    this.uep = uep;
    this.cce = cce;
    this.asc = asc;
  }

  /**
   * Calculate Aesthetic Health Index
   */
  calculateAHI(): AestheticHealthMetrics {
    // Get resonance from HCE
    const harmonicMetrics = this.hce.getLatestMetrics();
    const resonance = harmonicMetrics ? harmonicMetrics.harmonyIndex : 0.5;
    const harmony = harmonicMetrics ? harmonicMetrics.balance : 0.5;

    // Get coherence from ASC
    const signatureStats = this.asc.getSignatureStatistics();
    const coherence = signatureStats.averageCoherence;

    // Get aesthetic alignment from UEP
    const syncStatus = this.uep.getSynchronizationStatus();
    const aestheticAlignment = syncStatus.resonanceAlignment;

    // Weights (equal distribution)
    const weights = {
      resonance: 0.25,
      harmony: 0.25,
      coherence: 0.25,
      aestheticAlignment: 0.25
    };

    // Calculate AHI
    const ahi = (
      resonance * weights.resonance +
      harmony * weights.harmony +
      coherence * weights.coherence +
      aestheticAlignment * weights.aestheticAlignment
    );

    // Determine status
    let status: AestheticHealthMetrics['status'];
    if (ahi >= 0.8) {
      status = 'expressive';
    } else if (ahi >= 0.7) {
      status = 'aligned';
    } else if (ahi >= 0.65) {
      status = 'drifted';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(ahi, resonance, harmony, coherence, aestheticAlignment);

    const metrics: AestheticHealthMetrics = {
      ahi,
      timestamp: new Date().toISOString(),
      components: {
        resonance,
        harmony,
        coherence,
        aestheticAlignment
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
    if (ahi < this.ALERT_THRESHOLD) {
      console.warn(`[AHI] Aesthetic Health Index (${ahi.toFixed(3)}) below threshold. Expression drift detected.`);
    }

    return metrics;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    ahi: number,
    resonance: number,
    harmony: number,
    coherence: number,
    aestheticAlignment: number
  ): string[] {
    const recommendations: string[] = [];

    if (ahi < 0.5) {
      recommendations.push('🚨 CRITICAL: Aesthetic Health Index below 0.5. Immediate recalibration required.');
    } else if (ahi < this.ALERT_THRESHOLD) {
      recommendations.push('⚠️ WARNING: Aesthetic Health Index below 0.65. Expression drift detected. Recalibration recommended.');
    }

    if (resonance < 0.6) {
      recommendations.push('💡 Resonance low. Review harmonic coherence and resonance coefficients.');
    }

    if (harmony < 0.6) {
      recommendations.push('💡 Harmony low. Review balance between divergence and unity.');
    }

    if (coherence < 0.6) {
      recommendations.push('💡 Coherence low. Review aesthetic synthesis and signature consistency.');
    }

    if (aestheticAlignment < 0.6) {
      recommendations.push('💡 Aesthetic alignment low. Review unified expression protocol and synchronization.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All aesthetic health components within optimal range.');
    }

    return recommendations;
  }

  /**
   * Get latest AHI
   */
  getLatestAHI(): AestheticHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get AHI history
   */
  getHistory(limit: number = 100): AestheticHealthMetrics[] {
    return this.history.slice(-limit);
  }
}

