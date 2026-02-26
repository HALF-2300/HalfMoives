import dotenv from 'dotenv';
const env = dotenv.config();
if (!process.env.DATABASE_URL && env.parsed?.DATABASE_URL) {
  process.env.DATABASE_URL = env.parsed.DATABASE_URL;
}
import { prisma } from '../app/lib/prisma';
import { RecommendationEngine } from '../server/src/ai/recommendation';

async function run(uid: string) {
  const engine = new RecommendationEngine(prisma);
  const start = Date.now();
  const result1 = await engine.recommend(uid);
  const latency1 = Date.now() - start;
  console.log(JSON.stringify({ ...result1, cached: false, latency: latency1 }, null, 2));

  const start2 = Date.now();
  const result2 = await engine.recommend(uid);
  const latency2 = Date.now() - start2;
  console.log(JSON.stringify({ ...result2, cached: true, latency: latency2 }, null, 2));
}

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: tsx scripts/test-recommend.ts <userId>');
  process.exit(1);
}

run(uid)
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
