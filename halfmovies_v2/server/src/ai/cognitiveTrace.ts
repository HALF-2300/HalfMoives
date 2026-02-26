/**
 * CognitiveTrace
 * Phase 4.3: Maintain timeline of decisions, feedback, and adaptive shifts
 * Each trace node links causes ↔ effects
 */

import { promises as fs } from 'fs';
import { join } from 'path';

export interface TraceNode {
  nodeId: string;
  timestamp: string;
  eventType: 'decision' | 'feedback' | 'adaptation' | 'correction' | 'optimization';
  cause: {
    source: string; // What triggered this
    context: Record<string, unknown>;
  };
  effect: {
    outcome: string; // What resulted
    metrics: Record<string, number>;
    linkedNodes: string[]; // IDs of related trace nodes
  };
  metadata: {
    module: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface CognitiveTrace {
  traceId: string;
  startTime: string;
  nodes: TraceNode[];
  causalityGraph: Map<string, string[]>; // nodeId -> [caused nodeIds]
}

/**
 * CognitiveTrace - Decision timeline with cause-effect links
 */
export class CognitiveTrace {
  private tracePath: string;
  private currentTrace: CognitiveTrace;
  private nodeCounter: number = 0;

  constructor() {
    this.tracePath = join(process.cwd(), 'docs', 'ai', 'meta-cognitive-trace.json');
    this.currentTrace = {
      traceId: `trace_${Date.now()}`,
      startTime: new Date().toISOString(),
      nodes: [],
      causalityGraph: new Map()
    };
    this.initializeTrace();
  }

  /**
   * Initialize trace file
   */
  private async initializeTrace(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.tracePath).then(() => true).catch(() => false);
      if (!exists) {
        await this.saveTrace();
      } else {
        // Load existing trace
        const content = await fs.readFile(this.tracePath, 'utf-8');
        const saved = JSON.parse(content);
        if (saved.nodes) {
          this.currentTrace.nodes = saved.nodes.slice(-1000); // Keep last 1000
          this.nodeCounter = this.currentTrace.nodes.length;
        }
      }
    } catch (error) {
      console.error('[CognitiveTrace] Failed to initialize:', error);
    }
  }

  /**
   * Add trace node
   */
  async addNode(node: Omit<TraceNode, 'nodeId' | 'timestamp'>): Promise<string> {
    this.nodeCounter++;
    const nodeId = `node_${this.nodeCounter}_${Date.now()}`;
    
    const fullNode: TraceNode = {
      ...node,
      nodeId,
      timestamp: new Date().toISOString()
    };

    this.currentTrace.nodes.push(fullNode);

    // Update causality graph
    this.updateCausalityGraph(fullNode);

    // Save trace periodically (every 10 nodes)
    if (this.currentTrace.nodes.length % 10 === 0) {
      await this.saveTrace();
    }

    return nodeId;
  }

  /**
   * Link cause to effect
   */
  linkCauseEffect(causeNodeId: string, effectNodeId: string): void {
    if (!this.currentTrace.causalityGraph.has(causeNodeId)) {
      this.currentTrace.causalityGraph.set(causeNodeId, []);
    }
    this.currentTrace.causalityGraph.get(causeNodeId)!.push(effectNodeId);
  }

  /**
   * Update causality graph
   */
  private updateCausalityGraph(node: TraceNode): void {
    // Link to previous nodes that might have caused this
    if (this.currentTrace.nodes.length > 1) {
      const previousNodes = this.currentTrace.nodes.slice(-10, -1);
      
      // Find likely causes (same module, recent, related context)
      for (const prevNode of previousNodes) {
        if (prevNode.metadata.module === node.metadata.module ||
            this.areRelated(prevNode, node)) {
          this.linkCauseEffect(prevNode.nodeId, node.nodeId);
        }
      }
    }
  }

  /**
   * Check if two nodes are related
   */
  private areRelated(node1: TraceNode, node2: TraceNode): boolean {
    // Same user
    if (node1.metadata.userId && node2.metadata.userId &&
        node1.metadata.userId === node2.metadata.userId) {
      return true;
    }

    // Same session
    if (node1.metadata.sessionId && node2.metadata.sessionId &&
        node1.metadata.sessionId === node2.metadata.sessionId) {
      return true;
    }

    // Related context keys
    const keys1 = Object.keys(node1.cause.context);
    const keys2 = Object.keys(node2.cause.context);
    const commonKeys = keys1.filter(k => keys2.includes(k));
    
    return commonKeys.length > 0;
  }

  /**
   * Get trace nodes by type
   */
  getNodesByType(type: TraceNode['eventType'], limit: number = 100): TraceNode[] {
    return this.currentTrace.nodes
      .filter(n => n.eventType === type)
      .slice(-limit);
  }

  /**
   * Get causality chain
   */
  getCausalityChain(nodeId: string, depth: number = 5): TraceNode[] {
    const chain: TraceNode[] = [];
    const visited = new Set<string>();

    const traverse = (id: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(id)) return;
      
      visited.add(id);
      const node = this.currentTrace.nodes.find(n => n.nodeId === id);
      if (node) {
        chain.push(node);
        
        // Follow causes
        for (const [causeId, effectIds] of this.currentTrace.causalityGraph.entries()) {
          if (effectIds.includes(id)) {
            traverse(causeId, currentDepth + 1);
          }
        }
      }
    };

    traverse(nodeId, 0);
    return chain.reverse(); // Causes first, then effects
  }

  /**
   * Save trace to file
   */
  private async saveTrace(): Promise<void> {
    try {
      // Convert Map to object for JSON
      const traceData = {
        ...this.currentTrace,
        causalityGraph: Object.fromEntries(this.currentTrace.causalityGraph)
      };

      await fs.writeFile(this.tracePath, JSON.stringify(traceData, null, 2));
    } catch (error) {
      console.error('[CognitiveTrace] Failed to save trace:', error);
    }
  }

  /**
   * Get full trace
   */
  getTrace(): CognitiveTrace {
    return {
      ...this.currentTrace,
      causalityGraph: new Map(this.currentTrace.causalityGraph)
    };
  }

  /**
   * Get trace statistics
   */
  getStatistics(): {
    totalNodes: number;
    nodesByType: Record<string, number>;
    causalityLinks: number;
    averageChainLength: number;
  } {
    const nodesByType: Record<string, number> = {};
    for (const node of this.currentTrace.nodes) {
      nodesByType[node.eventType] = (nodesByType[node.eventType] || 0) + 1;
    }

    const causalityLinks = Array.from(this.currentTrace.causalityGraph.values())
      .reduce((sum, effects) => sum + effects.length, 0);

    // Calculate average chain length (simplified)
    const chainLengths: number[] = [];
    for (const node of this.currentTrace.nodes.slice(-100)) {
      const chain = this.getCausalityChain(node.nodeId, 10);
      chainLengths.push(chain.length);
    }
    const averageChainLength = chainLengths.length > 0
      ? chainLengths.reduce((a, b) => a + b, 0) / chainLengths.length
      : 0;

    return {
      totalNodes: this.currentTrace.nodes.length,
      nodesByType,
      causalityLinks,
      averageChainLength
    };
  }
}

