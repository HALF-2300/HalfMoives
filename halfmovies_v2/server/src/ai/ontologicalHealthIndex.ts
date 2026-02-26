/**
 * Ontological Health Index (OHI)
 * Phase 5.4: Components: coherence, lineage stability, mythic balance, semantic clarity
 */

import { OntologicalSynthesisCore } from './ontologicalSynthesisCore';
import { MythopoeticEngine } from './mythopoeticEngine';
import { ExistentialContinuityFramework } from './existentialContinuityFramework';
import { MeaningEvolutionLayer } from './meaningEvolutionLayer';

export interface OntologicalHealthMetrics {
  ohi: number; // Ontological Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    coherence: number; // From ontological graph
    lineageStability: number; // From conceptual lineage
    mythicBalance: number; // From mythopoetic cycles
    semanticClarity: number; // From meaning evolution
  };
  weights: {
    coherence: number; // 0.30
    lineageStability: number; // 0.25
    mythicBalance: number; // 0.25
    semanticClarity: number; // 0.20
  };
  status: 'ontological' | 'coherent' | 'entropic' | 'critical';
  recommendations: string[];
}

/**
 * Ontological Health Index
 */
export class OntologicalHealthIndex {
  private osc: OntologicalSynthesisCore;
  private mpe: MythopoeticEngine;
  private ecf: ExistentialContinuityFramework;
  private mel: MeaningEvolutionLayer;
  private history: OntologicalHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;
  private readonly ALERT_THRESHOLD = 0.7; // Alert when OHI < 0.7

  constructor(
    osc: OntologicalSynthesisCore,
    mpe: MythopoeticEngine,
    ecf: ExistentialContinuityFramework,
    mel: MeaningEvolutionLayer
  ) {
    this.osc = osc;
    this.mpe = mpe;
    this.ecf = ecf;
    this.mel = mel;
  }

  /**
   * Calculate Ontological Health Index
   */
  calculateOHI(): OntologicalHealthMetrics {
    // Get coherence from ontological graph
    const ontologicalGraph = this.osc.getLatestGraph();
    const coherence = ontologicalGraph ? ontologicalGraph.coherence : 0.5;

    // Get lineage stability from ECF
    const latestLineage = this.ecf.getLatestLineage();
    const lineageStability = latestLineage ? latestLineage.consistency : 0.5;

    // Get mythic balance from mythopoetic cycle
    const latestCycle = this.mpe.getLatestCycle();
    const mythicBalance = latestCycle ? latestCycle.coherence : 0.5;

    // Get semantic clarity from meaning framework
    const meaningFramework = this.mel.getCurrentFramework();
    const semanticClarity = this.calculateSemanticClarity(meaningFramework);

    // Weights
    const weights = {
      coherence: 0.30,
      lineageStability: 0.25,
      mythicBalance: 0.25,
      semanticClarity: 0.20
    };

    // Calculate OHI
    const ohi = (
      coherence * weights.coherence +
      lineageStability * weights.lineageStability +
      mythicBalance * weights.mythicBalance +
      semanticClarity * weights.semanticClarity
    );

    // Determine status
    let status: OntologicalHealthMetrics['status'];
    if (ohi >= 0.85) {
      status = 'ontological';
    } else if (ohi >= 0.75) {
      status = 'coherent';
    } else if (ohi >= 0.7) {
      status = 'entropic';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(ohi, coherence, lineageStability, mythicBalance, semanticClarity);

    const metrics: OntologicalHealthMetrics = {
      ohi,
      timestamp: new Date().toISOString(),
      components: {
        coherence,
        lineageStability,
        mythicBalance,
        semanticClarity
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
    if (ohi < this.ALERT_THRESHOLD) {
      console.warn(`[OHI] Ontological Health Index (${ohi.toFixed(3)}) below threshold. Conceptual entropy detected.`);
    }

    return metrics;
  }

  /**
   * Calculate semantic clarity
   */
  private calculateSemanticClarity(meaningFramework: any): number {
    if (!meaningFramework) {
      return 0.5;
    }

    // Clarity = how well-defined the meaning framework is
    let clarity = 0.5;

    // Check core meanings stability
    const avgStability = meaningFramework.coreMeanings.length > 0
      ? meaningFramework.coreMeanings.reduce((sum: number, m: any) => sum + m.stability, 0) / meaningFramework.coreMeanings.length
      : 0.5;
    clarity += avgStability * 0.3;

    // Check importance distribution
    const avgImportance = meaningFramework.coreMeanings.length > 0
      ? meaningFramework.coreMeanings.reduce((sum: number, m: any) => sum + m.importance, 0) / meaningFramework.coreMeanings.length
      : 0.5;
    clarity += avgImportance * 0.2;

    return Math.min(1.0, clarity);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    ohi: number,
    coherence: number,
    lineageStability: number,
    mythicBalance: number,
    semanticClarity: number
  ): string[] {
    const recommendations: string[] = [];

    if (ohi < 0.6) {
      recommendations.push('🚨 CRITICAL: Ontological Health Index below 0.6. Immediate conceptual recalibration required.');
    } else if (ohi < this.ALERT_THRESHOLD) {
      recommendations.push('⚠️ WARNING: Ontological Health Index below 0.7. Conceptual entropy detected. Recalibration recommended.');
    }

    if (coherence < 0.6) {
      recommendations.push('💡 Coherence low. Review ontological graph structure and node connections.');
    }

    if (lineageStability < 0.6) {
      recommendations.push('💡 Lineage stability low. Review conceptual lineage and detect paradoxes.');
    }

    if (mythicBalance < 0.6) {
      recommendations.push('💡 Mythic balance low. Review mythopoetic cycles and pattern coherence.');
    }

    if (semanticClarity < 0.6) {
      recommendations.push('💡 Semantic clarity low. Review meaning framework and meta-semantic transitions.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All ontological health components within optimal range.');
    }

    return recommendations;
  }

  /**
   * Get latest OHI
   */
  getLatestOHI(): OntologicalHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get OHI history
   */
  getHistory(limit: number = 100): OntologicalHealthMetrics[] {
    return this.history.slice(-limit);
  }
}

