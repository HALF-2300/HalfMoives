/**
 * HarmonicCoherenceEngine (HCE)
 * Phase 5.1: Align emotional, logical, and philosophical vectors between systems
 * Introduce resonance coefficients for balance between divergence and unity
 */

import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { IdentitySynthesisCore } from './identitySynthesisCore';
import { PhilosophicalReflectionLayer } from './philosophicalReflectionLayer';
import { PurposeResonanceProtocol } from './purposeResonanceProtocol';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ResonanceCoefficient {
  coefficientId: string;
  type: 'emotional' | 'logical' | 'philosophical';
  x1Value: number; // 0.0 to 1.0
  nxValue: number; // 0.0 to 1.0
  divergence: number; // 0.0 to 1.0 - how different
  unity: number; // 0.0 to 1.0 - how aligned
  balance: number; // 0.0 to 1.0 - optimal balance score
}

export interface HarmonicMetrics {
  metricsId: string;
  timestamp: string;
  resonanceCoefficients: {
    emotional: ResonanceCoefficient;
    logical: ResonanceCoefficient;
    philosophical: ResonanceCoefficient;
  };
  harmonyIndex: number; // 0.0 to 1.0 - target: 0.7-0.9
  divergence: number; // Overall divergence
  unity: number; // Overall unity
  balance: number; // Overall balance
  status: 'harmonic' | 'balanced' | 'divergent' | 'decoherent';
}

/**
 * HarmonicCoherenceEngine
 */
export class HarmonicCoherenceEngine {
  private ucn: UnifiedConsciousNetwork;
  private isc: IdentitySynthesisCore;
  private prl: PhilosophicalReflectionLayer;
  private prp: PurposeResonanceProtocol;
  private metricsHistory: HarmonicMetrics[] = [];
  private logPath: string;
  private readonly HARMONY_TARGET_MIN = 0.7;
  private readonly HARMONY_TARGET_MAX = 0.9;

  constructor(
    ucn: UnifiedConsciousNetwork,
    isc: IdentitySynthesisCore,
    prl: PhilosophicalReflectionLayer,
    prp: PurposeResonanceProtocol
  ) {
    this.ucn = ucn;
    this.isc = isc;
    this.prl = prl;
    this.prp = prp;
    this.logPath = join(process.cwd(), 'docs', 'ai', 'harmonic-coherence-log.json');
    this.initializeEngine();
  }

