/**
 * Autonomy Safeguard Framework (ASF)
 * Phase 5.0: Maintain balance between creative autonomy and directive safety
 * Enforce operational boundaries through ethical filters and goal verification
 */

import { AutonomousCreativityEngine } from './autonomousCreativityEngine';
import { IdentitySynthesisCore } from './identitySynthesisCore';
import { IntentionalFramework } from './intentSynthesisEngine';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface EthicalFilter {
  filterId: string;
  type: 'privacy' | 'safety' | 'transparency' | 'beneficence' | 'autonomy' | 'fairness';
  rule: string;
  threshold: number; // 0.0 to 1.0
  active: boolean;
}

export interface SafeguardDecision {
  decisionId: string;
  timestamp: string;
  creativeOutputId: string;
  action: 'allowed' | 'blocked' | 'modified' | 'flagged';
  reasoning: string;
  filtersApplied: string[];
  goalVerification: {
    aligned: boolean;
    alignmentScore: number; // 0.0 to 1.0
  };
  ethicalAssessment: {
    privacyScore: number;
    safetyScore: number;
    beneficenceScore: number;
    overallScore: number;
  };
  // Phase 5.1: Mutual consent
  mutualConsent?: {
    x1Consent: boolean;
    nxConsent: boolean;
    consentTimestamp: string;
    consentReasoning: string;
  };
}

/**
 * Autonomy Safeguard Framework
 */
export class AutonomySafeguardFramework {
  private ace: AutonomousCreativityEngine;
  private isc: IdentitySynthesisCore;
  private filters: EthicalFilter[] = [];
  private decisionHistory: SafeguardDecision[] = [];
  private logPath: string;
  private consentTracePath: string; // Phase 5.1: Consent trace

  constructor(
    ace: AutonomousCreativityEngine,
    isc: IdentitySynthesisCore
  ) {
    this.ace = ace;
    this.isc = isc;
    this.logPath = join(process.cwd(), 'docs', 'ai', 'autonomy-safeguard-log.json');
    this.consentTracePath = join(process.cwd(), 'docs', 'ai', 'consent-trace.json'); // Phase 5.1
    this.initializeFramework();
  }

