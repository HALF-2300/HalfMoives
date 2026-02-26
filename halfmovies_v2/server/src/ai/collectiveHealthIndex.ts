/**
 * Collective Health Index (CHI)
 * Phase 4.2: Measures overall health of distributed intelligence network
 */

import { CollectiveNodeMesh } from './collectiveNodeMesh';
import { ConsensusEngine } from './consensusEngine';
import { PredictiveMetrics } from './predictiveBridge';
import { CEPAIMetrics } from './contextualEmotionalPAI';
import { AdaptiveMetrics } from './adaptiveCore';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface CollectiveHealthMetrics {
  chi: number; // Collective Health Index (0.0 to 1.0)
  timestamp: string;
  components: {
    meshHealth: number; // Node mesh connectivity and activity
    consensusHealth: number; // Consensus engine effectiveness
    predictiveHealth: number; // Predictive system performance
    empathicHealth: number; // Empathic system performance
    optimizationHealth: number; // Self-optimization effectiveness
  };
  status: 'healthy' | 'degraded' | 'critical';
  recommendations: string[];
}

/**
 * Collective Health Index
 */
export class CollectiveHealthIndex {
  private mesh: CollectiveNodeMesh;
  private consensusEngine: ConsensusEngine;
  private metricsPath: string;

  constructor(mesh: CollectiveNodeMesh, consensusEngine: ConsensusEngine) {
    this.mesh = mesh;
    this.consensusEngine = consensusEngine;
    this.metricsPath = join(process.cwd(), 'docs', 'ai', 'collective-metrics.json');
  }

  /**
   * Calculate Collective Health Index
   */
  async calculateCHI(
    adaptiveMetrics: AdaptiveMetrics,
    predictiveMetrics: PredictiveMetrics,
    cePaiMetrics: CEPAIMetrics
  ): Promise<CollectiveHealthMetrics> {
    // Mesh health
    const meshStatus = this.mesh.getMeshStatus();
    const meshHealth = this.calculateMeshHealth(meshStatus);

    // Consensus health
    const consensusStats = this.consensusEngine.getStatistics();
    const consensusHealth = this.calculateConsensusHealth(consensusStats);

    // Predictive health
    const predictiveHealth = this.calculatePredictiveHealth(predictiveMetrics, adaptiveMetrics);

    // Empathic health
    const empathicHealth = this.calculateEmpathicHealth(cePaiMetrics);

    // Optimization health (simplified - would track optimization cycles)
    const optimizationHealth = 0.8; // Placeholder

    // Overall CHI
    const chi = (
      meshHealth * 0.2 +
      consensusHealth * 0.2 +
      predictiveHealth * 0.25 +
      empathicHealth * 0.25 +
      optimizationHealth * 0.1
    );

    // Determine status
    let status: 'healthy' | 'degraded' | 'critical';
    if (chi >= 0.7) {
      status = 'healthy';
    } else if (chi >= 0.5) {
      status = 'degraded';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      meshHealth,
      consensusHealth,
      predictiveHealth,
      empathicHealth,
      optimizationHealth
    });

    const metrics: CollectiveHealthMetrics = {
      chi,
      timestamp: new Date().toISOString(),
      components: {
        meshHealth,
        consensusHealth,
        predictiveHealth,
        empathicHealth,
        optimizationHealth
      },
      status,
      recommendations
    };

    // Save metrics
    await this.saveMetrics(metrics);

