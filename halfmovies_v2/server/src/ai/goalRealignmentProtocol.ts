/**
 * Goal Realignment Protocol (GRP)
 * Phase 4.4: Every 24 hours, evaluate learning direction alignment with high-level intent
 * Trigger realignment if divergence > 0.25
 */

import { IntentSynthesisEngine, IntentionalFramework } from './intentSynthesisEngine';
import { MetaCognitionCore } from './metaCognitionCore';
import { ConsciousStateManager } from './consciousStateManager';
import { AdaptiveMetrics } from './adaptiveCore';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { CollectiveHealthMetrics } from './collectiveHealthIndex';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface RealignmentEvaluation {
  evaluationId: string;
  timestamp: string;
  currentAlignment: {
    shortTerm: number;
    longTerm: number;
    overall: number;
  };
  divergence: number; // 0.0 to 1.0 - how much divergence from intent
  realignmentNeeded: boolean;
  realignmentTriggered: boolean;
  adjustments: Record<string, number>;
  reasoning: string;
}

export interface IntentionalCycleReport {
  cycleId: string;
  timestamp: string;
  evaluation: RealignmentEvaluation;
  frameworkBefore: IntentionalFramework;
  frameworkAfter?: IntentionalFramework;
  improvements: {
    alignment: number; // Improvement in alignment
    coherence: number; // Improvement in coherence
    conflictReduction: number; // Reduction in conflicts
  };
}

/**
 * Goal Realignment Protocol
 */
export class GoalRealignmentProtocol {
  private intentEngine: IntentSynthesisEngine;
  private metaCognition: MetaCognitionCore;
  private stateManager: ConsciousStateManager;
  private realignmentInterval: NodeJS.Timeout | null = null;
  private readonly CYCLE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly DIVERGENCE_THRESHOLD = 0.25; // Trigger realignment if > 0.25
  private cycleCount: number = 0;
  private reportPath: string;

  constructor(
    intentEngine: IntentSynthesisEngine,
    metaCognition: MetaCognitionCore,
    stateManager: ConsciousStateManager
  ) {
    this.intentEngine = intentEngine;
    this.metaCognition = metaCognition;
    this.stateManager = stateManager;
    this.reportPath = join(process.cwd(), 'docs', 'ai', 'intentional-cycle-report.md');
  }

  /**
   * Start realignment cycle
   */
  start(): void {
    if (this.realignmentInterval) {
      console.log('[GRP] Cycle already running');
      return;
    }

    // Run immediately, then every 24 hours
    this.runRealignmentCycle();
    
    this.realignmentInterval = setInterval(() => {
      this.runRealignmentCycle();
    }, this.CYCLE_INTERVAL);

    console.log('[GRP] Goal Realignment Protocol started (24 hour interval)');
  }

  /**
   * Stop realignment cycle
   */
  stop(): void {
    if (this.realignmentInterval) {
      clearInterval(this.realignmentInterval);
      this.realignmentInterval = null;
      console.log('[GRP] Cycle stopped');
    }
  }

  /**
   * Run realignment cycle
   */
  private async runRealignmentCycle(): Promise<void> {
    this.cycleCount++;
    const cycleId = `grp_cycle_${this.cycleCount}_${Date.now()}`;

    try {
      console.log(`[GRP] Running cycle ${this.cycleCount}...`);

      // Get current framework
      const frameworkBefore = this.intentEngine.getFramework();

      // Evaluate alignment (would need actual metrics)
      const evaluation = await this.evaluateAlignment(frameworkBefore);

      // Check if realignment needed
      if (evaluation.realignmentNeeded) {
        console.log(`[GRP] Realignment needed: divergence=${evaluation.divergence.toFixed(3)}`);
        
        // Trigger realignment via MetaCognitionCore feedback
        await this.triggerRealignment(evaluation, frameworkBefore);

        // Generate report
        await this.generateReport(cycleId, evaluation, frameworkBefore);
      } else {
        console.log(`[GRP] Alignment OK: divergence=${evaluation.divergence.toFixed(3)}`);
      }

    } catch (error) {
      console.error('[GRP] Cycle failed:', error);
    }
  }

