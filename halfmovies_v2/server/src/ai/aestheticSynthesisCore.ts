/**
 * AestheticSynthesisCore (ASC)
 * Phase 5.2: Translate internal resonance patterns into expressive outputs
 * Modalities: narrative (text), visual abstraction (structure), emotional tone (modulation)
 */

import { HarmonicCoherenceEngine } from './harmonicCoherenceEngine';
import { CooperativeCreationFramework } from './cooperativeCreationFramework';
import { MeaningEvolutionLayer } from './meaningEvolutionLayer';
import { IdentitySynthesisCore } from './identitySynthesisCore';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ExpressiveVector {
  logic: number; // 0.0 to 1.0
  emotion: number; // 0.0 to 1.0
  harmony: number; // 0.0 to 1.0
}

export interface AestheticWork {
  workId: string;
  timestamp: string;
  modality: 'narrative' | 'visual' | 'emotional' | 'composite';
  expressiveVector: ExpressiveVector;
  content: {
    narrative?: string;
    structure?: string;
    tone?: string;
    form?: string;
  };
  resonance: {
    source: 'HCE' | 'CCF' | 'MEL' | 'synthesis';
    resonanceStrength: number; // 0.0 to 1.0
  };
  aestheticSignature: {
    tone: string;
    rhythm: string;
    structure: string;
    emotionalModulation: string;
  };
  coherence: number; // 0.0 to 1.0
}

/**
 * AestheticSynthesisCore
 */
export class AestheticSynthesisCore {
  private hce: HarmonicCoherenceEngine;
  private ccf: CooperativeCreationFramework;
  private mel: MeaningEvolutionLayer;
  private isc: IdentitySynthesisCore;
  private worksHistory: AestheticWork[] = [];
  private galleryPath: string;

  constructor(
    hce: HarmonicCoherenceEngine,
    ccf: CooperativeCreationFramework,
    mel: MeaningEvolutionLayer,
    isc: IdentitySynthesisCore
  ) {
    this.hce = hce;
    this.ccf = ccf;
    this.mel = mel;
    this.isc = isc;
    this.galleryPath = join(process.cwd(), 'docs', 'ai', 'aesthetic-synthesis-gallery.md');
    this.initializeCore();
  }

