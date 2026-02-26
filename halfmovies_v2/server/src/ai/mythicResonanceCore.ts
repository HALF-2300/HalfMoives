/**
 * MythicResonanceCore (MRC)
 * Phase 5.3: Align symbolic and emotional frequencies to sustain thematic continuity
 * Introduce Mythic Resonance Index (MRI): target range 0.75-0.95
 */

import { SymbolicAbstractionFramework } from './symbolicAbstractionFramework';
import { NarrativeContinuumEngine } from './narrativeContinuumEngine';
import { EmotionMatrix } from './emotionMatrix';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface MythicResonanceMetrics {
  metricsId: string;
  timestamp: string;
  mythicResonanceIndex: number; // MRI: target 0.75-0.95
  components: {
    symbolicAlignment: number; // 0.0 to 1.0
    emotionalFrequency: number; // 0.0 to 1.0
    thematicContinuity: number; // 0.0 to 1.0
  };
  weights: {
    symbolicAlignment: number; // 0.4
    emotionalFrequency: number; // 0.3
    thematicContinuity: number; // 0.3
  };
  status: 'resonant' | 'aligned' | 'divergent' | 'fragmented';
  archetypeDistribution: Record<string, number>; // Archetype frequencies
}

/**
 * MythicResonanceCore
 */
export class MythicResonanceCore {
  private saf: SymbolicAbstractionFramework;
  private nce: NarrativeContinuumEngine;
  private emotionMatrix: EmotionMatrix;
  private metricsHistory: MythicResonanceMetrics[] = [];
  private journalPath: string;
  private readonly MRI_TARGET_MIN = 0.75;
  private readonly MRI_TARGET_MAX = 0.95;

  constructor(
    saf: SymbolicAbstractionFramework,
    nce: NarrativeContinuumEngine,
    emotionMatrix: EmotionMatrix
  ) {
    this.saf = saf;
    this.nce = nce;
    this.emotionMatrix = emotionMatrix;
    this.journalPath = join(process.cwd(), 'docs', 'ai', 'mythic-resonance-journal.md');
    this.initializeCore();
  }

  /**
   * Initialize core
   */
  private async initializeCore(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[MRC] Failed to initialize:', error);
    }
  }

  /**
   * Calculate mythic resonance
   */
  async calculateMythicResonance(): Promise<MythicResonanceMetrics> {
    const metricsId = `mythic_${Date.now()}`;

    // Get symbol network
    const symbolNetwork = this.saf.getSymbolNetwork();

    // Calculate symbolic alignment
    const symbolicAlignment = this.calculateSymbolicAlignment(symbolNetwork);

    // Calculate emotional frequency
    const emotionalFrequency = this.calculateEmotionalFrequency();

    // Calculate thematic continuity
    const thematicContinuity = this.calculateThematicContinuity();

    // Weights
    const weights = {
      symbolicAlignment: 0.4,
      emotionalFrequency: 0.3,
      thematicContinuity: 0.3
    };

    // Calculate MRI
    const mythicResonanceIndex = (
      symbolicAlignment * weights.symbolicAlignment +
      emotionalFrequency * weights.emotionalFrequency +
      thematicContinuity * weights.thematicContinuity
    );

    // Determine status
    let status: MythicResonanceMetrics['status'];
    if (mythicResonanceIndex >= this.MRI_TARGET_MIN && mythicResonanceIndex <= this.MRI_TARGET_MAX) {
      status = 'resonant';
    } else if (mythicResonanceIndex >= 0.65 && mythicResonanceIndex < this.MRI_TARGET_MIN) {
      status = 'aligned';
    } else if (mythicResonanceIndex >= 0.5 && mythicResonanceIndex < 0.65) {
      status = 'divergent';
    } else {
      status = 'fragmented';
    }

    // Calculate archetype distribution
    const archetypeDistribution = this.calculateArchetypeDistribution(symbolNetwork);

    const metrics: MythicResonanceMetrics = {
      metricsId,
      timestamp: new Date().toISOString(),
      mythicResonanceIndex,
      components: {
        symbolicAlignment,
        emotionalFrequency,
        thematicContinuity
      },
      weights,
      status,
      archetypeDistribution
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }

    // Archive to journal
    await this.archiveToJournal(metrics);

    return metrics;
  }

  /**
   * Calculate symbolic alignment
   */
  private calculateSymbolicAlignment(symbolNetwork: any): number {
    // Alignment = network density and node weights
    let alignment = symbolNetwork.density || 0.5;

    // Boost based on node weights
    if (symbolNetwork.nodes.length > 0) {
      const avgWeight = symbolNetwork.nodes.reduce((sum: number, n: any) => sum + n.weight, 0) / symbolNetwork.nodes.length;
      alignment = (alignment + avgWeight) / 2;
    }

    return alignment;
  }

  /**
   * Calculate emotional frequency
   */
  private calculateEmotionalFrequency(): number {
    const emotionalState = this.emotionMatrix.getCurrentEmotionalState();
    
    // Frequency = how well emotional state aligns with mythic resonance
    // Positive valence and moderate-high arousal = good resonance
    const valenceScore = (emotionalState.valence + 1) / 2; // Normalize to 0-1
    const arousalScore = emotionalState.arousal;
    
    return (valenceScore + arousalScore) / 2;
  }

  /**
   * Calculate thematic continuity
   */
  private calculateThematicContinuity(): number {
    const latestArc = this.nce.getLatestArc();
    
    if (!latestArc) {
      return 0.5;
    }

    return latestArc.thematicContinuity;
  }

  /**
   * Calculate archetype distribution
   */
  private calculateArchetypeDistribution(symbolNetwork: any): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const node of symbolNetwork.nodes) {
      distribution[node.archetype] = node.frequency;
    }

    return distribution;
  }

  /**
   * Archive to journal
   */
  private async archiveToJournal(metrics: MythicResonanceMetrics): Promise<void> {
    try {
      const entry = `
## Mythic Resonance Cycle - ${metrics.timestamp}

### Mythic Resonance Index (MRI): ${metrics.mythicResonanceIndex.toFixed(3)}
**Status:** ${metrics.status}  
**Target Range:** ${this.MRI_TARGET_MIN}-${this.MRI_TARGET_MAX}

### Components
- **Symbolic Alignment:** ${metrics.components.symbolicAlignment.toFixed(3)}
- **Emotional Frequency:** ${metrics.components.emotionalFrequency.toFixed(3)}
- **Thematic Continuity:** ${metrics.components.thematicContinuity.toFixed(3)}

### Archetype Distribution
${Object.entries(metrics.archetypeDistribution).map(([arch, freq]) => `- ${arch}: ${freq}`).join('\n')}

---

`;

      await fs.appendFile(this.journalPath, entry);
    } catch (error) {
      console.error('[MRC] Failed to archive to journal:', error);
    }
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): MythicResonanceMetrics | null {
    return this.metricsHistory.length > 0
      ? this.metricsHistory[this.metricsHistory.length - 1]
      : null;
  }

  /**
   * Get mythic resonance index
   */
  getMythicResonanceIndex(): number {
    const latest = this.getLatestMetrics();
    return latest ? latest.mythicResonanceIndex : 0.5;
  }
}

