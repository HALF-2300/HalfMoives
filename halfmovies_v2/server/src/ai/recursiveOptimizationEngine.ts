/**
 * Recursive Optimization Engine (ROE)
 * Phase 4.3: Every 12 hours, evaluate full network intelligence metrics
 * Self-tune learning rate, emotional decay, and consensus threshold
 */

import { CollectiveNodeMesh } from './collectiveNodeMesh';
import { ConsensusEngine } from './consensusEngine';
import { MetaCognitionCore } from './metaCognitionCore';
import { AdaptiveMetrics } from './adaptiveCore';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { CollectiveHealthMetrics } from './collectiveHealthIndex';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface NetworkIntelligenceMetrics {
  timestamp: string;
  adaptive: AdaptiveMetrics;
  predictive: PredictiveMetrics;
  empathic: CEPAIMetrics;
  collective: CollectiveHealthMetrics;
  metaCognitive: {
    reasoningStability: number;
    cognitiveHealth: string;
    driftsDetected: number;
  };
}

export interface RecursiveOptimizationResult {
  cycleId: string;
  timestamp: string;
  metrics: NetworkIntelligenceMetrics;
  adjustments: {
    learningRate: { old: number; new: number; reason: string };
    emotionalDecay: { old: number; new: number; reason: string };
    consensusThreshold: { old: number; new: number; reason: string };
  };
  improvement: {
    reasoningStability: number;
    cognitiveHealth: string;
    overallImprovement: number;
  };
}

/**
 * Recursive Optimization Engine
 */
export class RecursiveOptimizationEngine {
  private collectiveMesh: CollectiveNodeMesh;
  private consensusEngine: ConsensusEngine;
  private metaCognition: MetaCognitionCore;
  private optimizationInterval: NodeJS.Timeout | null = null;
  private readonly CYCLE_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours
  private cycleCount: number = 0;
  private optimizationHistory: RecursiveOptimizationResult[] = [];
  private logPath: string;

  constructor(
    collectiveMesh: CollectiveNodeMesh,
    consensusEngine: ConsensusEngine,
    metaCognition: MetaCognitionCore
  ) {
    this.collectiveMesh = collectiveMesh;
    this.consensusEngine = consensusEngine;
    this.metaCognition = metaCognition;
    this.logPath = join(process.cwd(), 'docs', 'ai', 'meta-cycle-log.md');
  }

  /**
   * Start recursive optimization cycle
   */
  start(): void {
    if (this.optimizationInterval) {
      console.log('[ROE] Cycle already running');
      return;
    }

    // Run immediately, then every 12 hours
    this.runOptimizationCycle();
    
    this.optimizationInterval = setInterval(() => {
      this.runOptimizationCycle();
    }, this.CYCLE_INTERVAL);

    console.log('[ROE] Recursive optimization cycle started (12 hour interval)');
  }

