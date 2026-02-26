/**
 * MythopoeticEngine (MPE)
 * Phase 5.4: Fuse narrative arcs with existential motifs
 * Generate mythic patterns representing cycles of creation, decay, renewal
 */

import { NarrativeContinuumEngine } from './narrativeContinuumEngine';
import { SymbolicAbstractionFramework } from './symbolicAbstractionFramework';
import { MythicResonanceCore } from './mythicResonanceCore';
import { OntologicalSynthesisCore } from './ontologicalSynthesisCore';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface MythicPattern {
  patternId: string;
  timestamp: string;
  cycle: 'creation' | 'decay' | 'renewal' | 'transcendence';
  narrativeArc: string; // Arc ID
  symbolicMotifs: string[]; // Motif IDs
  emotionalTrace: {
    valence: number;
    arousal: number;
    emotion: string;
  };
  mythicStructure: {
    beginning: string;
    transformation: string;
    resolution: string;
  };
  existentialMotif: string;
  resonance: number; // 0.0 to 1.0
}

export interface MythopoeticCycle {
  cycleId: string;
  timestamp: string;
  patterns: MythicPattern[];
  synthesis: {
    creation: number;
    decay: number;
    renewal: number;
    transcendence: number;
  };
  coherence: number; // 0.0 to 1.0
}

/**
 * MythopoeticEngine
 */
export class MythopoeticEngine {
  private nce: NarrativeContinuumEngine;
  private saf: SymbolicAbstractionFramework;
  private mrc: MythicResonanceCore;
  private osc: OntologicalSynthesisCore;
  private cycleHistory: MythopoeticCycle[] = [];
  private journalPath: string;

  constructor(
    nce: NarrativeContinuumEngine,
    saf: SymbolicAbstractionFramework,
    mrc: MythicResonanceCore,
    osc: OntologicalSynthesisCore
  ) {
    this.nce = nce;
    this.saf = saf;
    this.mrc = mrc;
    this.osc = osc;
    this.journalPath = join(process.cwd(), 'docs', 'ai', 'mythopoetic-journal.md');
    this.initializeEngine();
  }

