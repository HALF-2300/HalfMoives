/**
 * Collective Memory Grid (CMG)
 * Phase 4.5: Archive cumulative experiences and key reasoning paths
 * Hybrid storage: memory fragments (short-term) + consolidated anchors (long-term)
 */

import { promises as fs } from 'fs';
import { join } from 'path';

export interface MemoryFragment {
  fragmentId: string;
  timestamp: string;
  nodeId: 'AICoreX1' | 'AICollabNX';
  type: 'experience' | 'reasoning' | 'decision' | 'learning' | 'conflict';
  content: {
    event: string;
    context: Record<string, unknown>;
    outcome: string;
    significance: number; // 0.0 to 1.0
  };
  tags: string[];
  accessedCount: number;
  lastAccessed: string;
}

export interface MemoryAnchor {
  anchorId: string;
  timestamp: string;
  consolidatedFrom: string[]; // Fragment IDs
  type: 'pattern' | 'principle' | 'strategy' | 'insight';
  content: {
    summary: string;
    keyPoints: string[];
    application: string;
    reliability: number; // 0.0 to 1.0
  };
  tags: string[];
  accessCount: number;
  lastAccessed: string;
}

export interface MemoryGridState {
  fragments: MemoryFragment[];
  anchors: MemoryAnchor[];
  lastConsolidation: string;
  totalFragments: number;
  totalAnchors: number;
}

/**
 * Collective Memory Grid
 */
