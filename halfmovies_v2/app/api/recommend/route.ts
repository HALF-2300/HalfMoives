import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { RecommendationEngine } from '@server/ai/recommendation';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'uid parameter required' }, { status: 400 });
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const engine = new RecommendationEngine(prisma);
    const result = await engine.recommend(uid);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
