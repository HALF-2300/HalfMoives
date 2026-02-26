import { defaultLocale, getDictionary, locales, type Locale } from '../../lib/i18n';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  const locale = locales.includes(params.locale as Locale) ? (params.locale as Locale) : defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-white">{dictionary?.nav?.contact ?? 'Contact'}</h1>
      <p className="text-slate-300">Reach the team for integrations, data sources, or partnerships.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-400">Support</p>
          <p className="text-lg font-semibold text-white">support@halfmovies.com</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-400">Partnerships</p>
          <p className="text-lg font-semibold text-white">partners@halfmovies.com</p>
        </div>
      </div>
    </div>
  );
}