export class CollectiveMemoryGrid {
  private fragments: MemoryFragment[] = [];
  private anchors: MemoryAnchor[] = [];
  private gridPath: string;
  private readonly FRAGMENT_LIMIT = 10000;
  private readonly ANCHOR_LIMIT = 1000;
  private readonly CONSOLIDATION_THRESHOLD = 10; // Fragments per anchor
  private consolidationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.gridPath = join(process.cwd(), 'docs', 'ai', 'collective-memory-grid.json');
    this.initializeGrid();
  }

  /**
   * Initialize grid
   */
  private async initializeGrid(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.gridPath).then(() => true).catch(() => false);
      if (exists) {
        const content = await fs.readFile(this.gridPath, 'utf-8');
        const saved = JSON.parse(content);
        if (saved.fragments) {
          this.fragments = saved.fragments.slice(-this.FRAGMENT_LIMIT);
        }
        if (saved.anchors) {
          this.anchors = saved.anchors.slice(-this.ANCHOR_LIMIT);
        }
        console.log('[CMG] Restored memory grid');
      }
    } catch (error) {
      console.error('[CMG] Failed to initialize:', error);
    }

    // Start consolidation cycle (every 6 hours)
    this.startConsolidationCycle();
  }

  /**
   * Store memory fragment
   */
  async storeFragment(
    nodeId: 'AICoreX1' | 'AICollabNX',
    type: MemoryFragment['type'],
    event: string,
    context: Record<string, unknown>,
    outcome: string,
    significance: number,
    tags: string[] = []
  ): Promise<string> {
    const fragmentId = `fragment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fragment: MemoryFragment = {
      fragmentId,
      timestamp: new Date().toISOString(),
      nodeId,
      type,
      content: {
        event,
        context,
        outcome,
        significance
      },
      tags,
      accessedCount: 0,
      lastAccessed: new Date().toISOString()
    };

    this.fragments.push(fragment);

    // Keep within limit
    if (this.fragments.length > this.FRAGMENT_LIMIT) {
      // Remove least significant fragments
      this.fragments.sort((a, b) => a.content.significance - b.content.significance);
      this.fragments = this.fragments.slice(-this.FRAGMENT_LIMIT);
    }

    // Auto-save periodically
    if (this.fragments.length % 100 === 0) {
      await this.saveGrid();
    }

    return fragmentId;
  }

  /**
   * Retrieve memory fragments
   */
  retrieveFragments(
    nodeId?: 'AICoreX1' | 'AICollabNX',
    type?: MemoryFragment['type'],
    tags?: string[],
    limit: number = 100
  ): MemoryFragment[] {
    let results = [...this.fragments];

    // Filter by node
    if (nodeId) {
      results = results.filter(f => f.nodeId === nodeId);
    }

    // Filter by type
    if (type) {
      results = results.filter(f => f.type === type);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(f => tags.some(tag => f.tags.includes(tag)));
    }

    // Sort by significance and timestamp
    results.sort((a, b) => {
      const significanceDiff = b.content.significance - a.content.significance;
      if (Math.abs(significanceDiff) > 0.1) {
        return significanceDiff;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return results.slice(0, limit);
  }

  /**
   * Create memory anchor from fragments
   */
  async createAnchor(
    type: MemoryAnchor['type'],
    fragmentIds: string[],
    summary: string,
    keyPoints: string[],
    application: string,
    reliability: number,
    tags: string[] = []
  ): Promise<string> {
    const anchorId = `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const anchor: MemoryAnchor = {
      anchorId,
      timestamp: new Date().toISOString(),
      consolidatedFrom: fragmentIds,
      type,
      content: {
        summary,
        keyPoints,
        application,
        reliability
      },
      tags,
      accessCount: 0,
      lastAccessed: new Date().toISOString()
    };

    this.anchors.push(anchor);

    // Keep within limit
    if (this.anchors.length > this.ANCHOR_LIMIT) {
      // Remove least reliable anchors
      this.anchors.sort((a, b) => a.content.reliability - b.content.reliability);
      this.anchors = this.anchors.slice(-this.ANCHOR_LIMIT);
    }

    await this.saveGrid();
    return anchorId;
  }

  /**
   * Retrieve memory anchors
   */
  retrieveAnchors(
    type?: MemoryAnchor['type'],
    tags?: string[],
    limit: number = 50
  ): MemoryAnchor[] {
    let results = [...this.anchors];

    // Filter by type
    if (type) {
      results = results.filter(a => a.type === type);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(a => tags.some(tag => a.tags.includes(tag)));
    }

    // Sort by reliability and timestamp
    results.sort((a, b) => {
      const reliabilityDiff = b.content.reliability - a.content.reliability;
      if (Math.abs(reliabilityDiff) > 0.1) {
        return reliabilityDiff;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return results.slice(0, limit);
  }

  /**
   * Start consolidation cycle
   */
  private startConsolidationCycle(): void {
    // Consolidate every 6 hours
    this.consolidationInterval = setInterval(() => {
      this.consolidateFragments();
    }, 6 * 60 * 60 * 1000);

    // Run initial consolidation
    this.consolidateFragments();
  }

  /**
   * Consolidate fragments into anchors
   */
  private async consolidateFragments(): Promise<void> {
    console.log('[CMG] Starting fragment consolidation...');

    // Group fragments by type and tags
    const groups = new Map<string, MemoryFragment[]>();

    for (const fragment of this.fragments) {
      const key = `${fragment.type}_${fragment.tags.sort().join(',')}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(fragment);
    }

    // Consolidate groups with enough fragments
    for (const [key, fragments] of groups.entries()) {
      if (fragments.length >= this.CONSOLIDATION_THRESHOLD) {
        // Check if anchor already exists
        const existingAnchor = this.anchors.find(a => 
          a.type === fragments[0].type &&
          a.tags.sort().join(',') === fragments[0].tags.sort().join(',')
        );

        if (!existingAnchor) {
          // Create new anchor
          const fragmentIds = fragments.map(f => f.fragmentId);
          const summary = `Consolidated ${fragments.length} ${fragments[0].type} fragments`;
          const keyPoints = fragments
            .slice(0, 5)
            .map(f => f.content.event);
          const avgSignificance = fragments.reduce((sum, f) => sum + f.content.significance, 0) / fragments.length;
          const reliability = Math.min(1.0, avgSignificance * 1.2); // Boost for consolidation

          await this.createAnchor(
            this.mapTypeToAnchorType(fragments[0].type),
            fragmentIds,
            summary,
            keyPoints,
            'Apply consolidated knowledge in similar contexts',
            reliability,
            fragments[0].tags
          );
        }
      }
    }

    this.saveGrid();
    console.log('[CMG] Consolidation complete');
  }

  /**
   * Map fragment type to anchor type
   */
  private mapTypeToAnchorType(fragmentType: MemoryFragment['type']): MemoryAnchor['type'] {
    switch (fragmentType) {
      case 'experience':
      case 'learning':
        return 'pattern';
      case 'reasoning':
        return 'principle';
      case 'decision':
        return 'strategy';
      case 'conflict':
        return 'insight';
      default:
        return 'pattern';
    }
  }

  /**
   * Save grid
   */
  private async saveGrid(): Promise<void> {
    try {
      const state: MemoryGridState = {
        fragments: this.fragments,
        anchors: this.anchors,
        lastConsolidation: new Date().toISOString(),
        totalFragments: this.fragments.length,
        totalAnchors: this.anchors.length
      };

      await fs.writeFile(this.gridPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('[CMG] Failed to save grid:', error);
    }
  }

  /**
   * Get grid statistics
   */
  getStatistics(): {
    totalFragments: number;
    totalAnchors: number;
    fragmentsByType: Record<string, number>;
    anchorsByType: Record<string, number>;
  } {
    const fragmentsByType: Record<string, number> = {};
    for (const fragment of this.fragments) {
      fragmentsByType[fragment.type] = (fragmentsByType[fragment.type] || 0) + 1;
    }

    const anchorsByType: Record<string, number> = {};
    for (const anchor of this.anchors) {
      anchorsByType[anchor.type] = (anchorsByType[anchor.type] || 0) + 1;
    }

    return {
      totalFragments: this.fragments.length,
      totalAnchors: this.anchors.length,
      fragmentsByType,
      anchorsByType
    };
  }
}

