import { notFound } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import { FavoritesGrid } from '../FavoritesGrid';
import { Movie } from '../../lib/movies';

export const dynamic = 'force-dynamic';

function mapMovie(fav: any): Movie {
  const categories = fav.movie.categories?.map((c: any) => c.category.name) ?? [];
  return {
    id: fav.movie.id,
    title: fav.movie.title,
    overview: fav.movie.overview ?? '',
    poster: fav.movie.poster ?? 'https://via.placeholder.com/300x450?text=Movie',
    genres: categories,
    language: fav.movie.language ?? 'en',
    year: fav.movie.year ?? 0,
    rating: fav.movie.rating ?? 0
  };
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      preferences: true,
      favorites: {
        include: {
          movie: {
            include: {
              categories: { include: { category: true } }
            }
          }
        }
      }
    }
  });

  if (!user) return notFound();

  const favorites = user.favorites.map((f) => ({ ...mapMovie(f), movieId: f.movieId }));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Profile</p>
            <h1 className="text-3xl font-semibold text-white">{user.name ?? 'User'}</h1>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
          <div className="rounded-full bg-green-500/15 px-4 py-2 text-xs text-green-300">
            {user.isActive ? 'Active' : 'Disabled'}
          </div>
        </div>
        {user.preferences && (
          <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
            <div><span className="font-semibold text-white">Moods:</span> {user.preferences.moods.join(', ') || '—'}</div>
            <div><span className="font-semibold text-white">Genres:</span> {user.preferences.favoriteGenres.join(', ') || '—'}</div>
            <div><span className="font-semibold text-white">Languages:</span> {user.preferences.languages.join(', ') || '—'}</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Favorites</h2>
          <p className="text-sm text-slate-400">{favorites.length} saved</p>
        </div>
        <FavoritesGrid items={favorites} />
      </div>
    </div>
  );
}
