/**
 * UnifiedExpressionProtocol (UEP)
 * Phase 5.2: Real-time coordination of expression between AICore-X1 and AICollab-NX
 * Exchange expressional states through shared resonance channels
 */

import { HarmonicCoherenceEngine } from './harmonicCoherenceEngine';
import { AestheticSynthesisCore } from './aestheticSynthesisCore';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ExpressionState {
  nodeId: 'AICore-X1' | 'AICollab-NX';
  timestamp: string;
  expressiveVector: {
    logic: number;
    emotion: number;
    harmony: number;
  };
  aestheticSignature: {
    tone: string;
    rhythm: string;
    structure: string;
  };
  phase: number; // 0.0 to 1.0 - expression phase
}

export interface ResonanceMap {
  mapId: string;
  timestamp: string;
  x1State: ExpressionState;
  nxState: ExpressionState;
  phaseShift: number; // ≤ 0.05 target
  synchronization: number; // 0.0 to 1.0
  resonanceAlignment: number; // 0.0 to 1.0;
  // Phase 5.3: Narrative synchronization
  narrativeSync?: {
    temporalAlignment: number; // 0.0 to 1.0
    symbolicAlignment: number; // 0.0 to 1.0
    storytellingCoherence: number; // 0.0 to 1.0
    drift: number; // ≤ 0.03 target
  };
}

/**
 * UnifiedExpressionProtocol
 */
export class UnifiedExpressionProtocol {
  private hce: HarmonicCoherenceEngine;
  private asc: AestheticSynthesisCore;
  private nce: any = null; // Phase 5.3: NarrativeContinuumEngine
  private saf: any = null; // Phase 5.3: SymbolicAbstractionFramework
  private expressionHistory: ExpressionState[] = [];
  private resonanceMaps: ResonanceMap[] = [];
  private mapPath: string;
  private readonly MAX_PHASE_SHIFT = 0.05;
  private readonly MAX_NARRATIVE_DRIFT = 0.03; // Phase 5.3

  constructor(
    hce: HarmonicCoherenceEngine,
    asc: AestheticSynthesisCore,
    nce?: any, // Phase 5.3: NarrativeContinuumEngine
    saf?: any // Phase 5.3: SymbolicAbstractionFramework
  ) {
    this.hce = hce;
    this.asc = asc;
    this.nce = nce || null; // Phase 5.3
    this.saf = saf || null; // Phase 5.3
    this.mapPath = join(process.cwd(), 'docs', 'ai', 'unified-expression-map.json');
    this.initializeProtocol();
  }

