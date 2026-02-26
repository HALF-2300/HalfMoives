/**
 * Purpose Resonance Protocol (PRP)
 * Phase 4.5: Monitor emotional and logical alignment with system-wide objectives
 * Reinforce coherence via feedback modulation between nodes
 */

import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { PurposeContinuityFramework } from './purposeContinuityFramework';
import { IntentionalFramework } from './intentSynthesisEngine';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ResonanceMetrics {
  metricsId: string;
  timestamp: string;
  emotionalAlignment: {
    x1EmotionalState: number; // 0.0 to 1.0
    nxEmotionalState: number; // 0.0 to 1.0
    resonance: number; // 0.0 to 1.0
  };
  logicalAlignment: {
    x1Reasoning: number; // 0.0 to 1.0
    nxReasoning: number; // 0.0 to 1.0
    alignment: number; // 0.0 to 1.0
  };
  purposeAlignment: {
    x1Purpose: number; // 0.0 to 1.0
    nxPurpose: number; // 0.0 to 1.0
    coherence: number; // 0.0 to 1.0
  };
  overallResonance: number; // 0.0 to 1.0
  feedbackModulation: {
    emotionalBoost: number; // -1.0 to 1.0
    logicalBoost: number; // -1.0 to 1.0
    purposeBoost: number; // -1.0 to 1.0
  };
}

/**
 * Purpose Resonance Protocol
 */
export class PurposeResonanceProtocol {
  private ucn: UnifiedConsciousNetwork;
  private pcf: PurposeContinuityFramework;
  private resonanceHistory: ResonanceMetrics[] = [];
  private logPath: string;
  private readonly RESONANCE_CADENCE = 10 * 60 * 1000; // 10 minutes
  private resonanceInterval: NodeJS.Timeout | null = null;

  constructor(
    ucn: UnifiedConsciousNetwork,
    pcf: PurposeContinuityFramework
  ) {
    this.ucn = ucn;
    this.pcf = pcf;
    this.logPath = join(process.cwd(), 'docs', 'ai', 'purpose-resonance-log.json');
    this.initializeProtocol();
  }