    return metrics;
  }

  /**
   * Calculate mesh health
   */
  private calculateMeshHealth(meshStatus: ReturnType<CollectiveNodeMesh['getMeshStatus']>): number {
    let health = 0.5; // Base health

    // Active nodes boost health
    if (meshStatus.activeNodes > 0) {
      health += 0.3;
    }

    // Recent updates boost health
    const lastUpdate = new Date(meshStatus.lastUpdate);
    const age = Date.now() - lastUpdate.getTime();
    if (age < 5 * 60 * 1000) { // Less than 5 minutes
      health += 0.2;
    } else if (age < 15 * 60 * 1000) { // Less than 15 minutes
      health += 0.1;
    }

    return Math.min(1.0, health);
  }

  /**
   * Calculate consensus health
   */
  private calculateConsensusHealth(stats: ReturnType<ConsensusEngine['getStatistics']>): number {
    let health = 0.5;

    // High reinforcement score = good consensus
    if (stats.averageReinforcementScore > 0.6) {
      health += 0.3;
    } else if (stats.averageReinforcementScore > 0.4) {
      health += 0.15;
    }

    // High improvement rate = effective consensus
    if (stats.improvementRate > 0.5) {
      health += 0.2;
    } else if (stats.improvementRate > 0.3) {
      health += 0.1;
    }

    return Math.min(1.0, health);
  }

  /**
   * Calculate predictive health
   */
  private calculatePredictiveHealth(
    predictiveMetrics: PredictiveMetrics,
    adaptiveMetrics: AdaptiveMetrics
  ): number {
    let health = 0.5;

    // High PAI = good predictive health
    if (predictiveMetrics.predictiveAccuracyIndex > 0.6) {
      health += 0.3;
    } else if (predictiveMetrics.predictiveAccuracyIndex > 0.4) {
      health += 0.15;
    }

    // Low latency = good health
    if (adaptiveMetrics.avgLatency < 200) {
      health += 0.2;
    } else if (adaptiveMetrics.avgLatency < 500) {
      health += 0.1;
    }

    return Math.min(1.0, health);
  }

  /**
   * Calculate empathic health
   */
  private calculateEmpathicHealth(cePaiMetrics: CEPAIMetrics): number {
    let health = 0.5;

    // High CE-PAI = good empathic health
    if (cePaiMetrics.contextualEmotionalPAI > 0.6) {
      health += 0.3;
    } else if (cePaiMetrics.contextualEmotionalPAI > 0.4) {
      health += 0.15;
    }

    // High emotional resonance = good health
    if (cePaiMetrics.emotionalResonanceScore > 0.7) {
      health += 0.2;
    } else if (cePaiMetrics.emotionalResonanceScore > 0.5) {
      health += 0.1;
    }

    return Math.min(1.0, health);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(components: CollectiveHealthMetrics['components']): string[] {
    const recommendations: string[] = [];

    if (components.meshHealth < 0.6) {
      recommendations.push('⚠️ Mesh health low. Check node connectivity and activity.');
    }

    if (components.consensusHealth < 0.6) {
      recommendations.push('⚠️ Consensus health low. Review reinforcement scores and decision quality.');
    }

    if (components.predictiveHealth < 0.6) {
      recommendations.push('⚠️ Predictive health low. Consider adjusting prediction algorithms.');
    }

    if (components.empathicHealth < 0.6) {
      recommendations.push('⚠️ Empathic health low. Review emotional modeling and resonance.');
    }

    if (components.optimizationHealth < 0.6) {
      recommendations.push('⚠️ Optimization health low. Review self-optimization cycles.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All systems healthy.');
    }

    return recommendations;
  }

  /**
   * Save metrics
   */
  private async saveMetrics(metrics: CollectiveHealthMetrics): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), 'docs', 'ai'), { recursive: true });
      
      let existing: { metrics: CollectiveHealthMetrics[] } = { metrics: [] };
      try {
        const content = await fs.readFile(this.metricsPath, 'utf-8');
        existing = JSON.parse(content);
      } catch {
        // File doesn't exist, start fresh
      }

      existing.metrics.push(metrics);

      // Keep only last 1000 metrics
      if (existing.metrics.length > 1000) {
        existing.metrics = existing.metrics.slice(-1000);
      }

      await fs.writeFile(this.metricsPath, JSON.stringify(existing, null, 2));
    } catch (error) {
      console.error('[CollectiveHealthIndex] Failed to save metrics:', error);
    }
  }

  /**
   * Get latest CHI
   */
  async getLatestCHI(): Promise<CollectiveHealthMetrics | null> {
    try {
      const content = await fs.readFile(this.metricsPath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.metrics && data.metrics.length > 0) {
        return data.metrics[data.metrics.length - 1];
      }
    } catch {
      // File doesn't exist or error
    }
    
    return null;
  }
}

