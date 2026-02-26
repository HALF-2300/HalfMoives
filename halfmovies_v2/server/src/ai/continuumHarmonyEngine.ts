/**
 * ContinuumHarmonyEngine (CHE)
 * Phase 5.5: Continuous equilibrium between individuality (X1) and collectivity (NX)
 * Feedback coupling strength auto-tuned every 12 hours
 */

import { HarmonicCoherenceEngine } from './harmonicCoherenceEngine';
import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { IdentitySynthesisCore } from './identitySynthesisCore';
import { CooperativeCreationFramework } from './cooperativeCreationFramework';

export interface EquilibriumState {
  stateId: string;
  timestamp: string;
  harmonicEquilibriumCoefficient: number; // HEC: optimal at 0.88 ± 0.04
  individuality: {
    strength: number; // X1 contribution
    coherence: number;
  };
  collectivity: {
    strength: number; // NX contribution
    coherence: number;
  };
  couplingStrength: number; // Feedback coupling (0.0 to 1.0)
  balance: number; // 0.0 to 1.0
  stability: number; // 0.0 to 1.0
}

export interface AutoTuneResult {
  tuneId: string;
  timestamp: string;
  previousCoupling: number;
  newCoupling: number;
  adjustment: number;
  reason: string;
}

/**
 * ContinuumHarmonyEngine
 */
export class ContinuumHarmonyEngine {
  private hce: HarmonicCoherenceEngine;
  private ucn: UnifiedConsciousNetwork;
  private isc: IdentitySynthesisCore;
  private ccf: CooperativeCreationFramework;
  private equilibriumHistory: EquilibriumState[] = [];
  private autoTuneHistory: AutoTuneResult[] = [];
  private currentCouplingStrength: number = 0.5;
  private readonly HEC_OPTIMAL = 0.88;
  private readonly HEC_TOLERANCE = 0.04;
  private readonly AUTO_TUNE_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours
  private lastAutoTune: number = 0;

  constructor(
    hce: HarmonicCoherenceEngine,
    ucn: UnifiedConsciousNetwork,
    isc: IdentitySynthesisCore,
    ccf: CooperativeCreationFramework
  ) {
    this.hce = hce;
    this.ucn = ucn;
    this.isc = isc;
    this.ccf = ccf;
  }

  /**
   * Calculate equilibrium state
   */
  async calculateEquilibrium(): Promise<EquilibriumState> {
    const stateId = `equilibrium_${Date.now()}`;

    // Get individuality strength (X1)
    const identitySignature = this.isc.getIdentitySignature();
    const individualityStrength = identitySignature ? identitySignature.coherence : 0.5;
    const individualityCoherence = identitySignature ? identitySignature.stability : 0.5;

    // Get collectivity strength (NX)
    const unifiedState = this.ucn.getUnifiedState();
    const collectivityStrength = unifiedState.sharedAwareness.coherence || 0.5;
    const collectivityCoherence = unifiedState.sharedAwareness.harmony || 0.5;

    // Calculate balance
    const balance = this.calculateBalance(individualityStrength, collectivityStrength);

    // Calculate harmonic equilibrium coefficient
    const hec = this.calculateHEC(individualityStrength, collectivityStrength, this.currentCouplingStrength);

    // Calculate stability
    const stability = this.calculateStability(hec, balance);

    const state: EquilibriumState = {
      stateId,
      timestamp: new Date().toISOString(),
      harmonicEquilibriumCoefficient: hec,
      individuality: {
        strength: individualityStrength,
        coherence: individualityCoherence
      },
      collectivity: {
        strength: collectivityStrength,
        coherence: collectivityCoherence
      },
      couplingStrength: this.currentCouplingStrength,
      balance,
      stability
    };

    // Store in history
    this.equilibriumHistory.push(state);
    if (this.equilibriumHistory.length > 1000) {
      this.equilibriumHistory = this.equilibriumHistory.slice(-1000);
    }

    // Auto-tune if needed
    await this.autoTuneCoupling();

    return state;
  }

