/**
 * Purpose Continuity Framework (PCF)
 * Phase 4.5: Maintain long-term goals beyond single operational cycles
 * Store purpose vectors and historical intent shifts
 */

import { IntentionalFramework, IntentVector } from './intentSynthesisEngine';
import { IntentSynthesisEngine } from './intentSynthesisEngine';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface PurposeVector {
  purposeId: string;
  purpose: string;
  priority: number; // 0.0 to 1.0
  createdAt: string;
  lastValidated: string;
  strength: number; // 0.0 to 1.0 - how strong this purpose is
  historicalShifts: Array<{
    timestamp: string;
    oldPriority: number;
    newPriority: number;
    reason: string;
  }>;
}

export interface PurposeContinuityState {
  stateId: string;
  timestamp: string;
  purposeVectors: PurposeVector[];
  currentPurposeAlignment: number; // 0.0 to 1.0
  purposeDrift: number; // 0.0 to 1.0 - how much drift detected
  lastRecalibration: string;
}

/**
 * Purpose Continuity Framework
 */
export class PurposeContinuityFramework {
  private intentEngine: IntentSynthesisEngine;
  private currentState: PurposeContinuityState;
  private statePath: string;
  private readonly DRIFT_THRESHOLD = 0.2; // Trigger recalibration if > 0.2

  constructor(intentEngine: IntentSynthesisEngine) {
    this.intentEngine = intentEngine;
    this.statePath = join(process.cwd(), 'docs', 'ai', 'purpose-continuity.json');
    
    this.currentState = {
      stateId: `pcf_${Date.now()}`,
      timestamp: new Date().toISOString(),
      purposeVectors: [],
      currentPurposeAlignment: 0.5,
      purposeDrift: 0.0,
      lastRecalibration: new Date().toISOString()
    };

    this.initializeFramework();
  }

