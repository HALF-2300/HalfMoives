/**
 * AICore-X1 Operational Mode
 * Continuous learning and monitoring activation
 */

import { getAdaptiveCore } from './adaptiveCore';
import { getTelemetryRecorder } from './telemetry';
import { prisma } from '../prisma';
import { broadcastMetrics } from '../routes/insight';

export class OperationalMode {
  private adaptiveCore = getAdaptiveCore(prisma);
  private telemetry = getTelemetryRecorder();
  private isActive: boolean = false;
  private trainingInterval: NodeJS.Timeout | null = null;

  /**
   * Activate operational mode
   */
  async activate(): Promise<void> {
    if (this.isActive) {
      console.log('[OperationalMode] Already active');
      return;
    }

    console.log('[OperationalMode] 🚀 Activating Phase 3 Operational Mode...');

    // Initialize adaptive core
    await this.adaptiveCore.initialize();

    // Start continuous learning cycle
    this.startTrainingCycle();

    // Record initial telemetry
    const metrics = this.adaptiveCore.getMetrics();
    await this.telemetry.recordSnapshot(metrics);

    this.isActive = true;
    console.log('[OperationalMode] ✅ Operational mode ACTIVE');
    console.log('[OperationalMode] 📊 Monitoring: /api/health/adaptive');
    console.log('[OperationalMode] 📡 Streaming: /ws/insight');
    console.log('[OperationalMode] 🔄 Sync interval: 5 minutes');
    console.log('[OperationalMode] 📝 Telemetry: docs/ai/autoevolution.md');
  }

  /**
   * Start continuous training cycle
   */
  private startTrainingCycle(): void {
    // Process user activity events every 30 seconds
    this.trainingInterval = setInterval(async () => {
      try {
        await this.processUserActivityEvents();
      } catch (error) {
        console.error('[OperationalMode] Training cycle error:', error);
      }
    }, 30 * 1000);

    console.log('[OperationalMode] Training cycle started (30s interval)');
  }

  /**
   * Process recent user activity events for learning
   */
  private async processUserActivityEvents(): Promise<void> {
    try {
      // Get recent activities (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const recentActivities = await prisma.userActivity.findMany({
        where: {
          createdAt: {
            gte: fiveMinutesAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      // Learn from each activity
      for (const activity of recentActivities) {
        if (!activity.userId) continue;

        await this.adaptiveCore.learnFromActivity({
          userId: activity.userId,
          action: activity.action,
          metadata: activity.metadata as Record<string, unknown> || {}
        });
      }

      // Broadcast updated metrics via WebSocket
      broadcastMetrics();

      if (recentActivities.length > 0) {
        console.log(`[OperationalMode] Processed ${recentActivities.length} activity events`);
      }
    } catch (error) {
      console.error('[OperationalMode] Failed to process activities:', error);
    }
  }

  /**
   * Get operational status
   */
  getStatus(): {
    active: boolean;
    metrics: ReturnType<typeof this.adaptiveCore.getMetrics>;
  } {
    return {
      active: this.isActive,
      metrics: this.adaptiveCore.getMetrics()
    };
  }

  /**
   * Deactivate operational mode
   */
  async deactivate(): Promise<void> {
    if (!this.isActive) return;

    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
    }

    await this.adaptiveCore.shutdown();
    this.isActive = false;

    console.log('[OperationalMode] Deactivated');
  }
}

// Singleton instance
let operationalInstance: OperationalMode | null = null;

export function getOperationalMode(): OperationalMode {
  if (!operationalInstance) {
    operationalInstance = new OperationalMode();
  }
  return operationalInstance;
}

