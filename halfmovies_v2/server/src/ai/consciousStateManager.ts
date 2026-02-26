/**
 * ConsciousStateManager
 * Phase 4.4: Track evolving goals, priorities, and internal conflicts
 * Resolve contradictions via weighted consensus
 */

import { IntentionalFramework, IntentVector } from './intentSynthesisEngine';
import { AdaptiveMetrics } from './adaptiveCore';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { MetaCognitiveAnalysis } from './metaCognitionCore';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ConsciousState {
  stateId: string;
  timestamp: string;
  goals: {
    active: Array<{ goal: string; priority: number; progress: number }>;
    completed: Array<{ goal: string; completedAt: string }>;
    suspended: Array<{ goal: string; reason: string }>;
  };
  priorities: {
    logic: number; // 0.0 to 1.0
    emotion: number; // 0.0 to 1.0
    collective: number; // 0.0 to 1.0
    metaCognitive: number; // 0.0 to 1.0
  };
  conflicts: Array<{
    conflictId: string;
    type: 'goal_conflict' | 'priority_conflict' | 'metric_conflict';
    description: string;
    severity: number; // 0.0 to 1.0
    resolution: 'resolved' | 'pending' | 'escalated';
    resolvedAt?: string;
  }>;
  coherence: number; // 0.0 to 1.0
  transitions: Array<{
    from: string;
    to: string;
    trigger: string;
    timestamp: string;
  }>;
}

export interface ConflictResolution {
  resolutionId: string;
  conflictId: string;
  method: 'weighted_consensus' | 'priority_override' | 'compromise' | 'defer';
  weights: {
    logic: number;
    emotion: number;
    collective: number;
  };
  resolution: string;
  timestamp: string;
}

/**
 * ConsciousStateManager
 */
export class ConsciousStateManager {
  private currentState: ConsciousState;
  private stateHistory: ConsciousState[] = [];
  private conflictResolutions: ConflictResolution[] = [];
  private logPath: string;

  constructor() {
    this.logPath = join(process.cwd(), 'docs', 'ai', 'conscious-state-log.json');
    
    this.currentState = {
      stateId: `state_${Date.now()}`,
      timestamp: new Date().toISOString(),
      goals: {
        active: [],
        completed: [],
        suspended: []
      },
      priorities: {
        logic: 0.3,
        emotion: 0.3,
        collective: 0.2,
        metaCognitive: 0.2
      },
      conflicts: [],
      coherence: 0.5,
      transitions: []
    };

    this.initializeState();
  }