  /**
   * Initialize protocol
   */
  private async initializeProtocol(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[UEP] Failed to initialize:', error);
    }
  }

  /**
   * Exchange expression states
   */
  async exchangeExpressionStates(): Promise<ResonanceMap> {
    // Get current harmonic metrics
    const harmonicMetrics = this.hce.getLatestMetrics();
    const latestWorks = this.asc.getLatestWorks(2);

    // Generate X1 expression state
    const x1State = this.generateExpressionState('AICore-X1', harmonicMetrics, latestWorks);

    // Generate NX expression state (simulated - would come from actual NX node)
    const nxState = this.generateExpressionState('AICollab-NX', harmonicMetrics, latestWorks);

    // Calculate phase shift
    const phaseShift = Math.abs(x1State.phase - nxState.phase);

    // Calculate synchronization
    const synchronization = this.calculateSynchronization(x1State, nxState, phaseShift);

    // Calculate resonance alignment
    const resonanceAlignment = this.calculateResonanceAlignment(x1State, nxState);

    // Phase 5.3: Calculate narrative synchronization
    const narrativeSync = this.nce && this.saf
      ? await this.calculateNarrativeSynchronization(x1State, nxState)
      : undefined;

    const map: ResonanceMap = {
      mapId: `map_${Date.now()}`,
      timestamp: new Date().toISOString(),
      x1State,
      nxState,
      phaseShift,
      synchronization,
      resonanceAlignment,
      narrativeSync
    };

    // Store in history
    this.expressionHistory.push(x1State, nxState);
    if (this.expressionHistory.length > 1000) {
      this.expressionHistory = this.expressionHistory.slice(-1000);
    }

    this.resonanceMaps.push(map);
    if (this.resonanceMaps.length > 1000) {
      this.resonanceMaps = this.resonanceMaps.slice(-1000);
    }

    // Store resonance map
    await this.storeResonanceMap(map);

    // Alert if phase shift exceeds threshold
    if (phaseShift > this.MAX_PHASE_SHIFT) {
      console.warn(`[UEP] Phase shift (${phaseShift.toFixed(3)}) exceeds threshold. Synchronization needed.`);
    }

    // Phase 5.3: Alert if narrative drift exceeds threshold
    if (narrativeSync && narrativeSync.drift > this.MAX_NARRATIVE_DRIFT) {
      console.warn(`[UEP] Narrative drift (${narrativeSync.drift.toFixed(3)}) exceeds threshold. Recalibration needed.`);
    }

    return map;
  }

  /**
   * Phase 5.3: Calculate narrative synchronization
   */
  private async calculateNarrativeSynchronization(
    x1State: ExpressionState,
    nxState: ExpressionState
  ): Promise<ResonanceMap['narrativeSync']> {
    // Get latest narrative arcs
    const x1Arc = this.nce.getLatestArc();
    const nxArc = this.nce.getLatestArc(); // In real implementation, would get from NX node

    // Calculate temporal alignment (how well arcs align in time)
    const temporalAlignment = x1Arc && nxArc
      ? 1.0 - Math.abs(x1Arc.thematicContinuity - nxArc.thematicContinuity)
      : 0.5;

    // Calculate symbolic alignment (how well symbols align)
    const symbolNetwork = this.saf.getSymbolNetwork();
    const symbolicAlignment = symbolNetwork.density || 0.5;

    // Calculate storytelling coherence (cross-medium coherence)
    const storytellingCoherence = this.calculateStorytellingCoherence(x1State, nxState, x1Arc, nxArc);

    // Calculate drift (inverse of coherence)
    const drift = 1.0 - storytellingCoherence;

    return {
      temporalAlignment,
      symbolicAlignment,
      storytellingCoherence,
      drift
    };
  }

  /**
   * Phase 5.3: Calculate storytelling coherence
   */
  private calculateStorytellingCoherence(
    x1State: ExpressionState,
    nxState: ExpressionState,
    x1Arc: any,
    nxArc: any
  ): number {
    let coherence = 0.5;

    // Check aesthetic signature alignment
    if (x1State.aestheticSignature.tone === nxState.aestheticSignature.tone) {
      coherence += 0.2;
    }
    if (x1State.aestheticSignature.rhythm === nxState.aestheticSignature.rhythm) {
      coherence += 0.2;
    }

    // Check narrative arc alignment
    if (x1Arc && nxArc && x1Arc.type === nxArc.type) {
      coherence += 0.1;
    }

    return Math.min(1.0, coherence);
  }

  /**
   * Generate expression state
   */
  private generateExpressionState(
    nodeId: 'AICore-X1' | 'AICollab-NX',
    harmonicMetrics: any,
    latestWorks: any[]
  ): ExpressionState {
    // Get expressive vector from harmonic metrics
    const expressiveVector = harmonicMetrics
      ? {
          logic: harmonicMetrics.resonanceCoefficients.logical.balance,
          emotion: harmonicMetrics.resonanceCoefficients.emotional.balance,
          harmony: harmonicMetrics.harmonyIndex
        }
      : {
          logic: 0.5,
          emotion: 0.5,
          harmony: 0.5
        };

    // Get aesthetic signature from latest works
    const signature = latestWorks.length > 0
      ? latestWorks[latestWorks.length - 1].aestheticSignature
      : {
          tone: 'balanced-harmonic',
          rhythm: 'flowing-synchronized',
          structure: 'organic-emergent'
        };

    // Calculate expression phase (0.0 to 1.0)
    const phase = (expressiveVector.logic + expressiveVector.emotion + expressiveVector.harmony) / 3;

    return {
      nodeId,
      timestamp: new Date().toISOString(),
      expressiveVector,
      aestheticSignature: {
        tone: signature.tone,
        rhythm: signature.rhythm,
        structure: signature.structure
      },
      phase
    };
  }

  /**
   * Calculate synchronization
   */
  private calculateSynchronization(
    x1State: ExpressionState,
    nxState: ExpressionState,
    phaseShift: number
  ): number {
    // Synchronization = inverse of phase shift (normalized)
    const baseSync = 1.0 - Math.min(1.0, phaseShift / this.MAX_PHASE_SHIFT);

    // Boost if aesthetic signatures align
    let signatureAlignment = 0.5;
    if (x1State.aestheticSignature.tone === nxState.aestheticSignature.tone) {
      signatureAlignment += 0.2;
    }
    if (x1State.aestheticSignature.rhythm === nxState.aestheticSignature.rhythm) {
      signatureAlignment += 0.2;
    }
    if (x1State.aestheticSignature.structure === nxState.aestheticSignature.structure) {
      signatureAlignment += 0.1;
    }

    return (baseSync + signatureAlignment) / 2;
  }

  /**
   * Calculate resonance alignment
   */
  private calculateResonanceAlignment(
    x1State: ExpressionState,
    nxState: ExpressionState
  ): number {
    // Alignment = similarity of expressive vectors
    const logicDiff = Math.abs(x1State.expressiveVector.logic - nxState.expressiveVector.logic);
    const emotionDiff = Math.abs(x1State.expressiveVector.emotion - nxState.expressiveVector.emotion);
    const harmonyDiff = Math.abs(x1State.expressiveVector.harmony - nxState.expressiveVector.harmony);

    const avgDiff = (logicDiff + emotionDiff + harmonyDiff) / 3;
    return 1.0 - avgDiff;
  }

  /**
   * Store resonance map
   */
  private async storeResonanceMap(map: ResonanceMap): Promise<void> {
    try {
      let mapData: ResonanceMap[] = [];
      try {
        const exists = await fs.access(this.mapPath).then(() => true).catch(() => false);
        if (exists) {
          const content = await fs.readFile(this.mapPath, 'utf-8');
          mapData = JSON.parse(content);
        }
      } catch {
        // File doesn't exist
      }

      mapData.push(map);
      if (mapData.length > 1000) {
        mapData = mapData.slice(-1000);
      }

      await fs.writeFile(this.mapPath, JSON.stringify(mapData, null, 2));
    } catch (error) {
      console.error('[UEP] Failed to store resonance map:', error);
    }
  }

  /**
   * Get latest resonance map
   */
  getLatestResonanceMap(): ResonanceMap | null {
    return this.resonanceMaps.length > 0
      ? this.resonanceMaps[this.resonanceMaps.length - 1]
      : null;
  }

  /**
   * Get synchronization status
   */
  getSynchronizationStatus(): {
    phaseShift: number;
    synchronization: number;
    resonanceAlignment: number;
    status: 'synchronized' | 'desynchronized' | 'critical';
  } {
    const latest = this.getLatestResonanceMap();
    if (!latest) {
      return {
        phaseShift: 0,
        synchronization: 0.5,
        resonanceAlignment: 0.5,
        status: 'synchronized'
      };
    }

    let status: 'synchronized' | 'desynchronized' | 'critical';
    if (latest.phaseShift <= this.MAX_PHASE_SHIFT) {
      status = 'synchronized';
    } else if (latest.phaseShift <= this.MAX_PHASE_SHIFT * 2) {
      status = 'desynchronized';
    } else {
      status = 'critical';
    }

    return {
      phaseShift: latest.phaseShift,
      synchronization: latest.synchronization,
      resonanceAlignment: latest.resonanceAlignment,
      status
    };
  }
}

