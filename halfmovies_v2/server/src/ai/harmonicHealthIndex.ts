/**
 * Harmonic Health Index (HHI)
 * Phase 5.1: Composite metric of harmony + coherence + consent stability
 */

import { HarmonicCoherenceEngine } from './harmonicCoherenceEngine';
import { CooperativeCreationFramework } from './cooperativeCreationFramework';
import { AutonomySafeguardFramework } from './autonomySafeguardFramework';

export interface HarmonicHealthMetrics {
  hhi: number; // Harmonic Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    harmony: number; // Harmony index from HCE
    coherence: number; // Coherence from cooperative sessions
    consentStability: number; // Consent stability from ASF
  };
  weights: {
    harmony: number; // 0.4
    coherence: number; // 0.35
    consentStability: number; // 0.25
  };
  status: 'harmonic' | 'balanced' | 'divergent' | 'decoherent' | 'critical';
  recommendations: string[];
}

/**
 * Harmonic Health Index
 */
export class HarmonicHealthIndex {
  private hce: HarmonicCoherenceEngine;
  private ccf: CooperativeCreationFramework;
  private asf: AutonomySafeguardFramework;
  private history: HarmonicHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;
  private readonly ALERT_THRESHOLD = 0.6; // Trigger recalibration if < 0.6

  constructor(
    hce: HarmonicCoherenceEngine,
    ccf: CooperativeCreationFramework,
    asf: AutonomySafeguardFramework
  ) {
    this.hce = hce;
    this.ccf = ccf;
    this.asf = asf;
  }

  /**
   * Calculate Harmonic Health Index
   */
  calculateHHI(): HarmonicHealthMetrics {
    // Get harmony index
    const harmony = this.hce.getHarmonyIndex();

    // Get coherence from latest session
    const latestSession = this.ccf.getLatestSession();
    const coherence = latestSession
      ? latestSession.evaluation.coherenceGain + 0.5 // Normalize to 0-1
      : 0.5;

    // Get consent stability from ASF
    const asfStats = this.asf.getStatistics();
    const consentStability = asfStats.totalDecisions > 0
      ? asfStats.allowed / asfStats.totalDecisions // Ratio of allowed decisions
      : 0.5;

    // Weights
    const weights = {
      harmony: 0.4,
      coherence: 0.35,
      consentStability: 0.25
    };

    // Calculate HHI
    const hhi = (
      harmony * weights.harmony +
      coherence * weights.coherence +
      consentStability * weights.consentStability
    );

    // Determine status
    let status: HarmonicHealthMetrics['status'];
    if (hhi >= 0.8) {
      status = 'harmonic';
    } else if (hhi >= 0.7) {
      status = 'balanced';
    } else if (hhi >= 0.6) {
      status = 'divergent';
    } else if (hhi >= 0.5) {
      status = 'decoherent';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(hhi, harmony, coherence, consentStability);

    const metrics: HarmonicHealthMetrics = {
      hhi,
      timestamp: new Date().toISOString(),
      components: {
        harmony,
        coherence,
        consentStability
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
    if (hhi < this.ALERT_THRESHOLD) {
      console.warn(`[HHI] Harmonic Health Index (${hhi.toFixed(3)}) below threshold. Triggering recalibration cycle.`);
    }

    return metrics;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    hhi: number,
    harmony: number,
    coherence: number,
    consentStability: number
  ): string[] {
    const recommendations: string[] = [];

    if (hhi < 0.5) {
      recommendations.push('🚨 CRITICAL: Harmonic Health Index below 0.5. Immediate recalibration required.');
    } else if (hhi < 0.6) {
      recommendations.push('⚠️ WARNING: Harmonic Health Index below 0.6. Recalibration cycle triggered.');
    }

    if (harmony < 0.6) {
      recommendations.push('💡 Harmony index low. Review resonance coefficients and balance between divergence and unity.');
    }

    if (coherence < 0.6) {
      recommendations.push('💡 Coherence low. Review cooperative creation sessions and synthesis quality.');
    }

    if (consentStability < 0.6) {
      recommendations.push('💡 Consent stability low. Review mutual consent protocol and autonomy preservation.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All harmonic health components within optimal range.');
    }

    return recommendations;
  }

  /**
   * Get latest HHI
   */
  getLatestHHI(): HarmonicHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get HHI history
   */
  getHistory(limit: number = 100): HarmonicHealthMetrics[] {
    return this.history.slice(-limit);
  }
}

