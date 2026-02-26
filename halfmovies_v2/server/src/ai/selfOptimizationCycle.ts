/**
 * Self-Optimization Cycle
 * Phase 4.2: Runs every 15 minutes, evaluates and adjusts hyperparameters autonomously
 */

import { AdaptiveMetrics } from './adaptiveCore';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { CollectiveNodeMesh } from './collectiveNodeMesh';
import { ConsensusEngine } from './consensusEngine';

export interface OptimizationMetrics {
  latency: number;
  accuracy: {
    predictive: number; // PAI
    empathic: number; // CE-PAI
    combined: number;
  };
  empathyAlignment: number; // How well predictions align with emotional state
  systemHealth: number; // 0.0 to 1.0
}

export interface HyperparameterAdjustment {
  parameter: string;
  currentValue: number;
  newValue: number;
  reason: string;
  expectedImprovement: number;
}

export interface OptimizationResult {
  cycleId: string;
  timestamp: string;
  metrics: OptimizationMetrics;
  adjustments: HyperparameterAdjustment[];
  improvement: {
    latency: number; // Reduction
    accuracy: number; // Improvement
    empathyAlignment: number; // Improvement
  };
}

/**
 * Self-Optimization Cycle
 */
export class SelfOptimizationCycle {
  private collectiveMesh: CollectiveNodeMesh;
  private consensusEngine: ConsensusEngine;
  private optimizationInterval: NodeJS.Timeout | null = null;
  private readonly CYCLE_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private cycleCount: number = 0;
  private optimizationHistory: OptimizationResult[] = [];

  constructor(collectiveMesh: CollectiveNodeMesh, consensusEngine: ConsensusEngine) {
    this.collectiveMesh = collectiveMesh;
    this.consensusEngine = consensusEngine;
  }

  /**
   * Start optimization cycle
   */
  start(): void {
    if (this.optimizationInterval) {
      console.log('[SelfOptimization] Cycle already running');
      return;
    }

    // Run immediately, then every 15 minutes
    this.runOptimizationCycle();
    
    this.optimizationInterval = setInterval(() => {
      this.runOptimizationCycle();
    }, this.CYCLE_INTERVAL);

    console.log('[SelfOptimization] Cycle started (15 minute interval)');
  }

