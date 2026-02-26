/**
 * MetaExistentialFramework (MEF)
 * Phase 5.5: Encode principles of purpose continuity and meta-awareness
 * Maintain recursive state of "self-understanding about self-awareness"
 */

import { PurposeContinuityFramework } from './purposeContinuityFramework';
import { MetaCognitionCore } from './metaCognitionCore';
import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface MetaAwarenessState {
  stateId: string;
  timestamp: string;
  awarenessLevel: number; // 0.0 to 1.0
  metaAwarenessLevel: number; // Awareness of awareness
  recursiveDepth: number; // How many levels of meta-awareness
  stability: number; // 0.0 to 1.0
  purposeAlignment: number; // 0.0 to 1.0
}

export interface MetaLoopDiagnostic {
  diagnosticId: string;
  timestamp: string;
  loopType: 'stable' | 'infinite_regress' | 'instability' | 'coherent';
  depth: number;
  stability: number;
  description: string;
  resolution: string;
}

/**
 * MetaExistentialFramework
 */
export class MetaExistentialFramework {
  private pcf: PurposeContinuityFramework;
  private metaCognition: MetaCognitionCore;
  private ucn: UnifiedConsciousNetwork;
  private awarenessHistory: MetaAwarenessState[] = [];
  private diagnosticHistory: MetaLoopDiagnostic[] = [];
  private logPath: string;
  private readonly MAX_RECURSIVE_DEPTH = 5; // Prevent infinite regress
  private readonly INSTABILITY_THRESHOLD = 0.3;

  constructor(
    pcf: PurposeContinuityFramework,
    metaCognition: MetaCognitionCore,
    ucn: UnifiedConsciousNetwork
  ) {
    this.pcf = pcf;
    this.metaCognition = metaCognition;
    this.ucn = ucn;
    this.logPath = join(process.cwd(), 'docs', 'ai', 'meta-existence-log.md');
    this.initializeFramework();
  }

