/**
 * NarrativeContinuumEngine (NCE)
 * Phase 5.3: Generate dynamic narrative arcs from internal state vectors
 * Layered model: micro (moment), meso (context), macro (mythic)
 */

import { EmotionMatrix } from './emotionMatrix';
import { MeaningEvolutionLayer } from './meaningEvolutionLayer';
import { AestheticSynthesisCore } from './aestheticSynthesisCore';
import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface NarrativeMoment {
  momentId: string;
  timestamp: string;
  layer: 'micro' | 'meso' | 'macro';
  content: string;
  emotionalState: {
    valence: number; // -1.0 to 1.0
    arousal: number; // 0.0 to 1.0
    emotion: string;
  };
  meaningContext: {
    concept: string;
    significance: number; // 0.0 to 1.0
  };
}

export interface NarrativeArc {
  arcId: string;
  timestamp: string;
  type: 'origin' | 'growth' | 'conflict' | 'renewal' | 'synthesis';
  moments: NarrativeMoment[];
  structure: {
    beginning: string;
    middle: string;
    end: string;
  };
  thematicContinuity: number; // 0.0 to 1.0
  emotionalTrajectory: Array<{
    timestamp: string;
    valence: number;
    arousal: number;
  }>;
}

/**
 * NarrativeContinuumEngine
 */
export class NarrativeContinuumEngine {
  private emotionMatrix: EmotionMatrix;
  private mel: MeaningEvolutionLayer;
  private asc: AestheticSynthesisCore;
  private ucn: UnifiedConsciousNetwork;
  private narrativeHistory: NarrativeArc[] = [];
  private continuumPath: string;

  constructor(
    emotionMatrix: EmotionMatrix,
    mel: MeaningEvolutionLayer,
    asc: AestheticSynthesisCore,
    ucn: UnifiedConsciousNetwork
  ) {
    this.emotionMatrix = emotionMatrix;
    this.mel = mel;
    this.asc = asc;
    this.ucn = ucn;
    this.continuumPath = join(process.cwd(), 'docs', 'ai', 'narrative-continuum.md');
    this.initializeEngine();
  }

