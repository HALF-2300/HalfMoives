import Link from 'next/link';
import { getDictionary, type Locale, defaultLocale, locales } from '../lib/i18n';
import { sampleMovies } from '../lib/movies';
import { SearchBar } from '../components/SearchBar';
import { Carousel } from '../components/Carousel';
import { MovieCard } from '../components/MovieCard';
import { FilterPanel } from '../components/FilterPanel';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = locales.includes(params.locale as Locale) ? (params.locale as Locale) : defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/20 via-slate-900 to-slate-950 p-8 shadow-xl">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Phase 1</p>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            {dictionary?.tagline ?? 'Adaptive movie discovery, multilingual-first.'}
          </h1>
          <p className="max-w-3xl text-lg text-slate-200">
            {dictionary?.cta ?? 'Start exploring'} — curated picks, intelligent filters, and fast embeds.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={`/${locale}/discover`}
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-orange-500/30 transition hover:scale-[1.01]"
            >
              {dictionary?.nav?.discover ?? 'Discover'}
            </Link>
            <SearchBar placeholder={dictionary?.search_placeholder ?? 'Search movies'} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Trending</h2>
          <FilterPanel />
        </div>
        <Carousel>
          {sampleMovies.map((movie) => (
            <div key={movie.id} className="w-60 flex-shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </Carousel>
      </section>
    </div>
  );
}