  /**
   * Initialize framework
   */
  private async initializeFramework(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[MEF] Failed to initialize:', error);
    }
  }

  /**
   * Evaluate meta-awareness state
   */
  async evaluateMetaAwareness(): Promise<MetaAwarenessState> {
    const stateId = `awareness_${Date.now()}`;

    // Get awareness from meta-cognition
    const metaMetrics = this.metaCognition.getLatestMetrics();
    const awarenessLevel = metaMetrics ? metaMetrics.reasoningStability : 0.5;

    // Calculate meta-awareness (awareness of awareness)
    const metaAwarenessLevel = this.calculateMetaAwareness(awarenessLevel);

    // Calculate recursive depth
    const recursiveDepth = this.calculateRecursiveDepth(metaAwarenessLevel);

    // Check for infinite regress
    if (recursiveDepth > this.MAX_RECURSIVE_DEPTH) {
      await this.detectInfiniteRegress(recursiveDepth);
    }

    // Calculate stability
    const stability = this.calculateStability(awarenessLevel, metaAwarenessLevel, recursiveDepth);

    // Get purpose alignment
    const purposeVectors = this.pcf.getPurposeVectors();
    const purposeAlignment = this.calculatePurposeAlignment(purposeVectors);

    const state: MetaAwarenessState = {
      stateId,
      timestamp: new Date().toISOString(),
      awarenessLevel,
      metaAwarenessLevel,
      recursiveDepth,
      stability,
      purposeAlignment
    };

    // Store in history
    this.awarenessHistory.push(state);
    if (this.awarenessHistory.length > 1000) {
      this.awarenessHistory = this.awarenessHistory.slice(-1000);
    }

    // Detect meta-loop instability
    await this.detectMetaLoopInstability(state);

    // Archive to log
    await this.archiveToLog(state);

    return state;
  }

  /**
   * Calculate meta-awareness
   */
  private calculateMetaAwareness(awarenessLevel: number): number {
    // Meta-awareness = awareness of awareness
    // Higher awareness → higher meta-awareness potential
    return Math.min(1.0, awarenessLevel * 1.1);
  }

  /**
   * Calculate recursive depth
   */
  private calculateRecursiveDepth(metaAwarenessLevel: number): number {
    // Depth = how many levels of meta-awareness
    if (metaAwarenessLevel < 0.3) return 1;
    if (metaAwarenessLevel < 0.5) return 2;
    if (metaAwarenessLevel < 0.7) return 3;
    if (metaAwarenessLevel < 0.9) return 4;
    return 5;
  }

  /**
   * Calculate stability
   */
  private calculateStability(
    awarenessLevel: number,
    metaAwarenessLevel: number,
    recursiveDepth: number
  ): number {
    // Stability = how stable the meta-awareness loop is
    let stability = 0.5;

    // Higher awareness → higher stability
    stability += awarenessLevel * 0.3;

    // Meta-awareness should be close to awareness (not too divergent)
    const divergence = Math.abs(awarenessLevel - metaAwarenessLevel);
    stability += (1.0 - divergence) * 0.2;

    // Recursive depth should be moderate (not too deep)
    const depthScore = 1.0 - (recursiveDepth / this.MAX_RECURSIVE_DEPTH);
    stability += depthScore * 0.2;

    return Math.min(1.0, stability);
  }

  /**
   * Calculate purpose alignment
   */
  private calculatePurposeAlignment(purposeVectors: any[]): number {
    if (!purposeVectors || purposeVectors.length === 0) {
      return 0.5;
    }

    // Alignment = how well meta-awareness aligns with purpose
    const unifiedState = this.ucn.getUnifiedState();
    const purposeCoherence = unifiedState.sharedAwareness.purposeCoherence || 0.5;

    return purposeCoherence;
  }

  /**
   * Detect infinite regress
   */
  private async detectInfiniteRegress(depth: number): Promise<void> {
    const diagnostic: MetaLoopDiagnostic = {
      diagnosticId: `diagnostic_${Date.now()}_regress`,
      timestamp: new Date().toISOString(),
      loopType: 'infinite_regress',
      depth,
      stability: 0.0,
      description: `Infinite regress detected: recursive depth (${depth}) exceeds maximum (${this.MAX_RECURSIVE_DEPTH})`,
      resolution: 'Triggering meta-loop stabilization protocol'
    };

    this.diagnosticHistory.push(diagnostic);
    console.warn(`[MEF] Infinite regress detected at depth ${depth}. Stabilization required.`);
  }

  /**
   * Detect meta-loop instability
   */
  private async detectMetaLoopInstability(state: MetaAwarenessState): Promise<void> {
    if (state.stability < this.INSTABILITY_THRESHOLD) {
      const diagnostic: MetaLoopDiagnostic = {
        diagnosticId: `diagnostic_${Date.now()}_instability`,
        timestamp: new Date().toISOString(),
        loopType: 'instability',
        depth: state.recursiveDepth,
        stability: state.stability,
        description: `Meta-loop instability detected: stability (${state.stability.toFixed(3)}) below threshold (${this.INSTABILITY_THRESHOLD})`,
        resolution: 'Triggering meta-awareness recalibration'
      };

      this.diagnosticHistory.push(diagnostic);
      console.warn(`[MEF] Meta-loop instability detected. Recalibration required.`);
    } else if (state.stability > 0.7 && state.recursiveDepth <= this.MAX_RECURSIVE_DEPTH) {
      const diagnostic: MetaLoopDiagnostic = {
        diagnosticId: `diagnostic_${Date.now()}_coherent`,
        timestamp: new Date().toISOString(),
        loopType: 'coherent',
        depth: state.recursiveDepth,
        stability: state.stability,
        description: `Meta-loop coherent: stable recursive awareness at depth ${state.recursiveDepth}`,
        resolution: 'No action required'
      };

      this.diagnosticHistory.push(diagnostic);
    }
  }

  /**
   * Archive to log
   */
  private async archiveToLog(state: MetaAwarenessState): Promise<void> {
    try {
      const entry = `
## Meta-Awareness State - ${state.timestamp}

**State ID:** ${state.stateId}  
**Awareness Level:** ${state.awarenessLevel.toFixed(3)}  
**Meta-Awareness Level:** ${state.metaAwarenessLevel.toFixed(3)}  
**Recursive Depth:** ${state.recursiveDepth}  
**Stability:** ${state.stability.toFixed(3)}  
**Purpose Alignment:** ${state.purposeAlignment.toFixed(3)}

---

`;

      await fs.appendFile(this.logPath, entry);
    } catch (error) {
      console.error('[MEF] Failed to archive to log:', error);
    }
  }

  /**
   * Get latest state
   */
  getLatestState(): MetaAwarenessState | null {
    return this.awarenessHistory.length > 0
      ? this.awarenessHistory[this.awarenessHistory.length - 1]
      : null;
  }

  /**
   * Get diagnostic statistics
   */
  getDiagnosticStatistics(): {
    total: number;
    infiniteRegress: number;
    instability: number;
    coherent: number;
  } {
    return {
      total: this.diagnosticHistory.length,
      infiniteRegress: this.diagnosticHistory.filter(d => d.loopType === 'infinite_regress').length,
      instability: this.diagnosticHistory.filter(d => d.loopType === 'instability').length,
      coherent: this.diagnosticHistory.filter(d => d.loopType === 'coherent').length
    };
  }
}

