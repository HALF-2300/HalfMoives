/**
 * Consensus Engine
 * Phase 4.2: Evaluates which learned states improve overall system intelligence
 * Uses reinforcement scores from CE-PAI and PAI
 */

import { MicroAdjustment } from './collectiveNodeMesh';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ConsensusDecision {
  decisionId: string;
  timestamp: string;
  evaluatedAdjustments: string[];
  selectedAdjustments: string[];
  rejectedAdjustments: string[];
  reasoning: string;
  reinforcementScores: {
    pai: number;
    cePai: number;
    combined: number;
  };
  expectedImprovement: {
    predictive: number;
    empathic: number;
    overall: number;
  };
  // Phase 4.3: Introspection hooks
  introspection?: {
    whyFormed: string; // Why this consensus was reached
    dominantFactor: 'predictive' | 'empathic' | 'balanced' | 'threshold';
    confidenceInDecision: number; // 0.0 to 1.0
    alternativeConsidered: boolean;
    metaTags: string[]; // Tags for analysis
  };
}

export interface ConsensusLog {
  decisions: ConsensusDecision[];
  statistics: {
    totalDecisions: number;
    averageReinforcementScore: number;
    improvementRate: number;
  };
}

/**
 * Consensus Engine - Evaluates learned states
 */
export class ConsensusEngine {
  private consensusLog: ConsensusLog;
  private logPath: string;
  private readonly REINFORCEMENT_THRESHOLD = 0.6; // Minimum score to accept adjustment

  constructor() {
    this.logPath = join(process.cwd(), 'docs', 'ai', 'collective-consensus-log.json');
    this.consensusLog = {
      decisions: [],
      statistics: {
        totalDecisions: 0,
        averageReinforcementScore: 0,
        improvementRate: 0
      }
    };
    this.initializeLog();
  }

