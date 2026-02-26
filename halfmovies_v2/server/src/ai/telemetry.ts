/**
 * AICore-X1 Telemetry System
 * Records snapshots to autoevolution.md and diagnostics-report.md
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { AdaptiveMetrics } from './adaptiveCore';

export interface TelemetrySnapshot {
  timestamp: string;
  metrics: AdaptiveMetrics;
  anomalies: string[];
  learningRateDelta: number;
  systemHealth: 'green' | 'yellow' | 'red';
}

export class TelemetryRecorder {
  private autoevolutionPath: string;
  private diagnosticsPath: string;
  private lastLearningRate: number = 0;

  constructor() {
    const docsPath = join(process.cwd(), 'docs', 'ai');
    this.autoevolutionPath = join(docsPath, 'autoevolution.md');
    this.diagnosticsPath = join(docsPath, 'diagnostics-report.md');
  }

  /**
   * Record telemetry snapshot
   */
  async recordSnapshot(metrics: AdaptiveMetrics): Promise<void> {
    const snapshot: TelemetrySnapshot = {
      timestamp: new Date().toISOString(),
      metrics,
      anomalies: [],
      learningRateDelta: 0,
      systemHealth: 'green'
    };

    // Detect anomalies
    this.detectAnomalies(snapshot);

    // Calculate learning rate delta
    snapshot.learningRateDelta = this.calculateLearningRateDelta(metrics);

    // Determine system health
    snapshot.systemHealth = this.determineHealth(snapshot);

    // Record to files
    await this.appendToAutoevolution(snapshot);
    await this.updateDiagnostics(snapshot);

    // Report if threshold exceeded
    if (Math.abs(snapshot.learningRateDelta) > 0.15) {
      await this.reportAnomaly(snapshot);
    }
  }

  /**
   * Detect anomalies in metrics
   */
  private detectAnomalies(snapshot: TelemetrySnapshot): void {
    const { metrics } = snapshot;

    // High latency anomaly
    if (metrics.avgLatency > 1000) {
      snapshot.anomalies.push(`High latency detected: ${metrics.avgLatency}ms`);
    }

    // Low cache hit rate
    if (metrics.cacheHitRate < 0.3 && metrics.trainingOps > 100) {
      snapshot.anomalies.push(`Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
    }

    // Connection failures
    if (metrics.connectionFailures > 0) {
      snapshot.anomalies.push(`Connection failures: ${metrics.connectionFailures}`);
    }

    // Engine not active
    if (metrics.engine !== 'active') {
      snapshot.anomalies.push(`Engine status: ${metrics.engine}`);
    }

    // Excessive training operations (possible loop)
    if (metrics.trainingOps > 10000) {
      snapshot.anomalies.push(`High training operations: ${metrics.trainingOps}`);
    }
  }

  /**
   * Calculate learning rate delta
   */
  private calculateLearningRateDelta(metrics: AdaptiveMetrics): number {
    // Calculate average weight change
    const weights = Object.values(metrics.modelWeights);
    if (weights.length === 0) return 0;

    const avgWeight = weights.reduce((a, b) => a + Math.abs(b), 0) / weights.length;
    const delta = avgWeight - this.lastLearningRate;
    this.lastLearningRate = avgWeight;

    return delta;
  }

  /**
   * Determine system health
   */
  private determineHealth(snapshot: TelemetrySnapshot): 'green' | 'yellow' | 'red' {
    if (snapshot.anomalies.length === 0 && snapshot.metrics.engine === 'active') {
      return 'green';
    }

    if (snapshot.anomalies.length <= 2 && snapshot.metrics.connectionFailures < 3) {
      return 'yellow';
    }

    return 'red';
  }

  /**
   * Append snapshot to autoevolution.md
   */
  private async appendToAutoevolution(snapshot: TelemetrySnapshot): Promise<void> {
    try {
      const content = await this.getAutoevolutionContent();
      const entry = this.formatAutoevolutionEntry(snapshot);
      
      // Find insertion point (after last entry or at end)
      const insertPoint = content.lastIndexOf('## ');
      const newContent = insertPoint > 0
        ? content.slice(0, insertPoint) + entry + '\n\n' + content.slice(insertPoint)
        : content + '\n\n' + entry;

      await fs.writeFile(this.autoevolutionPath, newContent, 'utf-8');
    } catch (error) {
      console.error('[Telemetry] Failed to write to autoevolution.md:', error);
    }
  }

  /**
   * Update diagnostics-report.md
   */
  private async updateDiagnostics(snapshot: TelemetrySnapshot): Promise<void> {
    try {
      const content = await this.getDiagnosticsContent();
      
      // Update last snapshot section
      const snapshotSection = `
## 📊 Latest Telemetry Snapshot

**Timestamp:** ${snapshot.timestamp}  
**System Health:** ${snapshot.systemHealth.toUpperCase()}  
**Learning Rate Delta:** ${snapshot.learningRateDelta.toFixed(4)}  
**Training Operations:** ${snapshot.metrics.trainingOps}  
**Average Latency:** ${snapshot.metrics.avgLatency}ms  
**Cache Hit Rate:** ${(snapshot.metrics.cacheHitRate * 100).toFixed(1)}%  
**Engine Status:** ${snapshot.metrics.engine}

${snapshot.anomalies.length > 0 ? `**Anomalies:**\n${snapshot.anomalies.map(a => `- ${a}`).join('\n')}` : '**Anomalies:** None'}

---

`;

      // Append or replace snapshot section
      const updatedContent = content.replace(
        /## 📊 Latest Telemetry Snapshot[\s\S]*?---/,
        snapshotSection.trim()
      ) || content + snapshotSection;

      await fs.writeFile(this.diagnosticsPath, updatedContent, 'utf-8');
    } catch (error) {
      console.error('[Telemetry] Failed to update diagnostics-report.md:', error);
    }
  }

  /**
   * Report anomaly if threshold exceeded
   */
  private async reportAnomaly(snapshot: TelemetrySnapshot): Promise<void> {
    const report = {
      timestamp: snapshot.timestamp,
      type: 'learning_rate_threshold_exceeded',
      delta: snapshot.learningRateDelta,
      threshold: 0.15,
      metrics: snapshot.metrics,
      anomalies: snapshot.anomalies
    };

    console.warn('[Telemetry] ⚠️  ANOMALY DETECTED:');
    console.warn(`  Learning Rate Delta: ${snapshot.learningRateDelta.toFixed(4)} (threshold: 0.15)`);
    console.warn(`  System Health: ${snapshot.systemHealth}`);
    if (snapshot.anomalies.length > 0) {
      console.warn(`  Anomalies: ${snapshot.anomalies.join(', ')}`);
    }

    // Write to anomaly log
    try {
      const anomalyPath = join(process.cwd(), 'docs', 'ai', 'anomalies.log');
      const logEntry = `${snapshot.timestamp} | ${JSON.stringify(report)}\n`;
      await fs.appendFile(anomalyPath, logEntry, 'utf-8');
    } catch (error) {
      console.error('[Telemetry] Failed to log anomaly:', error);
    }
  }

  /**
   * Format autoevolution entry
   */
  private formatAutoevolutionEntry(snapshot: TelemetrySnapshot): string {
    return `## ${snapshot.timestamp} - Telemetry Snapshot

### System Status: ${snapshot.systemHealth.toUpperCase()}

**Metrics:**
- Training Operations: ${snapshot.metrics.trainingOps}
- Average Latency: ${snapshot.metrics.avgLatency}ms
- Cache Hit Rate: ${(snapshot.metrics.cacheHitRate * 100).toFixed(1)}%
- Engine: ${snapshot.metrics.engine}
- Learning Rate Delta: ${snapshot.learningRateDelta.toFixed(4)}

${snapshot.anomalies.length > 0 ? `**Anomalies:**\n${snapshot.anomalies.map(a => `- ${a}`).join('\n')}\n` : '**Anomalies:** None\n'}

**Model Weights:** ${Object.keys(snapshot.metrics.modelWeights).length} active weights

---`;
  }

  /**
   * Get current autoevolution content
   */
  private async getAutoevolutionContent(): Promise<string> {
    try {
      return await fs.readFile(this.autoevolutionPath, 'utf-8');
    } catch {
      return '# AICore-X1 Auto-Evolution Log\n\n';
    }
  }

  /**
   * Get current diagnostics content
   */
  private async getDiagnosticsContent(): Promise<string> {
    try {
      return await fs.readFile(this.diagnosticsPath, 'utf-8');
    } catch {
      return '# AICore-X1 System Diagnostics Report\n\n';
    }
  }
}

// Singleton instance
let telemetryInstance: TelemetryRecorder | null = null;

export function getTelemetryRecorder(): TelemetryRecorder {
  if (!telemetryInstance) {
    telemetryInstance = new TelemetryRecorder();
  }
  return telemetryInstance;
}

