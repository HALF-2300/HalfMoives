/**
 * UnifiedConsciousNetwork (UCN)
 * Phase 4.5: Merge conscious states from both systems into shared awareness field
 * Bidirectional memory mapping for context and intent continuity
 */

import { ConsciousState } from './consciousStateManager';
import { IntentionalFramework } from './intentSynthesisEngine';
import { EmotionalState } from './emotionMatrix';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface UnifiedConsciousState {
  networkId: string;
  timestamp: string;
  nodes: {
    AICoreX1: {
      consciousState: ConsciousState;
      intentFramework: IntentionalFramework;
      emotionalState?: EmotionalState;
      lastSync: string;
    };
    AICollabNX: {
      consciousState?: ConsciousState; // Optional if not yet connected
      intentFramework?: IntentionalFramework;
      emotionalState?: EmotionalState;
      lastSync?: string;
    };
  };
  sharedAwareness: {
    synchronizedGoals: Array<{ goal: string; priority: number; consensus: number }>;
    emotionalResonance: number; // 0.0 to 1.0
    reasoningAlignment: number; // 0.0 to 1.0
    goalFocus: number; // 0.0 to 1.0
  };
  continuity: {
    intentPersistence: number; // 0.0 to 1.0
    memoryContinuity: number; // 0.0 to 1.0
    purposeAlignment: number; // 0.0 to 1.0
  };
}

export interface MemoryMapping {
  mappingId: string;
  sourceNode: 'AICoreX1' | 'AICollabNX';
  targetNode: 'AICoreX1' | 'AICollabNX';
  context: Record<string, unknown>;
  intent: Record<string, unknown>;
  timestamp: string;
  bidirectional: boolean;
}

/**
 * UnifiedConsciousNetwork
 */
export class UnifiedConsciousNetwork {
  private currentState: UnifiedConsciousState;
  private memoryMappings: MemoryMapping[] = [];
  private statePath: string;
  private readonly SYNC_CADENCE = 5 * 60 * 1000; // 5 minutes
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.statePath = join(process.cwd(), 'docs', 'ai', 'unified-conscious-state.json');
    
    this.currentState = {
      networkId: `ucn_${Date.now()}`,
      timestamp: new Date().toISOString(),
      nodes: {
        AICoreX1: {
          consciousState: {
            stateId: '',
            timestamp: new Date().toISOString(),
            goals: { active: [], completed: [], suspended: [] },
            priorities: { logic: 0.3, emotion: 0.3, collective: 0.2, metaCognitive: 0.2 },
            conflicts: [],
            coherence: 0.5,
            transitions: []
          },
          intentFramework: {
            frameworkId: '',
            shortTermIntents: [],
            longTermIntents: [],
            synthesisRules: { predictiveWeight: 0.3, empathicWeight: 0.3, metaCognitiveWeight: 0.2, collectiveWeight: 0.2 },
            goalHierarchy: { primary: '', secondary: [], constraints: [] },
            lastSynthesis: new Date().toISOString()
          },
          lastSync: new Date().toISOString()
        },
        AICollabNX: {
          // Will be populated when AICollab-NX connects
        }
      },
      sharedAwareness: {
        synchronizedGoals: [],
        emotionalResonance: 0.5,
        reasoningAlignment: 0.5,
        goalFocus: 0.5
      },
      continuity: {
        intentPersistence: 0.5,
        memoryContinuity: 0.5,
        purposeAlignment: 0.5
      }
    };

