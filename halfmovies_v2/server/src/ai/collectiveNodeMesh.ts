/**
 * CollectiveNodeMesh
 * Phase 4.2: Distributed cognition layer enabling shared learned parameters
 * AICore-X1 ↔ AICollab-NX Collective Intelligence Network
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface NodeIdentity {
  nodeId: string;
  nodeType: 'AICore-X1' | 'AICollab-NX' | 'EnhancedLearning' | 'PredictiveBridge';
  capabilities: string[];
  lastSeen: string;
  status: 'active' | 'standby' | 'recovering';
}

export interface MicroAdjustment {
  adjustmentId: string;
  sourceNode: string;
  targetDomain: 'weights' | 'emotions' | 'context' | 'hyperparameters';
  adjustment: Record<string, number>;
  confidence: number; // 0.0 to 1.0
  timestamp: string;
  reinforcementScore?: number;
}

export interface SharedContext {
  contextId: string;
  sourceNode: string;
  contextType: 'user_state' | 'emotional_state' | 'behavioral_pattern' | 'optimization_hint';
  payload: Record<string, unknown>;
  propagationPath: string[]; // Nodes that have received this context
  timestamp: string;
  ttl: number; // Time to live in milliseconds
}

export interface NodeMeshState {
  nodes: Map<string, NodeIdentity>;
  globalLearningState: {
    weights: Record<string, number>;
    emotionalWeights: Record<string, number>;
    hyperparameters: Record<string, number>;
    lastUpdate: string;
  };
  pendingAdjustments: MicroAdjustment[];
  sharedContexts: Map<string, SharedContext>;
  conflictResolutions: Array<{
    conflictId: string;
    conflictingAdjustments: string[];
    resolution: 'merged' | 'selected' | 'averaged';
    timestamp: string;
  }>;
}

/**
 * CollectiveNodeMesh - Distributed cognition network
 */
export class CollectiveNodeMesh {
  private prisma: PrismaClient;
  private meshState: NodeMeshState;
  private readonly NODE_ID = 'AICore-X1';
  private readonly ADJUSTMENT_BATCH_SIZE = 10;
  private readonly CONTEXT_TTL = 5 * 60 * 1000; // 5 minutes
  private meshLogPath: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.meshLogPath = join(process.cwd(), 'docs', 'ai', 'mesh-state.json');
    
    this.meshState = {
      nodes: new Map(),
      globalLearningState: {
        weights: {},
        emotionalWeights: {},
        hyperparameters: {},
        lastUpdate: new Date().toISOString()
      },
      pendingAdjustments: [],
      sharedContexts: new Map(),
      conflictResolutions: []
    };