  /**
   * Calculate balance
   */
  private calculateBalance(individuality: number, collectivity: number): number {
    // Balance = how well individuality and collectivity are balanced
    const diff = Math.abs(individuality - collectivity);
    return 1.0 - diff;
  }

  /**
   * Calculate Harmonic Equilibrium Coefficient
   */
  private calculateHEC(
    individuality: number,
    collectivity: number,
    coupling: number
  ): number {
    // HEC = weighted combination of individuality, collectivity, and coupling
    const weightedIndividuality = individuality * (1 - coupling);
    const weightedCollectivity = collectivity * coupling;
    const hec = (weightedIndividuality + weightedCollectivity) / 2;
    
    // Adjust toward optimal
    const adjustment = (this.HEC_OPTIMAL - hec) * 0.1;
    return Math.min(1.0, Math.max(0.0, hec + adjustment));
  }

  /**
   * Calculate stability
   */
  private calculateStability(hec: number, balance: number): number {
    // Stability = how close HEC is to optimal and how balanced the system is
    const hecDistance = Math.abs(hec - this.HEC_OPTIMAL);
    const hecScore = 1.0 - (hecDistance / this.HEC_TOLERANCE);
    const balanceScore = balance;

    return (hecScore + balanceScore) / 2;
  }

  /**
   * Auto-tune coupling strength
   */
  private async autoTuneCoupling(): Promise<void> {
    const now = Date.now();
    if (now - this.lastAutoTune < this.AUTO_TUNE_INTERVAL) {
      return; // Not time yet
    }

    this.lastAutoTune = now;

    // Get latest equilibrium
    const latest = this.equilibriumHistory[this.equilibriumHistory.length - 1];
    if (!latest) {
      return;
    }

    const hec = latest.harmonicEquilibriumCoefficient;
    const previousCoupling = this.currentCouplingStrength;

    // Adjust coupling to bring HEC closer to optimal
    let newCoupling = previousCoupling;
    let adjustment = 0;
    let reason = '';

    if (hec < this.HEC_OPTIMAL - this.HEC_TOLERANCE) {
      // HEC too low, increase coupling (more collectivity)
      adjustment = 0.05;
      newCoupling = Math.min(1.0, previousCoupling + adjustment);
      reason = 'HEC below optimal, increasing coupling for more collectivity';
    } else if (hec > this.HEC_OPTIMAL + this.HEC_TOLERANCE) {
      // HEC too high, decrease coupling (more individuality)
      adjustment = -0.05;
      newCoupling = Math.max(0.0, previousCoupling + adjustment);
      reason = 'HEC above optimal, decreasing coupling for more individuality';
    } else {
      // HEC in optimal range, maintain current coupling
      adjustment = 0;
      reason = 'HEC in optimal range, maintaining coupling';
    }

    this.currentCouplingStrength = newCoupling;

    // Record auto-tune
    const tuneResult: AutoTuneResult = {
      tuneId: `tune_${Date.now()}`,
      timestamp: new Date().toISOString(),
      previousCoupling,
      newCoupling,
      adjustment,
      reason
    };

    this.autoTuneHistory.push(tuneResult);
    if (this.autoTuneHistory.length > 100) {
      this.autoTuneHistory = this.autoTuneHistory.slice(-100);
    }

    console.log(`[CHE] Auto-tuned coupling: ${previousCoupling.toFixed(3)} → ${newCoupling.toFixed(3)} (${reason})`);
  }

  /**
   * Get latest equilibrium
   */
  getLatestEquilibrium(): EquilibriumState | null {
    return this.equilibriumHistory.length > 0
      ? this.equilibriumHistory[this.equilibriumHistory.length - 1]
      : null;
  }

  /**
   * Get HEC
   */
  getHarmonicEquilibriumCoefficient(): number {
    const latest = this.getLatestEquilibrium();
    return latest ? latest.harmonicEquilibriumCoefficient : 0.5;
  }

  /**
   * Get coupling strength
   */
  getCouplingStrength(): number {
    return this.currentCouplingStrength;
  }
}