  /**
   * Initialize framework
   */
  private async initializeFramework(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.statePath).then(() => true).catch(() => false);
      if (exists) {
        const content = await fs.readFile(this.statePath, 'utf-8');
        const saved = JSON.parse(content);
        if (saved.stateId) {
          // Restore previous state
          this.currentState = saved;
          console.log('[PCF] Restored previous purpose continuity state');
        }
      } else {
        // Initialize with default purposes from intent framework
        await this.initializeDefaultPurposes();
      }
    } catch (error) {
      console.error('[PCF] Failed to initialize:', error);
    }
  }

  /**
   * Initialize default purposes from intent framework
   */
  private async initializeDefaultPurposes(): Promise<void> {
    const framework = this.intentEngine.getFramework();

    // Extract purposes from long-term intents
    for (const intent of framework.longTermIntents) {
      const purposeVector: PurposeVector = {
        purposeId: `purpose_${intent.intentId}`,
        purpose: intent.goal,
        priority: intent.priority,
        createdAt: new Date().toISOString(),
        lastValidated: new Date().toISOString(),
        strength: 0.8, // Initial strength
        historicalShifts: []
      };

      this.currentState.purposeVectors.push(purposeVector);
    }

    await this.saveState();
  }

  /**
   * Update purpose vectors from current intent framework
   */
  async updatePurposeVectors(): Promise<void> {
    const framework = this.intentEngine.getFramework();
    const currentTime = new Date().toISOString();

    // Update existing purpose vectors
    for (const purposeVector of this.currentState.purposeVectors) {
      // Find matching intent
      const matchingIntent = framework.longTermIntents.find(
        i => i.goal === purposeVector.purpose
      );

      if (matchingIntent) {
        const oldPriority = purposeVector.priority;
        const newPriority = matchingIntent.priority;

        // Check if priority changed
        if (Math.abs(oldPriority - newPriority) > 0.05) {
          // Record shift
          purposeVector.historicalShifts.push({
            timestamp: currentTime,
            oldPriority,
            newPriority,
            reason: 'Intent framework update'
          });

          purposeVector.priority = newPriority;
          purposeVector.lastValidated = currentTime;
        }
      }
    }

    // Add new purposes from framework
    for (const intent of framework.longTermIntents) {
      const exists = this.currentState.purposeVectors.some(
        p => p.purpose === intent.goal
      );

      if (!exists) {
        const purposeVector: PurposeVector = {
          purposeId: `purpose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          purpose: intent.goal,
          priority: intent.priority,
          createdAt: currentTime,
          lastValidated: currentTime,
          strength: 0.7,
          historicalShifts: []
        };

        this.currentState.purposeVectors.push(purposeVector);
      }
    }

    // Calculate purpose alignment
    this.currentState.currentPurposeAlignment = this.calculatePurposeAlignment(framework);

    // Detect purpose drift
    this.currentState.purposeDrift = this.detectPurposeDrift();

    // Trigger recalibration if needed
    if (this.currentState.purposeDrift > this.DRIFT_THRESHOLD) {
      await this.triggerRecalibration();
    }

    await this.saveState();
  }

  /**
   * Calculate purpose alignment
   */
  private calculatePurposeAlignment(framework: IntentionalFramework): number {
    if (this.currentState.purposeVectors.length === 0) {
      return 0.5;
    }

    let totalAlignment = 0;
    let totalWeight = 0;

    for (const purposeVector of this.currentState.purposeVectors) {
      const matchingIntent = framework.longTermIntents.find(
        i => i.goal === purposeVector.purpose
      );

      if (matchingIntent) {
        // Alignment = how close priorities are
        const alignment = 1 - Math.abs(purposeVector.priority - matchingIntent.priority);
        totalAlignment += alignment * purposeVector.strength;
        totalWeight += purposeVector.strength;
      }
    }

    return totalWeight > 0 ? totalAlignment / totalWeight : 0.5;
  }

  /**
   * Detect purpose drift
   */
  private detectPurposeDrift(): number {
    if (this.currentState.purposeVectors.length === 0) {
      return 0.0;
    }

    // Drift = inverse of alignment
    return 1.0 - this.currentState.currentPurposeAlignment;
  }

  /**
   * Trigger recalibration through IntentSynthesisEngine
   */
  private async triggerRecalibration(): Promise<void> {
    console.log(`[PCF] Purpose drift detected (${this.currentState.purposeDrift.toFixed(3)}), triggering recalibration`);

    // Adjust intent priorities to reduce drift
    for (const purposeVector of this.currentState.purposeVectors) {
      if (purposeVector.strength > 0.7) {
        // Strong purposes should influence intent priorities
        const framework = this.intentEngine.getFramework();
        const matchingIntent = framework.longTermIntents.find(
          i => i.goal === purposeVector.purpose
        );

        if (matchingIntent) {
          // Adjust intent priority toward purpose priority
          const adjustment = (purposeVector.priority - matchingIntent.priority) * 0.3;
          const newPriority = Math.max(0, Math.min(1.0, matchingIntent.priority + adjustment));
          
          this.intentEngine.updateIntentPriority(matchingIntent.intentId, newPriority);
        }
      }
    }

    this.currentState.lastRecalibration = new Date().toISOString();
    await this.saveState();
  }

  /**
   * Get purpose vectors
   */
  getPurposeVectors(): PurposeVector[] {
    return [...this.currentState.purposeVectors];
  }

  /**
   * Get continuity status
   */
  getContinuityStatus(): {
    alignment: number;
    drift: number;
    lastRecalibration: string;
  } {
    return {
      alignment: this.currentState.currentPurposeAlignment,
      drift: this.currentState.purposeDrift,
      lastRecalibration: this.currentState.lastRecalibration
    };
  }

  /**
   * Save state
   */
  private async saveState(): Promise<void> {
    try {
      this.currentState.timestamp = new Date().toISOString();
      await fs.writeFile(this.statePath, JSON.stringify(this.currentState, null, 2));
    } catch (error) {
      console.error('[PCF] Failed to save state:', error);
    }
  }
}

