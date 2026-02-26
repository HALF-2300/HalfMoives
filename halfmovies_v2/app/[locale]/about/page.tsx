import { defaultLocale, getDictionary, locales, type Locale } from '../../lib/i18n';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const locale = locales.includes(params.locale as Locale) ? (params.locale as Locale) : defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-white">{dictionary?.nav?.about ?? 'About'}</h1>
      <p className="text-slate-300">
        HalfMovies v2 is built for adaptive discovery: localized UI, AR-first defaults, resilient caching,
        and AI-ready APIs. This phase ships the core scaffolding so future phases can focus on
        recommendations, profiles, and community modules.
      </p>
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-sm text-slate-200">
        <ul className="list-disc space-y-2 pl-5">
          <li>Next.js 15 + TypeScript + Tailwind</li>
          <li>Express 5 API with Prisma + Postgres</li>
          <li>NextAuth v5 (beta) ready for OAuth + credentials</li>
          <li>Arabic default locale with RTL awareness</li>
        </ul>
      </div>
    </div>
  );
}
