/**
 * Predictive Metrics Tracker
 * Phase 4.0: Tracks and archives predictive metrics
 */

import { PredictiveMetrics } from './predictiveBridge';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface PredictiveMetricsSnapshot {
  timestamp: string;
  metrics: PredictiveMetrics;
  cycle: number;
}

export class PredictiveMetricsTracker {
  private metricsPath: string;
  private cycleCount: number = 0;
  private readonly PAI_UPDATE_CYCLES = 10; // Update PAI every 10 cycles

  constructor() {
    this.metricsPath = join(process.cwd(), 'docs', 'ai', 'predictive-metrics.json');
    this.initializeMetricsFile();
  }

  /**
   * Initialize metrics file
   */
  private async initializeMetricsFile(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      const exists = await fs.access(this.metricsPath).then(() => true).catch(() => false);
      if (!exists) {
        await fs.writeFile(
          this.metricsPath,
          JSON.stringify({ snapshots: [], cycles: [] }, null, 2)
        );
      }
    } catch (error) {
      console.error('[PredictiveMetricsTracker] Failed to initialize:', error);
    }
  }

  /**
   * Record metrics snapshot
   */
  async recordSnapshot(metrics: PredictiveMetrics): Promise<void> {
    this.cycleCount++;

    try {
      const snapshot: PredictiveMetricsSnapshot = {
        timestamp: new Date().toISOString(),
        metrics,
        cycle: this.cycleCount
      };

      // Read existing data
      const content = await fs.readFile(this.metricsPath, 'utf-8');
      const data = JSON.parse(content);

      // Add snapshot
      data.snapshots.push(snapshot);

      // Keep only last 1000 snapshots
      if (data.snapshots.length > 1000) {
        data.snapshots = data.snapshots.slice(-1000);
      }

      // Update PAI every N cycles
      if (this.cycleCount % this.PAI_UPDATE_CYCLES === 0) {
        data.cycles.push({
          cycle: this.cycleCount,
          timestamp: snapshot.timestamp,
          pai: metrics.predictiveAccuracyIndex,
          totalPredictions: metrics.totalPredictions,
          accuratePredictions: metrics.accuratePredictions,
          averageConfidence: metrics.averageConfidence,
          latencyReduction: metrics.latencyReduction
        });

        // Keep only last 100 cycles
        if (data.cycles.length > 100) {
          data.cycles = data.cycles.slice(-100);
        }

        console.log(`[PredictiveMetricsTracker] PAI updated at cycle ${this.cycleCount}: ${metrics.predictiveAccuracyIndex.toFixed(3)}`);
      }

      // Write back
      await fs.writeFile(this.metricsPath, JSON.stringify(data, null, 2));

    } catch (error) {
      console.error('[PredictiveMetricsTracker] Failed to record snapshot:', error);
    }
  }

  /**
   * Get latest metrics
   */
  async getLatestMetrics(): Promise<PredictiveMetricsSnapshot | null> {
    try {
      const content = await fs.readFile(this.metricsPath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.snapshots.length === 0) return null;
      
      return data.snapshots[data.snapshots.length - 1];
    } catch {
      return null;
    }
  }

  /**
   * Get PAI trend over last N cycles
   */
  async getPAITrend(cycles: number = 10): Promise<{
    current: number;
    average: number;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      const content = await fs.readFile(this.metricsPath, 'utf-8');
      const data = JSON.parse(content);
      
      const recentCycles = data.cycles.slice(-cycles);
      if (recentCycles.length === 0) {
        return { current: 0, average: 0, trend: 'stable' };
      }

      const current = recentCycles[recentCycles.length - 1].pai;
      const average = recentCycles.reduce((sum: number, c: any) => sum + c.pai, 0) / recentCycles.length;

      // Calculate trend
      if (recentCycles.length >= 2) {
        const older = recentCycles.slice(0, Math.floor(recentCycles.length / 2));
        const newer = recentCycles.slice(Math.floor(recentCycles.length / 2));
        
        const olderAvg = older.reduce((sum: number, c: any) => sum + c.pai, 0) / older.length;
        const newerAvg = newer.reduce((sum: number, c: any) => sum + c.pai, 0) / newer.length;
        
        const diff = newerAvg - olderAvg;
        
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (diff > 0.05) trend = 'improving';
        else if (diff < -0.05) trend = 'declining';
        
        return { current, average, trend };
      }

      return { current, average, trend: 'stable' };
    } catch {
      return { current: 0, average: 0, trend: 'stable' };
    }
  }
}