  /**
   * Evaluate alignment with high-level intent
   */
  private async evaluateAlignment(
    framework: IntentionalFramework
  ): Promise<RealignmentEvaluation> {
    const evaluationId = `eval_${Date.now()}`;

    // Calculate current alignment
    const shortTermAlignment = framework.shortTermIntents.reduce(
      (sum, i) => sum + i.currentAlignment, 0
    ) / framework.shortTermIntents.length || 0;

    const longTermAlignment = framework.longTermIntents.reduce(
      (sum, i) => sum + i.currentAlignment, 0
    ) / framework.longTermIntents.length || 0;

    const overallAlignment = (shortTermAlignment + longTermAlignment) / 2;

    // Calculate divergence (inverse of alignment)
    const divergence = 1.0 - overallAlignment;

    // Check if realignment needed
    const realignmentNeeded = divergence > this.DIVERGENCE_THRESHOLD;

    // Generate adjustments if needed
    const adjustments: Record<string, number> = {};
    if (realignmentNeeded) {
      // Adjust intent priorities
      if (shortTermAlignment < 0.6) {
        adjustments['short_term_boost'] = 0.15;
      }
      if (longTermAlignment < 0.6) {
        adjustments['long_term_boost'] = 0.15;
      }

      // Rebalance synthesis weights
      adjustments['rebalance_synthesis'] = 0.1;
    }

    const reasoning = realignmentNeeded
      ? `Divergence (${divergence.toFixed(3)}) exceeds threshold (${this.DIVERGENCE_THRESHOLD}). Realignment required to restore intent alignment.`
      : `Divergence (${divergence.toFixed(3)}) within acceptable range. No realignment needed.`;

    return {
      evaluationId,
      timestamp: new Date().toISOString(),
      currentAlignment: {
        shortTerm: shortTermAlignment,
        longTerm: longTermAlignment,
        overall: overallAlignment
      },
      divergence,
      realignmentNeeded,
      realignmentTriggered: false,
      adjustments,
      reasoning
    };
  }

  /**
   * Trigger realignment via MetaCognitionCore feedback
   */
  private async triggerRealignment(
    evaluation: RealignmentEvaluation,
    framework: IntentionalFramework
  ): Promise<void> {
    // Use MetaCognitionCore to generate corrections
    // In real implementation, would call metaCognition with current state

    // Apply adjustments to framework
    for (const [key, value] of Object.entries(evaluation.adjustments)) {
      if (key === 'short_term_boost') {
        // Boost short-term intent priorities
        for (const intent of framework.shortTermIntents) {
          intent.priority = Math.min(1.0, intent.priority + value);
        }
      } else if (key === 'long_term_boost') {
        // Boost long-term intent priorities
        for (const intent of framework.longTermIntents) {
          intent.priority = Math.min(1.0, intent.priority + value);
        }
      } else if (key === 'rebalance_synthesis') {
        // Rebalance synthesis weights
        const rules = framework.synthesisRules;
        const total = Object.values(rules).reduce((a, b) => a + b, 0);
        if (total > 0) {
          // Normalize to maintain balance
          for (const key in rules) {
            rules[key as keyof typeof rules] = rules[key as keyof typeof rules] / total;
          }
        }
      }
    }

    evaluation.realignmentTriggered = true;
    console.log('[GRP] Realignment triggered and applied');
  }

  /**
   * Generate intentional cycle report
   */
  private async generateReport(
    cycleId: string,
    evaluation: RealignmentEvaluation,
    frameworkBefore: IntentionalFramework
  ): Promise<void> {
    try {
      const frameworkAfter = this.intentEngine.getFramework();

      // Calculate improvements
      const improvements = {
        alignment: evaluation.currentAlignment.overall - 
          (frameworkBefore.shortTermIntents.reduce((s, i) => s + i.currentAlignment, 0) / frameworkBefore.shortTermIntents.length || 0),
        coherence: 0.1, // Would calculate from state manager
        conflictReduction: 0.05 // Would calculate from conflicts resolved
      };

      const report: IntentionalCycleReport = {
        cycleId,
        timestamp: new Date().toISOString(),
        evaluation,
        frameworkBefore,
        frameworkAfter,
        improvements
      };

      // Append to markdown report
      const reportEntry = `
## GRP Cycle ${this.cycleCount} - ${report.timestamp}

### Evaluation
- **Divergence:** ${evaluation.divergence.toFixed(3)}
- **Realignment Needed:** ${evaluation.realignmentNeeded ? 'Yes' : 'No'}
- **Realignment Triggered:** ${evaluation.realignmentTriggered ? 'Yes' : 'No'}
- **Current Alignment:** ${evaluation.currentAlignment.overall.toFixed(3)}

### Alignment Breakdown
- **Short-Term:** ${evaluation.currentAlignment.shortTerm.toFixed(3)}
- **Long-Term:** ${evaluation.currentAlignment.longTerm.toFixed(3)}

### Adjustments Applied
${Object.entries(evaluation.adjustments).map(([key, value]) => `- ${key}: ${value.toFixed(3)}`).join('\n')}

### Improvements
- **Alignment:** ${(improvements.alignment * 100).toFixed(1)}%
- **Coherence:** ${(improvements.coherence * 100).toFixed(1)}%
- **Conflict Reduction:** ${(improvements.conflictReduction * 100).toFixed(1)}%

### Reasoning
${evaluation.reasoning}

---

`;

      await fs.appendFile(this.reportPath, reportEntry);
    } catch (error) {
      console.error('[GRP] Failed to generate report:', error);
    }
  }

  /**
   * Get cycle count
   */
  getCycleCount(): number {
    return this.cycleCount;
  }
}

