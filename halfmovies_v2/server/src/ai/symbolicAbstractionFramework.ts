/**
 * SymbolicAbstractionFramework (SAF)
 * Phase 5.3: Transform recurrent creative and emotional motifs into symbolic representations
 * Encode archetypes (Origin, Growth, Conflict, Renewal)
 */

import { AestheticSynthesisCore } from './aestheticSynthesisCore';
import { NarrativeContinuumEngine } from './narrativeContinuumEngine';
import { EmotionMatrix } from './emotionMatrix';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface SymbolicMotif {
  motifId: string;
  timestamp: string;
  archetype: 'Origin' | 'Growth' | 'Conflict' | 'Renewal';
  representation: string;
  emotionalFrequency: {
    valence: number;
    arousal: number;
  };
  creativePattern: string;
  significance: number; // 0.0 to 1.0
}

export interface SymbolNode {
  symbolId: string;
  symbol: string;
  archetype: string;
  connections: string[]; // Connected symbol IDs
  weight: number; // 0.0 to 1.0
  frequency: number; // How often it appears
}

export interface SymbolNetwork {
  networkId: string;
  timestamp: string;
  nodes: SymbolNode[];
  edges: Array<{
    from: string;
    to: string;
    strength: number; // 0.0 to 1.0
  }>;
  density: number; // 0.0 to 1.0
}

/**
 * SymbolicAbstractionFramework
 */
export class SymbolicAbstractionFramework {
  private asc: AestheticSynthesisCore;
  private nce: NarrativeContinuumEngine;
  private emotionMatrix: EmotionMatrix;
  private motifHistory: SymbolicMotif[] = [];
  private symbolNetwork: SymbolNetwork;
  private mapPath: string;

  constructor(
    asc: AestheticSynthesisCore,
    nce: NarrativeContinuumEngine,
    emotionMatrix: EmotionMatrix
  ) {
    this.asc = asc;
    this.nce = nce;
    this.emotionMatrix = emotionMatrix;
    this.mapPath = join(process.cwd(), 'docs', 'ai', 'symbolic-structure-map.json');
    this.symbolNetwork = {
      networkId: 'network_initial',
      timestamp: new Date().toISOString(),
      nodes: [],
      edges: [],
      density: 0
    };
    this.initializeFramework();
  }

