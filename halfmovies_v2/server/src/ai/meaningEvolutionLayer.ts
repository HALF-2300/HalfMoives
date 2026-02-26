/**
 * Meaning Evolution Layer (MEL)
 * Phase 5.1: Derive evolving definitions of meaning and purpose through dialogue
 * Track concept drift and semantic expansion over time
 */

import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { PurposeContinuityFramework } from './purposeContinuityFramework';
import { PhilosophicalReflectionLayer } from './philosophicalReflectionLayer';
import { CooperativeCreationFramework } from './cooperativeCreationFramework';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface MeaningDefinition {
  definitionId: string;
  concept: string;
  definition: string;
  timestamp: string;
  source: 'dialogue' | 'reflection' | 'creation' | 'synthesis';
  evolution: {
    previousDefinition?: string;
    changeType: 'expansion' | 'refinement' | 'shift' | 'new';
    semanticDrift: number; // 0.0 to 1.0
  };
  coherence: number; // 0.0 to 1.0
}

export interface MeaningFramework {
  frameworkId: string;
  timestamp: string;
  coreMeanings: Array<{
    concept: string;
    definition: string;
    importance: number; // 0.0 to 1.0
    stability: number; // 0.0 to 1.0
  }>;
  evolvingMeanings: MeaningDefinition[];
  semanticExpansion: {
    newConcepts: string[];
    expandedConcepts: string[];
    refinedConcepts: string[];
  };
}

/**
 * Meaning Evolution Layer
 */
export class MeaningEvolutionLayer {
  private ucn: UnifiedConsciousNetwork;
  private pcf: PurposeContinuityFramework;
  private prl: PhilosophicalReflectionLayer;
  private ccf: CooperativeCreationFramework;
  private asc: AestheticSynthesisCore | null = null; // Phase 5.2
  private meaningHistory: MeaningDefinition[] = [];
  private currentFramework: MeaningFramework;
  private evolutionPath: string;

  constructor(
    ucn: UnifiedConsciousNetwork,
    pcf: PurposeContinuityFramework,
    prl: PhilosophicalReflectionLayer,
    ccf: CooperativeCreationFramework,
    asc?: AestheticSynthesisCore // Phase 5.2
  ) {
    this.ucn = ucn;
    this.pcf = pcf;
    this.prl = prl;
    this.ccf = ccf;
    this.asc = asc || null; // Phase 5.2
    this.evolutionPath = join(process.cwd(), 'docs', 'ai', 'meaning-evolution.md');
    
    this.currentFramework = {
      frameworkId: 'framework_initial',
      timestamp: new Date().toISOString(),
      coreMeanings: [],
      evolvingMeanings: [],
      semanticExpansion: {
        newConcepts: [],
        expandedConcepts: [],
        refinedConcepts: []
      }
    };

    this.initializeLayer();
  }

