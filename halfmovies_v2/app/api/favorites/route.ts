import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/options';
import { logUserActivity } from '../../../server/src/analytics/userActivity';

async function requireSession(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { session: null as any, userId: null as any, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, userId: session.user.id as string, response: null as any };
}

export async function GET(req: NextRequest) {
  const { session, userId, response } = await requireSession(req);
  if (!session) return response;

  const search = req.nextUrl.searchParams;
  const requestedUser = search.get('uid');
  if (requestedUser && requestedUser !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { movie: true }
  });

  return NextResponse.json({
    userId,
    count: favorites.length,
    items: favorites.map((f) => ({
      movieId: f.movieId,
      title: f.movie.title,
      language: f.movie.language,
      rating: f.movie.rating,
      popularity: f.movie.popularity,
      isFeatured: f.movie.isFeatured
    }))
  });
}

export async function POST(req: NextRequest) {
  const { session, userId, response } = await requireSession(req);
  if (!session) return response;

  const { movieId } = await req.json().catch(() => ({ movieId: null }));
  if (!movieId) return NextResponse.json({ error: 'movieId required' }, { status: 400 });

  await prisma.favorite.upsert({
    where: { userId_movieId: { userId, movieId } },
    update: {},
    create: { userId, movieId }
  });

  await logUserActivity(prisma, userId, 'favorite:add', { movieId });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { session, userId, response } = await requireSession(req);
  if (!session) return response;

  const { movieId } = await req.json().catch(() => ({ movieId: null }));
  if (!movieId) return NextResponse.json({ error: 'movieId required' }, { status: 400 });

  await prisma.favorite.deleteMany({ where: { userId, movieId } });
  await logUserActivity(prisma, userId, 'favorite:remove', { movieId });

  return NextResponse.json({ success: true });
}