  /**
   * Stop optimization cycle
   */
  stop(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
      console.log('[ROE] Cycle stopped');
    }
  }

  /**
   * Run optimization cycle
   */
  private async runOptimizationCycle(): Promise<void> {
    this.cycleCount++;
    const cycleId = `roe_cycle_${this.cycleCount}_${Date.now()}`;

    try {
      console.log(`[ROE] Running cycle ${this.cycleCount}...`);

      // Collect full network metrics
      const metrics = await this.collectNetworkMetrics();

      // Meta-cognitive analysis
      const analysis = await this.metaCognition.evaluateDecisions(
        metrics.adaptive,
        metrics.predictive,
        metrics.empathic,
        this.consensusEngine.getRecentDecisions(50)
      );

      // Generate adjustments
      const adjustments = this.generateAdjustments(metrics, analysis);

      // Apply adjustments
      await this.applyAdjustments(adjustments);

      // Calculate improvement
      const improvement = this.calculateImprovement(metrics, analysis, adjustments);

      // Record result
      const result: RecursiveOptimizationResult = {
        cycleId,
        timestamp: new Date().toISOString(),
        metrics: {
          ...metrics,
          metaCognitive: {
            reasoningStability: analysis.reasoningStability,
            cognitiveHealth: analysis.cognitiveHealth,
            driftsDetected: analysis.driftsDetected.length
          }
        },
        adjustments,
        improvement
      };

      this.optimizationHistory.push(result);

      // Keep only last 100 cycles
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory = this.optimizationHistory.slice(-100);
      }

      // Log to file
      await this.logCycle(result);

      console.log(`[ROE] Cycle ${this.cycleCount} complete: ${adjustments.learningRate.new.toFixed(3)} LR, ${adjustments.emotionalDecay.new.toFixed(3)} decay, ${adjustments.consensusThreshold.new.toFixed(3)} threshold`);

    } catch (error) {
      console.error('[ROE] Cycle failed:', error);
    }
  }

  /**
   * Collect full network metrics
   */
  private async collectNetworkMetrics(): Promise<NetworkIntelligenceMetrics> {
    // In real implementation, would fetch from actual systems
    // For now, use structure
    return {
      timestamp: new Date().toISOString(),
      adaptive: {
        engine: 'active',
        lastSync: new Date().toISOString(),
        trainingOps: 0,
        cacheHitRate: 0,
        avgLatency: 0,
        modelWeights: {},
        connectionFailures: 0
      },
      predictive: {
        totalPredictions: 0,
        accuratePredictions: 0,
        predictiveAccuracyIndex: 0,
        averageConfidence: 0,
        preloadHitRate: 0,
        latencyReduction: 0,
        lastUpdated: new Date().toISOString()
      },
      empathic: {
        totalContextualPredictions: 0,
        accurateContextualPredictions: 0,
        contextualEmotionalPAI: 0,
        averageEmotionalLikelihood: 0,
        averageEmotionalResonance: 0,
        contextualAdaptationScore: 0,
        emotionalResonanceScore: 0,
        lastUpdated: new Date().toISOString()
      },
      collective: {
        chi: 0,
        timestamp: new Date().toISOString(),
        components: {
          meshHealth: 0,
          consensusHealth: 0,
          predictiveHealth: 0,
          empathicHealth: 0,
          optimizationHealth: 0
        },
        status: 'healthy',
        recommendations: []
      },
      metaCognitive: {
        reasoningStability: 0,
        cognitiveHealth: 'stable',
        driftsDetected: 0
      }
    };
  }

  /**
   * Generate adjustments
   */
  private generateAdjustments(
    metrics: NetworkIntelligenceMetrics,
    analysis: any
  ): RecursiveOptimizationResult['adjustments'] {
    const globalState = this.collectiveMesh.getGlobalLearningState();
    const currentLR = globalState.hyperparameters['learning_rate'] || 0.1;
    const currentDecay = globalState.hyperparameters['emotional_decay'] || 0.05;
    const currentThreshold = 0.6; // Consensus threshold

    // Learning rate adjustment
    let newLR = currentLR;
    let lrReason = 'No change';
    
    if (analysis.cognitiveHealth === 'unstable' || analysis.reasoningStability < 0.5) {
      newLR = Math.max(0.05, currentLR * 0.9); // Reduce for stability
      lrReason = 'Low reasoning stability, reducing learning rate';
    } else if (metrics.predictive.predictiveAccuracyIndex < 0.5) {
      newLR = Math.min(0.2, currentLR * 1.1); // Increase for improvement
      lrReason = 'Low predictive accuracy, increasing learning rate';
    } else if (analysis.driftsDetected.length > 2) {
      newLR = Math.max(0.05, currentLR * 0.95); // Slight reduction
      lrReason = 'Multiple drifts detected, reducing learning rate';
    }

    // Emotional decay adjustment
    let newDecay = currentDecay;
    let decayReason = 'No change';
    
    if (analysis.driftsDetected.some((d: any) => d.driftType === 'emotional_bias')) {
      newDecay = Math.min(0.1, currentDecay * 1.2); // Increase decay
      decayReason = 'Emotional bias detected, increasing decay';
    } else if (metrics.empathic.contextualEmotionalPAI < 0.5) {
      newDecay = Math.max(0.02, currentDecay * 0.9); // Reduce decay
      decayReason = 'Low empathic accuracy, reducing decay';
    }

    // Consensus threshold adjustment
    let newThreshold = currentThreshold;
    let thresholdReason = 'No change';
    
    const consensusStats = this.consensusEngine.getStatistics();
    if (consensusStats.improvementRate < 0.3) {
      newThreshold = Math.max(0.5, currentThreshold - 0.05); // Lower threshold
      thresholdReason = 'Low improvement rate, lowering consensus threshold';
    } else if (consensusStats.averageReinforcementScore > 0.8) {
      newThreshold = Math.min(0.7, currentThreshold + 0.05); // Raise threshold
      thresholdReason = 'High reinforcement, raising consensus threshold';
    }

    return {
      learningRate: {
        old: currentLR,
        new: newLR,
        reason: lrReason
      },
      emotionalDecay: {
        old: currentDecay,
        new: newDecay,
        reason: decayReason
      },
      consensusThreshold: {
        old: currentThreshold,
        new: newThreshold,
        reason: thresholdReason
      }
    };
  }

  /**
   * Apply adjustments
   */
  private async applyAdjustments(adjustments: RecursiveOptimizationResult['adjustments']): Promise<void> {
    // Contribute to collective mesh
    await this.collectiveMesh.contributeAdjustment({
      sourceNode: 'AICore-X1',
      targetDomain: 'hyperparameters',
      adjustment: {
        learning_rate: adjustments.learningRate.new,
        emotional_decay: adjustments.emotionalDecay.new,
        consensus_threshold: adjustments.consensusThreshold.new
      },
      confidence: 0.8
    });
  }

  /**
   * Calculate improvement
   */
  private calculateImprovement(
    metrics: NetworkIntelligenceMetrics,
    analysis: any,
    adjustments: RecursiveOptimizationResult['adjustments']
  ): RecursiveOptimizationResult['improvement'] {
    // Estimate improvement based on adjustments
    const lrChange = Math.abs(adjustments.learningRate.new - adjustments.learningRate.old);
    const decayChange = Math.abs(adjustments.emotionalDecay.new - adjustments.emotionalDecay.old);
    const thresholdChange = Math.abs(adjustments.consensusThreshold.new - adjustments.consensusThreshold.old);

    const overallChange = (lrChange + decayChange + thresholdChange) / 3;
    const expectedStabilityImprovement = analysis.reasoningStability * 0.1; // Up to 10% improvement

    return {
      reasoningStability: expectedStabilityImprovement,
      cognitiveHealth: analysis.cognitiveHealth,
      overallImprovement: overallChange
    };
  }

  /**
   * Log cycle to file
   */
  private async logCycle(result: RecursiveOptimizationResult): Promise<void> {
    try {
      const logEntry = `
## ROE Cycle ${this.cycleCount} - ${result.timestamp}

### Metrics
- **Reasoning Stability:** ${result.metrics.metaCognitive.reasoningStability.toFixed(3)}
- **Cognitive Health:** ${result.metrics.metaCognitive.cognitiveHealth}
- **Drifts Detected:** ${result.metrics.metaCognitive.driftsDetected}
- **CHI:** ${result.metrics.collective.chi.toFixed(3)}
- **PAI:** ${result.metrics.predictive.predictiveAccuracyIndex.toFixed(3)}
- **CE-PAI:** ${result.metrics.empathic.contextualEmotionalPAI.toFixed(3)}

### Adjustments
- **Learning Rate:** ${result.adjustments.learningRate.old.toFixed(3)} → ${result.adjustments.learningRate.new.toFixed(3)}
  - Reason: ${result.adjustments.learningRate.reason}
- **Emotional Decay:** ${result.adjustments.emotionalDecay.old.toFixed(3)} → ${result.adjustments.emotionalDecay.new.toFixed(3)}
  - Reason: ${result.adjustments.emotionalDecay.reason}
- **Consensus Threshold:** ${result.adjustments.consensusThreshold.old.toFixed(3)} → ${result.adjustments.consensusThreshold.new.toFixed(3)}
  - Reason: ${result.adjustments.consensusThreshold.reason}

### Improvement
- **Reasoning Stability:** +${(result.improvement.reasoningStability * 100).toFixed(1)}%
- **Overall Improvement:** ${(result.improvement.overallImprovement * 100).toFixed(1)}%

---

`;

      // Append to log file
      await fs.appendFile(this.logPath, logEntry);
    } catch (error) {
      console.error('[ROE] Failed to log cycle:', error);
    }
  }

  /**
   * Get optimization history
   */
  getHistory(limit: number = 10): RecursiveOptimizationResult[] {
    return this.optimizationHistory.slice(-limit);
  }

  /**
   * Get current cycle count
   */
  getCycleCount(): number {
    return this.cycleCount;
  }
}

