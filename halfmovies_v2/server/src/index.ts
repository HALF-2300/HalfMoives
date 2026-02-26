import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { createServer } from 'http';
import { PORT } from './config';
import moviesRouter from './routes/movies';
import searchRouter from './routes/search';
import userRouter from './routes/user';
import recommendRouter from './routes/recommend';
import statsRouter from './routes/stats';
import healthRouter from './routes/health';
import { initializeInsightWebSocket } from './routes/insight';
import { getOperationalMode } from './ai/operationalMode';

const app = express();
const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true
  })
);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/search', searchRouter);
app.use('/api/user', userRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/stats', statsRouter);

// Create HTTP server for WebSocket support
const server = createServer(app);

// Initialize WebSocket for real-time metrics
initializeInsightWebSocket(server);

// Initialize Operational Mode
async function initializeOperationalMode() {
  try {
    const operationalMode = getOperationalMode();
    await operationalMode.activate();
    logger.info('[AICore-X1] Operational Mode activated - Phase 3 Live Adaptive Run #1');
  } catch (error) {
    logger.error('[AICore-X1] Failed to activate Operational Mode:', error);
  }
}

// Start server
server.listen(PORT, async () => {
  logger.info(`API listening on http://localhost:${PORT}`);
  logger.info(`WebSocket available at ws://localhost:${PORT}/ws/insight`);
  logger.info(`Health endpoint: http://localhost:${PORT}/api/health/adaptive`);
  
  // Activate operational mode after server starts
  await initializeOperationalMode();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  const operationalMode = getOperationalMode();
  await operationalMode.deactivate();
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