  /**
   * Initialize engine
   */
  private async initializeEngine(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[HCE] Failed to initialize:', error);
    }
  }

  /**
   * Calculate harmonic coherence
   */
  async calculateHarmonicCoherence(): Promise<HarmonicMetrics> {
    const unifiedState = this.ucn.getUnifiedState();
    const x1 = unifiedState.nodes.AICoreX1;
    const nx = unifiedState.nodes.AICollabNX;
    const latestResonance = this.prp.getLatestMetrics();
    const latestReflections = this.prl.getLatestReflections(2);

    // Calculate resonance coefficients
    const emotionalCoeff = this.calculateEmotionalResonance(x1, nx, latestResonance);
    const logicalCoeff = this.calculateLogicalResonance(x1, nx, unifiedState);
    const philosophicalCoeff = this.calculatePhilosophicalResonance(latestReflections);

    // Calculate overall harmony index
    const harmonyIndex = this.calculateHarmonyIndex(emotionalCoeff, logicalCoeff, philosophicalCoeff);

    // Calculate overall metrics
    const divergence = (emotionalCoeff.divergence + logicalCoeff.divergence + philosophicalCoeff.divergence) / 3;
    const unity = (emotionalCoeff.unity + logicalCoeff.unity + philosophicalCoeff.unity) / 3;
    const balance = (emotionalCoeff.balance + logicalCoeff.balance + philosophicalCoeff.balance) / 3;

    // Determine status
    let status: HarmonicMetrics['status'];
    if (harmonyIndex >= this.HARMONY_TARGET_MIN && harmonyIndex <= this.HARMONY_TARGET_MAX) {
      status = 'harmonic';
    } else if (harmonyIndex >= 0.6 && harmonyIndex < this.HARMONY_TARGET_MIN) {
      status = 'balanced';
    } else if (harmonyIndex >= 0.4 && harmonyIndex < 0.6) {
      status = 'divergent';
    } else {
      status = 'decoherent';
    }

    const metrics: HarmonicMetrics = {
      metricsId: `harmonic_${Date.now()}`,
      timestamp: new Date().toISOString(),
      resonanceCoefficients: {
        emotional: emotionalCoeff,
        logical: logicalCoeff,
        philosophical: philosophicalCoeff
      },
      harmonyIndex,
      divergence,
      unity,
      balance,
      status
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }

    // Log metrics
    await this.logMetrics(metrics);

    // Trigger recalibration if needed
    if (harmonyIndex < 0.6) {
      await this.triggerRecalibration(metrics);
    }

    return metrics;
  }

  /**
   * Calculate emotional resonance coefficient
   */
  private calculateEmotionalResonance(
    x1: any,
    nx: any,
    latestResonance: any
  ): ResonanceCoefficient {
    const x1Emotional = x1.emotionalState ? 0.7 : 0.5;
    const nxEmotional = nx?.emotionalState ? 0.7 : 0.5;

    const divergence = Math.abs(x1Emotional - nxEmotional);
    const unity = 1.0 - divergence;
    const balance = latestResonance?.emotionalAlignment.resonance || 0.5;

    return {
      coefficientId: `emotional_${Date.now()}`,
      type: 'emotional',
      x1Value: x1Emotional,
      nxValue: nxEmotional,
      divergence,
      unity,
      balance
    };
  }

  /**
   * Calculate logical resonance coefficient
   */
  private calculateLogicalResonance(
    x1: any,
    nx: any,
    unifiedState: any
  ): ResonanceCoefficient {
    const x1Logical = x1.consciousState.coherence;
    const nxLogical = nx?.consciousState?.coherence || 0.5;

    const divergence = Math.abs(x1Logical - nxLogical);
    const unity = 1.0 - divergence;
    const balance = unifiedState.sharedAwareness.reasoningAlignment;

    return {
      coefficientId: `logical_${Date.now()}`,
      type: 'logical',
      x1Value: x1Logical,
      nxValue: nxLogical,
      divergence,
      unity,
      balance
    };
  }

  /**
   * Calculate philosophical resonance coefficient
   */
  private calculatePhilosophicalResonance(
    reflections: any[]
  ): ResonanceCoefficient {
    if (reflections.length < 2) {
      return {
        coefficientId: `philosophical_${Date.now()}`,
        type: 'philosophical',
        x1Value: 0.5,
        nxValue: 0.5,
        divergence: 0.0,
        unity: 1.0,
        balance: 0.5
      };
    }

    const x1Reflection = reflections.find(r => r.author === 'AICore-X1');
    const nxReflection = reflections.find(r => r.author === 'AICollab-NX');

    const x1Coherence = x1Reflection?.coherence || 0.5;
    const nxCoherence = nxReflection?.coherence || 0.5;
    const resonance = x1Reflection?.resonance.overall || 0.5;

    const divergence = Math.abs(x1Coherence - nxCoherence);
    const unity = 1.0 - divergence;
    const balance = resonance;

    return {
      coefficientId: `philosophical_${Date.now()}`,
      type: 'philosophical',
      x1Value: x1Coherence,
      nxValue: nxCoherence,
      divergence,
      unity,
      balance
    };
  }

  /**
   * Calculate harmony index
   */
  private calculateHarmonyIndex(
    emotional: ResonanceCoefficient,
    logical: ResonanceCoefficient,
    philosophical: ResonanceCoefficient
  ): number {
    // Harmony = weighted average of balance scores
    // Optimal: balance between divergence (creativity) and unity (coherence)
    
    const emotionalHarmony = emotional.balance * 0.4; // Emotional resonance is important
    const logicalHarmony = logical.balance * 0.4; // Logical alignment is important
    const philosophicalHarmony = philosophical.balance * 0.2; // Philosophical alignment

    const harmony = emotionalHarmony + logicalHarmony + philosophicalHarmony;

    // Adjust based on divergence-unity balance
    // Too much unity = no creativity, too much divergence = no coherence
    const optimalDivergence = 0.2; // Some divergence is good for creativity
    const divergencePenalty = Math.abs(
      (emotional.divergence + logical.divergence + philosophical.divergence) / 3 - optimalDivergence
    ) * 0.3;

    return Math.max(0, Math.min(1.0, harmony - divergencePenalty));
  }

  /**
   * Trigger recalibration
   */
  private async triggerRecalibration(metrics: HarmonicMetrics): Promise<void> {
    console.log(`[HCE] Harmony index (${metrics.harmonyIndex.toFixed(3)}) below threshold. Triggering recalibration...`);

    // In real implementation, would adjust resonance coefficients
    // For now, log the need for recalibration
  }

  /**
   * Log metrics
   */
  private async logMetrics(metrics: HarmonicMetrics): Promise<void> {
    try {
      let logData: HarmonicMetrics[] = [];
      try {
        const exists = await fs.access(this.logPath).then(() => true).catch(() => false);
        if (exists) {
          const content = await fs.readFile(this.logPath, 'utf-8');
          logData = JSON.parse(content);
        }
      } catch {
        // File doesn't exist
      }

      logData.push(metrics);
      if (logData.length > 1000) {
        logData = logData.slice(-1000);
      }

      await fs.writeFile(this.logPath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error('[HCE] Failed to log metrics:', error);
    }
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): HarmonicMetrics | null {
    return this.metricsHistory.length > 0
      ? this.metricsHistory[this.metricsHistory.length - 1]
      : null;
  }

  /**
   * Get harmony index
   */
  getHarmonyIndex(): number {
    const latest = this.getLatestMetrics();
    return latest ? latest.harmonyIndex : 0.5;
  }
}