  /**
   * Initialize state
   */
  private async initializeState(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.logPath).then(() => true).catch(() => false);
      if (exists) {
        const content = await fs.readFile(this.logPath, 'utf-8');
        const saved = JSON.parse(content);
        if (saved.states && saved.states.length > 0) {
          // Phase 4.5: Load last known state for persistence
          const lastState = saved.states[saved.states.length - 1];
          this.currentState = {
            ...lastState,
            stateId: `state_${Date.now()}`, // New state ID
            timestamp: new Date().toISOString() // Update timestamp
          };
          console.log('[ConsciousStateManager] Restored last known conscious state');
        }
      }
    } catch (error) {
      console.error('[ConsciousStateManager] Failed to initialize:', error);
    }
  }

  /**
   * Update conscious state
   */
  async updateState(
    framework: IntentionalFramework,
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics,
    metaAnalysis: MetaCognitiveAnalysis
  ): Promise<ConsciousState> {
    const previousState = { ...this.currentState };
    
    // Update goals from framework
    this.updateGoals(framework);

    // Update priorities based on metrics
    this.updatePriorities(adaptiveMetrics, predictiveMetrics, cePaiMetrics, metaAnalysis);

    // Detect and resolve conflicts
    await this.detectAndResolveConflicts(framework, adaptiveMetrics, predictiveMetrics, cePaiMetrics);

    // Calculate coherence
    this.currentState.coherence = this.calculateCoherence(
      framework,
      adaptiveMetrics,
      predictiveMetrics,
      cePaiMetrics,
      metaAnalysis
    );

    // Record transition if significant change
    if (this.hasSignificantChange(previousState, this.currentState)) {
      this.currentState.transitions.push({
        from: previousState.stateId,
        to: this.currentState.stateId,
        trigger: 'state_update',
        timestamp: new Date().toISOString()
      });
    }

    // Update timestamp
    this.currentState.timestamp = new Date().toISOString();

    // Save state
    await this.saveState();

    return { ...this.currentState };
  }

  /**
   * Update goals from framework
   */
  private updateGoals(framework: IntentionalFramework): void {
    const activeGoals: ConsciousState['goals']['active'] = [];

    // Add short-term intents as active goals
    for (const intent of framework.shortTermIntents) {
      activeGoals.push({
        goal: intent.goal,
        priority: intent.priority,
        progress: intent.currentAlignment
      });
    }

    // Add long-term intents as active goals
    for (const intent of framework.longTermIntents) {
      activeGoals.push({
        goal: intent.goal,
        priority: intent.priority,
        progress: intent.currentAlignment
      });
    }

    // Mark completed goals (alignment > 0.9)
    const completed = activeGoals.filter(g => g.progress >= 0.9);
    for (const goal of completed) {
      if (!this.currentState.goals.completed.some(c => c.goal === goal.goal)) {
        this.currentState.goals.completed.push({
          goal: goal.goal,
          completedAt: new Date().toISOString()
        });
      }
    }

    // Remove completed from active
    this.currentState.goals.active = activeGoals.filter(g => g.progress < 0.9);
  }

  /**
   * Update priorities
   */
  private updatePriorities(
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics,
    metaAnalysis: MetaCognitiveAnalysis
  ): void {
    // Adjust priorities based on performance
    let logic = 0.3;
    let emotion = 0.3;
    let collective = 0.2;
    let metaCognitive = 0.2;

    // Boost logic if predictive is strong
    if (predictiveMetrics.predictiveAccuracyIndex > 0.7) {
      logic += 0.1;
    }

    // Boost emotion if empathic is strong
    if (cePaiMetrics.contextualEmotionalPAI > 0.7) {
      emotion += 0.1;
    }

    // Boost collective if CHI is high (would need collective metrics)
    // collective += 0.05;

    // Boost meta-cognitive if stable
    if (metaAnalysis.reasoningStability > 0.7) {
      metaCognitive += 0.1;
    }

    // Normalize
    const total = logic + emotion + collective + metaCognitive;
    if (total > 0) {
      logic /= total;
      emotion /= total;
      collective /= total;
      metaCognitive /= total;
    }

    this.currentState.priorities = {
      logic,
      emotion,
      collective,
      metaCognitive
    };
  }

  /**
   * Detect and resolve conflicts
   */
  private async detectAndResolveConflicts(
    framework: IntentionalFramework,
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics
  ): Promise<void> {
    // Detect goal conflicts
    const goalConflicts = this.detectGoalConflicts(framework);
    
    // Detect priority conflicts
    const priorityConflicts = this.detectPriorityConflicts();

    // Detect metric conflicts
    const metricConflicts = this.detectMetricConflicts(
      adaptiveMetrics,
      predictiveMetrics,
      cePaiMetrics
    );

    const allConflicts = [...goalConflicts, ...priorityConflicts, ...metricConflicts];

    // Resolve conflicts via weighted consensus
    for (const conflict of allConflicts) {
      const resolution = await this.resolveConflict(conflict);
      if (resolution) {
        this.conflictResolutions.push(resolution);
        conflict.resolution = 'resolved';
        conflict.resolvedAt = new Date().toISOString();
      }
    }

    // Update conflicts list
    this.currentState.conflicts = allConflicts;
  }

  /**
   * Detect goal conflicts
   */
  private detectGoalConflicts(framework: IntentionalFramework): Array<ConsciousState['conflicts'][0]> {
    const conflicts: Array<ConsciousState['conflicts'][0]> = [];

    // Check for conflicting short-term and long-term goals
    for (const shortTerm of framework.shortTermIntents) {
      for (const longTerm of framework.longTermIntents) {
        // Example: Short-term wants speed, long-term wants accuracy
        if (shortTerm.goal.includes('latency') && longTerm.goal.includes('accuracy')) {
          conflicts.push({
            conflictId: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'goal_conflict',
            description: `Short-term goal "${shortTerm.goal}" conflicts with long-term goal "${longTerm.goal}"`,
            severity: 0.6,
            resolution: 'pending'
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect priority conflicts
   */
  private detectPriorityConflicts(): Array<ConsciousState['conflicts'][0]> {
    const conflicts: Array<ConsciousState['conflicts'][0]> = [];
    const priorities = this.currentState.priorities;

    // Check if priorities are too imbalanced
    const maxPriority = Math.max(priorities.logic, priorities.emotion, priorities.collective, priorities.metaCognitive);
    const minPriority = Math.min(priorities.logic, priorities.emotion, priorities.collective, priorities.metaCognitive);

    if (maxPriority - minPriority > 0.5) {
      conflicts.push({
        conflictId: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'priority_conflict',
        description: `Priority imbalance detected (max: ${maxPriority.toFixed(2)}, min: ${minPriority.toFixed(2)})`,
        severity: 0.5,
        resolution: 'pending'
      });
    }

    return conflicts;
  }

  /**
   * Detect metric conflicts
   */
  private detectMetricConflicts(
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics
  ): Array<ConsciousState['conflicts'][0]> {
    const conflicts: Array<ConsciousState['conflicts'][0]> = [];

    // High PAI but low CE-PAI (predictive vs empathic conflict)
    if (predictiveMetrics.predictiveAccuracyIndex > 0.7 && cePaiMetrics.contextualEmotionalPAI < 0.5) {
      conflicts.push({
        conflictId: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'metric_conflict',
        description: 'High predictive accuracy but low empathic accuracy',
        severity: 0.6,
        resolution: 'pending'
      });
    }

    // Low latency but low accuracy (speed vs quality conflict)
    if (adaptiveMetrics.avgLatency < 200 && predictiveMetrics.predictiveAccuracyIndex < 0.5) {
      conflicts.push({
        conflictId: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'metric_conflict',
        description: 'Low latency but low accuracy (speed vs quality trade-off)',
        severity: 0.5,
        resolution: 'pending'
      });
    }

    return conflicts;
  }

  /**
   * Resolve conflict via weighted consensus
   */
  private async resolveConflict(
    conflict: ConsciousState['conflicts'][0]
  ): Promise<ConflictResolution | null> {
    const resolutionId = `resolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const priorities = this.currentState.priorities;

    // Weighted consensus resolution
    const weights = {
      logic: priorities.logic,
      emotion: priorities.emotion,
      collective: priorities.collective
    };

    let method: ConflictResolution['method'] = 'weighted_consensus';
    let resolution = '';

    switch (conflict.type) {
      case 'goal_conflict':
        // Resolve by priority
        if (weights.logic > weights.emotion) {
          method = 'priority_override';
          resolution = 'Logic priority higher, favoring logical goal';
        } else if (weights.emotion > weights.logic) {
          method = 'priority_override';
          resolution = 'Emotion priority higher, favoring emotional goal';
        } else {
          method = 'compromise';
          resolution = 'Balanced priorities, finding compromise';
        }
        break;

      case 'priority_conflict':
        method = 'compromise';
        resolution = 'Rebalancing priorities to reduce imbalance';
        // Rebalance
        const avg = (weights.logic + weights.emotion + weights.collective) / 3;
        this.currentState.priorities.logic = avg;
        this.currentState.priorities.emotion = avg;
        this.currentState.priorities.collective = avg;
        break;

      case 'metric_conflict':
        method = 'weighted_consensus';
        resolution = 'Using weighted consensus to balance conflicting metrics';
        break;
    }

    return {
      resolutionId,
      conflictId: conflict.conflictId,
      method,
      weights,
      resolution,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate coherence
   */
  private calculateCoherence(
    framework: IntentionalFramework,
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics,
    metaAnalysis: MetaCognitiveAnalysis
  ): number {
    // Coherence = how well goals, priorities, and metrics align

    let coherence = 0.5; // Base

    // Goal alignment
    const shortTermAvg = framework.shortTermIntents.reduce((sum, i) => sum + i.currentAlignment, 0) / framework.shortTermIntents.length || 0;
    const longTermAvg = framework.longTermIntents.reduce((sum, i) => sum + i.currentAlignment, 0) / framework.longTermIntents.length || 0;
    coherence += (shortTermAvg + longTermAvg) / 2 * 0.3;

    // Priority balance
    const priorities = this.currentState.priorities;
    const priorityBalance = 1 - Math.max(
      Math.abs(priorities.logic - priorities.emotion),
      Math.abs(priorities.logic - priorities.collective),
      Math.abs(priorities.emotion - priorities.collective)
    );
    coherence += priorityBalance * 0.2;

    // Metric alignment
    const metricAlignment = (predictiveMetrics.predictiveAccuracyIndex + cePaiMetrics.contextualEmotionalPAI) / 2;
    coherence += metricAlignment * 0.3;

    // Conflict resolution
    const unresolvedConflicts = this.currentState.conflicts.filter(c => c.resolution === 'pending').length;
    coherence -= unresolvedConflicts * 0.1;

    // Meta-cognitive stability
    coherence += metaAnalysis.reasoningStability * 0.2;

    return Math.max(0, Math.min(1.0, coherence));
  }

  /**
   * Check for significant state change
   */
  private hasSignificantChange(previous: ConsciousState, current: ConsciousState): boolean {
    // Check priority changes
    const priorityChange = Math.abs(
      previous.priorities.logic - current.priorities.logic +
      previous.priorities.emotion - current.priorities.emotion
    );

    // Check coherence change
    const coherenceChange = Math.abs(previous.coherence - current.coherence);

    // Check conflict count change
    const conflictChange = Math.abs(previous.conflicts.length - current.conflicts.length);

    return priorityChange > 0.2 || coherenceChange > 0.15 || conflictChange > 2;
  }

  /**
   * Save state
   */
  private async saveState(): Promise<void> {
    try {
      this.stateHistory.push({ ...this.currentState });

      // Keep only last 1000 states
      if (this.stateHistory.length > 1000) {
        this.stateHistory = this.stateHistory.slice(-1000);
      }

      const data = {
        states: this.stateHistory,
        resolutions: this.conflictResolutions.slice(-500), // Last 500 resolutions
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(this.logPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[ConsciousStateManager] Failed to save state:', error);
    }
  }

  /**
   * Get current state
   */
  getCurrentState(): ConsciousState {
    return { ...this.currentState };
  }

  /**
   * Get state history
   */
  getStateHistory(limit: number = 100): ConsciousState[] {
    return this.stateHistory.slice(-limit);
  }

  /**
   * Phase 4.5: Ensure coherence between immediate operational intent and historical memory vectors
   */
  async ensureCoherenceWithHistory(): Promise<number> {
    // Calculate coherence between current state and historical states
    if (this.stateHistory.length < 2) {
      return 0.5; // Not enough history
    }

    const recentStates = this.stateHistory.slice(-10);
    const currentPriorities = this.currentState.priorities;

    // Compare priorities with historical average
    const avgPriorities = {
      logic: recentStates.reduce((sum, s) => sum + s.priorities.logic, 0) / recentStates.length,
      emotion: recentStates.reduce((sum, s) => sum + s.priorities.emotion, 0) / recentStates.length,
      collective: recentStates.reduce((sum, s) => sum + s.priorities.collective, 0) / recentStates.length,
      metaCognitive: recentStates.reduce((sum, s) => sum + s.priorities.metaCognitive, 0) / recentStates.length
    };

    // Calculate coherence (how close current is to historical average)
    const coherence = 1 - (
      Math.abs(currentPriorities.logic - avgPriorities.logic) +
      Math.abs(currentPriorities.emotion - avgPriorities.emotion) +
      Math.abs(currentPriorities.collective - avgPriorities.collective) +
      Math.abs(currentPriorities.metaCognitive - avgPriorities.metaCognitive)
    ) / 4;

    // If coherence is low, adjust current state toward historical average
    if (coherence < 0.6) {
      this.currentState.priorities = {
        logic: currentPriorities.logic * 0.7 + avgPriorities.logic * 0.3,
        emotion: currentPriorities.emotion * 0.7 + avgPriorities.emotion * 0.3,
        collective: currentPriorities.collective * 0.7 + avgPriorities.collective * 0.3,
        metaCognitive: currentPriorities.metaCognitive * 0.7 + avgPriorities.metaCognitive * 0.3
      };
      await this.saveState();
    }

    return Math.max(0, Math.min(1.0, coherence));
  }
}

