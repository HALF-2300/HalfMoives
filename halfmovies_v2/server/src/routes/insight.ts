/**
 * WebSocket endpoint for real-time adaptive metrics
 * /ws/insight
 */

import { WebSocketServer, WebSocket } from 'ws';
import { getAdaptiveCore } from '../ai/adaptiveCore';
import { prisma } from '../prisma';

let wss: WebSocketServer | null = null;

export function initializeInsightWebSocket(server: any): void {
  wss = new WebSocketServer({ 
    server,
    path: '/ws/insight'
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[Insight] WebSocket client connected');

    // Send initial metrics
    sendMetrics(ws);

    // Send metrics every 5 seconds
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendMetrics(ws);
      } else {
        clearInterval(interval);
      }
    }, 5000);

    ws.on('close', () => {
      console.log('[Insight] WebSocket client disconnected');
      clearInterval(interval);
    });

    ws.on('error', (error) => {
      console.error('[Insight] WebSocket error:', error);
      clearInterval(interval);
    });
  });

  console.log('[Insight] WebSocket server initialized on /ws/insight');
}

async function sendMetrics(ws: WebSocket): Promise<void> {
  try {
    const adaptiveCore = getAdaptiveCore(prisma);
    const metrics = adaptiveCore.getMetrics();

    // Get cache stats if Redis is available
    let cacheHits = 0;
    let cacheMisses = 0;
    try {
      const { redis } = await import('../services/redis');
      if (redis) {
        // Get cache stats from Redis
        const stats = await redis.get('adaptive:cache:stats');
        if (stats) {
          const parsed = JSON.parse(stats);
          cacheHits = parsed.hits || 0;
          cacheMisses = parsed.misses || 0;
        }
      }
    } catch {
      // Redis not available
    }

    const message = {
      type: 'metrics',
      data: {
        engine: metrics.engine,
        lastSync: metrics.lastSync,
        trainingOps: metrics.trainingOps,
        cacheHitRate: metrics.cacheHitRate,
        avgLatency: metrics.avgLatency,
        modelWeights: metrics.modelWeights,
        cacheStats: {
          hits: cacheHits,
          misses: cacheMisses,
          hitRate: cacheHits + cacheMisses > 0 
            ? cacheHits / (cacheHits + cacheMisses) 
            : 0
        },
        timestamp: new Date().toISOString()
      }
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error('[Insight] Failed to send metrics:', error);
  }
}

export function broadcastMetrics(): void {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'metrics_update',
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

