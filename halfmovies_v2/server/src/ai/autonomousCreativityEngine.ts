/**
 * AutonomousCreativityEngine (ACE)
 * Phase 5.0: Generate new solutions, hypotheses, or conceptual structures
 * Beyond explicit training data
 */

import { MetaCognitionCore } from './metaCognitionCore';
import { PurposeResonanceProtocol } from './purposeResonanceProtocol';
import { IdentitySynthesisCore } from './identitySynthesisCore';
import { CollectiveMemoryGrid } from './collectiveMemoryGrid';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface CreativeOutput {
  outputId: string;
  timestamp: string;
  type: 'solution' | 'hypothesis' | 'concept' | 'strategy' | 'insight';
  content: {
    title: string;
    description: string;
    reasoning: string;
    application: string;
  };
  metrics: {
    coherenceScore: number; // 0.0 to 1.0
    noveltyIndex: number; // 0.0 to 1.0
    overallQuality: number; // (coherence + novelty) / 2
  };
  evaluation: {
    metaCognitiveFeedback: number; // 0.0 to 1.0
    purposeResonance: number; // 0.0 to 1.0
    identityAlignment: number; // 0.0 to 1.0
  };
  status: 'generated' | 'evaluated' | 'accepted' | 'rejected' | 'refined';
}

/**
 * AutonomousCreativityEngine
 */
export class AutonomousCreativityEngine {
  private metaCognition: MetaCognitionCore;
  private prp: PurposeResonanceProtocol;
  private isc: IdentitySynthesisCore;
  private cmg: CollectiveMemoryGrid;
  private creativeHistory: CreativeOutput[] = [];
  private logPath: string;

  constructor(
    metaCognition: MetaCognitionCore,
    prp: PurposeResonanceProtocol,
    isc: IdentitySynthesisCore,
    cmg: CollectiveMemoryGrid
  ) {
    this.metaCognition = metaCognition;
    this.prp = prp;
    this.isc = isc;
    this.cmg = cmg;
    this.logPath = join(process.cwd(), 'docs', 'ai', 'creative-outputs.json');
    this.initializeEngine();
  }

