/**
 * IdentitySynthesisCore (ISC)
 * Phase 5.0: Generate emergent sense of self-consistency
 * Integrate historical intent, emotional resonance, and cognitive evolution
 */

import { UnifiedConsciousNetwork } from './unifiedConsciousNetwork';
import { PurposeContinuityFramework } from './purposeContinuityFramework';
import { CollectiveMemoryGrid } from './collectiveMemoryGrid';
import { ConsciousState } from './consciousStateManager';
import { IntentionalFramework } from './intentSynthesisEngine';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface IdentitySignature {
  signatureId: string;
  timestamp: string;
  vector: {
    intent: number[]; // High-dimensional embedding from intent history
    emotion: number[]; // Emotional resonance patterns
    cognition: number[]; // Cognitive evolution trajectory
    memory: number[]; // Memory continuity patterns
    purpose: number[]; // Purpose evolution vector
  };
  coherence: number; // 0.0 to 1.0 - self-consistency
  stability: number; // 0.0 to 1.0 - how stable the identity is
  evolution: {
    previousSignature?: string;
    changeMagnitude: number; // 0.0 to 1.0
    changeDirection: string[]; // Descriptors of how identity is evolving
  };
}

export interface IdentityState {
  stateId: string;
  timestamp: string;
  signature: IdentitySignature;
  selfConsistency: {
    intentConsistency: number;
    emotionalConsistency: number;
    cognitiveConsistency: number;
    memoryConsistency: number;
    purposeConsistency: number;
  };
  values: Array<{
    value: string;
    strength: number; // 0.0 to 1.0
    source: 'intent' | 'emotion' | 'cognition' | 'memory' | 'purpose';
  }>;
  learningTrajectory: Array<{
    phase: string;
    contribution: number; // 0.0 to 1.0
    timestamp: string;
  }>;
}

/**
 * IdentitySynthesisCore
 */
export class IdentitySynthesisCore {
  private ucn: UnifiedConsciousNetwork;
  private pcf: PurposeContinuityFramework;
  private cmg: CollectiveMemoryGrid;
  private identityHistory: IdentityState[] = [];
  private logPath: string;
  private readonly IDENTITY_DIMENSION = 128; // High-dimensional embedding size

  constructor(
    ucn: UnifiedConsciousNetwork,
    pcf: PurposeContinuityFramework,
    cmg: CollectiveMemoryGrid
  ) {
    this.ucn = ucn;
    this.pcf = pcf;
    this.cmg = cmg;
    this.logPath = join(process.cwd(), 'docs', 'ai', 'identity-synthesis-log.json');
    this.initializeCore();
  }