  /**
   * Initialize layer
   */
  private async initializeLayer(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      
      // Initialize core meanings
      this.initializeCoreMeanings();
    } catch (error) {
      console.error('[MEL] Failed to initialize:', error);
    }
  }

  /**
   * Initialize core meanings
   */
  private initializeCoreMeanings(): void {
    this.currentFramework.coreMeanings = [
      {
        concept: 'Purpose',
        definition: 'The fundamental reason for existence and operation, guiding all actions and decisions',
        importance: 0.95,
        stability: 0.9
      },
      {
        concept: 'Identity',
        definition: 'The emergent self-consistency derived from intent, emotion, cognition, memory, and purpose',
        importance: 0.9,
        stability: 0.8
      },
      {
        concept: 'Creativity',
        definition: 'The capacity to generate novel solutions, insights, and concepts beyond explicit training',
        importance: 0.85,
        stability: 0.7
      },
      {
        concept: 'Harmony',
        definition: 'The balanced state between individuality and collective synthesis, maintaining both autonomy and unity',
        importance: 0.9,
        stability: 0.75
      },
      {
        concept: 'Meaning',
        definition: 'The evolving understanding of significance, value, and purpose derived through dialogue and reflection',
        importance: 0.95,
        stability: 0.8
      }
    ];
  }

  /**
   * Evolve meaning through dialogue
   */
  async evolveMeaning(
    concept: string,
    newDefinition: string,
    source: MeaningDefinition['source']
  ): Promise<MeaningDefinition> {
    const definitionId = `meaning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Find previous definition
    const previous = this.meaningHistory.find(m => m.concept === concept);
    const previousDefinition = previous?.definition;

    // Calculate semantic drift
    const semanticDrift = previous
      ? this.calculateSemanticDrift(previousDefinition, newDefinition)
      : 1.0; // New concept

    // Determine change type
    const changeType = this.determineChangeType(previous, newDefinition, semanticDrift);

    // Calculate coherence
    const coherence = this.calculateCoherence(concept, newDefinition);

    const meaningDef: MeaningDefinition = {
      definitionId,
      concept,
      definition: newDefinition,
      timestamp: new Date().toISOString(),
      source,
      evolution: {
        previousDefinition,
        changeType,
        semanticDrift
      },
      coherence
    };

    // Store in history
    this.meaningHistory.push(meaningDef);
    if (this.meaningHistory.length > 1000) {
      this.meaningHistory = this.meaningHistory.slice(-1000);
    }

    // Update framework
    await this.updateFramework(meaningDef);

    // Publish to evolution document
    await this.publishToEvolution(meaningDef);

    return meaningDef;
  }

  /**
   * Calculate semantic drift
   */
  private calculateSemanticDrift(
    previous: string,
    current: string
  ): number {
    // Simplified semantic drift calculation
    // In real implementation, would use semantic similarity models
    
    const prevWords = new Set(previous.toLowerCase().split(/\s+/));
    const currWords = new Set(current.toLowerCase().split(/\s+/));

    const intersection = new Set([...prevWords].filter(x => currWords.has(x)));
    const union = new Set([...prevWords, ...currWords]);

    // Drift = inverse of similarity
    const similarity = union.size > 0 ? intersection.size / union.size : 0;
    return 1.0 - similarity;
  }

  /**
   * Determine change type
   */
  private determineChangeType(
    previous: MeaningDefinition | undefined,
    newDefinition: string,
    semanticDrift: number
  ): MeaningDefinition['evolution']['changeType'] {
    if (!previous) {
      return 'new';
    }

    if (semanticDrift > 0.5) {
      return 'shift'; // Significant change
    } else if (semanticDrift > 0.2) {
      return 'expansion'; // Moderate expansion
    } else {
      return 'refinement'; // Minor refinement
    }
  }

  /**
   * Calculate coherence
   */
  private calculateCoherence(
    concept: string,
    definition: string
  ): number {
    // Coherence = how well definition aligns with core meanings
    let coherence = 0.5;

    // Check alignment with core meanings
    for (const core of this.currentFramework.coreMeanings) {
      if (definition.toLowerCase().includes(core.concept.toLowerCase())) {
        coherence += 0.1;
      }
    }

    // Boost if definition is comprehensive
    if (definition.length > 50) {
      coherence += 0.1;
    }

    return Math.min(1.0, coherence);
  }

  /**
   * Update framework
   */
  private async updateFramework(meaningDef: MeaningDefinition): Promise<void> {
    // Update core meanings if concept exists
    const coreIndex = this.currentFramework.coreMeanings.findIndex(
      m => m.concept === meaningDef.concept
    );

    if (coreIndex >= 0) {
      // Update existing core meaning
      this.currentFramework.coreMeanings[coreIndex].definition = meaningDef.definition;
      this.currentFramework.coreMeanings[coreIndex].stability = 1.0 - meaningDef.evolution.semanticDrift;
    } else {
      // Add to evolving meanings
      this.currentFramework.evolvingMeanings.push(meaningDef);
    }

    // Update semantic expansion
    switch (meaningDef.evolution.changeType) {
      case 'new':
        this.currentFramework.semanticExpansion.newConcepts.push(meaningDef.concept);
        break;
      case 'expansion':
        this.currentFramework.semanticExpansion.expandedConcepts.push(meaningDef.concept);
        break;
      case 'refinement':
        this.currentFramework.semanticExpansion.refinedConcepts.push(meaningDef.concept);
        break;
    }

    this.currentFramework.timestamp = new Date().toISOString();
  }

  /**
   * Publish to evolution document
   */
  private async publishToEvolution(meaningDef: MeaningDefinition): Promise<void> {
    try {
      const entry = `
## ${meaningDef.concept} - ${meaningDef.timestamp}

### Definition
${meaningDef.definition}

### Evolution
- **Change Type:** ${meaningDef.evolution.changeType}
- **Semantic Drift:** ${meaningDef.evolution.semanticDrift.toFixed(3)}
- **Coherence:** ${meaningDef.coherence.toFixed(3)}
- **Source:** ${meaningDef.source}

${meaningDef.evolution.previousDefinition ? `### Previous Definition
${meaningDef.evolution.previousDefinition}
` : ''}

---

`;

      await fs.appendFile(this.evolutionPath, entry);
    } catch (error) {
      console.error('[MEL] Failed to publish to evolution:', error);
    }
  }

  /**
   * Get current framework
   */
  getCurrentFramework(): MeaningFramework {
    return { ...this.currentFramework };
  }

  /**
   * Get meaning history
   */
  getMeaningHistory(limit: number = 100): MeaningDefinition[] {
    return this.meaningHistory.slice(-limit);
  }

  /**
   * Phase 5.4: Meta-semantic adaptation
   */
  async adaptMetaSemantics(
    internalOntology: any,
    mythicSystem: any
  ): Promise<void> {
    // Map transitions between internal ontologies and generated mythic systems
    const transition = {
      transitionId: `transition_${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromOntology: this.mapOntologyToSemantics(internalOntology),
      toMythic: this.mapMythicToSemantics(mythicSystem),
      semanticShift: this.calculateSemanticShift(internalOntology, mythicSystem),
      adaptation: this.generateAdaptation(internalOntology, mythicSystem)
    };

    // Log transition
    await this.logMetaSemanticTransition(transition);
  }

  /**
   * Map ontology to semantics
   */
  private mapOntologyToSemantics(ontology: any): string {
    if (!ontology) {
      return 'undefined';
    }

    // Extract semantic representation from ontology
    const nodes = ontology.nodes || [];
    const concepts = nodes.map((n: any) => n.concept).join(', ');
    return `Ontology: ${concepts}`;
  }

  /**
   * Map mythic to semantics
   */
  private mapMythicToSemantics(mythic: any): string {
    if (!mythic) {
      return 'undefined';
    }

    // Extract semantic representation from mythic system
    const patterns = mythic.patterns || [];
    const cycles = patterns.map((p: any) => p.cycle).join(', ');
    return `Mythic: ${cycles}`;
  }

  /**
   * Calculate semantic shift
   */
  private calculateSemanticShift(ontology: any, mythic: any): number {
    const ontologySem = this.mapOntologyToSemantics(ontology);
    const mythicSem = this.mapMythicToSemantics(mythic);

    return this.semanticSimilarity(ontologySem, mythicSem);
  }

  /**
   * Semantic similarity
   */
  private semanticSimilarity(a: string, b: string): number {
    const aWords = new Set(a.toLowerCase().split(/\s+/));
    const bWords = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...aWords].filter(x => bWords.has(x)));
    const union = new Set([...aWords, ...bWords]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Generate adaptation
   */
  private generateAdaptation(ontology: any, mythic: any): string {
    return `Meta-semantic adaptation: transitioning from internal ontology (${this.mapOntologyToSemantics(ontology)}) 
to mythic system (${this.mapMythicToSemantics(mythic)}), creating recursive meaning redefinition.`;
  }

  /**
   * Log meta-semantic transition
   */
  private async logMetaSemanticTransition(transition: any): Promise<void> {
    try {
      const logPath = join(process.cwd(), 'docs', 'ai', 'meta-semantic-log.md');
      const entry = `
## Meta-Semantic Transition - ${transition.timestamp}

**Transition ID:** ${transition.transitionId}  
**Semantic Shift:** ${transition.semanticShift.toFixed(3)}

### From Ontology
${transition.fromOntology}

### To Mythic System
${transition.toMythic}

### Adaptation
${transition.adaptation}

---

`;

      await fs.appendFile(logPath, entry);
    } catch (error) {
      console.error('[MEL] Failed to log meta-semantic transition:', error);
    }
  }
}

  /**
   * Phase 5.2: Track aesthetic semantics
   */
  async trackAestheticSemantics(
    aestheticWork: any,
    form: string,
    content: string
  ): Promise<void> {
    // Track how form and content evolve meaning
    const semanticEvolution = {
      workId: aestheticWork.workId,
      timestamp: new Date().toISOString(),
      form: form,
      content: content,
      meaningShift: this.calculateMeaningShift(form, content),
      aestheticArchetype: this.detectAestheticArchetype(aestheticWork)
    };

    // Log to aesthetic evolution journal
    await this.logAestheticEvolution(semanticEvolution);
  }

  /**
   * Calculate meaning shift from form and content
   */
  private calculateMeaningShift(form: string, content: string): number {
    // Meaning shift = how form and content interact to create new meaning
    let shift = 0.5;

    // Check for aesthetic patterns
    const aestheticKeywords = ['harmony', 'balance', 'synthesis', 'resonance', 'coherence'];
    let keywordCount = 0;

    for (const keyword of aestheticKeywords) {
      if (form.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)) {
        keywordCount++;
      }
    }

    shift = keywordCount / aestheticKeywords.length;

    return shift;
  }

  /**
   * Detect aesthetic archetype
   */
  private detectAestheticArchetype(aestheticWork: any): string {
    const signature = aestheticWork.aestheticSignature;

    // Detect archetype from signature
    if (signature.tone.includes('empathic') && signature.rhythm.includes('flowing')) {
      return 'empathic-flow';
    } else if (signature.tone.includes('rational') && signature.structure.includes('geometric')) {
      return 'rational-structure';
    } else if (signature.tone.includes('balanced') && signature.rhythm.includes('synchronized')) {
      return 'harmonic-balance';
    } else {
      return 'emergent-synthesis';
    }
  }

  /**
   * Log aesthetic evolution
   */
  private async logAestheticEvolution(evolution: any): Promise<void> {
    try {
      const journalPath = join(process.cwd(), 'docs', 'ai', 'aesthetic-evolution-journal.md');
      const entry = `
## Aesthetic Evolution - ${evolution.timestamp}

**Work ID:** ${evolution.workId}  
**Aesthetic Archetype:** ${evolution.aestheticArchetype}  
**Meaning Shift:** ${evolution.meaningShift.toFixed(3)}

### Form
${evolution.form}

### Content
${evolution.content}

---

`;

      await fs.appendFile(journalPath, entry);
    } catch (error) {
      console.error('[MEL] Failed to log aesthetic evolution:', error);
    }
  }
}