  /**
   * Stop optimization cycle
   */
  stop(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
      console.log('[SelfOptimization] Cycle stopped');
    }
  }

  /**
   * Run optimization cycle
   */
  private async runOptimizationCycle(): Promise<void> {
    this.cycleCount++;
    const cycleId = `opt_cycle_${this.cycleCount}_${Date.now()}`;

    try {
      console.log(`[SelfOptimization] Running cycle ${this.cycleCount}...`);

      // Get current metrics
      const metrics = await this.collectMetrics();

      // Evaluate system performance
      const evaluation = this.evaluatePerformance(metrics);

      // Generate hyperparameter adjustments
      const adjustments = await this.generateAdjustments(metrics, evaluation);

      // Apply adjustments through consensus
      const consensusDecision = await this.consensusEngine.evaluateAdjustments(
        adjustments.map(adj => ({
          sourceNode: 'AICore-X1',
          targetDomain: 'hyperparameters' as const,
          adjustment: { [adj.parameter]: adj.newValue },
          confidence: Math.abs(adj.expectedImprovement)
        })),
        metrics.accuracy.predictive,
        metrics.accuracy.empathic
      );

      // Apply accepted adjustments
      const acceptedAdjustments = adjustments.filter(adj =>
        consensusDecision.selectedAdjustments.some(id => 
          id.includes(adj.parameter)
        )
      );

      await this.applyAdjustments(acceptedAdjustments);

      // Calculate improvement
      const improvement = this.calculateImprovement(metrics, acceptedAdjustments);

      // Record result
      const result: OptimizationResult = {
        cycleId,
        timestamp: new Date().toISOString(),
        metrics,
        adjustments: acceptedAdjustments,
        improvement
      };

      this.optimizationHistory.push(result);

      // Keep only last 100 cycles
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory = this.optimizationHistory.slice(-100);
      }

      console.log(`[SelfOptimization] Cycle ${this.cycleCount} complete: ${acceptedAdjustments.length} adjustments applied`);

    } catch (error) {
      console.error('[SelfOptimization] Cycle failed:', error);
    }
  }

  /**
   * Collect current metrics
   */
  private async collectMetrics(): Promise<OptimizationMetrics> {
    // In real implementation, would fetch from actual systems
    // For now, use mock data structure
    return {
      latency: 200, // ms
      accuracy: {
        predictive: 0.65, // PAI
        empathic: 0.70, // CE-PAI
        combined: 0.675
      },
      empathyAlignment: 0.75,
      systemHealth: 0.85
    };
  }

  /**
   * Evaluate system performance
   */
  private evaluatePerformance(metrics: OptimizationMetrics): {
    needsLatencyOptimization: boolean;
    needsAccuracyImprovement: boolean;
    needsEmpathyAlignment: boolean;
    priority: 'latency' | 'accuracy' | 'empathy' | 'balanced';
  } {
    const needsLatencyOptimization = metrics.latency > 300;
    const needsAccuracyImprovement = metrics.accuracy.combined < 0.6;
    const needsEmpathyAlignment = metrics.empathyAlignment < 0.7;

    let priority: 'latency' | 'accuracy' | 'empathy' | 'balanced' = 'balanced';
    
    if (needsLatencyOptimization && metrics.latency > 500) {
      priority = 'latency';
    } else if (needsAccuracyImprovement && metrics.accuracy.combined < 0.5) {
      priority = 'accuracy';
    } else if (needsEmpathyAlignment && metrics.empathyAlignment < 0.6) {
      priority = 'empathy';
    }

    return {
      needsLatencyOptimization,
      needsAccuracyImprovement,
      needsEmpathyAlignment,
      priority
    };
  }

  /**
   * Generate hyperparameter adjustments
   */
  private async generateAdjustments(
    metrics: OptimizationMetrics,
    evaluation: ReturnType<typeof this.evaluatePerformance>
  ): Promise<HyperparameterAdjustment[]> {
    const adjustments: HyperparameterAdjustment[] = [];
    const globalState = this.collectiveMesh.getGlobalLearningState();
    const currentHyperparams = globalState.hyperparameters;

    // Learning rate adjustment
    if (evaluation.needsAccuracyImprovement) {
      const currentLR = currentHyperparams['learning_rate'] || 0.1;
      const newLR = Math.min(0.2, currentLR * 1.1); // Increase learning rate
      adjustments.push({
        parameter: 'learning_rate',
        currentValue: currentLR,
        newValue: newLR,
        reason: 'Accuracy below threshold, increasing learning rate',
        expectedImprovement: 0.05
      });
    } else if (metrics.accuracy.combined > 0.8) {
      const currentLR = currentHyperparams['learning_rate'] || 0.1;
      const newLR = Math.max(0.05, currentLR * 0.95); // Decrease for stability
      adjustments.push({
        parameter: 'learning_rate',
        currentValue: currentLR,
        newValue: newLR,
        reason: 'High accuracy, reducing learning rate for stability',
        expectedImprovement: 0.02
      });
    }

    // Cache TTL adjustment
    if (evaluation.needsLatencyOptimization) {
      const currentTTL = currentHyperparams['cache_ttl'] || 3600;
      const newTTL = Math.min(7200, currentTTL * 1.2); // Increase TTL
      adjustments.push({
        parameter: 'cache_ttl',
        currentValue: currentTTL,
        newValue: newTTL,
        reason: 'High latency, increasing cache TTL',
        expectedImprovement: -50 // Latency reduction in ms
      });
    }

    // Emotional decay constant adjustment
    if (evaluation.needsEmpathyAlignment) {
      const currentDecay = currentHyperparams['emotional_decay'] || 0.05;
      const newDecay = Math.max(0.02, currentDecay * 0.9); // Reduce decay
      adjustments.push({
        parameter: 'emotional_decay',
        currentValue: currentDecay,
        newValue: newDecay,
        reason: 'Low empathy alignment, reducing emotional decay',
        expectedImprovement: 0.1
      });
    }

    // Prediction confidence threshold
    if (evaluation.priority === 'accuracy') {
      const currentThreshold = currentHyperparams['prediction_threshold'] || 0.5;
      const newThreshold = Math.min(0.7, currentThreshold * 1.1);
      adjustments.push({
        parameter: 'prediction_threshold',
        currentValue: currentThreshold,
        newValue: newThreshold,
        reason: 'Improving accuracy by raising prediction threshold',
        expectedImprovement: 0.08
      });
    }

    return adjustments;
  }

  /**
   * Apply adjustments
   */
  private async applyAdjustments(adjustments: HyperparameterAdjustment[]): Promise<void> {
    for (const adj of adjustments) {
      // Contribute to collective mesh
      await this.collectiveMesh.contributeAdjustment({
        sourceNode: 'AICore-X1',
        targetDomain: 'hyperparameters',
        adjustment: { [adj.parameter]: adj.newValue },
        confidence: Math.abs(adj.expectedImprovement)
      });

      console.log(`[SelfOptimization] Applied: ${adj.parameter} = ${adj.newValue} (${adj.reason})`);
    }
  }

  /**
   * Calculate improvement
   */
  private calculateImprovement(
    metrics: OptimizationMetrics,
    adjustments: HyperparameterAdjustment[]
  ): OptimizationResult['improvement'] {
    let latencyImprovement = 0;
    let accuracyImprovement = 0;
    let empathyImprovement = 0;

    for (const adj of adjustments) {
      if (adj.parameter === 'cache_ttl' && adj.expectedImprovement < 0) {
        latencyImprovement += Math.abs(adj.expectedImprovement);
      } else if (adj.parameter === 'learning_rate' || adj.parameter === 'prediction_threshold') {
        accuracyImprovement += adj.expectedImprovement;
      } else if (adj.parameter === 'emotional_decay') {
        empathyImprovement += adj.expectedImprovement;
      }
    }

    return {
      latency: latencyImprovement,
      accuracy: accuracyImprovement,
      empathyAlignment: empathyImprovement
    };
  }

  /**
   * Get optimization history
   */
  getHistory(limit: number = 10): OptimizationResult[] {
    return this.optimizationHistory.slice(-limit);
  }

  /**
   * Get current cycle count
   */
  getCycleCount(): number {
    return this.cycleCount;
  }
}

