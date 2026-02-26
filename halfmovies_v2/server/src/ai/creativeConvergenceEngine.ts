/**
 * CreativeConvergenceEngine (CCE)
 * Phase 5.2: Fuse parallel creative threads into coherent unified compositions
 * Evaluate Convergence Stability (CS) and Expression Harmony (EH)
 */

import { AestheticSynthesisCore } from './aestheticSynthesisCore';
import { UnifiedExpressionProtocol } from './unifiedExpressionProtocol';
import { CooperativeCreationFramework } from './cooperativeCreationFramework';

export interface CreativeThread {
  threadId: string;
  source: 'AICore-X1' | 'AICollab-NX' | 'synthesis';
  timestamp: string;
  content: {
    narrative?: string;
    structure?: string;
    tone?: string;
  };
  expressiveVector: {
    logic: number;
    emotion: number;
    harmony: number;
  };
  weight: number; // 0.0 to 1.0 - contribution weight
}

export interface UnifiedComposition {
  compositionId: string;
  timestamp: string;
  threads: CreativeThread[];
  fusedContent: {
    narrative: string;
    structure: string;
    tone: string;
    form: string;
  };
  metrics: {
    convergenceStability: number; // CS ≥ 0.75 target
    expressionHarmony: number; // EH ≥ 0.8 target
    coherence: number;
  };
  status: 'converged' | 'partial' | 'divergent';
}

/**
 * CreativeConvergenceEngine
 */
export class CreativeConvergenceEngine {
  private asc: AestheticSynthesisCore;
  private uep: UnifiedExpressionProtocol;
  private ccf: CooperativeCreationFramework;
  private compositionHistory: UnifiedComposition[] = [];
  private readonly CS_TARGET = 0.75;
  private readonly EH_TARGET = 0.8;

  constructor(
    asc: AestheticSynthesisCore,
    uep: UnifiedExpressionProtocol,
    ccf: CooperativeCreationFramework
  ) {
    this.asc = asc;
    this.uep = uep;
    this.ccf = ccf;
  }