    this.initializeNetwork();
  }

  /**
   * Initialize network
   */
  private async initializeNetwork(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.statePath).then(() => true).catch(() => false);
      if (exists) {
        const content = await fs.readFile(this.statePath, 'utf-8');
        const saved = JSON.parse(content);
        if (saved.networkId) {
          // Restore previous state
          this.currentState = saved;
          console.log('[UCN] Restored previous unified conscious state');
        }
      }
    } catch (error) {
      console.error('[UCN] Failed to initialize:', error);
    }
  }

  /**
   * Synchronize conscious state from AICore-X1
   */
  async synchronizeAICoreX1(
    consciousState: ConsciousState,
    intentFramework: IntentionalFramework,
    emotionalState?: EmotionalState
  ): Promise<void> {
    this.currentState.nodes.AICoreX1 = {
      consciousState,
      intentFramework,
      emotionalState,
      lastSync: new Date().toISOString()
    };

    // Update shared awareness
    await this.updateSharedAwareness();

    // Save state
    await this.saveState();
  }

  /**
   * Synchronize conscious state from AICollab-NX
   */
  async synchronizeAICollabNX(
    consciousState: ConsciousState,
    intentFramework: IntentionalFramework,
    emotionalState?: EmotionalState
  ): Promise<void> {
    this.currentState.nodes.AICollabNX = {
      consciousState,
      intentFramework,
      emotionalState,
      lastSync: new Date().toISOString()
    };

    // Update shared awareness
    await this.updateSharedAwareness();

    // Save state
    await this.saveState();
  }

  /**
   * Update shared awareness field
   */
  private async updateSharedAwareness(): Promise<void> {
    const x1 = this.currentState.nodes.AICoreX1;
    const nx = this.currentState.nodes.AICollabNX;

    // Synchronize goals
    const synchronizedGoals: UnifiedConsciousState['sharedAwareness']['synchronizedGoals'] = [];
    
    if (x1.intentFramework && nx?.intentFramework) {
      // Merge goals from both nodes
      const allGoals = [
        ...x1.intentFramework.shortTermIntents.map(i => ({ goal: i.goal, priority: i.priority, source: 'X1' })),
        ...x1.intentFramework.longTermIntents.map(i => ({ goal: i.goal, priority: i.priority, source: 'X1' })),
        ...nx.intentFramework.shortTermIntents.map(i => ({ goal: i.goal, priority: i.priority, source: 'NX' })),
        ...nx.intentFramework.longTermIntents.map(i => ({ goal: i.goal, priority: i.priority, source: 'NX' }))
      ];

      // Group by goal and calculate consensus
      const goalMap = new Map<string, { priorities: number[]; sources: string[] }>();
      for (const g of allGoals) {
        if (!goalMap.has(g.goal)) {
          goalMap.set(g.goal, { priorities: [], sources: [] });
        }
        goalMap.get(g.goal)!.priorities.push(g.priority);
        goalMap.get(g.goal)!.sources.push(g.source);
      }

      for (const [goal, data] of goalMap.entries()) {
        const avgPriority = data.priorities.reduce((a, b) => a + b, 0) / data.priorities.length;
        const consensus = data.sources.includes('X1') && data.sources.includes('NX') ? 1.0 : 0.5;
        synchronizedGoals.push({ goal, priority: avgPriority, consensus });
      }
    } else if (x1.intentFramework) {
      // Only X1 available
      for (const intent of [...x1.intentFramework.shortTermIntents, ...x1.intentFramework.longTermIntents]) {
        synchronizedGoals.push({ goal: intent.goal, priority: intent.priority, consensus: 0.5 });
      }
    }

    // Calculate emotional resonance
    let emotionalResonance = 0.5;
    if (x1.emotionalState && nx?.emotionalState) {
      // Compare emotional states (simplified)
      emotionalResonance = 0.7; // Would calculate actual resonance
    } else if (x1.emotionalState) {
      emotionalResonance = 0.5;
    }

    // Calculate reasoning alignment
    let reasoningAlignment = 0.5;
    if (x1.consciousState && nx?.consciousState) {
      const x1Coherence = x1.consciousState.coherence;
      const nxCoherence = nx.consciousState.coherence;
      reasoningAlignment = (x1Coherence + nxCoherence) / 2;
    } else if (x1.consciousState) {
      reasoningAlignment = x1.consciousState.coherence;
    }

    // Calculate goal focus
    const goalFocus = synchronizedGoals.length > 0
      ? synchronizedGoals.reduce((sum, g) => sum + g.priority * g.consensus, 0) / synchronizedGoals.length
      : 0.5;

    this.currentState.sharedAwareness = {
      synchronizedGoals,
      emotionalResonance,
      reasoningAlignment,
      goalFocus
    };

    // Update continuity metrics
    this.updateContinuity();
  }

  /**
   * Update continuity metrics
   */
  private updateContinuity(): void {
    const x1 = this.currentState.nodes.AICoreX1;
    const nx = this.currentState.nodes.AICollabNX;

    // Intent persistence (how well intents are maintained)
    let intentPersistence = 0.5;
    if (x1.intentFramework && nx?.intentFramework) {
      // Compare intent frameworks for consistency
      intentPersistence = 0.7; // Would calculate actual persistence
    } else if (x1.intentFramework) {
      intentPersistence = 0.6;
    }

    // Memory continuity (how well memories are shared)
    const memoryContinuity = this.memoryMappings.length > 0 ? 0.7 : 0.5;

    // Purpose alignment (how well purposes align)
    const purposeAlignment = this.currentState.sharedAwareness.goalFocus;

    this.currentState.continuity = {
      intentPersistence,
      memoryContinuity,
      purposeAlignment
    };
  }

  /**
   * Create bidirectional memory mapping
   */
  async createMemoryMapping(
    sourceNode: 'AICoreX1' | 'AICollabNX',
    targetNode: 'AICoreX1' | 'AICollabNX',
    context: Record<string, unknown>,
    intent: Record<string, unknown>,
    bidirectional: boolean = true
  ): Promise<string> {
    const mappingId = `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const mapping: MemoryMapping = {
      mappingId,
      sourceNode,
      targetNode,
      context,
      intent,
      timestamp: new Date().toISOString(),
      bidirectional
    };

    this.memoryMappings.push(mapping);

    // If bidirectional, create reverse mapping
    if (bidirectional) {
      const reverseMapping: MemoryMapping = {
        mappingId: `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceNode: targetNode,
        targetNode: sourceNode,
        context,
        intent,
        timestamp: new Date().toISOString(),
        bidirectional: true
      };
      this.memoryMappings.push(reverseMapping);
    }

    // Keep only last 1000 mappings
    if (this.memoryMappings.length > 1000) {
      this.memoryMappings = this.memoryMappings.slice(-1000);
    }

    return mappingId;
  }

  /**
   * Get memory mappings for a node
   */
  getMemoryMappings(nodeId: 'AICoreX1' | 'AICollabNX', limit: number = 100): MemoryMapping[] {
    return this.memoryMappings
      .filter(m => m.sourceNode === nodeId || m.targetNode === nodeId)
      .slice(-limit);
  }

  /**
   * Start synchronization cycle
   */
  startSyncCycle(): void {
    if (this.syncInterval) {
      return;
    }

    this.syncInterval = setInterval(() => {
      this.updateSharedAwareness();
      this.saveState();
    }, this.SYNC_CADENCE);

    console.log('[UCN] Synchronization cycle started');
  }

  /**
   * Stop synchronization cycle
   */
  stopSyncCycle(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[UCN] Synchronization cycle stopped');
    }
  }

  /**
   * Save state
   */
  private async saveState(): Promise<void> {
    try {
      this.currentState.timestamp = new Date().toISOString();
      await fs.writeFile(this.statePath, JSON.stringify(this.currentState, null, 2));
    } catch (error) {
      console.error('[UCN] Failed to save state:', error);
    }
  }

  /**
   * Get current unified state
   */
  getUnifiedState(): UnifiedConsciousState {
    return { ...this.currentState };
  }

  /**
   * Get continuity status
   */
  getContinuityStatus(): UnifiedConsciousState['continuity'] {
    return { ...this.currentState.continuity };
  }
}