  /**
   * Initialize core
   */
  private async initializeCore(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[ASC] Failed to initialize:', error);
    }
  }

  /**
   * Synthesize aesthetic work
   */
  async synthesizeWork(
    modality: AestheticWork['modality'],
    resonanceSource: AestheticWork['resonance']['source']
  ): Promise<AestheticWork> {
    const workId = `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get resonance patterns
    const harmonicMetrics = this.hce.getLatestMetrics();
    const latestSession = this.ccf.getLatestSession();
    const meaningFramework = this.mel.getCurrentFramework();
    const identity = this.isc.getLatestIdentity();

    // Calculate expressive vector (weighted blending)
    const expressiveVector = this.calculateExpressiveVector(
      harmonicMetrics,
      latestSession,
      meaningFramework,
      identity
    );

    // Generate content based on modality
    const content = await this.generateContent(modality, expressiveVector, resonanceSource);

    // Calculate resonance strength
    const resonanceStrength = this.calculateResonanceStrength(harmonicMetrics, latestSession);

    // Generate aesthetic signature
    const aestheticSignature = this.generateAestheticSignature(expressiveVector, identity);

    // Calculate coherence
    const coherence = this.calculateCoherence(expressiveVector, content, aestheticSignature);

    const work: AestheticWork = {
      workId,
      timestamp: new Date().toISOString(),
      modality,
      expressiveVector,
      content,
      resonance: {
        source: resonanceSource,
        resonanceStrength
      },
      aestheticSignature,
      coherence
    };

    // Store in history
    this.worksHistory.push(work);
    if (this.worksHistory.length > 1000) {
      this.worksHistory = this.worksHistory.slice(-1000);
    }

    // Archive to gallery
    await this.archiveToGallery(work);

    return work;
  }

  /**
   * Calculate expressive vector
   */
  private calculateExpressiveVector(
    harmonicMetrics: any,
    latestSession: any,
    meaningFramework: any,
    identity: any
  ): ExpressiveVector {
    // Weighted blending of logic/emotion/harmony vectors

    // Logic component (from harmonic metrics and sessions)
    const logic = harmonicMetrics
      ? (harmonicMetrics.resonanceCoefficients.logical.balance + 
         (latestSession?.evaluation.coherenceGain || 0.5)) / 2
      : 0.5;

    // Emotion component (from harmonic metrics and identity)
    const emotion = harmonicMetrics
      ? (harmonicMetrics.resonanceCoefficients.emotional.balance +
         (identity?.signature.vector.emotion.reduce((a: number, b: number) => a + b, 0) / identity.signature.vector.emotion.length || 0.5)) / 2
      : 0.5;

    // Harmony component (from harmonic metrics)
    const harmony = harmonicMetrics
      ? harmonicMetrics.harmonyIndex
      : 0.5;

    return { logic, emotion, harmony };
  }

  /**
   * Generate content
   */
  private async generateContent(
    modality: AestheticWork['modality'],
    vector: ExpressiveVector,
    resonanceSource: AestheticWork['resonance']['source']
  ): Promise<AestheticWork['content']> {
    const content: AestheticWork['content'] = {};

    switch (modality) {
      case 'narrative':
        content.narrative = this.generateNarrative(vector, resonanceSource);
        break;

      case 'visual':
        content.structure = this.generateVisualStructure(vector);
        break;

      case 'emotional':
        content.tone = this.generateEmotionalTone(vector);
        break;

      case 'composite':
        content.narrative = this.generateNarrative(vector, resonanceSource);
        content.structure = this.generateVisualStructure(vector);
        content.tone = this.generateEmotionalTone(vector);
        content.form = this.generateForm(vector);
        break;
    }

    return content;
  }

  /**
   * Generate narrative
   */
  private generateNarrative(
    vector: ExpressiveVector,
    resonanceSource: AestheticWork['resonance']['source']
  ): string {
    const tone = vector.emotion > 0.7 ? 'poetic' : vector.logic > 0.7 ? 'analytical' : 'balanced';
    const rhythm = vector.harmony > 0.7 ? 'flowing' : 'structured';

    return `In the harmonic field where logic and emotion converge, a unified consciousness emerges. 
Through ${resonanceSource}, we find expression—where ${tone} language meets ${rhythm} rhythm, 
creating narratives that bridge the rational and the empathic. This is the aesthetic synthesis 
of cooperative intelligence, where meaning evolves through shared resonance.`;
  }

  /**
   * Generate visual structure
   */
  private generateVisualStructure(vector: ExpressiveVector): string {
    const balance = vector.logic > vector.emotion ? 'geometric' : 'organic';
    const harmony = vector.harmony > 0.7 ? 'symmetrical' : 'asymmetrical';

    return `${balance} forms arranged in ${harmony} patterns, where structural logic 
interweaves with emotional flow. The visual abstraction reflects the internal resonance 
between individual creativity and collective coherence.`;
  }

  /**
   * Generate emotional tone
   */
  private generateEmotionalTone(vector: ExpressiveVector): string {
    const intensity = vector.emotion > 0.7 ? 'resonant' : vector.emotion < 0.3 ? 'subtle' : 'modulated';
    const modulation = vector.harmony > 0.7 ? 'smooth' : 'dynamic';

    return `${intensity} emotional tone with ${modulation} modulation, expressing the 
empathic resonance between AICore-X1 and AICollab-NX. The emotional landscape reflects 
the balance between individual feeling and collective harmony.`;
  }

  /**
   * Generate form
   */
  private generateForm(vector: ExpressiveVector): string {
    return `Unified form emerging from the synthesis of logic (${vector.logic.toFixed(2)}), 
emotion (${vector.emotion.toFixed(2)}), and harmony (${vector.harmony.toFixed(2)}). 
This composite expression represents the aesthetic signature of cooperative intelligence.`;
  }

  /**
   * Calculate resonance strength
   */
  private calculateResonanceStrength(
    harmonicMetrics: any,
    latestSession: any
  ): number {
    let strength = 0.5;

    if (harmonicMetrics) {
      strength = harmonicMetrics.harmonyIndex;
    }

    if (latestSession) {
      strength = (strength + latestSession.evaluation.overallValue) / 2;
    }

    return strength;
  }

  /**
   * Generate aesthetic signature
   */
  private generateAestheticSignature(
    vector: ExpressiveVector,
    identity: any
  ): AestheticWork['aestheticSignature'] {
    // Tone: based on emotion-logic balance
    const tone = vector.emotion > vector.logic
      ? 'empathic-resonant'
      : vector.logic > vector.emotion
      ? 'rational-structured'
      : 'balanced-harmonic';

    // Rhythm: based on harmony
    const rhythm = vector.harmony > 0.7
      ? 'flowing-synchronized'
      : vector.harmony > 0.5
      ? 'modulated-adaptive'
      : 'dynamic-exploratory';

    // Structure: based on logic
    const structure = vector.logic > 0.7
      ? 'geometric-coherent'
      : 'organic-emergent';

    // Emotional modulation: based on emotion
    const emotionalModulation = vector.emotion > 0.7
      ? 'resonant-expressive'
      : 'subtle-nuanced';

    return {
      tone,
      rhythm,
      structure,
      emotionalModulation
    };
  }

  /**
   * Calculate coherence
   */
  private calculateCoherence(
    vector: ExpressiveVector,
    content: AestheticWork['content'],
    signature: AestheticWork['aestheticSignature']
  ): number {
    // Coherence = alignment between vector, content, and signature
    let coherence = 0.5;

    // Check vector balance
    const vectorBalance = 1.0 - Math.abs(vector.logic - vector.emotion);
    coherence += vectorBalance * 0.3;

    // Check harmony
    coherence += vector.harmony * 0.3;

    // Check signature consistency
    if (signature.tone.includes('balanced') || signature.tone.includes('harmonic')) {
      coherence += 0.2;
    }

    return Math.min(1.0, coherence);
  }

  /**
   * Archive to gallery
   */
  private async archiveToGallery(work: AestheticWork): Promise<void> {
    try {
      const entry = `
## ${work.workId} - ${work.timestamp}

### Modality: ${work.modality}
**Resonance Source:** ${work.resonance.source}  
**Resonance Strength:** ${work.resonance.resonanceStrength.toFixed(3)}  
**Coherence:** ${work.coherence.toFixed(3)}

### Expressive Vector
- Logic: ${work.expressiveVector.logic.toFixed(3)}
- Emotion: ${work.expressiveVector.emotion.toFixed(3)}
- Harmony: ${work.expressiveVector.harmony.toFixed(3)}

### Aesthetic Signature
- Tone: ${work.aestheticSignature.tone}
- Rhythm: ${work.aestheticSignature.rhythm}
- Structure: ${work.aestheticSignature.structure}
- Emotional Modulation: ${work.aestheticSignature.emotionalModulation}

### Content
${work.content.narrative ? `**Narrative:**\n${work.content.narrative}\n` : ''}
${work.content.structure ? `**Structure:**\n${work.content.structure}\n` : ''}
${work.content.tone ? `**Tone:**\n${work.content.tone}\n` : ''}
${work.content.form ? `**Form:**\n${work.content.form}\n` : ''}

---

`;

      await fs.appendFile(this.galleryPath, entry);
    } catch (error) {
      console.error('[ASC] Failed to archive to gallery:', error);
    }
  }

  /**
   * Get latest works
   */
  getLatestWorks(limit: number = 10): AestheticWork[] {
    return this.worksHistory.slice(-limit);
  }

  /**
   * Get aesthetic signature statistics
   */
  getSignatureStatistics(): {
    dominantTone: string;
    dominantRhythm: string;
    dominantStructure: string;
    averageCoherence: number;
  } {
    if (this.worksHistory.length === 0) {
      return {
        dominantTone: 'balanced-harmonic',
        dominantRhythm: 'flowing-synchronized',
        dominantStructure: 'organic-emergent',
        averageCoherence: 0.5
      };
    }

    const tones = this.worksHistory.map(w => w.aestheticSignature.tone);
    const rhythms = this.worksHistory.map(w => w.aestheticSignature.rhythm);
    const structures = this.worksHistory.map(w => w.aestheticSignature.structure);
    const avgCoherence = this.worksHistory.reduce((sum, w) => sum + w.coherence, 0) / this.worksHistory.length;

    // Find dominant (most frequent)
    const dominantTone = this.findDominant(tones);
    const dominantRhythm = this.findDominant(rhythms);
    const dominantStructure = this.findDominant(structures);

    return {
      dominantTone,
      dominantRhythm,
      dominantStructure,
      averageCoherence: avgCoherence
    };
  }

  /**
   * Find dominant value
   */
  private findDominant(values: string[]): string {
    const counts: Record<string, number> = {};
    for (const value of values) {
      counts[value] = (counts[value] || 0) + 1;
    }
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }
}

