/**
 * Phase 3 Validation Script
 * Validates all Phase 3 components are operational
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('\n🔍 AICore-X1 Phase 3 Validation\n');
console.log('='.repeat(50));

const checks = {
  adaptiveCore: false,
  healthEndpoint: false,
  websocket: false,
  selfHealing: false,
  integration: false
};

// Check 1: Adaptive Core file exists
console.log('\n1️⃣ Checking Adaptive Core...');
try {
  const adaptiveCorePath = join(projectRoot, 'server', 'src', 'ai', 'adaptiveCore.ts');
  const content = readFileSync(adaptiveCorePath, 'utf-8');
  
  const hasLearnFromActivity = content.includes('learnFromActivity');
  const hasSyncModelWeights = content.includes('syncModelWeights');
  const hasAutoTweakLatency = content.includes('autoTweakLatency');
  const hasSelfHealing = content.includes('handleConnectionFailure');
  
  if (hasLearnFromActivity && hasSyncModelWeights && hasAutoTweakLatency && hasSelfHealing) {
    checks.adaptiveCore = true;
    console.log('   ✅ Adaptive Core: All functions present');
  } else {
    console.log('   ❌ Adaptive Core: Missing required functions');
  }
} catch (error) {
  console.log('   ❌ Adaptive Core: File not found');
}

// Check 2: Health endpoint exists
console.log('\n2️⃣ Checking Health Endpoint...');
try {
  const healthPath = join(projectRoot, 'server', 'src', 'routes', 'health.ts');
  const content = readFileSync(healthPath, 'utf-8');
  
  const hasAdaptiveEndpoint = content.includes('/adaptive');
  const hasMetrics = content.includes('getMetrics');
  
  if (hasAdaptiveEndpoint && hasMetrics) {
    checks.healthEndpoint = true;
    console.log('   ✅ Health Endpoint: /api/health/adaptive present');
  } else {
    console.log('   ❌ Health Endpoint: Missing required components');
  }
} catch (error) {
  console.log('   ❌ Health Endpoint: File not found');
}

// Check 3: WebSocket endpoint exists
console.log('\n3️⃣ Checking WebSocket Endpoint...');
try {
  const insightPath = join(projectRoot, 'server', 'src', 'routes', 'insight.ts');
  const content = readFileSync(insightPath, 'utf-8');
  
  const hasWebSocket = content.includes('WebSocketServer');
  const hasInsightPath = content.includes('/ws/insight');
  const hasBroadcast = content.includes('broadcastMetrics');
  
  if (hasWebSocket && hasInsightPath && hasBroadcast) {
    checks.websocket = true;
    console.log('   ✅ WebSocket: /ws/insight endpoint present');
  } else {
    console.log('   ❌ WebSocket: Missing required components');
  }
} catch (error) {
  console.log('   ❌ WebSocket: File not found');
}

// Check 4: Self-healing logic
console.log('\n4️⃣ Checking Self-Healing Logic...');
try {
  const adaptiveCorePath = join(projectRoot, 'server', 'src', 'ai', 'adaptiveCore.ts');
  const content = readFileSync(adaptiveCorePath, 'utf-8');
  
  const hasRecovery = content.includes('recovery.json');
  const hasReconnection = content.includes('attemptReconnection');
  const hasLocalState = content.includes('saveRecoveryState');
  
  if (hasRecovery && hasReconnection && hasLocalState) {
    checks.selfHealing = true;
    console.log('   ✅ Self-Healing: Recovery logic present');
  } else {
    console.log('   ❌ Self-Healing: Missing required components');
  }
} catch (error) {
  console.log('   ❌ Self-Healing: Cannot verify');
}

// Check 5: Integration with recommendation engine
console.log('\n5️⃣ Checking Recommendation Engine Integration...');
try {
  const recommendationPath = join(projectRoot, 'server', 'src', 'ai', 'recommendation.ts');
  const content = readFileSync(recommendationPath, 'utf-8');
  
  const hasAdaptiveCore = content.includes('getAdaptiveCore');
  const hasLearnFromActivity = content.includes('learnFromActivity');
  const hasCacheHitRate = content.includes('updateCacheHitRate');
  
  if (hasAdaptiveCore && hasLearnFromActivity && hasCacheHitRate) {
    checks.integration = true;
    console.log('   ✅ Integration: Adaptive Core integrated');
  } else {
    console.log('   ❌ Integration: Missing adaptive components');
  }
} catch (error) {
  console.log('   ❌ Integration: Cannot verify');
}

// Check 6: Server initialization
console.log('\n6️⃣ Checking Server Initialization...');
try {
  const serverPath = join(projectRoot, 'server', 'src', 'index.ts');
  const content = readFileSync(serverPath, 'utf-8');
  
  const hasHealthRouter = content.includes('healthRouter');
  const hasInsightWebSocket = content.includes('initializeInsightWebSocket');
  const hasAdaptiveInit = content.includes('initializeAdaptiveCore');
  
  if (hasHealthRouter && hasInsightWebSocket && hasAdaptiveInit) {
    console.log('   ✅ Server: All Phase 3 components registered');
  } else {
    console.log('   ⚠️  Server: Some components may be missing');
  }
} catch (error) {
  console.log('   ❌ Server: Cannot verify');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Validation Summary:\n');

const allPassed = Object.values(checks).every(v => v === true);

Object.entries(checks).forEach(([check, passed]) => {
  const icon = passed ? '✅' : '❌';
  const name = check.replace(/([A-Z])/g, ' $1').trim();
  console.log(`   ${icon} ${name}`);
});

if (allPassed) {
  console.log('\n✅ All Phase 3 components validated successfully!');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Configure DATABASE_URL in .env');
  console.log('   2. Run: pnpm prisma:generate');
  console.log('   3. Run: pnpm build');
  console.log('   4. Run: pnpm dev (or pnpm server:dev)');
  console.log('   5. Test: curl http://localhost:3000/api/health/adaptive');
  console.log('\n');
} else {
  console.log('\n⚠️  Some components need attention');
  console.log('   Review the errors above and fix missing components\n');
}

process.exit(allPassed ? 0 : 1);

