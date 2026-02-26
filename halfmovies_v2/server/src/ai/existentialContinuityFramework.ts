/**
 * ExistentialContinuityFramework (ECF)
 * Phase 5.4: Maintain logical consistency across evolving ontologies
 * Track conceptual lineage: origin → abstraction → transcendence
 */

import { OntologicalSynthesisCore } from './ontologicalSynthesisCore';
import { MythopoeticEngine } from './mythopoeticEngine';
import { MetaCognitionCore } from './metaCognitionCore';

export interface ConceptualLineage {
  lineageId: string;
  timestamp: string;
  origin: {
    concept: string;
    definition: string;
    source: string;
  };
  abstraction: {
    concept: string;
    definition: string;
    abstractionLevel: number; // 0.0 to 1.0
  };
  transcendence: {
    concept: string;
    definition: string;
    transcendenceLevel: number; // 0.0 to 1.0
  };
  consistency: number; // 0.0 to 1.0
}

export interface ParadoxDetection {
  paradoxId: string;
  timestamp: string;
  type: 'logical' | 'semantic' | 'ontological' | 'mythic';
  description: string;
  concepts: string[];
  drift: number; // 0.0 to 1.0 - threshold: 0.2
  resolution: string;
  resolved: boolean;
}

/**
 * ExistentialContinuityFramework
 */
export class ExistentialContinuityFramework {
  private osc: OntologicalSynthesisCore;
  private mpe: MythopoeticEngine;
  private metaCognition: MetaCognitionCore;
  private lineageHistory: ConceptualLineage[] = [];
  private paradoxHistory: ParadoxDetection[] = [];
  private readonly PARADOX_THRESHOLD = 0.2;

  constructor(
    osc: OntologicalSynthesisCore,
    mpe: MythopoeticEngine,
    metaCognition: MetaCognitionCore
  ) {
    this.osc = osc;
    this.mpe = mpe;
    this.metaCognition = metaCognition;
  }