    // Register this node
    this.registerNode();
    this.initializeMeshState();
  }

  /**
   * Register this node in the mesh
   */
  private registerNode(): void {
    const node: NodeIdentity = {
      nodeId: this.NODE_ID,
      nodeType: 'AICore-X1',
      capabilities: [
        'adaptive_learning',
        'predictive_cognition',
        'empathic_intelligence',
        'contextual_analysis',
        'emotional_modeling'
      ],
      lastSeen: new Date().toISOString(),
      status: 'active'
    };

    this.meshState.nodes.set(this.NODE_ID, node);
  }

  /**
   * Initialize mesh state from disk
   */
  private async initializeMeshState(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.meshLogPath).then(() => true).catch(() => false);
      
      if (exists) {
        const content = await fs.readFile(this.meshLogPath, 'utf-8');
        const saved = JSON.parse(content);
        
        // Restore global learning state
        if (saved.globalLearningState) {
          this.meshState.globalLearningState = saved.globalLearningState;
        }
        
        // Restore nodes (if any)
        if (saved.nodes) {
          saved.nodes.forEach((n: NodeIdentity) => {
            this.meshState.nodes.set(n.nodeId, n);
          });
        }
      }
    } catch (error) {
      console.error('[CollectiveNodeMesh] Failed to initialize:', error);
    }
  }

  /**
   * Contribute micro-adjustment to global learning state
   */
  async contributeAdjustment(adjustment: Omit<MicroAdjustment, 'adjustmentId' | 'timestamp'>): Promise<string> {
    const adjustmentId = `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullAdjustment: MicroAdjustment = {
      ...adjustment,
      adjustmentId,
      timestamp: new Date().toISOString()
    };

    // Add to pending adjustments
    this.meshState.pendingAdjustments.push(fullAdjustment);

    // Check for conflicts
    const conflicts = this.detectConflicts(fullAdjustment);
    if (conflicts.length > 0) {
      await this.resolveConflicts(fullAdjustment, conflicts);
    } else {
      // Apply adjustment immediately
      await this.applyAdjustment(fullAdjustment);
    }

    // Update node last seen
    this.updateNodeStatus(this.NODE_ID, 'active');

    // Save mesh state
    await this.saveMeshState();

    console.log(`[CollectiveNodeMesh] Adjustment contributed: ${adjustmentId} (${adjustment.targetDomain})`);

    return adjustmentId;
  }

  /**
   * Apply adjustment to global learning state
   */
  private async applyAdjustment(adjustment: MicroAdjustment): Promise<void> {
    const { targetDomain, adjustment: values, confidence } = adjustment;

    // Apply with confidence weighting
    const weight = confidence;

    switch (targetDomain) {
      case 'weights':
        for (const [key, value] of Object.entries(values)) {
          this.meshState.globalLearningState.weights[key] = 
            (this.meshState.globalLearningState.weights[key] || 0) * (1 - weight) + value * weight;
        }
        break;

      case 'emotions':
        for (const [key, value] of Object.entries(values)) {
          this.meshState.globalLearningState.emotionalWeights[key] = 
            (this.meshState.globalLearningState.emotionalWeights[key] || 0) * (1 - weight) + value * weight;
        }
        break;

      case 'hyperparameters':
        for (const [key, value] of Object.entries(values)) {
          this.meshState.globalLearningState.hyperparameters[key] = 
            (this.meshState.globalLearningState.hyperparameters[key] || 0) * (1 - weight) + value * weight;
        }
        break;
    }

    this.meshState.globalLearningState.lastUpdate = new Date().toISOString();
  }

  /**
   * Detect conflicts with existing adjustments
   */
  private detectConflicts(newAdjustment: MicroAdjustment): MicroAdjustment[] {
    return this.meshState.pendingAdjustments.filter(adj => {
      // Same domain and overlapping keys
      return adj.targetDomain === newAdjustment.targetDomain &&
             adj.adjustmentId !== newAdjustment.adjustmentId &&
             Object.keys(adj.adjustment).some(key => newAdjustment.adjustment.hasOwnProperty(key));
    });
  }

  /**
   * Resolve conflicts between adjustments
   */
  private async resolveConflicts(
    newAdjustment: MicroAdjustment,
    conflicts: MicroAdjustment[]
  ): Promise<void> {
    const conflictId = `conflict_${Date.now()}`;
    const allAdjustments = [newAdjustment, ...conflicts];

    // Resolution strategy: merge if similar, average if conflicting
    let resolution: 'merged' | 'selected' | 'averaged' = 'averaged';

    // Check if adjustments are similar (within 10%)
    const areSimilar = allAdjustments.every(adj => {
      const avgConfidence = allAdjustments.reduce((sum, a) => sum + a.confidence, 0) / allAdjustments.length;
      return Math.abs(adj.confidence - avgConfidence) < 0.1;
    });

    if (areSimilar) {
      resolution = 'merged';
      // Merge all adjustments
      const merged: Record<string, number> = {};
      for (const adj of allAdjustments) {
        for (const [key, value] of Object.entries(adj.adjustment)) {
          merged[key] = (merged[key] || 0) + value * adj.confidence;
        }
      }
      // Normalize
      const totalConfidence = allAdjustments.reduce((sum, a) => sum + a.confidence, 0);
      for (const key in merged) {
        merged[key] = merged[key] / totalConfidence;
      }
      await this.applyAdjustment({
        ...newAdjustment,
        adjustment: merged,
        confidence: Math.min(1.0, totalConfidence / allAdjustments.length)
      });
    } else {
      // Average conflicting adjustments
      resolution = 'averaged';
      const averaged: Record<string, number> = {};
      for (const adj of allAdjustments) {
        for (const [key, value] of Object.entries(adj.adjustment)) {
          averaged[key] = (averaged[key] || 0) + value;
        }
      }
      for (const key in averaged) {
        averaged[key] = averaged[key] / allAdjustments.length;
      }
      await this.applyAdjustment({
        ...newAdjustment,
        adjustment: averaged,
        confidence: allAdjustments.reduce((sum, a) => sum + a.confidence, 0) / allAdjustments.length
      });
    }

    // Record resolution
    this.meshState.conflictResolutions.push({
      conflictId,
      conflictingAdjustments: allAdjustments.map(a => a.adjustmentId),
      resolution,
      timestamp: new Date().toISOString()
    });

    // Remove resolved adjustments from pending
    this.meshState.pendingAdjustments = this.meshState.pendingAdjustments.filter(
      adj => !allAdjustments.some(a => a.adjustmentId === adj.adjustmentId)
    );

    console.log(`[CollectiveNodeMesh] Conflict resolved: ${conflictId} (${resolution})`);
  }

  /**
   * Share context with other nodes
   */
  async shareContext(context: Omit<SharedContext, 'contextId' | 'timestamp' | 'propagationPath'>): Promise<string> {
    const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullContext: SharedContext = {
      ...context,
      contextId,
      timestamp: new Date().toISOString(),
      propagationPath: [this.NODE_ID]
    };

    this.meshState.sharedContexts.set(contextId, fullContext);

    // In a real distributed system, this would propagate to other nodes
    // For now, we simulate by logging
    console.log(`[CollectiveNodeMesh] Context shared: ${contextId} (${context.contextType})`);

    await this.saveMeshState();

    return contextId;
  }

  /**
   * Receive context from another node
   */
  async receiveContext(context: SharedContext): Promise<void> {
    // Add this node to propagation path
    context.propagationPath.push(this.NODE_ID);

    // Store context
    this.meshState.sharedContexts.set(context.contextId, context);

    // Update source node status
    this.updateNodeStatus(context.sourceNode, 'active');

    console.log(`[CollectiveNodeMesh] Context received: ${context.contextId} from ${context.sourceNode}`);
  }

  /**
   * Get global learning state
   */
  getGlobalLearningState(): NodeMeshState['globalLearningState'] {
    return { ...this.meshState.globalLearningState };
  }

  /**
   * Get shared contexts (with TTL check)
   */
  getSharedContexts(contextType?: string): SharedContext[] {
    const now = Date.now();
    const contexts: SharedContext[] = [];

    for (const context of this.meshState.sharedContexts.values()) {
      // Check TTL
      const age = now - new Date(context.timestamp).getTime();
      if (age > context.ttl) {
        this.meshState.sharedContexts.delete(context.contextId);
        continue;
      }

      if (!contextType || context.contextType === contextType) {
        contexts.push(context);
      }
    }

    return contexts;
  }

  /**
   * Update node status
   */
  private updateNodeStatus(nodeId: string, status: NodeIdentity['status']): void {
    const node = this.meshState.nodes.get(nodeId);
    if (node) {
      node.status = status;
      node.lastSeen = new Date().toISOString();
    }
  }

  /**
   * Save mesh state to disk
   */
  private async saveMeshState(): Promise<void> {
    try {
      const state = {
        nodes: Array.from(this.meshState.nodes.values()),
        globalLearningState: this.meshState.globalLearningState,
        lastSaved: new Date().toISOString()
      };
      await fs.writeFile(this.meshLogPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('[CollectiveNodeMesh] Failed to save state:', error);
    }
  }

  /**
   * Get mesh status
   */
  getMeshStatus(): {
    nodeCount: number;
    activeNodes: number;
    pendingAdjustments: number;
    sharedContexts: number;
    lastUpdate: string;
  } {
    const activeNodes = Array.from(this.meshState.nodes.values())
      .filter(n => n.status === 'active').length;

    return {
      nodeCount: this.meshState.nodes.size,
      activeNodes,
      pendingAdjustments: this.meshState.pendingAdjustments.length,
      sharedContexts: this.meshState.sharedContexts.size,
      lastUpdate: this.meshState.globalLearningState.lastUpdate
    };
  }
}