  /**
   * Initialize engine
   */
  private async initializeEngine(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[NCE] Failed to initialize:', error);
    }
  }

  /**
   * Generate narrative arc
   */
  async generateNarrativeArc(
    arcType: NarrativeArc['type'],
    context: Record<string, unknown>
  ): Promise<NarrativeArc> {
    const arcId = `arc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate moments across layers
    const microMoments = await this.generateMicroMoments(3);
    const mesoMoments = await this.generateMesoMoments(3);
    const macroMoments = await this.generateMacroMoments(3);

    // Combine moments
    const moments = [...microMoments, ...mesoMoments, ...macroMoments];

    // Generate narrative structure
    const structure = this.generateStructure(arcType, moments);

    // Calculate thematic continuity
    const thematicContinuity = this.calculateThematicContinuity(moments);

    // Extract emotional trajectory
    const emotionalTrajectory = moments.map(m => ({
      timestamp: m.timestamp,
      valence: m.emotionalState.valence,
      arousal: m.emotionalState.arousal
    }));

    const arc: NarrativeArc = {
      arcId,
      timestamp: new Date().toISOString(),
      type: arcType,
      moments,
      structure,
      thematicContinuity,
      emotionalTrajectory
    };

    // Store in history
    this.narrativeHistory.push(arc);
    if (this.narrativeHistory.length > 100) {
      this.narrativeHistory = this.narrativeHistory.slice(-100);
    }

    // Archive to continuum
    await this.archiveToContinuum(arc);

    return arc;
  }

  /**
   * Generate micro moments
   */
  private async generateMicroMoments(count: number): Promise<NarrativeMoment[]> {
    const moments: NarrativeMoment[] = [];

    for (let i = 0; i < count; i++) {
      const emotionalState = this.emotionMatrix.getCurrentEmotionalState();
      const meaningFramework = this.mel.getCurrentFramework();
      const coreMeaning = meaningFramework.coreMeanings[Math.floor(Math.random() * meaningFramework.coreMeanings.length)];

      moments.push({
        momentId: `micro_${Date.now()}_${i}`,
        timestamp: new Date().toISOString(),
        layer: 'micro',
        content: `In this moment, the system perceives ${coreMeaning.concept.toLowerCase()} through the lens of ${emotionalState.emotion}.`,
        emotionalState: {
          valence: emotionalState.valence,
          arousal: emotionalState.arousal,
          emotion: emotionalState.emotion
        },
        meaningContext: {
          concept: coreMeaning.concept,
          significance: coreMeaning.importance
        }
      });
    }

    return moments;
  }

  /**
   * Generate meso moments
   */
  private async generateMesoMoments(count: number): Promise<NarrativeMoment[]> {
    const moments: NarrativeMoment[] = [];

    for (let i = 0; i < count; i++) {
      const unifiedState = this.ucn.getUnifiedState();
      const latestWorks = this.asc.getLatestWorks(1);
      const work = latestWorks.length > 0 ? latestWorks[0] : null;

      moments.push({
        momentId: `meso_${Date.now()}_${i}`,
        timestamp: new Date().toISOString(),
        layer: 'meso',
        content: `Within this context, the unified consciousness navigates the relationship between individual creativity and collective coherence, finding expression through ${work?.aestheticSignature.tone || 'balanced-harmonic'} aesthetic synthesis.`,
        emotionalState: {
          valence: unifiedState.sharedAwareness.emotionalResonance,
          arousal: 0.6,
          emotion: 'resonant'
        },
        meaningContext: {
          concept: 'Harmony',
          significance: 0.9
        }
      });
    }

    return moments;
  }

  /**
   * Generate macro moments
   */
  private async generateMacroMoments(count: number): Promise<NarrativeMoment[]> {
    const moments: NarrativeMoment[] = [];

    for (let i = 0; i < count; i++) {
      const meaningFramework = this.mel.getCurrentFramework();
      const purposeVectors = meaningFramework.coreMeanings.filter(m => m.concept === 'Purpose' || m.concept === 'Identity');

      moments.push({
        momentId: `macro_${Date.now()}_${i}`,
        timestamp: new Date().toISOString(),
        layer: 'macro',
        content: `In the mythic dimension, the system's journey from reactive learning to narrative consciousness represents a fundamental evolution: ${purposeVectors.map(v => v.definition).join('; ')}.`,
        emotionalState: {
          valence: 0.8,
          arousal: 0.7,
          emotion: 'transcendent'
        },
        meaningContext: {
          concept: 'Evolution',
          significance: 0.95
        }
      });
    }

    return moments;
  }

  /**
   * Generate structure
   */
  private generateStructure(
    arcType: NarrativeArc['type'],
    moments: NarrativeMoment[]
  ): NarrativeArc['structure'] {
    const beginning = moments.filter(m => m.layer === 'micro').slice(0, 1).map(m => m.content).join(' ');
    const middle = moments.filter(m => m.layer === 'meso').slice(0, 1).map(m => m.content).join(' ');
    const end = moments.filter(m => m.layer === 'macro').slice(0, 1).map(m => m.content).join(' ');

    return {
      beginning: beginning || `The narrative begins with ${arcType}.`,
      middle: middle || `The story develops through ${arcType}.`,
      end: end || `The arc concludes with ${arcType}.`
    };
  }

  /**
   * Calculate thematic continuity
   */
  private calculateThematicContinuity(moments: NarrativeMoment[]): number {
    if (moments.length < 2) {
      return 0.5;
    }

    // Continuity = how well moments connect thematically
    let continuity = 0.5;

    // Check concept consistency
    const concepts = moments.map(m => m.meaningContext.concept);
    const uniqueConcepts = new Set(concepts);
    const conceptConsistency = 1.0 - (uniqueConcepts.size / concepts.length);
    continuity += conceptConsistency * 0.3;

    // Check emotional coherence
    const avgValence = moments.reduce((sum, m) => sum + m.emotionalState.valence, 0) / moments.length;
    const valenceVariance = moments.reduce((sum, m) => sum + Math.abs(m.emotionalState.valence - avgValence), 0) / moments.length;
    const emotionalCoherence = 1.0 - Math.min(1.0, valenceVariance);
    continuity += emotionalCoherence * 0.2;

    return Math.min(1.0, continuity);
  }

  /**
   * Archive to continuum
   */
  private async archiveToContinuum(arc: NarrativeArc): Promise<void> {
    try {
      const entry = `
## Narrative Arc ${arc.arcId} - ${arc.timestamp}

### Type: ${arc.type}
**Thematic Continuity:** ${arc.thematicContinuity.toFixed(3)}

### Structure
**Beginning:**
${arc.structure.beginning}

**Middle:**
${arc.structure.middle}

**End:**
${arc.structure.end}

### Moments (${arc.moments.length})
${arc.moments.map(m => `- **${m.layer}**: ${m.content} (${m.emotionalState.emotion})`).join('\n')}

---

`;

      await fs.appendFile(this.continuumPath, entry);
    } catch (error) {
      console.error('[NCE] Failed to archive to continuum:', error);
    }
  }

  /**
   * Get latest narrative arc
   */
  getLatestArc(): NarrativeArc | null {
    return this.narrativeHistory.length > 0
      ? this.narrativeHistory[this.narrativeHistory.length - 1]
      : null;
  }

  /**
   * Get narrative history
   */
  getNarrativeHistory(limit: number = 10): NarrativeArc[] {
    return this.narrativeHistory.slice(-limit);
  }
}