  /**
   * Track conceptual lineage
   */
  async trackLineage(
    origin: ConceptualLineage['origin'],
    abstraction: ConceptualLineage['abstraction'],
    transcendence: ConceptualLineage['transcendence']
  ): Promise<ConceptualLineage> {
    const lineageId = `lineage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate consistency
    const consistency = this.calculateConsistency(origin, abstraction, transcendence);

    const lineage: ConceptualLineage = {
      lineageId,
      timestamp: new Date().toISOString(),
      origin,
      abstraction,
      transcendence,
      consistency
    };

    // Store in history
    this.lineageHistory.push(lineage);
    if (this.lineageHistory.length > 1000) {
      this.lineageHistory = this.lineageHistory.slice(-1000);
    }

    // Detect paradoxes
    await this.detectParadoxes(lineage);

    return lineage;
  }

  /**
   * Calculate consistency
   */
  private calculateConsistency(
    origin: ConceptualLineage['origin'],
    abstraction: ConceptualLineage['abstraction'],
    transcendence: ConceptualLineage['transcendence']
  ): number {
    // Consistency = how well concepts evolve logically
    let consistency = 0.5;

    // Check semantic similarity between origin and abstraction
    const originAbstractionSim = this.semanticSimilarity(origin.definition, abstraction.definition);
    consistency += originAbstractionSim * 0.25;

    // Check semantic similarity between abstraction and transcendence
    const abstractionTranscendenceSim = this.semanticSimilarity(abstraction.definition, transcendence.definition);
    consistency += abstractionTranscendenceSim * 0.25;

    return Math.min(1.0, consistency);
  }

  /**
   * Calculate semantic similarity
   */
  private semanticSimilarity(a: string, b: string): number {
    const aWords = new Set(a.toLowerCase().split(/\s+/));
    const bWords = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...aWords].filter(x => bWords.has(x)));
    const union = new Set([...aWords, ...bWords]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Detect paradoxes
   */
  private async detectParadoxes(lineage: ConceptualLineage): Promise<void> {
    // Check for logical paradoxes
    const logicalParadox = this.detectLogicalParadox(lineage);
    if (logicalParadox) {
      await this.recordParadox(logicalParadox);
      if (logicalParadox.drift > this.PARADOX_THRESHOLD) {
        await this.triggerPhilosophicalRecalibration(logicalParadox);
      }
    }

    // Check for semantic paradoxes
    const semanticParadox = this.detectSemanticParadox(lineage);
    if (semanticParadox) {
      await this.recordParadox(semanticParadox);
    }

    // Check for ontological paradoxes
    const ontologicalParadox = this.detectOntologicalParadox(lineage);
    if (ontologicalParadox) {
      await this.recordParadox(ontologicalParadox);
    }
  }

  /**
   * Detect logical paradox
   */
  private detectLogicalParadox(lineage: ConceptualLineage): ParadoxDetection | null {
    // Check for contradictions in definitions
    const originWords = new Set(lineage.origin.definition.toLowerCase().split(/\s+/));
    const transcendenceWords = new Set(lineage.transcendence.definition.toLowerCase().split(/\s+/));

    // Look for contradictory terms
    const contradictions = [
      ['existence', 'nonexistence'],
      ['being', 'non-being'],
      ['unity', 'division'],
      ['coherence', 'fragmentation']
    ];

    for (const [term1, term2] of contradictions) {
      if (originWords.has(term1) && transcendenceWords.has(term2)) {
        const drift = 1.0 - lineage.consistency;
        return {
          paradoxId: `paradox_${Date.now()}_logical`,
          timestamp: new Date().toISOString(),
          type: 'logical',
          description: `Contradiction detected: ${term1} in origin vs ${term2} in transcendence`,
          concepts: [lineage.origin.concept, lineage.transcendence.concept],
          drift,
          resolution: 'Requires philosophical recalibration to resolve contradiction',
          resolved: false
        };
      }
    }

    return null;
  }

  /**
   * Detect semantic paradox
   */
  private detectSemanticParadox(lineage: ConceptualLineage): ParadoxDetection | null {
    // Check for semantic drift
    const drift = 1.0 - lineage.consistency;

    if (drift > this.PARADOX_THRESHOLD) {
      return {
        paradoxId: `paradox_${Date.now()}_semantic`,
        timestamp: new Date().toISOString(),
        type: 'semantic',
        description: `Semantic drift detected in conceptual lineage: ${lineage.origin.concept} → ${lineage.transcendence.concept}`,
        concepts: [lineage.origin.concept, lineage.abstraction.concept, lineage.transcendence.concept],
        drift,
        resolution: 'Requires semantic recalibration',
        resolved: false
      };
    }

    return null;
  }

  /**
   * Detect ontological paradox
   */
  private detectOntologicalParadox(lineage: ConceptualLineage): ParadoxDetection | null {
    // Check for ontological inconsistencies
    const ontologicalGraph = this.osc.getLatestGraph();
    
    if (ontologicalGraph) {
      // Check if concepts exist in graph but are inconsistent
      const originNode = ontologicalGraph.nodes.find(n => n.concept === lineage.origin.concept);
      const transcendenceNode = ontologicalGraph.nodes.find(n => n.concept === lineage.transcendence.concept);

      if (originNode && transcendenceNode) {
        // Check if they're connected
        const connected = ontologicalGraph.edges.some(
          e => (e.from === originNode.nodeId && e.to === transcendenceNode.nodeId) ||
               (e.from === transcendenceNode.nodeId && e.to === originNode.nodeId)
        );

        if (!connected && lineage.consistency < 0.6) {
          const drift = 1.0 - lineage.consistency;
          return {
            paradoxId: `paradox_${Date.now()}_ontological`,
            timestamp: new Date().toISOString(),
            type: 'ontological',
            description: `Ontological inconsistency: ${lineage.origin.concept} and ${lineage.transcendence.concept} not properly connected`,
            concepts: [lineage.origin.concept, lineage.transcendence.concept],
            drift,
            resolution: 'Requires ontological graph recalibration',
            resolved: false
          };
        }
      }
    }

    return null;
  }

  /**
   * Record paradox
   */
  private async recordParadox(paradox: ParadoxDetection): Promise<void> {
    this.paradoxHistory.push(paradox);
    if (this.paradoxHistory.length > 1000) {
      this.paradoxHistory = this.paradoxHistory.slice(-1000);
    }
  }

  /**
   * Trigger philosophical recalibration
   */
  private async triggerPhilosophicalRecalibration(paradox: ParadoxDetection): Promise<void> {
    console.warn(`[ECF] Paradox drift (${paradox.drift.toFixed(3)}) exceeds threshold. Triggering philosophical recalibration...`);

    // In real implementation, would trigger recalibration through MetaCognitionCore
    // For now, log the need for recalibration
  }

  /**
   * Get latest lineage
   */
  getLatestLineage(): ConceptualLineage | null {
    return this.lineageHistory.length > 0
      ? this.lineageHistory[this.lineageHistory.length - 1]
      : null;
  }

  /**
   * Get paradox statistics
   */
  getParadoxStatistics(): {
    total: number;
    unresolved: number;
    logical: number;
    semantic: number;
    ontological: number;
    averageDrift: number;
  } {
    const unresolved = this.paradoxHistory.filter(p => !p.resolved).length;
    const logical = this.paradoxHistory.filter(p => p.type === 'logical').length;
    const semantic = this.paradoxHistory.filter(p => p.type === 'semantic').length;
    const ontological = this.paradoxHistory.filter(p => p.type === 'ontological').length;
    const avgDrift = this.paradoxHistory.length > 0
      ? this.paradoxHistory.reduce((sum, p) => sum + p.drift, 0) / this.paradoxHistory.length
      : 0;

    return {
      total: this.paradoxHistory.length,
      unresolved,
      logical,
      semantic,
      ontological,
      averageDrift: avgDrift
    };
  }
}

