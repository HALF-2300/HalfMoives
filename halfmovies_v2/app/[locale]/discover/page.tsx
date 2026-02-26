import { defaultLocale, getDictionary, locales, type Locale } from '../../lib/i18n';
import { sampleMovies } from '../../lib/movies';
import { MovieCard } from '../../components/MovieCard';
import { SearchBar } from '../../components/SearchBar';
import { FilterPanel } from '../../components/FilterPanel';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getTopFans() {
  const aggregates = await prisma.favorite.groupBy({
    by: ['userId'],
    _count: { movieId: true },
    orderBy: { _count: { movieId: 'desc' } },
    take: 5
  });

  const filtered = aggregates.filter((a) => a._count.movieId > 0);
  const users = await prisma.user.findMany({ where: { id: { in: filtered.map((f) => f.userId) } } });

  return filtered.map((f) => ({
    userId: f.userId,
    count: f._count.movieId,
    name: users.find((u) => u.id === f.userId)?.name ?? 'Viewer'
  }));
}

export default async function DiscoverPage({ params }: { params: { locale: string } }) {
  const locale = locales.includes(params.locale as Locale) ? (params.locale as Locale) : defaultLocale;
  const dictionary = await getDictionary(locale);
  const topFans = await getTopFans();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{dictionary?.nav?.discover ?? 'Discover'}</h1>
          <p className="text-slate-400">Smart filters + fast embeds.</p>
        </div>
        <div className="w-full max-w-md">
          <SearchBar placeholder={dictionary?.search_placeholder ?? 'Search movies'} />
        </div>
      </div>
      <FilterPanel />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sampleMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Top Fans</h2>
          <p className="text-xs text-slate-400">Favorites count</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topFans.map((fan) => (
            <div key={fan.userId} className="rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm text-white">
              <p className="font-semibold">{fan.name}</p>
              <p className="text-xs text-slate-400">{fan.count} favorites</p>
            </div>
          ))}
          {topFans.length === 0 && <p className="text-sm text-slate-400">No favorites yet.</p>}
        </div>
      </div>
    </div>
  );
}