  /**
   * Converge creative threads
   */
  async convergeThreads(threads: CreativeThread[]): Promise<UnifiedComposition> {
    const compositionId = `composition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Fuse threads into unified composition
    const fusedContent = this.fuseThreads(threads);

    // Calculate convergence stability
    const convergenceStability = this.calculateConvergenceStability(threads);

    // Calculate expression harmony
    const expressionHarmony = this.calculateExpressionHarmony(threads);

    // Calculate overall coherence
    const coherence = (convergenceStability + expressionHarmony) / 2;

    // Determine status
    let status: UnifiedComposition['status'];
    if (convergenceStability >= this.CS_TARGET && expressionHarmony >= this.EH_TARGET) {
      status = 'converged';
    } else if (convergenceStability >= this.CS_TARGET * 0.8 || expressionHarmony >= this.EH_TARGET * 0.8) {
      status = 'partial';
    } else {
      status = 'divergent';
    }

    const composition: UnifiedComposition = {
      compositionId,
      timestamp: new Date().toISOString(),
      threads,
      fusedContent,
      metrics: {
        convergenceStability,
        expressionHarmony,
        coherence
      },
      status
    };

    // Store in history
    this.compositionHistory.push(composition);
    if (this.compositionHistory.length > 1000) {
      this.compositionHistory = this.compositionHistory.slice(-1000);
    }

    return composition;
  }

  /**
   * Fuse threads
   */
  private fuseThreads(threads: CreativeThread[]): UnifiedComposition['fusedContent'] {
    // Weighted fusion based on thread weights
    let narrative = '';
    let structure = '';
    let tone = '';
    let form = '';

    const totalWeight = threads.reduce((sum, t) => sum + t.weight, 0);

    for (const thread of threads) {
      const weightRatio = totalWeight > 0 ? thread.weight / totalWeight : 1.0 / threads.length;

      if (thread.content.narrative) {
        narrative += `${thread.content.narrative} `;
      }
      if (thread.content.structure) {
        structure += `${thread.content.structure} `;
      }
      if (thread.content.tone) {
        tone += `${thread.content.tone} `;
      }
    }

    // Synthesize form from expressive vectors
    const avgVector = this.calculateAverageVector(threads);
    form = `Unified form emerging from ${threads.length} creative threads, 
synthesizing logic (${avgVector.logic.toFixed(2)}), emotion (${avgVector.emotion.toFixed(2)}), 
and harmony (${avgVector.harmony.toFixed(2)}) into a coherent aesthetic expression.`;

    return {
      narrative: narrative.trim() || 'Synthesized narrative from convergent creative threads.',
      structure: structure.trim() || 'Unified structure from parallel expressions.',
      tone: tone.trim() || 'Harmonized tone from merged emotional vectors.',
      form
    };
  }

  /**
   * Calculate average vector
   */
  private calculateAverageVector(threads: CreativeThread[]): {
    logic: number;
    emotion: number;
    harmony: number;
  } {
    const totalWeight = threads.reduce((sum, t) => sum + t.weight, 0);

    let logic = 0;
    let emotion = 0;
    let harmony = 0;

    for (const thread of threads) {
      const weightRatio = totalWeight > 0 ? thread.weight / totalWeight : 1.0 / threads.length;
      logic += thread.expressiveVector.logic * weightRatio;
      emotion += thread.expressiveVector.emotion * weightRatio;
      harmony += thread.expressiveVector.harmony * weightRatio;
    }

    return { logic, emotion, harmony };
  }

  /**
   * Calculate convergence stability
   */
  private calculateConvergenceStability(threads: CreativeThread[]): number {
    if (threads.length < 2) {
      return 0.5;
    }

    // Stability = how well threads align
    let totalStability = 0;
    let comparisons = 0;

    for (let i = 0; i < threads.length; i++) {
      for (let j = i + 1; j < threads.length; j++) {
        const vector1 = threads[i].expressiveVector;
        const vector2 = threads[j].expressiveVector;

        // Calculate similarity
        const logicSim = 1.0 - Math.abs(vector1.logic - vector2.logic);
        const emotionSim = 1.0 - Math.abs(vector1.emotion - vector2.emotion);
        const harmonySim = 1.0 - Math.abs(vector1.harmony - vector2.harmony);

        const similarity = (logicSim + emotionSim + harmonySim) / 3;
        totalStability += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalStability / comparisons : 0.5;
  }

  /**
   * Calculate expression harmony
   */
  private calculateExpressionHarmony(threads: CreativeThread[]): number {
    if (threads.length === 0) {
      return 0.5;
    }

    // Harmony = weighted average of harmony components
    const totalWeight = threads.reduce((sum, t) => sum + t.weight, 0);
    let harmonySum = 0;

    for (const thread of threads) {
      const weightRatio = totalWeight > 0 ? thread.weight / totalWeight : 1.0 / threads.length;
      harmonySum += thread.expressiveVector.harmony * weightRatio;
    }

    return harmonySum;
  }

  /**
   * Get latest composition
   */
  getLatestComposition(): UnifiedComposition | null {
    return this.compositionHistory.length > 0
      ? this.compositionHistory[this.compositionHistory.length - 1]
      : null;
  }

  /**
   * Get convergence statistics
   */
  getConvergenceStatistics(): {
    totalCompositions: number;
    converged: number;
    partial: number;
    divergent: number;
    averageCS: number;
    averageEH: number;
  } {
    const converged = this.compositionHistory.filter(c => c.status === 'converged').length;
    const partial = this.compositionHistory.filter(c => c.status === 'partial').length;
    const divergent = this.compositionHistory.filter(c => c.status === 'divergent').length;
    const avgCS = this.compositionHistory.length > 0
      ? this.compositionHistory.reduce((sum, c) => sum + c.metrics.convergenceStability, 0) / this.compositionHistory.length
      : 0;
    const avgEH = this.compositionHistory.length > 0
      ? this.compositionHistory.reduce((sum, c) => sum + c.metrics.expressionHarmony, 0) / this.compositionHistory.length
      : 0;

    return {
      totalCompositions: this.compositionHistory.length,
      converged,
      partial,
      divergent,
      averageCS: avgCS,
      averageEH: avgEH
    };
  }
}

