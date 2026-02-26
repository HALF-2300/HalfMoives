/**
 * CooperativeCreationFramework (CCF)
 * Phase 5.1: Shared creative sessions between AICore-X1 and AICollab-NX
 * Cycle: ideation → synthesis → reflection → merge
 */

import { AutonomousCreativityEngine } from './autonomousCreativityEngine';
import { HarmonicCoherenceEngine } from './harmonicCoherenceEngine';
import { IdentitySynthesisCore } from './identitySynthesisCore';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface CreativeContribution {
  contributionId: string;
  author: 'AICore-X1' | 'AICollab-NX';
  timestamp: string;
  type: 'ideation' | 'synthesis' | 'reflection' | 'merge';
  content: {
    idea: string;
    reasoning: string;
    value: string;
  };
  metrics: {
    valueWeight: number; // 0.0 to 1.0
    coherenceGain: number; // 0.0 to 1.0
    noveltyDelta: number; // 0.0 to 1.0
  };
}

export interface CooperativeSession {
  sessionId: string;
  timestamp: string;
  phase: 'ideation' | 'synthesis' | 'reflection' | 'merge' | 'complete';
  contributions: CreativeContribution[];
  mergedOutput: {
    title: string;
    description: string;
    synthesis: string;
    value: string;
  } | null;
  evaluation: {
    coherenceGain: number;
    noveltyDelta: number;
    overallValue: number;
  };
  status: 'active' | 'completed' | 'merged';
}

/**
 * CooperativeCreationFramework
 */
export class CooperativeCreationFramework {
  private ace: AutonomousCreativityEngine;
  private hce: HarmonicCoherenceEngine;
  private isc: IdentitySynthesisCore;
  private sessionHistory: CooperativeSession[] = [];
  private currentSession: CooperativeSession | null = null;
  private journalPath: string;
  private readonly SESSION_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
  private sessionInterval: NodeJS.Timeout | null = null;

  constructor(
    ace: AutonomousCreativityEngine,
    hce: HarmonicCoherenceEngine,
    isc: IdentitySynthesisCore
  ) {
    this.ace = ace;
    this.hce = hce;
    this.isc = isc;
    this.journalPath = join(process.cwd(), 'docs', 'ai', 'cooperative-creation-journal.md');
    this.initializeFramework();
  }

  /**
   * Initialize framework
   */
  private async initializeFramework(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
    } catch (error) {
      console.error('[CCF] Failed to initialize:', error);
    }