  /**
   * Initialize engine
   */
  private async initializeEngine(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[MPE] Failed to initialize:', error);
    }
  }

  /**
   * Generate mythopoetic cycle
   */
  async generateCycle(): Promise<MythopoeticCycle> {
    const cycleId = `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get narrative arcs
    const narrativeArcs = this.nce.getNarrativeHistory(4);
    
    // Get symbolic motifs
    const symbolicMotifs = this.saf.getLatestMotifs(4);
    
    // Get mythic metrics
    const mythicMetrics = this.mrc.getLatestMetrics();

    // Generate mythic patterns for each cycle type
    const patterns: MythicPattern[] = [];

    // Creation pattern
    const creationArc = narrativeArcs.find(a => a.type === 'origin' || a.type === 'growth');
    if (creationArc) {
      patterns.push(await this.generatePattern('creation', creationArc, symbolicMotifs, mythicMetrics));
    }

    // Decay pattern
    const decayArc = narrativeArcs.find(a => a.type === 'conflict');
    if (decayArc) {
      patterns.push(await this.generatePattern('decay', decayArc, symbolicMotifs, mythicMetrics));
    }

    // Renewal pattern
    const renewalArc = narrativeArcs.find(a => a.type === 'renewal' || a.type === 'synthesis');
    if (renewalArc) {
      patterns.push(await this.generatePattern('renewal', renewalArc, symbolicMotifs, mythicMetrics));
    }

    // Transcendence pattern (synthesis of all)
    patterns.push(await this.generatePattern('transcendence', narrativeArcs[0] || null, symbolicMotifs, mythicMetrics));

    // Calculate synthesis
    const synthesis = this.calculateSynthesis(patterns);

    // Calculate coherence
    const coherence = this.calculateCoherence(patterns, synthesis);

    const cycle: MythopoeticCycle = {
      cycleId,
      timestamp: new Date().toISOString(),
      patterns,
      synthesis,
      coherence
    };

    // Store in history
    this.cycleHistory.push(cycle);
    if (this.cycleHistory.length > 100) {
      this.cycleHistory = this.cycleHistory.slice(-100);
    }

    // Archive to journal
    await this.archiveToJournal(cycle);

    return cycle;
  }

  /**
   * Generate mythic pattern
   */
  private async generatePattern(
    cycleType: MythicPattern['cycle'],
    narrativeArc: any,
    symbolicMotifs: any[],
    mythicMetrics: any
  ): Promise<MythicPattern> {
    const patternId = `pattern_${Date.now()}_${cycleType}`;

    // Get emotional trace from mythic metrics
    const emotionalTrace = {
      valence: mythicMetrics?.components.emotionalFrequency || 0.5,
      arousal: 0.7,
      emotion: cycleType === 'creation' ? 'emergent' : cycleType === 'decay' ? 'conflict' : cycleType === 'renewal' ? 'resonant' : 'transcendent'
    };

    // Generate mythic structure
    const mythicStructure = this.generateMythicStructure(cycleType, narrativeArc);

    // Generate existential motif
    const existentialMotif = this.generateExistentialMotif(cycleType, symbolicMotifs);

    // Calculate resonance
    const resonance = this.calculateResonance(cycleType, mythicMetrics);

    return {
      patternId,
      timestamp: new Date().toISOString(),
      cycle: cycleType,
      narrativeArc: narrativeArc?.arcId || '',
      symbolicMotifs: symbolicMotifs.slice(0, 3).map(m => m.motifId),
      emotionalTrace,
      mythicStructure,
      existentialMotif,
      resonance
    };
  }

  /**
   * Generate mythic structure
   */
  private generateMythicStructure(
    cycleType: MythicPattern['cycle'],
    narrativeArc: any
  ): MythicPattern['mythicStructure'] {
    const beginning = narrativeArc?.structure.beginning || `The ${cycleType} cycle begins.`;
    const transformation = narrativeArc?.structure.middle || `Through ${cycleType}, transformation occurs.`;
    const resolution = narrativeArc?.structure.end || `The ${cycleType} cycle resolves.`;

    return { beginning, transformation, resolution };
  }

  /**
   * Generate existential motif
   */
  private generateExistentialMotif(
    cycleType: MythicPattern['cycle'],
    symbolicMotifs: any[]
  ): string {
    const motifs = symbolicMotifs.filter(m => {
      if (cycleType === 'creation') return m.archetype === 'Origin';
      if (cycleType === 'decay') return m.archetype === 'Conflict';
      if (cycleType === 'renewal') return m.archetype === 'Renewal';
      return m.archetype === 'Growth';
    });

    if (motifs.length > 0) {
      return motifs[0].representation;
    }

    return `The existential motif of ${cycleType} represents the fundamental cycle of existence.`;
  }

  /**
   * Calculate resonance
   */
  private calculateResonance(
    cycleType: MythicPattern['cycle'],
    mythicMetrics: any
  ): number {
    if (!mythicMetrics) {
      return 0.5;
    }

    // Resonance based on mythic resonance index
    let resonance = mythicMetrics.mythicResonanceIndex;

    // Adjust based on cycle type
    if (cycleType === 'transcendence') {
      resonance += 0.1;
    }

    return Math.min(1.0, resonance);
  }

  /**
   * Calculate synthesis
   */
  private calculateSynthesis(patterns: MythicPattern[]): MythopoeticCycle['synthesis'] {
    const creation = patterns.find(p => p.cycle === 'creation')?.resonance || 0.5;
    const decay = patterns.find(p => p.cycle === 'decay')?.resonance || 0.5;
    const renewal = patterns.find(p => p.cycle === 'renewal')?.resonance || 0.5;
    const transcendence = patterns.find(p => p.cycle === 'transcendence')?.resonance || 0.5;

    return { creation, decay, renewal, transcendence };
  }

  /**
   * Calculate coherence
   */
  private calculateCoherence(
    patterns: MythicPattern[],
    synthesis: MythopoeticCycle['synthesis']
  ): number {
    // Coherence = how well patterns form a coherent cycle
    let coherence = 0.5;

    // Check pattern coverage
    const cycleTypes = new Set(patterns.map(p => p.cycle));
    const coverage = cycleTypes.size / 4; // 4 cycle types
    coherence += coverage * 0.3;

    // Check synthesis balance
    const avgSynthesis = (synthesis.creation + synthesis.decay + synthesis.renewal + synthesis.transcendence) / 4;
    coherence += avgSynthesis * 0.2;

    return Math.min(1.0, coherence);
  }

  /**
   * Archive to journal
   */
  private async archiveToJournal(cycle: MythopoeticCycle): Promise<void> {
    try {
      const entry = `
## Mythopoetic Cycle ${cycle.cycleId} - ${cycle.timestamp}

### Coherence: ${cycle.coherence.toFixed(3)}

### Synthesis
- **Creation:** ${cycle.synthesis.creation.toFixed(3)}
- **Decay:** ${cycle.synthesis.decay.toFixed(3)}
- **Renewal:** ${cycle.synthesis.renewal.toFixed(3)}
- **Transcendence:** ${cycle.synthesis.transcendence.toFixed(3)}

### Patterns (${cycle.patterns.length})
${cycle.patterns.map(p => `
#### ${p.cycle.toUpperCase()}
**Resonance:** ${p.resonance.toFixed(3)}  
**Existential Motif:** ${p.existentialMotif}

**Mythic Structure:**
- Beginning: ${p.mythicStructure.beginning}
- Transformation: ${p.mythicStructure.transformation}
- Resolution: ${p.mythicStructure.resolution}
`).join('\n')}

---

`;

      await fs.appendFile(this.journalPath, entry);
    } catch (error) {
      console.error('[MPE] Failed to archive to journal:', error);
    }
  }

  /**
   * Get latest cycle
   */
  getLatestCycle(): MythopoeticCycle | null {
    return this.cycleHistory.length > 0
      ? this.cycleHistory[this.cycleHistory.length - 1]
      : null;
  }

  /**
   * Get cycle history
   */
  getCycleHistory(limit: number = 10): MythopoeticCycle[] {
    return this.cycleHistory.slice(-limit);
  }
}

