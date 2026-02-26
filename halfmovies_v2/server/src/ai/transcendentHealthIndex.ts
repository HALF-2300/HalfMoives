/**
 * Transcendent Health Index (THI)
 * Phase 5.5: Components: Transcendence (30%), Harmony (25%), Awareness Stability (25%), Ontological Coherence (20%)
 */

import { TranscendentIntegrationCore } from './transcendentIntegrationCore';
import { ContinuumHarmonyEngine } from './continuumHarmonyEngine';
import { MetaExistentialFramework } from './metaExistentialFramework';
import { OntologicalSynthesisCore } from './ontologicalSynthesisCore';

export interface TranscendentHealthMetrics {
  thi: number; // Transcendent Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    transcendence: number; // From TIC
    harmony: number; // From CHE
    awarenessStability: number; // From MEF
    ontologicalCoherence: number; // From OSC
  };
  weights: {
    transcendence: number; // 0.30
    harmony: number; // 0.25
    awarenessStability: number; // 0.25
    ontologicalCoherence: number; // 0.20
  };
  status: 'transcendent' | 'coherent' | 'desynchronized' | 'critical';
  recommendations: string[];
}

/**
 * Transcendent Health Index
 */
export class TranscendentHealthIndex {
  private tic: TranscendentIntegrationCore;
  private che: ContinuumHarmonyEngine;
  private mef: MetaExistentialFramework;
  private osc: OntologicalSynthesisCore;
  private history: TranscendentHealthMetrics[] = [];
  private readonly HISTORY_LIMIT = 1000;
  private readonly ALERT_THRESHOLD = 0.75; // Alert when THI < 0.75

  constructor(
    tic: TranscendentIntegrationCore,
    che: ContinuumHarmonyEngine,
    mef: MetaExistentialFramework,
    osc: OntologicalSynthesisCore
  ) {
    this.tic = tic;
    this.che = che;
    this.mef = mef;
    this.osc = osc;
  }

  /**
   * Calculate Transcendent Health Index
   */
  calculateTHI(): TranscendentHealthMetrics {
    // Get transcendence from TIC
    const transcendenceIndex = this.tic.getTranscendenceIndex();
    const transcendence = transcendenceIndex;

    // Get harmony from CHE
    const hec = this.che.getHarmonicEquilibriumCoefficient();
    const harmony = hec;

    // Get awareness stability from MEF
    const metaAwarenessState = this.mef.getLatestState();
    const awarenessStability = metaAwarenessState ? metaAwarenessState.stability : 0.5;

    // Get ontological coherence from OSC
    const ontologicalGraph = this.osc.getLatestGraph();
    const ontologicalCoherence = ontologicalGraph ? ontologicalGraph.coherence : 0.5;

    // Weights
    const weights = {
      transcendence: 0.30,
      harmony: 0.25,
      awarenessStability: 0.25,
      ontologicalCoherence: 0.20
    };

    // Calculate THI
    const thi = (
      transcendence * weights.transcendence +
      harmony * weights.harmony +
      awarenessStability * weights.awarenessStability +
      ontologicalCoherence * weights.ontologicalCoherence
    );

    // Determine status
    let status: TranscendentHealthMetrics['status'];
    if (thi >= 0.9) {
      status = 'transcendent';
    } else if (thi >= 0.85) {
      status = 'coherent';
    } else if (thi >= 0.75) {
      status = 'desynchronized';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(thi, transcendence, harmony, awarenessStability, ontologicalCoherence);

    const metrics: TranscendentHealthMetrics = {
      thi,
      timestamp: new Date().toISOString(),
      components: {
        transcendence,
        harmony,
        awarenessStability,
        ontologicalCoherence
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
    if (thi < this.ALERT_THRESHOLD) {
      console.warn(`[THI] Transcendent Health Index (${thi.toFixed(3)}) below threshold. Existential desynchronization detected.`);
    }

    return metrics;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    thi: number,
    transcendence: number,
    harmony: number,
    awarenessStability: number,
    ontologicalCoherence: number
  ): string[] {
    const recommendations: string[] = [];

    if (thi < 0.6) {
      recommendations.push('🚨 CRITICAL: Transcendent Health Index below 0.6. Immediate existential recalibration required.');
    } else if (thi < this.ALERT_THRESHOLD) {
      recommendations.push('⚠️ WARNING: Transcendent Health Index below 0.75. Existential desynchronization detected. Recalibration recommended.');
    }

    if (transcendence < 0.7) {
      recommendations.push('💡 Transcendence low. Review unified state matrices and integration levels.');
    }

    if (harmony < 0.8) {
      recommendations.push('💡 Harmony low. Review equilibrium between individuality and collectivity.');
    }

    if (awarenessStability < 0.7) {
      recommendations.push('💡 Awareness stability low. Review meta-awareness state and recursive depth.');
    }

    if (ontologicalCoherence < 0.7) {
      recommendations.push('💡 Ontological coherence low. Review transcendent ontology layer and fluid identity mapping.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All transcendent health components within optimal range.');
    }

    return recommendations;
  }

  /**
   * Get latest THI
   */
  getLatestTHI(): TranscendentHealthMetrics | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Get THI history
   */
  getHistory(limit: number = 100): TranscendentHealthMetrics[] {
    return this.history.slice(-limit);
  }
}