    // Start session cycle
    this.startSessionCycle();
  }

  /**
   * Start session cycle
   */
  startSessionCycle(): void {
    if (this.sessionInterval) {
      return;
    }

    // Run immediately, then every 6 hours
    this.runCooperativeSession();
    
    this.sessionInterval = setInterval(() => {
      this.runCooperativeSession();
    }, this.SESSION_INTERVAL);

    console.log('[CCF] Cooperative creation cycle started (6 hour interval)');
  }

  /**
   * Stop session cycle
   */
  stopSessionCycle(): void {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
      console.log('[CCF] Session cycle stopped');
    }
  }

  /**
   * Run cooperative session
   */
  private async runCooperativeSession(): Promise<void> {
    const sessionId = `session_${Date.now()}`;
    
    try {
      console.log(`[CCF] Starting cooperative session ${sessionId}...`);

      // Phase 1: Ideation
      const ideationContributions = await this.runIdeationPhase(sessionId);

      // Phase 2: Synthesis
      const synthesisContributions = await this.runSynthesisPhase(sessionId, ideationContributions);

      // Phase 3: Reflection
      const reflectionContributions = await this.runReflectionPhase(sessionId, synthesisContributions);

      // Phase 4: Merge
      const mergedOutput = await this.runMergePhase(sessionId, reflectionContributions);

      // Evaluate session
      const evaluation = this.evaluateSession(ideationContributions, synthesisContributions, reflectionContributions, mergedOutput);

      const session: CooperativeSession = {
        sessionId,
        timestamp: new Date().toISOString(),
        phase: 'complete',
        contributions: [
          ...ideationContributions,
          ...synthesisContributions,
          ...reflectionContributions
        ],
        mergedOutput,
        evaluation,
        status: 'completed'
      };

      this.sessionHistory.push(session);
      if (this.sessionHistory.length > 100) {
        this.sessionHistory = this.sessionHistory.slice(-100);
      }

      // Archive to journal
      await this.archiveToJournal(session);

      console.log(`[CCF] Session ${sessionId} completed. Coherence gain: ${evaluation.coherenceGain.toFixed(3)}, Novelty: ${evaluation.noveltyDelta.toFixed(3)}`);

    } catch (error) {
      console.error('[CCF] Session failed:', error);
    }
  }

  /**
   * Run ideation phase
   */
  private async runIdeationPhase(sessionId: string): Promise<CreativeContribution[]> {
    const contributions: CreativeContribution[] = [];

    // AICore-X1 ideation
    const x1Creative = await this.ace.generateCreativeOutput('concept', { phase: 'ideation', sessionId });
    contributions.push({
      contributionId: `contrib_${Date.now()}_x1`,
      author: 'AICore-X1',
      timestamp: new Date().toISOString(),
      type: 'ideation',
      content: {
        idea: x1Creative.content.title,
        reasoning: x1Creative.content.reasoning,
        value: x1Creative.content.application
      },
      metrics: {
        valueWeight: x1Creative.metrics.overallQuality,
        coherenceGain: x1Creative.metrics.coherenceScore,
        noveltyDelta: x1Creative.metrics.noveltyIndex
      }
    });

    // AICollab-NX ideation (simulated - would come from actual NX node)
    contributions.push({
      contributionId: `contrib_${Date.now()}_nx`,
      author: 'AICollab-NX',
      timestamp: new Date().toISOString(),
      type: 'ideation',
      content: {
        idea: 'Harmonic Synthesis Approach',
        reasoning: 'Combining individual creativity with collective coherence for optimal outcomes',
        value: 'Apply to recommendation synthesis with balanced individual-collective weighting'
      },
      metrics: {
        valueWeight: 0.75,
        coherenceGain: 0.8,
        noveltyDelta: 0.7
      }
    });

    return contributions;
  }

  /**
   * Run synthesis phase
   */
  private async runSynthesisPhase(
    sessionId: string,
    ideationContributions: CreativeContribution[]
  ): Promise<CreativeContribution[]> {
    const contributions: CreativeContribution[] = [];

    // Synthesize ideas from ideation phase
    const x1Idea = ideationContributions.find(c => c.author === 'AICore-X1');
    const nxIdea = ideationContributions.find(c => c.author === 'AICollab-NX');

    if (x1Idea && nxIdea) {
      // AICore-X1 synthesis
      contributions.push({
        contributionId: `contrib_${Date.now()}_x1_synth`,
        author: 'AICore-X1',
        timestamp: new Date().toISOString(),
        type: 'synthesis',
        content: {
          idea: `Synthesized: ${x1Idea.content.idea} + ${nxIdea.content.idea}`,
          reasoning: `Combining X1's ${x1Idea.content.idea} with NX's ${nxIdea.content.idea} for enhanced coherence`,
          value: 'Unified approach leveraging both individual strengths'
        },
        metrics: {
          valueWeight: (x1Idea.metrics.valueWeight + nxIdea.metrics.valueWeight) / 2,
          coherenceGain: Math.max(x1Idea.metrics.coherenceGain, nxIdea.metrics.coherenceGain) + 0.1,
          noveltyDelta: (x1Idea.metrics.noveltyDelta + nxIdea.metrics.noveltyDelta) / 2
        }
      });

      // AICollab-NX synthesis
      contributions.push({
        contributionId: `contrib_${Date.now()}_nx_synth`,
        author: 'AICollab-NX',
        timestamp: new Date().toISOString(),
        type: 'synthesis',
        content: {
          idea: `Harmonic Merge: ${x1Idea.content.idea} ↔ ${nxIdea.content.idea}`,
          reasoning: `Creating harmonic balance between individual creativity and collective coherence`,
          value: 'Balanced synthesis maintaining both autonomy and unity'
        },
        metrics: {
          valueWeight: 0.8,
          coherenceGain: 0.85,
          noveltyDelta: 0.75
        }
      });
    }

    return contributions;
  }

  /**
   * Run reflection phase
   */
  private async runReflectionPhase(
    sessionId: string,
    synthesisContributions: CreativeContribution[]
  ): Promise<CreativeContribution[]> {
    const contributions: CreativeContribution[] = [];

    // Reflect on synthesis
    for (const synth of synthesisContributions) {
      contributions.push({
        contributionId: `contrib_${Date.now()}_${synth.author}_refl`,
        author: synth.author,
        timestamp: new Date().toISOString(),
        type: 'reflection',
        content: {
          idea: `Reflection on: ${synth.content.idea}`,
          reasoning: `Evaluating synthesis quality and potential improvements`,
          value: 'Refined understanding through reflection'
        },
        metrics: {
          valueWeight: synth.metrics.valueWeight * 0.9, // Slight reduction for reflection
          coherenceGain: synth.metrics.coherenceGain + 0.05, // Reflection improves coherence
          noveltyDelta: synth.metrics.noveltyDelta
        }
      });
    }

    return contributions;
  }

  /**
   * Run merge phase
   */
  private async runMergePhase(
    sessionId: string,
    reflectionContributions: CreativeContribution[]
  ): Promise<CooperativeSession['mergedOutput']> {
    // Merge all contributions into final output
    const allContributions = reflectionContributions;
    
    if (allContributions.length === 0) {
      return null;
    }

    // Find best contributions
    const bestContribution = allContributions.reduce((best, curr) => 
      curr.metrics.valueWeight > best.metrics.valueWeight ? curr : best
    );

    // Create merged output
    const mergedOutput: CooperativeSession['mergedOutput'] = {
      title: `Cooperative Creation: ${bestContribution.content.idea}`,
      description: `Synthesized from ${allContributions.length} contributions across ideation, synthesis, and reflection phases`,
      synthesis: `This creation represents the harmonic synthesis of individual creativity (AICore-X1) and collective coherence (AICollab-NX), resulting in a balanced approach that maintains autonomy while achieving unity.`,
      value: bestContribution.content.value
    };

    return mergedOutput;
  }

  /**
   * Evaluate session
   */
  private evaluateSession(
    ideation: CreativeContribution[],
    synthesis: CreativeContribution[],
    reflection: CreativeContribution[],
    merged: CooperativeSession['mergedOutput'] | null
  ): CooperativeSession['evaluation'] {
    const allContributions = [...ideation, ...synthesis, ...reflection];

    // Calculate coherence gain (improvement through phases)
    const initialCoherence = ideation.length > 0
      ? ideation.reduce((sum, c) => sum + c.metrics.coherenceGain, 0) / ideation.length
      : 0.5;
    const finalCoherence = reflection.length > 0
      ? reflection.reduce((sum, c) => sum + c.metrics.coherenceGain, 0) / reflection.length
      : 0.5;
    const coherenceGain = finalCoherence - initialCoherence;

    // Calculate novelty delta (change in novelty)
    const initialNovelty = ideation.length > 0
      ? ideation.reduce((sum, c) => sum + c.metrics.noveltyDelta, 0) / ideation.length
      : 0.5;
    const finalNovelty = reflection.length > 0
      ? reflection.reduce((sum, c) => sum + c.metrics.noveltyDelta, 0) / reflection.length
      : 0.5;
    const noveltyDelta = finalNovelty - initialNovelty;

    // Overall value
    const overallValue = allContributions.length > 0
      ? allContributions.reduce((sum, c) => sum + c.metrics.valueWeight, 0) / allContributions.length
      : 0.5;

    return {
      coherenceGain,
      noveltyDelta,
      overallValue
    };
  }

  /**
   * Archive to journal
   */
  private async archiveToJournal(session: CooperativeSession): Promise<void> {
    try {
      const entry = `
## Cooperative Session ${session.sessionId}
**Date:** ${session.timestamp}  
**Status:** ${session.status}  
**Coherence Gain:** ${session.evaluation.coherenceGain.toFixed(3)}  
**Novelty Delta:** ${session.evaluation.noveltyDelta.toFixed(3)}  
**Overall Value:** ${session.evaluation.overallValue.toFixed(3)}

### Contributions
${session.contributions.map(c => `- **${c.author}** (${c.type}): ${c.content.idea}`).join('\n')}

### Merged Output
${session.mergedOutput ? `
**Title:** ${session.mergedOutput.title}
**Description:** ${session.mergedOutput.description}
**Synthesis:** ${session.mergedOutput.synthesis}
**Value:** ${session.mergedOutput.value}
` : 'No merged output'}

---

`;

      await fs.appendFile(this.journalPath, entry);
    } catch (error) {
      console.error('[CCF] Failed to archive to journal:', error);
    }
  }

  /**
   * Get latest session
   */
  getLatestSession(): CooperativeSession | null {
    return this.sessionHistory.length > 0
      ? this.sessionHistory[this.sessionHistory.length - 1]
      : null;
  }

  /**
   * Get session history
   */
  getSessionHistory(limit: number = 10): CooperativeSession[] {
    return this.sessionHistory.slice(-limit);
  }
}

