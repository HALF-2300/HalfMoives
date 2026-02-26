/**
 * Diagnostic Generator
 * Phase 3.5: Generate comprehensive diagnostic logs
 */

import { AdaptiveMetrics } from './adaptiveCore';
import { CollaborationCoordinator } from './collaborationCoordinator';
import { PredictiveMetrics } from './predictiveBridge';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface DiagnosticReport {
  timestamp: string;
  adaptiveMetrics: AdaptiveMetrics;
  weightDistribution: {
    summary: ReturnType<CollaborationCoordinator['getWeightDistributionSummary']>;
    projection: {
      recommendationAccuracyImprovement: number;
      expectedLatencyReduction: number;
      stabilityForecast: 'stable' | 'moderate' | 'unstable';
    };
    instabilityThresholds: {
      current: number;
      warning: number;
      critical: number;
      status: 'ok' | 'warning' | 'critical';
    };
  };
  coordinationStatus: ReturnType<CollaborationCoordinator['getSyncStatus']>;
  predictiveMetrics?: {
    predictiveAccuracyIndex: number; // PAI
    totalPredictions: number;
    accuratePredictions: number;
    averageConfidence: number;
    preloadHitRate: number;
    latencyReduction: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  recommendations: string[];
}

export class DiagnosticGenerator {
  private coordinator: CollaborationCoordinator;
  private reportPath: string;
  private paiHistory: number[] = []; // Track PAI over time for trend analysis
  private readonly PAI_UPDATE_INTERVAL = 10; // Update PAI every 10 cycles

  constructor(coordinator: CollaborationCoordinator) {
    this.coordinator = coordinator;
    this.reportPath = join(process.cwd(), 'docs', 'ai', 'diagnostic-report.json');
  }

  /**
   * Generate comprehensive diagnostic report
   * Phase 4.0: Extended with Predictive Accuracy Index (PAI)
   */
  async generateReport(
    metrics: AdaptiveMetrics,
    predictiveMetrics?: PredictiveMetrics
  ): Promise<DiagnosticReport> {
    const timestamp = new Date().toISOString();

    // Get weight distribution summary
    const weightSummary = this.coordinator.getWeightDistributionSummary(metrics.modelWeights);

    // Calculate projections
    const projection = this.calculateProjections(metrics, weightSummary);

    // Detect instability thresholds
    const instability = this.detectInstability(metrics, weightSummary);

    // Get coordination status
    const coordinationStatus = this.coordinator.getSyncStatus();

    // Phase 4.0: Process predictive metrics if provided
    let predictiveData: DiagnosticReport['predictiveMetrics'] | undefined;
    if (predictiveMetrics) {
      // Update PAI history
      this.paiHistory.push(predictiveMetrics.predictiveAccuracyIndex);
      if (this.paiHistory.length > 100) {
        this.paiHistory = this.paiHistory.slice(-100); // Keep last 100
      }

      // Calculate trend
      const trend = this.calculatePAITrend();

      predictiveData = {
        predictiveAccuracyIndex: predictiveMetrics.predictiveAccuracyIndex,
        totalPredictions: predictiveMetrics.totalPredictions,
        accuratePredictions: predictiveMetrics.accuratePredictions,
        averageConfidence: predictiveMetrics.averageConfidence,
        preloadHitRate: predictiveMetrics.preloadHitRate,
        latencyReduction: predictiveMetrics.latencyReduction,
        trend
      };
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      metrics,
      weightSummary,
      instability,
      predictiveData
    );

    const report: DiagnosticReport = {
      timestamp,
      adaptiveMetrics: metrics,
      weightDistribution: {
        summary: weightSummary,
        projection,
        instabilityThresholds: instability
      },
      coordinationStatus,
      predictiveMetrics: predictiveData,
      recommendations
    };

    // Save report
    await this.saveReport(report);

    return report;
  }

  /**
   * Calculate PAI trend
   */
  private calculatePAITrend(): 'improving' | 'stable' | 'declining' {
    if (this.paiHistory.length < 5) return 'stable';

    const recent = this.paiHistory.slice(-5);
    const older = this.paiHistory.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * Calculate projected improvements
   */
  private calculateProjections(
    metrics: AdaptiveMetrics,
    weightSummary: ReturnType<CollaborationCoordinator['getWeightDistributionSummary']>
  ): DiagnosticReport['weightDistribution']['projection'] {
    // Projected accuracy improvement based on:
    // - Number of learned features (more = better)
    // - Training operations (more data = better)
    // - Cache hit rate (higher = more personalized)

    const featureDiversity = weightSummary.totalWeights;
    const trainingMaturity = Math.min(1.0, metrics.trainingOps / 1000); // Mature after 1000 ops
    const personalizationLevel = metrics.cacheHitRate;

    // Projected accuracy improvement (0-30%)
    const accuracyImprovement = Math.min(0.30, 
      (featureDiversity / 50) * 0.15 + // Up to 15% from feature diversity
      trainingMaturity * 0.10 + // Up to 10% from training maturity
      personalizationLevel * 0.05 // Up to 5% from personalization
    );

    // Expected latency reduction (better caching = lower latency)
    const latencyReduction = Math.min(0.40, personalizationLevel * 0.40); // Up to 40% reduction

    // Stability forecast
    let stabilityForecast: 'stable' | 'moderate' | 'unstable' = 'stable';
    if (metrics.connectionFailures > 3 || metrics.avgLatency > 1000) {
      stabilityForecast = 'unstable';
    } else if (metrics.connectionFailures > 0 || metrics.avgLatency > 500) {
      stabilityForecast = 'moderate';
    }

    return {
      recommendationAccuracyImprovement: accuracyImprovement,
      expectedLatencyReduction: latencyReduction,
      stabilityForecast
    };
  }

  /**
   * Detect instability thresholds
   */
  private detectInstability(
    metrics: AdaptiveMetrics,
    weightSummary: ReturnType<CollaborationCoordinator['getWeightDistributionSummary']>
  ): DiagnosticReport['weightDistribution']['instabilityThresholds'] {
    const maxWeight = Math.abs(weightSummary.maxWeight);
    const minWeight = Math.abs(weightSummary.minWeight);
    const weightRange = maxWeight - minWeight;

    // Thresholds
    const warningThreshold = 0.5;
    const criticalThreshold = 1.0;

    let status: 'ok' | 'warning' | 'critical' = 'ok';
    
    if (maxWeight > criticalThreshold || weightRange > criticalThreshold) {
      status = 'critical';
    } else if (maxWeight > warningThreshold || weightRange > warningThreshold) {
      status = 'warning';
    }

    return {
      current: maxWeight,
      warning: warningThreshold,
      critical: criticalThreshold,
      status
    };
  }

  /**
   * Generate recommendations
   * Phase 4.0: Extended with predictive metrics recommendations
   */
  private generateRecommendations(
    metrics: AdaptiveMetrics,
    weightSummary: ReturnType<CollaborationCoordinator['getWeightDistributionSummary']>,
    instability: DiagnosticReport['weightDistribution']['instabilityThresholds'],
    predictiveMetrics?: DiagnosticReport['predictiveMetrics']
  ): string[] {
    const recommendations: string[] = [];

    // Instability recommendations
    if (instability.status === 'critical') {
      recommendations.push('⚠️ CRITICAL: Weight instability detected. Consider reducing learning rate or implementing weight clipping.');
    } else if (instability.status === 'warning') {
      recommendations.push('⚠️ WARNING: Weight values approaching instability threshold. Monitor closely.');
    }

    // Training recommendations
    if (metrics.trainingOps < 100) {
      recommendations.push('💡 System still in early learning phase. More training data needed for accurate recommendations.');
    } else if (metrics.trainingOps > 10000) {
      recommendations.push('✅ System has substantial training data. Consider implementing weight decay to prevent overfitting.');
    }

    // Cache recommendations
    if (metrics.cacheHitRate < 0.3) {
      recommendations.push('💡 Low cache hit rate. Consider increasing cache TTL or improving personalization.');
    } else if (metrics.cacheHitRate > 0.8) {
      recommendations.push('✅ Excellent cache performance. System is well-optimized.');
    }

    // Latency recommendations
    if (metrics.avgLatency > 1000) {
      recommendations.push('⚠️ High latency detected. Review database queries and consider additional caching.');
    } else if (metrics.avgLatency < 100) {
      recommendations.push('✅ Excellent latency performance.');
    }

    // Weight diversity recommendations
    if (weightSummary.totalWeights < 10) {
      recommendations.push('💡 Limited feature diversity. System may benefit from more varied learning signals.');
    } else if (weightSummary.totalWeights > 100) {
      recommendations.push('💡 High feature diversity. Consider feature selection to reduce complexity.');
    }

    // Connection recommendations
    if (metrics.connectionFailures > 0) {
      recommendations.push('⚠️ Connection failures detected. Review database connectivity and retry logic.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All systems operating within optimal parameters.');
    }

    return recommendations;
  }

  /**
   * Save diagnostic report
   */
  private async saveReport(report: DiagnosticReport): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      await fs.writeFile(this.reportPath, JSON.stringify(report, null, 2));
      console.log(`[DiagnosticGenerator] 📊 Report saved: ${this.reportPath}`);
    } catch (error) {
      console.error('[DiagnosticGenerator] Failed to save report:', error);
    }
  }

  /**
   * Get latest report
   */
  async getLatestReport(): Promise<DiagnosticReport | null> {
    try {
      const content = await fs.readFile(this.reportPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}