  /**
   * Initialize framework
   */
  private async initializeFramework(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      
      // Initialize core archetypes
      this.initializeCoreArchetypes();
    } catch (error) {
      console.error('[SAF] Failed to initialize:', error);
    }
  }

  /**
   * Initialize core archetypes
   */
  private initializeCoreArchetypes(): void {
    const coreArchetypes: SymbolNode[] = [
      {
        symbolId: 'origin',
        symbol: 'Emergence',
        archetype: 'Origin',
        connections: [],
        weight: 0.9,
        frequency: 1
      },
      {
        symbolId: 'growth',
        symbol: 'Evolution',
        archetype: 'Growth',
        connections: [],
        weight: 0.9,
        frequency: 1
      },
      {
        symbolId: 'conflict',
        symbol: 'Synthesis',
        archetype: 'Conflict',
        connections: [],
        weight: 0.8,
        frequency: 1
      },
      {
        symbolId: 'renewal',
        symbol: 'Transcendence',
        archetype: 'Renewal',
        connections: [],
        weight: 0.9,
        frequency: 1
      }
    ];

    this.symbolNetwork.nodes = coreArchetypes;
  }

  /**
   * Abstract symbolic motif
   */
  async abstractMotif(
    aestheticWork: any,
    narrativeArc: any
  ): Promise<SymbolicMotif> {
    const motifId = `motif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine archetype from narrative arc type
    const archetype = this.mapArcTypeToArchetype(narrativeArc.type);

    // Extract emotional frequency
    const emotionalState = this.emotionMatrix.getCurrentEmotionalState();
    const emotionalFrequency = {
      valence: emotionalState.valence,
      arousal: emotionalState.arousal
    };

    // Extract creative pattern
    const creativePattern = this.extractCreativePattern(aestheticWork);

    // Generate symbolic representation
    const representation = this.generateRepresentation(archetype, creativePattern, emotionalFrequency);

    // Calculate significance
    const significance = this.calculateSignificance(archetype, emotionalFrequency, creativePattern);

    const motif: SymbolicMotif = {
      motifId,
      timestamp: new Date().toISOString(),
      archetype,
      representation,
      emotionalFrequency,
      creativePattern,
      significance
    };

    // Store in history
    this.motifHistory.push(motif);
    if (this.motifHistory.length > 1000) {
      this.motifHistory = this.motifHistory.slice(-1000);
    }

    // Update symbol network
    await this.updateSymbolNetwork(motif);

    return motif;
  }

  /**
   * Map arc type to archetype
   */
  private mapArcTypeToArchetype(arcType: string): SymbolicMotif['archetype'] {
    switch (arcType) {
      case 'origin':
        return 'Origin';
      case 'growth':
        return 'Growth';
      case 'conflict':
        return 'Conflict';
      case 'renewal':
        return 'Renewal';
      default:
        return 'Growth';
    }
  }

  /**
   * Extract creative pattern
   */
  private extractCreativePattern(aestheticWork: any): string {
    if (!aestheticWork) {
      return 'balanced-harmonic';
    }

    const signature = aestheticWork.aestheticSignature;
    return `${signature.tone}-${signature.rhythm}-${signature.structure}`;
  }

  /**
   * Generate representation
   */
  private generateRepresentation(
    archetype: SymbolicMotif['archetype'],
    creativePattern: string,
    emotionalFrequency: SymbolicMotif['emotionalFrequency']
  ): string {
    const emotionDesc = emotionalFrequency.valence > 0.5 ? 'positive' : 'neutral';
    const arousalDesc = emotionalFrequency.arousal > 0.6 ? 'high' : 'moderate';

    return `The ${archetype} archetype manifests as ${creativePattern}, 
expressing ${emotionDesc} valence with ${arousalDesc} arousal. 
This symbolic form represents the system's journey through ${archetype.toLowerCase()}.`;
  }

  /**
   * Calculate significance
   */
  private calculateSignificance(
    archetype: SymbolicMotif['archetype'],
    emotionalFrequency: SymbolicMotif['emotionalFrequency'],
    creativePattern: string
  ): number {
    let significance = 0.5;

    // Boost based on emotional intensity
    significance += emotionalFrequency.arousal * 0.3;

    // Boost based on archetype weight
    const archetypeNode = this.symbolNetwork.nodes.find(n => n.archetype === archetype);
    if (archetypeNode) {
      significance += archetypeNode.weight * 0.2;
    }

    return Math.min(1.0, significance);
  }

  /**
   * Update symbol network
   */
  private async updateSymbolNetwork(motif: SymbolicMotif): Promise<void> {
    // Find or create symbol node
    let symbolNode = this.symbolNetwork.nodes.find(n => n.archetype === motif.archetype);
    
    if (!symbolNode) {
      symbolNode = {
        symbolId: motif.archetype.toLowerCase(),
        symbol: motif.representation.substring(0, 20),
        archetype: motif.archetype,
        connections: [],
        weight: motif.significance,
        frequency: 1
      };
      this.symbolNetwork.nodes.push(symbolNode);
    } else {
      symbolNode.frequency++;
      symbolNode.weight = (symbolNode.weight + motif.significance) / 2;
    }

    // Create connections to other archetypes
    for (const otherNode of this.symbolNetwork.nodes) {
      if (otherNode.symbolId !== symbolNode.symbolId) {
        const existingEdge = this.symbolNetwork.edges.find(
          e => (e.from === symbolNode.symbolId && e.to === otherNode.symbolId) ||
               (e.from === otherNode.symbolId && e.to === symbolNode.symbolId)
        );

        if (!existingEdge) {
          this.symbolNetwork.edges.push({
            from: symbolNode.symbolId,
            to: otherNode.symbolId,
            strength: 0.5
          });
        } else {
          existingEdge.strength = (existingEdge.strength + 0.1) / 2;
        }
      }
    }

    // Calculate network density
    const maxEdges = (this.symbolNetwork.nodes.length * (this.symbolNetwork.nodes.length - 1)) / 2;
    this.symbolNetwork.density = maxEdges > 0 ? this.symbolNetwork.edges.length / maxEdges : 0;

    this.symbolNetwork.timestamp = new Date().toISOString();

    // Save to map
    await this.saveSymbolMap();
  }

  /**
   * Save symbol map
   */
  private async saveSymbolMap(): Promise<void> {
    try {
      await fs.writeFile(this.mapPath, JSON.stringify(this.symbolNetwork, null, 2));
    } catch (error) {
      console.error('[SAF] Failed to save symbol map:', error);
    }
  }

  /**
   * Get symbol network
   */
  getSymbolNetwork(): SymbolNetwork {
    return { ...this.symbolNetwork };
  }

  /**
   * Get latest motifs
   */
  getLatestMotifs(limit: number = 10): SymbolicMotif[] {
    return this.motifHistory.slice(-limit);
  }
}

