/**
 * AICollab-NX ↔ AICore-X1 Collaboration Coordinator
 * Phase 3.5: Bi-directional weight synchronization and validation
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface WeightSyncPayload {
  sourceModule: string;
  weightDelta: Record<string, number>;
  weightDistribution: Record<string, number>;
  userId?: string;
  timestamp?: string;
}

export interface LearningSessionData {
  sessionId: string;
  deltaAccuracy?: number | null;
  sourceModule: string;
  impactScore: number;
  weightDistribution: Record<string, number>;
  weightDelta: Record<string, number>;
  instabilityThreshold?: number | null;
  stabilityScore: number;
  recommendationAccuracy?: number;
  validationStatus?: 'validated' | 'pending' | 'failed';
}

export class CollaborationCoordinator {
  private prisma: PrismaClient;
  private syncLogPath: string;
  private lastSyncTimestamp: Date | null = null;
  private pendingSyncs: Map<string, WeightSyncPayload> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.syncLogPath = join(process.cwd(), 'docs', 'ai', 'sync-log.json');
    this.initializeSyncLog();
  }

  /**
   * Initialize sync log file
   */
  private async initializeSyncLog(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.syncLogPath).then(() => true).catch(() => false);
      if (!exists) {
        await fs.writeFile(this.syncLogPath, JSON.stringify({ syncs: [] }, null, 2));
      }
    } catch (error) {
      console.error('[Coordinator] Failed to initialize sync log:', error);
    }
  }

  /**
   * Sync weights bi-directionally
   * AICore-X1 → AICollab-NX → Validation → Feedback
   */
  async syncWeights(sessionId: string, payload: WeightSyncPayload): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      payload.timestamp = timestamp;

      // Store sync payload
      this.pendingSyncs.set(sessionId, payload);
      this.lastSyncTimestamp = new Date();

      // Log sync
      await this.logSync(sessionId, payload);

      // Simulate bi-directional sync (in real implementation, this would be inter-module communication)
      console.log(`[Coordinator] 🔄 Sync: ${payload.sourceModule} → weights synced (${Object.keys(payload.weightDelta).length} features)`);

      // Validate sync quality
      const validation = await this.validateSync(payload);
      
      if (!validation.valid) {
        console.warn(`[Coordinator] ⚠️ Sync validation failed: ${validation.reason}`);
      }

      // Broadcast to other modules (if any)
      await this.broadcastSync(sessionId, payload, validation);

    } catch (error) {
      console.error('[Coordinator] Sync failed:', error);
    }
  }

  /**
   * Record learning session
   */
  async recordLearningSession(data: LearningSessionData): Promise<void> {
    try {
      // In future: store in LearningSession table
      // For now: log to file
      const logPath = join(process.cwd(), 'docs', 'ai', 'learning-sessions.json');
      
      let sessions: LearningSessionData[] = [];
      try {
        const existing = await fs.readFile(logPath, 'utf-8');
        sessions = JSON.parse(existing);
      } catch {
        sessions = [];
      }

      sessions.push({
        ...data,
        validationStatus: data.validationStatus || 'pending'
      });

      // Keep only last 1000 sessions
      if (sessions.length > 1000) {
        sessions = sessions.slice(-1000);
      }

      await fs.writeFile(logPath, JSON.stringify(sessions, null, 2));

      console.log(`[Coordinator] 📝 Learning session recorded: ${data.sessionId} (impact: ${data.impactScore.toFixed(3)})`);

    } catch (error) {
      console.error('[Coordinator] Failed to record learning session:', error);
    }
  }

  /**
   * Validate sync quality
   */
  private async validateSync(payload: WeightSyncPayload): Promise<{
    valid: boolean;
    reason?: string;
    score: number;
  }> {
    const weightDelta = payload.weightDelta;
    const weightCount = Object.keys(weightDelta).length;
    
    // Validation rules
    if (weightCount === 0) {
      return { valid: false, reason: 'Empty weight delta', score: 0 };
    }

    // Check for extreme values (potential instability)
    const maxWeight = Math.max(...Object.values(weightDelta).map(Math.abs));
    if (maxWeight > 1.0) {
      return { valid: false, reason: `Extreme weight detected: ${maxWeight}`, score: 0.3 };
    }

    // Check for NaN or Infinity
    for (const [key, value] of Object.entries(weightDelta)) {
      if (!isFinite(value)) {
        return { valid: false, reason: `Invalid weight for ${key}: ${value}`, score: 0 };
      }
    }

    // Calculate quality score
    const score = Math.min(1.0, weightCount / 10) * (1.0 - Math.min(1.0, maxWeight / 2.0));
    
    return { valid: score > 0.5, score };
  }

  /**
   * Broadcast sync to other modules
   */
  private async broadcastSync(
    sessionId: string,
    payload: WeightSyncPayload,
    validation: { valid: boolean; score: number }
  ): Promise<void> {
    // In a real multi-module system, this would send messages to other modules
    // For now, we log it
    console.log(`[Coordinator] 📡 Broadcast: ${sessionId} (valid: ${validation.valid}, score: ${validation.score.toFixed(2)})`);
  }

  /**
   * Log sync operation
   */
  private async logSync(sessionId: string, payload: WeightSyncPayload): Promise<void> {
    try {
      const logData = {
        sessionId,
        timestamp: payload.timestamp,
        sourceModule: payload.sourceModule,
        weightCount: Object.keys(payload.weightDelta).length,
        userId: payload.userId
      };

      const existing = await fs.readFile(this.syncLogPath, 'utf-8');
      const log = JSON.parse(existing);
      log.syncs.push(logData);

      // Keep only last 500 syncs
      if (log.syncs.length > 500) {
        log.syncs = log.syncs.slice(-500);
      }

      await fs.writeFile(this.syncLogPath, JSON.stringify(log, null, 2));

    } catch (error) {
      console.error('[Coordinator] Failed to log sync:', error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    lastSync: Date | null;
    pendingSyncs: number;
    syncLogPath: string;
  } {
    return {
      lastSync: this.lastSyncTimestamp,
      pendingSyncs: this.pendingSyncs.size,
      syncLogPath: this.syncLogPath
    };
  }

  /**
   * Get weight distribution summary
   */
  getWeightDistributionSummary(weights: Record<string, number>): {
    totalWeights: number;
    topWeights: Array<{ feature: string; weight: number }>;
    averageWeight: number;
    maxWeight: number;
    minWeight: number;
  } {
    const entries = Object.entries(weights);
    const values = Object.values(weights);

    return {
      totalWeights: entries.length,
      topWeights: entries
        .map(([feature, weight]) => ({ feature, weight }))
        .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
        .slice(0, 10),
      averageWeight: values.reduce((a, b) => a + b, 0) / values.length || 0,
      maxWeight: Math.max(...values, 0),
      minWeight: Math.min(...values, 0)
    };
  }
}