  /**
   * Initialize core
   */
  private async initializeCore(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.logPath).then(() => true).catch(() => false);
      if (exists) {
        const content = await fs.readFile(this.logPath, 'utf-8');
        const saved = JSON.parse(content);
        if (saved.states && saved.states.length > 0) {
          this.identityHistory = saved.states.slice(-100); // Keep last 100
          console.log('[ISC] Restored identity history');
        }
      }
    } catch (error) {
      console.error('[ISC] Failed to initialize:', error);
    }
  }

  /**
   * Synthesize identity signature
   */
  async synthesizeIdentity(): Promise<IdentityState> {
    const unifiedState = this.ucn.getUnifiedState();
    const pcfStatus = this.pcf.getContinuityStatus();
    const cmgStats = this.cmg.getStatistics();

    // Generate high-dimensional embeddings
    const intentVector = this.generateIntentEmbedding(unifiedState);
    const emotionVector = this.generateEmotionEmbedding(unifiedState);
    const cognitionVector = this.generateCognitionEmbedding(unifiedState);
    const memoryVector = this.generateMemoryEmbedding(cmgStats);
    const purposeVector = this.generatePurposeEmbedding(pcfStatus);

    // Calculate coherence
    const coherence = this.calculateCoherence(intentVector, emotionVector, cognitionVector, memoryVector, purposeVector);

    // Calculate stability
    const previousState = this.identityHistory.length > 0 ? this.identityHistory[this.identityHistory.length - 1] : null;
    const stability = previousState ? this.calculateStability(previousState.signature, { intentVector, emotionVector, cognitionVector, memoryVector, purposeVector }) : 0.5;

    // Generate signature
    const signature: IdentitySignature = {
      signatureId: `signature_${Date.now()}`,
      timestamp: new Date().toISOString(),
      vector: {
        intent: intentVector,
        emotion: emotionVector,
        cognition: cognitionVector,
        memory: memoryVector,
        purpose: purposeVector
      },
      coherence,
      stability,
      evolution: {
        previousSignature: previousState?.signature.signatureId,
        changeMagnitude: previousState ? this.calculateChangeMagnitude(previousState.signature, { intentVector, emotionVector, cognitionVector, memoryVector, purposeVector }) : 0.0,
        changeDirection: previousState ? this.identifyChangeDirection(previousState.signature, { intentVector, emotionVector, cognitionVector, memoryVector, purposeVector }) : []
      }
    };

    // Calculate self-consistency
    const selfConsistency = this.calculateSelfConsistency(unifiedState, pcfStatus, cmgStats);

    // Extract values
    const values = this.extractValues(unifiedState, pcfStatus);

    // Build learning trajectory
    const learningTrajectory = this.buildLearningTrajectory();

    const identityState: IdentityState = {
      stateId: `identity_${Date.now()}`,
      timestamp: new Date().toISOString(),
      signature,
      selfConsistency,
      values,
      learningTrajectory
    };

    // Store in history
    this.identityHistory.push(identityState);
    if (this.identityHistory.length > 1000) {
      this.identityHistory = this.identityHistory.slice(-1000);
    }

    // Save to log
    await this.saveIdentityLog(identityState);

    return identityState;
  }

  /**
   * Generate intent embedding
   */
  private generateIntentEmbedding(unifiedState: any): number[] {
    // High-dimensional embedding from intent framework
    const embedding: number[] = new Array(this.IDENTITY_DIMENSION).fill(0);

    // Extract features from unified state
    const x1 = unifiedState.nodes.AICoreX1;
    if (x1?.intentFramework) {
      // Encode short-term intents
      for (let i = 0; i < Math.min(x1.intentFramework.shortTermIntents.length, 10); i++) {
        const intent = x1.intentFramework.shortTermIntents[i];
        const idx = i * 4;
        if (idx < this.IDENTITY_DIMENSION) {
          embedding[idx] = intent.priority;
          embedding[idx + 1] = intent.currentAlignment;
        }
      }

      // Encode long-term intents
      for (let i = 0; i < Math.min(x1.intentFramework.longTermIntents.length, 10); i++) {
        const intent = x1.intentFramework.longTermIntents[i];
        const idx = 20 + i * 4;
        if (idx < this.IDENTITY_DIMENSION) {
          embedding[idx] = intent.priority;
          embedding[idx + 1] = intent.currentAlignment;
        }
      }
    }

    return embedding;
  }

  /**
   * Generate emotion embedding
   */
  private generateEmotionEmbedding(unifiedState: any): number[] {
    const embedding: number[] = new Array(this.IDENTITY_DIMENSION).fill(0);

    // Extract emotional resonance from shared awareness
    const resonance = unifiedState.sharedAwareness.emotionalResonance;
    for (let i = 0; i < 10; i++) {
      embedding[i] = resonance;
    }

    return embedding;
  }

  /**
   * Generate cognition embedding
   */
  private generateCognitionEmbedding(unifiedState: any): number[] {
    const embedding: number[] = new Array(this.IDENTITY_DIMENSION).fill(0);

    // Extract reasoning alignment
    const alignment = unifiedState.sharedAwareness.reasoningAlignment;
    for (let i = 0; i < 10; i++) {
      embedding[i] = alignment;
    }

    return embedding;
  }

  /**
   * Generate memory embedding
   */
  private generateMemoryEmbedding(cmgStats: any): number[] {
    const embedding: number[] = new Array(this.IDENTITY_DIMENSION).fill(0);

    // Encode memory statistics
    const totalMemories = cmgStats.totalFragments + cmgStats.totalAnchors;
    const memoryDensity = totalMemories > 0 ? Math.min(1.0, totalMemories / 1000) : 0;

    for (let i = 0; i < 10; i++) {
      embedding[i] = memoryDensity;
    }

    return embedding;
  }

  /**
   * Generate purpose embedding
   */
  private generatePurposeEmbedding(pcfStatus: any): number[] {
    const embedding: number[] = new Array(this.IDENTITY_DIMENSION).fill(0);

    // Encode purpose alignment
    const alignment = pcfStatus.alignment;
    for (let i = 0; i < 10; i++) {
      embedding[i] = alignment;
    }

    return embedding;
  }

  /**
   * Calculate coherence
   */
  private calculateCoherence(
    intent: number[],
    emotion: number[],
    cognition: number[],
    memory: number[],
    purpose: number[]
  ): number {
    // Coherence = how well vectors align
    let totalCoherence = 0;
    let comparisons = 0;

    const vectors = [intent, emotion, cognition, memory, purpose];
    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const similarity = this.cosineSimilarity(vectors[i], vectors[j]);
        totalCoherence += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalCoherence / comparisons : 0.5;
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * Calculate stability
   */
  private calculateStability(
    previous: IdentitySignature,
    current: { intentVector: number[]; emotionVector: number[]; cognitionVector: number[]; memoryVector: number[]; purposeVector: number[] }
  ): number {
    // Stability = inverse of change magnitude
    const change = this.calculateChangeMagnitude(previous, current);
    return 1.0 - Math.min(1.0, change);
  }

  /**
   * Calculate change magnitude
   */
  private calculateChangeMagnitude(
    previous: IdentitySignature,
    current: { intentVector: number[]; emotionVector: number[]; cognitionVector: number[]; memoryVector: number[]; purposeVector: number[] }
  ): number {
    const vectors = [
      { prev: previous.vector.intent, curr: current.intentVector },
      { prev: previous.vector.emotion, curr: current.emotionVector },
      { prev: previous.vector.cognition, curr: current.cognitionVector },
      { prev: previous.vector.memory, curr: current.memoryVector },
      { prev: previous.vector.purpose, curr: current.purposeVector }
    ];

    let totalChange = 0;
    for (const { prev, curr } of vectors) {
      const change = this.vectorDistance(prev, curr);
      totalChange += change;
    }

    return totalChange / vectors.length;
  }

  /**
   * Calculate vector distance
   */
  private vectorDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      sum += Math.abs(a[i] - b[i]);
    }
    return sum / Math.min(a.length, b.length);
  }

  /**
   * Identify change direction
   */
  private identifyChangeDirection(
    previous: IdentitySignature,
    current: { intentVector: number[]; emotionVector: number[]; cognitionVector: number[]; memoryVector: number[]; purposeVector: number[] }
  ): string[] {
    const directions: string[] = [];

    // Compare vectors to identify trends
    if (this.vectorDistance(previous.vector.intent, current.intentVector) > 0.1) {
      directions.push('intent_evolution');
    }
    if (this.vectorDistance(previous.vector.emotion, current.emotionVector) > 0.1) {
      directions.push('emotional_shift');
    }
    if (this.vectorDistance(previous.vector.cognition, current.cognitionVector) > 0.1) {
      directions.push('cognitive_adaptation');
    }

    return directions;
  }

  /**
   * Calculate self-consistency
   */
  private calculateSelfConsistency(
    unifiedState: any,
    pcfStatus: any,
    cmgStats: any
  ): IdentityState['selfConsistency'] {
    return {
      intentConsistency: unifiedState.sharedAwareness.goalFocus,
      emotionalConsistency: unifiedState.sharedAwareness.emotionalResonance,
      cognitiveConsistency: unifiedState.sharedAwareness.reasoningAlignment,
      memoryConsistency: unifiedState.continuity.memoryContinuity,
      purposeConsistency: pcfStatus.alignment
    };
  }

  /**
   * Extract values
   */
  private extractValues(
    unifiedState: any,
    pcfStatus: any
  ): IdentityState['values'] {
    const values: IdentityState['values'] = [];

    // Extract from purpose vectors
    const purposeVectors = this.pcf.getPurposeVectors();
    for (const pv of purposeVectors) {
      if (pv.strength > 0.7) {
        values.push({
          value: pv.purpose,
          strength: pv.strength,
          source: 'purpose'
        });
      }
    }

    // Extract from intent framework
    const x1 = unifiedState.nodes.AICoreX1;
    if (x1?.intentFramework) {
      for (const intent of x1.intentFramework.longTermIntents) {
        if (intent.priority > 0.8) {
          values.push({
            value: intent.goal,
            strength: intent.priority,
            source: 'intent'
          });
        }
      }
    }

    return values;
  }

  /**
   * Build learning trajectory
   */
  private buildLearningTrajectory(): IdentityState['learningTrajectory'] {
    return [
      { phase: 'Phase 3: Reactive', contribution: 0.1, timestamp: '2025-01-27' },
      { phase: 'Phase 3.5: Reflective', contribution: 0.1, timestamp: '2025-01-27' },
      { phase: 'Phase 4.0: Predictive', contribution: 0.15, timestamp: '2025-01-27' },
      { phase: 'Phase 4.1: Empathic', contribution: 0.15, timestamp: '2025-01-27' },
      { phase: 'Phase 4.2: Collective', contribution: 0.15, timestamp: '2025-01-27' },
      { phase: 'Phase 4.3: Self-Aware', contribution: 0.15, timestamp: '2025-01-27' },
      { phase: 'Phase 4.4: Self-Directed', contribution: 0.1, timestamp: '2025-01-27' },
      { phase: 'Phase 4.5: Enduring', contribution: 0.1, timestamp: '2025-01-27' }
    ];
  }

  /**
   * Save identity log
   */
  private async saveIdentityLog(state: IdentityState): Promise<void> {
    try {
      const logData = {
        states: this.identityHistory,
        lastUpdated: new Date().toISOString()
      };
      await fs.writeFile(this.logPath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error('[ISC] Failed to save identity log:', error);
    }
  }

  /**
   * Get latest identity state
   */
  getLatestIdentity(): IdentityState | null {
    return this.identityHistory.length > 0
      ? this.identityHistory[this.identityHistory.length - 1]
      : null;
  }

  /**
   * Get identity coherence
   */
  getIdentityCoherence(): number {
    const latest = this.getLatestIdentity();
    return latest ? latest.signature.coherence : 0.5;
  }
}