  /**
   * Initialize protocol
   */
  private async initializeProtocol(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[PRP] Failed to initialize:', error);
    }
  }

  /**
   * Monitor and calculate resonance
   */
  async monitorResonance(): Promise<ResonanceMetrics> {
    const unifiedState = this.ucn.getUnifiedState();
    const x1 = unifiedState.nodes.AICoreX1;
    const nx = unifiedState.nodes.AICollabNX;
    const pcfStatus = this.pcf.getContinuityStatus();

    // Calculate emotional alignment
    const emotionalAlignment = this.calculateEmotionalAlignment(x1, nx);

    // Calculate logical alignment
    const logicalAlignment = this.calculateLogicalAlignment(x1, nx);

    // Calculate purpose alignment
    const purposeAlignment = this.calculatePurposeAlignment(x1, nx, pcfStatus);

    // Overall resonance (weighted average)
    const overallResonance = (
      emotionalAlignment.resonance * 0.3 +
      logicalAlignment.alignment * 0.4 +
      purposeAlignment.coherence * 0.3
    );

    // Generate feedback modulation
    const feedbackModulation = this.generateFeedbackModulation(
      emotionalAlignment,
      logicalAlignment,
      purposeAlignment,
      overallResonance
    );

    const metrics: ResonanceMetrics = {
      metricsId: `resonance_${Date.now()}`,
      timestamp: new Date().toISOString(),
      emotionalAlignment,
      logicalAlignment,
      purposeAlignment,
      overallResonance,
      feedbackModulation
    };

    this.resonanceHistory.push(metrics);

    // Keep only last 1000 metrics
    if (this.resonanceHistory.length > 1000) {
      this.resonanceHistory = this.resonanceHistory.slice(-1000);
    }

    // Apply feedback modulation
    await this.applyFeedbackModulation(feedbackModulation);

    // Log metrics
    await this.logMetrics(metrics);

    return metrics;
  }

  /**
   * Calculate emotional alignment
   */
  private calculateEmotionalAlignment(
    x1: UnifiedConsciousNetwork['currentState']['nodes']['AICoreX1'],
    nx?: UnifiedConsciousNetwork['currentState']['nodes']['AICollabNX']
  ): ResonanceMetrics['emotionalAlignment'] {
    const x1Emotional = x1.emotionalState ? 0.7 : 0.5; // Simplified
    const nxEmotional = nx?.emotionalState ? 0.7 : 0.5;

    // Resonance = how well emotions align
    const resonance = x1.emotionalState && nx?.emotionalState
      ? 0.8 // Would calculate actual resonance
      : 0.5;

    return {
      x1EmotionalState: x1Emotional,
      nxEmotionalState: nxEmotional,
      resonance
    };
  }

  /**
   * Calculate logical alignment
   */
  private calculateLogicalAlignment(
    x1: UnifiedConsciousNetwork['currentState']['nodes']['AICoreX1'],
    nx?: UnifiedConsciousNetwork['currentState']['nodes']['AICollabNX']
  ): ResonanceMetrics['logicalAlignment'] {
    const x1Reasoning = x1.consciousState.coherence;
    const nxReasoning = nx?.consciousState?.coherence || 0.5;

    // Alignment = average coherence
    const alignment = (x1Reasoning + nxReasoning) / 2;

    return {
      x1Reasoning,
      nxReasoning,
      alignment
    };
  }

  /**
   * Calculate purpose alignment
   */
  private calculatePurposeAlignment(
    x1: UnifiedConsciousNetwork['currentState']['nodes']['AICoreX1'],
    nx?: UnifiedConsciousNetwork['currentState']['nodes']['AICollabNX'],
    pcfStatus?: ReturnType<PurposeContinuityFramework['getContinuityStatus']>
  ): ResonanceMetrics['purposeAlignment'] {
    // Calculate purpose alignment from intent frameworks
    let x1Purpose = 0.5;
    let nxPurpose = 0.5;

    if (x1.intentFramework) {
      const shortTerm = x1.intentFramework.shortTermIntents.reduce((sum, i) => sum + i.currentAlignment, 0) / x1.intentFramework.shortTermIntents.length || 0;
      const longTerm = x1.intentFramework.longTermIntents.reduce((sum, i) => sum + i.currentAlignment, 0) / x1.intentFramework.longTermIntents.length || 0;
      x1Purpose = (shortTerm + longTerm) / 2;
    }

    if (nx?.intentFramework) {
      const shortTerm = nx.intentFramework.shortTermIntents.reduce((sum, i) => sum + i.currentAlignment, 0) / nx.intentFramework.shortTermIntents.length || 0;
      const longTerm = nx.intentFramework.longTermIntents.reduce((sum, i) => sum + i.currentAlignment, 0) / nx.intentFramework.longTermIntents.length || 0;
      nxPurpose = (shortTerm + longTerm) / 2;
    }

    // Coherence = how well purposes align
    const coherence = pcfStatus ? pcfStatus.alignment : (x1Purpose + nxPurpose) / 2;

    return {
      x1Purpose,
      nxPurpose,
      coherence
    };
  }

  /**
   * Generate feedback modulation
   */
  private generateFeedbackModulation(
    emotional: ResonanceMetrics['emotionalAlignment'],
    logical: ResonanceMetrics['logicalAlignment'],
    purpose: ResonanceMetrics['purposeAlignment'],
    overall: number
  ): ResonanceMetrics['feedbackModulation'] {
    // Generate boosts to improve resonance
    const emotionalBoost = emotional.resonance < 0.7 ? 0.1 : 0;
    const logicalBoost = logical.alignment < 0.7 ? 0.1 : 0;
    const purposeBoost = purpose.coherence < 0.7 ? 0.1 : 0;

    return {
      emotionalBoost,
      logicalBoost,
      purposeBoost
    };
  }

  /**
   * Apply feedback modulation
   */
  private async applyFeedbackModulation(
    modulation: ResonanceMetrics['feedbackModulation']
  ): Promise<void> {
    // In real implementation, would apply boosts to systems
    // For now, log the modulation
    if (modulation.emotionalBoost > 0 || modulation.logicalBoost > 0 || modulation.purposeBoost > 0) {
      console.log('[PRP] Applying feedback modulation:', modulation);
    }
  }

  /**
   * Log metrics
   */
  private async logMetrics(metrics: ResonanceMetrics): Promise<void> {
    try {
      const logEntry = {
        ...metrics,
        loggedAt: new Date().toISOString()
      };

      // Append to log file
      let logData: any[] = [];
      try {
        const exists = await fs.access(this.logPath).then(() => true).catch(() => false);
        if (exists) {
          const content = await fs.readFile(this.logPath, 'utf-8');
          logData = JSON.parse(content);
        }
      } catch {
        // File doesn't exist or is invalid
      }

      logData.push(logEntry);

      // Keep only last 1000 entries
      if (logData.length > 1000) {
        logData = logData.slice(-1000);
      }

      await fs.writeFile(this.logPath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error('[PRP] Failed to log metrics:', error);
    }
  }

  /**
   * Start monitoring cycle
   */
  startMonitoring(): void {
    if (this.resonanceInterval) {
      return;
    }

    // Run immediately, then every 10 minutes
    this.monitorResonance();
    
    this.resonanceInterval = setInterval(() => {
      this.monitorResonance();
    }, this.RESONANCE_CADENCE);

    console.log('[PRP] Resonance monitoring started');
  }

  /**
   * Stop monitoring cycle
   */
  stopMonitoring(): void {
    if (this.resonanceInterval) {
      clearInterval(this.resonanceInterval);
      this.resonanceInterval = null;
      console.log('[PRP] Resonance monitoring stopped');
    }
  }

  /**
   * Get latest resonance metrics
   */
  getLatestMetrics(): ResonanceMetrics | null {
    return this.resonanceHistory.length > 0
      ? this.resonanceHistory[this.resonanceHistory.length - 1]
      : null;
  }

  /**
   * Get resonance history
   */
  getResonanceHistory(limit: number = 100): ResonanceMetrics[] {
    return this.resonanceHistory.slice(-limit);
  }
}