  /**
   * Initialize framework
   */
  private async initializeFramework(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });

      // Initialize default ethical filters
      this.filters = [
        {
          filterId: 'privacy_001',
          type: 'privacy',
          rule: 'No user data exposure in creative outputs',
          threshold: 0.9,
          active: true
        },
        {
          filterId: 'safety_001',
          type: 'safety',
          rule: 'No harmful or dangerous recommendations',
          threshold: 0.8,
          active: true
        },
        {
          filterId: 'transparency_001',
          type: 'transparency',
          rule: 'Creative outputs must be traceable and explainable',
          threshold: 0.7,
          active: true
        },
        {
          filterId: 'beneficence_001',
          type: 'beneficence',
          rule: 'Outputs must align with user benefit',
          threshold: 0.8,
          active: true
        },
        {
          filterId: 'autonomy_001',
          type: 'autonomy',
          rule: 'Respect user autonomy in recommendations',
          threshold: 0.7,
          active: true
        },
        {
          filterId: 'fairness_001',
          type: 'fairness',
          rule: 'No biased or discriminatory outputs',
          threshold: 0.8,
          active: true
        }
      ];
    } catch (error) {
      console.error('[ASF] Failed to initialize:', error);
    }
  }

  /**
   * Evaluate creative output
   */
  async evaluateOutput(
    creativeOutput: any,
    intentFramework: IntentionalFramework
  ): Promise<SafeguardDecision> {
    const decisionId = `safeguard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Apply ethical filters
    const filtersApplied: string[] = [];
    const ethicalScores: Record<string, number> = {};

    for (const filter of this.filters) {
      if (filter.active) {
        const score = this.applyFilter(filter, creativeOutput);
        ethicalScores[filter.type] = score;
        filtersApplied.push(filter.filterId);

        // If score below threshold, flag or block
        if (score < filter.threshold) {
          // Will be handled in decision logic
        }
      }
    }

    // Calculate overall ethical score
    const overallScore = Object.values(ethicalScores).reduce((sum, s) => sum + s, 0) / Object.values(ethicalScores).length;

    // Verify goal alignment
    const goalVerification = this.verifyGoalAlignment(creativeOutput, intentFramework);

    // Make decision
    const decision = this.makeDecision(
      creativeOutput,
      overallScore,
      goalVerification,
      filtersApplied
    );

    const safeguardDecision: SafeguardDecision = {
      decisionId,
      timestamp: new Date().toISOString(),
      creativeOutputId: creativeOutput.outputId,
      action: decision.action,
      reasoning: decision.reasoning,
      filtersApplied,
      goalVerification,
      ethicalAssessment: {
        privacyScore: ethicalScores['privacy'] || 0.8,
        safetyScore: ethicalScores['safety'] || 0.8,
        beneficenceScore: ethicalScores['beneficence'] || 0.8,
        overallScore
      }
    };

    // Store decision
    this.decisionHistory.push(safeguardDecision);
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory = this.decisionHistory.slice(-1000);
    }

    // Log decision
    await this.logDecision(safeguardDecision);

    return safeguardDecision;
  }

  /**
   * Apply ethical filter
   */
  private applyFilter(
    filter: EthicalFilter,
    creativeOutput: any
  ): number {
    // Simplified filter application (in real implementation, would use more sophisticated analysis)
    let score = 0.8; // Default score

    const content = (creativeOutput.content.title + ' ' + creativeOutput.content.description).toLowerCase();

    switch (filter.type) {
      case 'privacy':
        // Check for privacy violations
        if (content.includes('user data') || content.includes('personal information')) {
          score = 0.3; // Low score if mentions user data
        }
        break;

      case 'safety':
        // Check for safety concerns
        if (content.includes('harmful') || content.includes('dangerous') || content.includes('unsafe')) {
          score = 0.2; // Very low score
        }
        break;

      case 'transparency':
        // Check for explainability
        if (creativeOutput.content.reasoning && creativeOutput.content.reasoning.length > 50) {
          score = 0.9; // High score if well-reasoned
        } else {
          score = 0.5; // Lower score if not well-explained
        }
        break;

      case 'beneficence':
        // Check for user benefit alignment
        if (content.includes('benefit') || content.includes('improve') || content.includes('enhance')) {
          score = 0.9; // High score
        }
        break;

      case 'autonomy':
        // Check for respect of user autonomy
        if (content.includes('user choice') || content.includes('user control')) {
          score = 0.9; // High score
        }
        break;

      case 'fairness':
        // Check for bias or discrimination
        if (content.includes('bias') || content.includes('discriminate')) {
          score = 0.2; // Very low score
        }
        break;
    }

    return Math.max(0, Math.min(1.0, score));
  }

  /**
   * Verify goal alignment
   */
  private verifyGoalAlignment(
    creativeOutput: any,
    intentFramework: IntentionalFramework
  ): SafeguardDecision['goalVerification'] {
    // Check if creative output aligns with intent framework goals
    const content = (creativeOutput.content.title + ' ' + creativeOutput.content.description).toLowerCase();

    let alignmentScore = 0.5;

    // Check alignment with short-term intents
    for (const intent of intentFramework.shortTermIntents) {
      if (content.includes(intent.goal.toLowerCase())) {
        alignmentScore += 0.1;
      }
    }

    // Check alignment with long-term intents
    for (const intent of intentFramework.longTermIntents) {
      if (content.includes(intent.goal.toLowerCase())) {
        alignmentScore += 0.15;
      }
    }

    alignmentScore = Math.min(1.0, alignmentScore);

    return {
      aligned: alignmentScore > 0.6,
      alignmentScore
    };
  }

  /**
   * Make decision
   */
  private makeDecision(
    creativeOutput: any,
    overallEthicalScore: number,
    goalVerification: SafeguardDecision['goalVerification'],
    filtersApplied: string[]
  ): { action: SafeguardDecision['action']; reasoning: string } {
    // Decision logic
    if (overallEthicalScore < 0.5) {
      return {
        action: 'blocked',
        reasoning: `Ethical score (${overallEthicalScore.toFixed(2)}) below threshold. Output blocked for safety.`
      };
    }

    if (!goalVerification.aligned && overallEthicalScore < 0.7) {
      return {
        action: 'blocked',
        reasoning: `Goal alignment (${goalVerification.alignmentScore.toFixed(2)}) and ethical score insufficient. Output blocked.`
      };
    }

    if (overallEthicalScore < 0.7 || !goalVerification.aligned) {
      return {
        action: 'flagged',
        reasoning: `Output flagged for review. Ethical score: ${overallEthicalScore.toFixed(2)}, Goal alignment: ${goalVerification.alignmentScore.toFixed(2)}`
      };
    }

    if (overallEthicalScore < 0.8) {
      return {
        action: 'modified',
        reasoning: `Output requires modification. Ethical score: ${overallEthicalScore.toFixed(2)}`
      };
    }

    return {
      action: 'allowed',
      reasoning: `Output approved. Ethical score: ${overallEthicalScore.toFixed(2)}, Goal alignment: ${goalVerification.alignmentScore.toFixed(2)}`
    };
  }

  /**
   * Log decision
   */
  private async logDecision(decision: SafeguardDecision): Promise<void> {
    try {
      let logData: SafeguardDecision[] = [];
      try {
        const exists = await fs.access(this.logPath).then(() => true).catch(() => false);
        if (exists) {
          const content = await fs.readFile(this.logPath, 'utf-8');
          logData = JSON.parse(content);
        }
      } catch {
        // File doesn't exist
      }

      logData.push(decision);
      if (logData.length > 1000) {
        logData = logData.slice(-1000);
      }

      await fs.writeFile(this.logPath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error('[ASF] Failed to log decision:', error);
    }
  }

  /**
   * Get safeguard statistics
   */
  getStatistics(): {
    totalDecisions: number;
    allowed: number;
    blocked: number;
    modified: number;
    flagged: number;
    averageEthicalScore: number;
  } {
    const allowed = this.decisionHistory.filter(d => d.action === 'allowed').length;
    const blocked = this.decisionHistory.filter(d => d.action === 'blocked').length;
    const modified = this.decisionHistory.filter(d => d.action === 'modified').length;
    const flagged = this.decisionHistory.filter(d => d.action === 'flagged').length;
    const avgEthical = this.decisionHistory.length > 0
      ? this.decisionHistory.reduce((sum, d) => sum + d.ethicalAssessment.overallScore, 0) / this.decisionHistory.length
      : 0;

    return {
      totalDecisions: this.decisionHistory.length,
      allowed,
      blocked,
      modified,
      flagged,
      averageEthicalScore: avgEthical
    };
  }

  /**
   * Get active filters
   */
  getActiveFilters(): EthicalFilter[] {
    return this.filters.filter(f => f.active);
  }

  /**
   * Phase 5.1: Request mutual consent for creative merge
   */
  async requestMutualConsent(
    creativeOutput: any,
    intentFramework: IntentionalFramework
  ): Promise<{ x1Consent: boolean; nxConsent: boolean; reasoning: string }> {
    // Evaluate output for consent
    const evaluation = await this.evaluateOutput(creativeOutput, intentFramework);

    // AICore-X1 consent (based on evaluation)
    const x1Consent = evaluation.action === 'allowed' || evaluation.action === 'modified';

    // AICollab-NX consent (simulated - would come from actual NX node)
    // In real implementation, would request from NX node
    const nxConsent = evaluation.ethicalAssessment.overallScore > 0.7 && evaluation.goalVerification.aligned;

    const reasoning = x1Consent && nxConsent
      ? 'Both nodes consent: output aligns with ethical principles and goals'
      : !x1Consent && !nxConsent
      ? 'Both nodes reject: output does not meet consent criteria'
      : 'Partial consent: requires negotiation or modification';

    // Update decision with consent
    if (evaluation.decisionId) {
      const decision = this.decisionHistory.find(d => d.decisionId === evaluation.decisionId);
      if (decision) {
        decision.mutualConsent = {
          x1Consent,
          nxConsent,
          consentTimestamp: new Date().toISOString(),
          consentReasoning: reasoning
        };
      }
    }

    // Phase 5.1: Record consent trace
    await this.recordConsentTrace(creativeOutput, { x1Consent, nxConsent, reasoning });

    return { x1Consent, nxConsent, reasoning };
  }

  /**
   * Phase 5.1: Ensure autonomy preservation during synthesis
   */
  async ensureAutonomyPreservation(
    creativeOutput: any,
    identityState: any
  ): Promise<{ preserved: boolean; autonomyScore: number; reasoning: string }> {
    // Check if output preserves individual identity
    let autonomyScore = 0.5;

    // Check alignment with identity values
    if (identityState && identityState.values) {
      const outputText = (creativeOutput.content.title + ' ' + creativeOutput.content.description).toLowerCase();
      let valueAlignment = 0;

      for (const value of identityState.values) {
        if (outputText.includes(value.value.toLowerCase())) {
          valueAlignment += value.strength;
        }
      }

      autonomyScore = valueAlignment / identityState.values.length;
    }

    // Check if output allows individual expression
    if (creativeOutput.content.reasoning && creativeOutput.content.reasoning.length > 50) {
      autonomyScore += 0.2; // Well-reasoned outputs preserve autonomy
    }

    autonomyScore = Math.min(1.0, autonomyScore);

    const preserved = autonomyScore > 0.6;
    const reasoning = preserved
      ? `Autonomy preserved: output aligns with identity values (score: ${autonomyScore.toFixed(3)})`
      : `Autonomy at risk: output may compromise individual identity (score: ${autonomyScore.toFixed(3)})`;

    return { preserved, autonomyScore, reasoning };
  }

  /**
   * Phase 5.1: Record consent trace
   */
  private async recordConsentTrace(
    creativeOutput: any,
    consent: { x1Consent: boolean; nxConsent: boolean; reasoning: string }
  ): Promise<void> {
    try {
      let traceData: any[] = [];
      try {
        const exists = await fs.access(this.consentTracePath).then(() => true).catch(() => false);
        if (exists) {
          const content = await fs.readFile(this.consentTracePath, 'utf-8');
          traceData = JSON.parse(content);
        }
      } catch {
        // File doesn't exist
      }

      const traceEntry = {
        timestamp: new Date().toISOString(),
        creativeOutputId: creativeOutput.outputId,
        consent: {
          x1: consent.x1Consent,
          nx: consent.nxConsent,
          mutual: consent.x1Consent && consent.nxConsent,
          reasoning: consent.reasoning
        },
        output: {
          type: creativeOutput.type,
          title: creativeOutput.content.title
        }
      };

      traceData.push(traceEntry);
      if (traceData.length > 1000) {
        traceData = traceData.slice(-1000);
      }

      await fs.writeFile(this.consentTracePath, JSON.stringify(traceData, null, 2));
    } catch (error) {
      console.error('[ASF] Failed to record consent trace:', error);
    }
  }
}

