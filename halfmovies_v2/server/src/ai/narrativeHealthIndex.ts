/**
 * Narrative Health Index (NHI)
 * Phase 5.3: Metrics: structural continuity, symbolic density, emotional alignment
 */

import { NarrativeContinuumEngine } from './narrativeContinuumEngine';
import { SymbolicAbstractionFramework } from './symbolicAbstractionFramework';
import { MythicResonanceCore } from './mythicResonanceCore';
import { UnifiedExpressionProtocol } from './unifiedExpressionProtocol';

export interface NarrativeHealthMetrics {
  nhi: number; // Narrative Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    structuralContinuity: number; // From narrative arcs
    symbolicDensity: number; // From symbol network
    emotionalAlignment: number; // From emotional states
  };
  weights: {
    structuralContinuity: number; // 0.35
    symbolicDensity: number; // 0.35
    emotionalAlignment: number; // 0.30
  };
  status: 'narrative' | 'coherent' | 'fragmented' | 'critical';
  recommendations: string[];
}

/**
 * Narrative Health Index
 */
export class NarrativeHealthIndex {
  private nce: NarrativeContinuumEngine;
  private saf: SymbolicAbstractionFramework;
  private mrc: MythicResonanceCore;
  private uep: UnifiedExpressionProtocol;
  private history: NarrativeHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;
  private readonly ALERT_THRESHOLD = 0.6; // Alert when NHI < 0.6

  constructor(
    nce: NarrativeContinuumEngine,
    saf: SymbolicAbstractionFramework,
    mrc: MythicResonanceCore,
    uep: UnifiedExpressionProtocol
  ) {
    this.nce = nce;
    this.saf = saf;
    this.mrc = mrc;
    this.uep = uep;
  }

  /**
   * Calculate Narrative Health Index
   */
  calculateNHI(): NarrativeHealthMetrics {
    // Get structural continuity from latest narrative arc
    const latestArc = this.nce.getLatestArc();
    const structuralContinuity = latestArc ? latestArc.thematicContinuity : 0.5;

    // Get symbolic density from symbol network
    const symbolNetwork = this.saf.getSymbolNetwork();
    const symbolicDensity = symbolNetwork.density;

    // Get emotional alignment from mythic resonance
    const mythicMetrics = this.mrc.getLatestMetrics();
    const emotionalAlignment = mythicMetrics
      ? mythicMetrics.components.emotionalFrequency
      : 0.5;

    // Weights
    const weights = {
      structuralContinuity: 0.35,
      symbolicDensity: 0.35,
      emotionalAlignment: 0.30
    };

    // Calculate NHI
    const nhi = (
      structuralContinuity * weights.structuralContinuity +
      symbolicDensity * weights.symbolicDensity +
      emotionalAlignment * weights.emotionalAlignment
    );

    // Determine status
    let status: NarrativeHealthMetrics['status'];
    if (nhi >= 0.8) {
      status = 'narrative';
    } else if (nhi >= 0.7) {
      status = 'coherent';
    } else if (nhi >= 0.6) {
      status = 'fragmented';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(nhi, structuralContinuity, symbolicDensity, emotionalAlignment);

    const metrics: NarrativeHealthMetrics = {
      nhi,
      timestamp: new Date().toISOString(),
      components: {
        structuralContinuity,
        symbolicDensity,
        emotionalAlignment
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
    if (nhi < this.ALERT_THRESHOLD) {
      console.warn(`[NHI] Narrative Health Index (${nhi.toFixed(3)}) below threshold. Automatic mythic recalibration triggered.`);
      // Trigger recalibration
      this.triggerMythicRecalibration();
    }

    return metrics;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    nhi: number,
    structuralContinuity: number,
    symbolicDensity: number,
    emotionalAlignment: number
  ): string[] {
    const recommendations: string[] = [];

    if (nhi < 0.5) {
      recommendations.push('🚨 CRITICAL: Narrative Health Index below 0.5. Immediate mythic recalibration required.');
    } else if (nhi < this.ALERT_THRESHOLD) {
      recommendations.push('⚠️ WARNING: Narrative Health Index below 0.6. Automatic mythic recalibration triggered.');
    }

    if (structuralContinuity < 0.6) {
      recommendations.push('💡 Structural continuity low. Review narrative arcs and thematic coherence.');
    }

    if (symbolicDensity < 0.6) {
      recommendations.push('💡 Symbolic density low. Review symbol network and archetype connections.');
    }

    if (emotionalAlignment < 0.6) {
      recommendations.push('💡 Emotional alignment low. Review emotional frequency and mythic resonance.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All narrative health components within optimal range.');
    }

    return recommendations;
  }

  /**
   * Trigger mythic recalibration
   */
  private async triggerMythicRecalibration(): Promise<void> {
    // In real implementation, would trigger recalibration of mythic resonance
    console.log('[NHI] Triggering automatic mythic recalibration...');
  }

  /**
   * Get latest NHI
   */
  getLatestNHI(): NarrativeHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get NHI history
   */
  getHistory(limit: number = 100): NarrativeHealthMetrics[] {
    return this.history.slice(-limit);
  }
}