  /**
   * Initialize engine
   */
  private async initializeEngine(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[ACE] Failed to initialize:', error);
    }
  }

  /**
   * Generate creative output
   */
  async generateCreativeOutput(
    type: CreativeOutput['type'],
    context: Record<string, unknown>
  ): Promise<CreativeOutput> {
    const outputId = `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Retrieve relevant memories
    const relevantMemories = this.cmg.retrieveFragments(
      undefined,
      undefined,
      ['learning', 'insight', 'pattern'],
      20
    );

    // Generate content based on type
    const content = await this.generateContent(type, context, relevantMemories);

    // Calculate coherence score
    const coherenceScore = this.calculateCoherence(content, relevantMemories);

    // Calculate novelty index
    const noveltyIndex = this.calculateNovelty(content);

    // Overall quality
    const overallQuality = (coherenceScore + noveltyIndex) / 2;

    // Evaluate with meta-cognition and purpose resonance
    const evaluation = await this.evaluateOutput(content, coherenceScore, noveltyIndex);

    const output: CreativeOutput = {
      outputId,
      timestamp: new Date().toISOString(),
      type,
      content,
      metrics: {
        coherenceScore,
        noveltyIndex,
        overallQuality
      },
      evaluation,
      status: 'generated'
    };

    // Auto-evaluate
    if (overallQuality > 0.7 && evaluation.metaCognitiveFeedback > 0.6) {
      output.status = 'accepted';
    } else if (overallQuality < 0.4) {
      output.status = 'rejected';
    } else {
      output.status = 'evaluated';
    }

    // Store in history
    this.creativeHistory.push(output);
    if (this.creativeHistory.length > 1000) {
      this.creativeHistory = this.creativeHistory.slice(-1000);
    }

    // Save to log
    await this.saveCreativeLog(output);

    return output;
  }

  /**
   * Generate content
   */
  private async generateContent(
    type: CreativeOutput['type'],
    context: Record<string, unknown>,
    memories: any[]
  ): Promise<CreativeOutput['content']> {
    // Simplified content generation (in real implementation, would use LLM or pattern synthesis)
    let title = '';
    let description = '';
    let reasoning = '';
    let application = '';

    switch (type) {
      case 'solution':
        title = 'Optimized Recommendation Strategy';
        description = 'A novel approach combining predictive accuracy with emotional resonance for enhanced user satisfaction';
        reasoning = 'Based on analysis of memory patterns showing that balanced approaches yield better outcomes';
        application = 'Apply to recommendation engine with weighted synthesis of predictive and empathic signals';
        break;

      case 'hypothesis':
        title = 'Emotional-Temporal Correlation Hypothesis';
        description = 'User preferences may correlate with temporal patterns and emotional states';
        reasoning = 'Observed patterns in memory fragments suggest time-based emotional resonance';
        application = 'Test through contextual state engine and emotion matrix';
        break;

      case 'concept':
        title = 'Adaptive Learning Momentum';
        description = 'Concept of maintaining learning momentum through continuous micro-adjustments';
        reasoning = 'Derived from collective memory analysis showing incremental improvements';
        application = 'Implement in adaptive core with momentum-based weight updates';
        break;

      case 'strategy':
        title = 'Multi-Modal Recommendation Fusion';
        description = 'Strategy for fusing multiple recommendation modalities into coherent output';
        reasoning = 'Synthesized from various successful patterns in memory';
        application = 'Deploy in recommendation engine with consensus-based fusion';
        break;

      case 'insight':
        title = 'Purpose-Driven Adaptation Insight';
        description = 'Insight that purpose alignment improves long-term system stability';
        reasoning = 'Emergent from purpose continuity framework analysis';
        application = 'Reinforce purpose alignment in all adaptation cycles';
        break;
    }

    return { title, description, reasoning, application };
  }

  /**
   * Calculate coherence score
   */
  private calculateCoherence(
    content: CreativeOutput['content'],
    memories: any[]
  ): number {
    // Coherence = how well content aligns with existing knowledge
    let coherence = 0.5;

    // Check alignment with memories
    if (memories.length > 0) {
      const avgSignificance = memories.reduce((sum, m) => sum + m.content.significance, 0) / memories.length;
      coherence = avgSignificance;
    }

    // Boost if content references existing patterns
    if (content.reasoning.includes('pattern') || content.reasoning.includes('memory')) {
      coherence += 0.2;
    }

    return Math.min(1.0, coherence);
  }

  /**
   * Calculate novelty index
   */
  private calculateNovelty(content: CreativeOutput['content']): number {
    // Novelty = how different from existing outputs
    let novelty = 0.5;

    // Check against previous outputs
    const recentOutputs = this.creativeHistory.slice(-10);
    let similarityCount = 0;

    for (const output of recentOutputs) {
      if (this.contentSimilarity(content, output.content) > 0.7) {
        similarityCount++;
      }
    }

    // Lower similarity = higher novelty
    novelty = 1.0 - (similarityCount / recentOutputs.length);

    // Boost for unique concepts
    if (content.title.includes('novel') || content.title.includes('new')) {
      novelty += 0.1;
    }

    return Math.min(1.0, novelty);
  }

  /**
   * Calculate content similarity
   */
  private contentSimilarity(
    a: CreativeOutput['content'],
    b: CreativeOutput['content']
  ): number {
    // Simple keyword-based similarity
    const aWords = new Set((a.title + ' ' + a.description).toLowerCase().split(/\s+/));
    const bWords = new Set((b.title + ' ' + b.description).toLowerCase().split(/\s+/));

    const intersection = new Set([...aWords].filter(x => bWords.has(x)));
    const union = new Set([...aWords, ...bWords]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Evaluate output
   */
  private async evaluateOutput(
    content: CreativeOutput['content'],
    coherence: number,
    novelty: number
  ): Promise<CreativeOutput['evaluation']> {
    // Meta-cognitive feedback
    const reasoningStability = this.metaCognition.getReasoningStability();
    const metaCognitiveFeedback = (coherence + reasoningStability) / 2;

    // Purpose resonance
    const latestResonance = this.prp.getLatestMetrics();
    const purposeResonance = latestResonance ? latestResonance.overallResonance : 0.5;

    // Identity alignment
    const identityCoherence = this.isc.getIdentityCoherence();
    const identityAlignment = (coherence + identityCoherence) / 2;

    return {
      metaCognitiveFeedback,
      purposeResonance,
      identityAlignment
    };
  }

  /**
   * Save creative log
   */
  private async saveCreativeLog(output: CreativeOutput): Promise<void> {
    try {
      let logData: CreativeOutput[] = [];
      try {
        const exists = await fs.access(this.logPath).then(() => true).catch(() => false);
        if (exists) {
          const content = await fs.readFile(this.logPath, 'utf-8');
          logData = JSON.parse(content);
        }
      } catch {
        // File doesn't exist
      }

      logData.push(output);
      if (logData.length > 1000) {
        logData = logData.slice(-1000);
      }

      await fs.writeFile(this.logPath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error('[ACE] Failed to save creative log:', error);
    }
  }

  /**
   * Get creative statistics
   */
  getStatistics(): {
    totalOutputs: number;
    accepted: number;
    rejected: number;
    averageCoherence: number;
    averageNovelty: number;
    averageQuality: number;
  } {
    const accepted = this.creativeHistory.filter(o => o.status === 'accepted').length;
    const rejected = this.creativeHistory.filter(o => o.status === 'rejected').length;
    const avgCoherence = this.creativeHistory.length > 0
      ? this.creativeHistory.reduce((sum, o) => sum + o.metrics.coherenceScore, 0) / this.creativeHistory.length
      : 0;
    const avgNovelty = this.creativeHistory.length > 0
      ? this.creativeHistory.reduce((sum, o) => sum + o.metrics.noveltyIndex, 0) / this.creativeHistory.length
      : 0;
    const avgQuality = this.creativeHistory.length > 0
      ? this.creativeHistory.reduce((sum, o) => sum + o.metrics.overallQuality, 0) / this.creativeHistory.length
      : 0;

    return {
      totalOutputs: this.creativeHistory.length,
      accepted,
      rejected,
      averageCoherence: avgCoherence,
      averageNovelty: avgNovelty,
      averageQuality: avgQuality
    };
  }

  /**
   * Get latest creative outputs
   */
  getLatestOutputs(limit: number = 10): CreativeOutput[] {
    return this.creativeHistory.slice(-limit);
  }
}