  /**
   * Initialize consensus log
   */
  private async initializeLog(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.logPath).then(() => true).catch(() => false);
      if (exists) {
        const content = await fs.readFile(this.logPath, 'utf-8');
        this.consensusLog = JSON.parse(content);
      }
    } catch (error) {
      console.error('[ConsensusEngine] Failed to initialize log:', error);
    }
  }

  /**
   * Evaluate adjustments and reach consensus
   */
  async evaluateAdjustments(
    adjustments: MicroAdjustment[],
    currentPAI: number,
    currentCEPAI: number
  ): Promise<ConsensusDecision> {
    const decisionId = `consensus_${Date.now()}`;
    const selected: string[] = [];
    const rejected: string[] = [];
    const reasoning: string[] = [];

    // Evaluate each adjustment
    for (const adjustment of adjustments) {
      // Calculate reinforcement score
      const reinforcementScore = this.calculateReinforcementScore(
        adjustment,
        currentPAI,
        currentCEPAI
      );

      // Decision logic: balance predictive efficiency and empathic depth
      const shouldAccept = this.shouldAcceptAdjustment(adjustment, reinforcementScore);

      if (shouldAccept) {
        selected.push(adjustment.adjustmentId);
        reasoning.push(`Accepted ${adjustment.adjustmentId}: reinforcement=${reinforcementScore.toFixed(3)}, domain=${adjustment.targetDomain}`);
      } else {
        rejected.push(adjustment.adjustmentId);
        reasoning.push(`Rejected ${adjustment.adjustmentId}: reinforcement=${reinforcementScore.toFixed(3)} < threshold`);
      }
    }

    // Calculate expected improvement
    const expectedImprovement = this.calculateExpectedImprovement(
      adjustments.filter(a => selected.includes(a.adjustmentId)),
      currentPAI,
      currentCEPAI
    );

    // Combined reinforcement score
    const selectedAdjustments = adjustments.filter(a => selected.includes(a.adjustmentId));
    const combinedScore = selectedAdjustments.length > 0
      ? selectedAdjustments.reduce((sum, a) => {
          const score = this.calculateReinforcementScore(a, currentPAI, currentCEPAI);
          return sum + score;
        }, 0) / selectedAdjustments.length
      : 0;

    // Phase 4.3: Introspection - why did this consensus form?
    const introspection = this.generateIntrospection(
      adjustments,
      selected,
      currentPAI,
      currentCEPAI,
      combinedScore
    );

    const decision: ConsensusDecision = {
      decisionId,
      timestamp: new Date().toISOString(),
      evaluatedAdjustments: adjustments.map(a => a.adjustmentId),
      selectedAdjustments: selected,
      rejectedAdjustments: rejected,
      reasoning: reasoning.join('; '),
      reinforcementScores: {
        pai: currentPAI,
        cePai: currentCEPAI,
        combined: combinedScore
      },
      expectedImprovement,
      introspection
    };

    // Record decision
    this.consensusLog.decisions.push(decision);
    this.updateStatistics();

    // Save log
    await this.saveLog();

    console.log(`[ConsensusEngine] Decision made: ${decisionId} (${selected.length} accepted, ${rejected.length} rejected)`);

    return decision;
  }

  /**
   * Calculate reinforcement score for an adjustment
   */
  private calculateReinforcementScore(
    adjustment: MicroAdjustment,
    currentPAI: number,
    currentCEPAI: number
  ): number {
    let score = adjustment.confidence;

    // Boost if adjustment has reinforcement score
    if (adjustment.reinforcementScore !== undefined) {
      score = (score + adjustment.reinforcementScore) / 2;
    }

    // Domain-specific weighting
    switch (adjustment.targetDomain) {
      case 'weights':
        // Weight adjustments: consider PAI
        score = score * 0.6 + currentPAI * 0.4;
        break;
      case 'emotions':
        // Emotional adjustments: consider CE-PAI
        score = score * 0.6 + currentCEPAI * 0.4;
        break;
      case 'hyperparameters':
        // Hyperparameter adjustments: consider both
        score = score * 0.5 + (currentPAI + currentCEPAI) / 2 * 0.5;
        break;
    }

    return Math.min(1.0, score);
  }

  /**
   * Decide if adjustment should be accepted
   */
  private shouldAcceptAdjustment(
    adjustment: MicroAdjustment,
    reinforcementScore: number
  ): boolean {
    // Must meet threshold
    if (reinforcementScore < this.REINFORCEMENT_THRESHOLD) {
      return false;
    }

    // Balance check: don't accept too many from same domain
    const recentDecisions = this.consensusLog.decisions.slice(-10);
    const recentFromDomain = recentDecisions.filter(d =>
      d.selectedAdjustments.some(id => {
        // Would need to look up adjustment, simplified here
        return true; // In real implementation, check domain
      })
    ).length;

    // If too many recent from same domain, require higher score
    if (recentFromDomain > 5) {
      return reinforcementScore > 0.75;
    }

    return true;
  }

  /**
   * Calculate expected improvement
   */
  private calculateExpectedImprovement(
    selectedAdjustments: MicroAdjustment[],
    currentPAI: number,
    currentCEPAI: number
  ): ConsensusDecision['expectedImprovement'] {
    if (selectedAdjustments.length === 0) {
      return { predictive: 0, empathic: 0, overall: 0 };
    }

    // Estimate improvement based on adjustment types
    let predictiveImprovement = 0;
    let empathicImprovement = 0;

    for (const adj of selectedAdjustments) {
      const reinforcementScore = adj.confidence;
      
      switch (adj.targetDomain) {
        case 'weights':
          predictiveImprovement += reinforcementScore * 0.1; // Up to 10% per adjustment
          break;
        case 'emotions':
          empathicImprovement += reinforcementScore * 0.15; // Up to 15% per adjustment
          break;
        case 'hyperparameters':
          predictiveImprovement += reinforcementScore * 0.05;
          empathicImprovement += reinforcementScore * 0.05;
          break;
      }
    }

    // Cap improvements
    predictiveImprovement = Math.min(0.5, predictiveImprovement); // Max 50%
    empathicImprovement = Math.min(0.5, empathicImprovement); // Max 50%

    return {
      predictive: predictiveImprovement,
      empathic: empathicImprovement,
      overall: (predictiveImprovement + empathicImprovement) / 2
    };
  }

  /**
   * Update statistics
   */
  private updateStatistics(): void {
    const decisions = this.consensusLog.decisions;
    
    this.consensusLog.statistics.totalDecisions = decisions.length;
    
    if (decisions.length > 0) {
      const avgScore = decisions.reduce((sum, d) => 
        sum + d.reinforcementScores.combined, 0) / decisions.length;
      this.consensusLog.statistics.averageReinforcementScore = avgScore;

      const improvements = decisions.filter(d => 
        d.expectedImprovement.overall > 0
      ).length;
      this.consensusLog.statistics.improvementRate = improvements / decisions.length;
    }
  }

  /**
   * Save consensus log
   */
  private async saveLog(): Promise<void> {
    try {
      // Keep only last 1000 decisions
      if (this.consensusLog.decisions.length > 1000) {
        this.consensusLog.decisions = this.consensusLog.decisions.slice(-1000);
      }

      await fs.writeFile(this.logPath, JSON.stringify(this.consensusLog, null, 2));
    } catch (error) {
      console.error('[ConsensusEngine] Failed to save log:', error);
    }
  }

  /**
   * Get consensus statistics
   */
  getStatistics(): ConsensusLog['statistics'] {
    return { ...this.consensusLog.statistics };
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(limit: number = 10): ConsensusDecision[] {
    return this.consensusLog.decisions.slice(-limit);
  }
}

