/**
 * AICore-X1 System Diagnostics
 * Verifies data pipeline integrity across all active modules
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma with proper config
let prisma;
try {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error.message);
  console.log('\n💡 Run: pnpm prisma:generate\n');
  process.exit(1);
}

const diagnostics = {
  timestamp: new Date().toISOString(),
  system: 'AICore-X1',
  version: '1.0.0',
  modules: {},
  health: 'unknown',
  recommendations: []
};

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', latency: Date.now() };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function checkRecommendationModule() {
  const results = {
    status: 'unknown',
    latency: null,
    cache: null,
    errors: []
  };

  try {
    // Check if recommendation engine can query
    const start = Date.now();
    const testMovies = await prisma.movie.findMany({ take: 1 });
    results.latency = Date.now() - start;
    
    // Check user preferences table
    const prefsCount = await prisma.userPreferences.count();
    
    // Check AI logs
    const aiLogsCount = await prisma.aiLog.count();
    const recentLogs = await prisma.aiLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    results.status = 'operational';
    results.metrics = {
      moviesInDb: await prisma.movie.count(),
      userPreferences: prefsCount,
      aiLogs: aiLogsCount,
      recentLatency: recentLogs.length > 0 
        ? recentLogs.map(l => l.latency).filter(Boolean)
        : []
    };

    // Check for high latency warnings
    const highLatency = recentLogs.filter(l => l.latency && l.latency > 500);
    if (highLatency.length > 0) {
      results.warnings = [`${highLatency.length} high-latency calls detected (>500ms)`];
    }

  } catch (error) {
    results.status = 'error';
    results.errors.push(error.message);
  }

  return results;
}

async function checkUserProfileModule() {
  const results = {
    status: 'unknown',
    users: 0,
    preferences: 0,
    favorites: 0,
    errors: []
  };

  try {
    results.users = await prisma.user.count();
    results.preferences = await prisma.userPreferences.count();
    results.favorites = await prisma.favorite.count();

    // Check schema integrity
    const sampleUser = await prisma.user.findFirst({
      include: {
        preferences: true,
        favorites: true
      }
    });

    if (sampleUser) {
      results.sampleData = {
        hasPreferences: !!sampleUser.preferences,
        favoritesCount: sampleUser.favorites.length
      };
    }

    results.status = 'operational';
  } catch (error) {
    results.status = 'error';
    results.errors.push(error.message);
  }

  return results;
}

async function checkActivityModule() {
  const results = {
    status: 'unknown',
    totalActivities: 0,
    recentActivities: [],
    errors: []
  };

  try {
    results.totalActivities = await prisma.userActivity.count();
    
    const recent = await prisma.userActivity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    results.recentActivities = recent.map(a => ({
      action: a.action,
      userId: a.userId,
      timestamp: a.createdAt
    }));

    // Check activity distribution
    const activityTypes = await prisma.userActivity.groupBy({
      by: ['action'],
      _count: true
    });

    results.activityDistribution = activityTypes;

    results.status = 'operational';
  } catch (error) {
    results.status = 'error';
    results.errors.push(error.message);
  }

  return results;
}

async function checkNeonConnection() {
  const results = {
    status: 'unknown',
    connectionString: process.env.DATABASE_URL ? 'configured' : 'missing',
    errors: []
  };

  try {
    if (!process.env.DATABASE_URL) {
      results.status = 'warning';
      results.errors.push('DATABASE_URL not set in environment');
      return results;
    }

    // Check if it's a Neon connection string
    const isNeon = process.env.DATABASE_URL.includes('neon.tech') || 
                   process.env.DATABASE_URL.includes('neon');
    
    results.isNeon = isNeon;
    results.status = isNeon ? 'connected' : 'connected (non-Neon)';
    
    // Test connection
    const start = Date.now();
    await prisma.$queryRaw`SELECT version()`;
    results.latency = Date.now() - start;
    
  } catch (error) {
    results.status = 'error';
    results.errors.push(error.message);
  }

  return results;
}

async function checkRedisCache() {
  const results = {
    status: 'unknown',
    configured: !!process.env.REDIS_URL,
    errors: []
  };

  try {
    if (!process.env.REDIS_URL) {
      results.status = 'warning';
      results.message = 'Redis not configured (caching disabled)';
      return results;
    }

    // Try to import and test Redis
    try {
      const { redis } = await import('../server/src/services/redis.js');
      if (redis) {
        await redis.ping();
        results.status = 'operational';
      } else {
        results.status = 'warning';
        results.message = 'Redis client not initialized';
      }
    } catch (importError) {
      results.status = 'warning';
      results.message = 'Redis module not available';
    }
  } catch (error) {
    results.status = 'error';
    results.errors.push(error.message);
  }

  return results;
}

async function generateRecommendations() {
  const recommendations = [];

  // Check database connection
  if (!process.env.DATABASE_URL) {
    recommendations.push({
      priority: 'high',
      module: 'database',
      issue: 'DATABASE_URL not configured',
      action: 'Set DATABASE_URL environment variable with Neon DB connection string'
    });
  }

  // Check Redis
  if (!process.env.REDIS_URL) {
    recommendations.push({
      priority: 'medium',
      module: 'cache',
      issue: 'Redis not configured',
      action: 'Configure REDIS_URL for improved recommendation latency'
    });
  }

  return recommendations;
}

async function runDiagnostics() {
  console.log('\n🔍 AICore-X1 System Diagnostics\n');
  console.log('=' .repeat(50));

  // Database Connection
  console.log('\n📊 Checking Database Connection...');
  diagnostics.modules.database = await checkNeonConnection();
  console.log(`   Status: ${diagnostics.modules.database.status}`);

  // Recommendation Module
  console.log('\n🤖 Checking Recommendation Module...');
  diagnostics.modules.recommend = await checkRecommendationModule();
  console.log(`   Status: ${diagnostics.modules.recommend.status}`);
  if (diagnostics.modules.recommend.metrics) {
    console.log(`   Movies: ${diagnostics.modules.recommend.metrics.moviesInDb}`);
    console.log(`   User Preferences: ${diagnostics.modules.recommend.metrics.userPreferences}`);
    console.log(`   AI Logs: ${diagnostics.modules.recommend.metrics.aiLogs}`);
  }

  // User Profile Module
  console.log('\n👤 Checking User Profile Module...');
  diagnostics.modules.user_profile = await checkUserProfileModule();
  console.log(`   Status: ${diagnostics.modules.user_profile.status}`);
  console.log(`   Users: ${diagnostics.modules.user_profile.users}`);
  console.log(`   Preferences: ${diagnostics.modules.user_profile.preferences}`);
  console.log(`   Favorites: ${diagnostics.modules.user_profile.favorites}`);

  // Activity Module
  console.log('\n📈 Checking Activity Module...');
  diagnostics.modules.activity = await checkActivityModule();
  console.log(`   Status: ${diagnostics.modules.activity.status}`);
  console.log(`   Total Activities: ${diagnostics.modules.activity.totalActivities}`);

  // Redis Cache
  console.log('\n💾 Checking Redis Cache...');
  diagnostics.modules.cache = await checkRedisCache();
  console.log(`   Status: ${diagnostics.modules.cache.status}`);

  // Generate recommendations
  diagnostics.recommendations = await generateRecommendations();

  // Overall health
  const allModulesHealthy = Object.values(diagnostics.modules).every(
    m => m.status === 'operational' || m.status === 'connected' || m.status === 'healthy'
  );
  diagnostics.health = allModulesHealthy ? 'healthy' : 'degraded';

  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Overall System Health: ${diagnostics.health.toUpperCase()}\n`);

  // Print recommendations
  if (diagnostics.recommendations.length > 0) {
    console.log('💡 Recommendations:\n');
    diagnostics.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.module}: ${rec.issue}`);
      console.log(`      → ${rec.action}\n`);
    });
  }

  // Save diagnostics report
  const fs = await import('fs');
  const reportPath = join(__dirname, '../docs/ai/diagnostics.json');
  const reportDir = join(__dirname, '../docs/ai');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(diagnostics, null, 2));
  console.log(`📄 Full report saved to: docs/ai/diagnostics.json\n`);

  await prisma.$disconnect();
  return diagnostics;
}

// Run diagnostics
runDiagnostics()
  .then(() => {
    console.log('✅ Diagnostics complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Diagnostics failed:', error);
    process.exit(1);
  });

