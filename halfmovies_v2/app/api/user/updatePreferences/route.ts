import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/options';
import { logUserActivity } from '../../../../server/src/analytics/userActivity';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moods, favoriteGenres, languages, prefVector } = await req.json().catch(() => ({}));
  await prisma.userPreferences.upsert({
    where: { userId: session.user.id },
    update: { moods, favoriteGenres, languages, prefVector },
    create: { userId: session.user.id, moods: moods ?? [], favoriteGenres: favoriteGenres ?? [], languages: languages ?? [], prefVector }
  });

  await logUserActivity(prisma, session.user.id, 'preferences:update', {
    moodsCount: moods?.length ?? 0,
    favoriteGenresCount: favoriteGenres?.length ?? 0,
    languagesCount: languages?.length ?? 0
  });

  return NextResponse.json({ success: true });
}
