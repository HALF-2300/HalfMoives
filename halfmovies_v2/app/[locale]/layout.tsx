import '../styles/globals.css';

import { ReactNode } from 'react';
import { Providers } from '../components/Providers';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Sidebar } from '../components/Sidebar';
import { getDictionary, defaultLocale, locales, type Locale } from '../lib/i18n';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = locales.includes(params.locale as Locale) ? (params.locale as Locale) : defaultLocale;
  const dictionary = await getDictionary(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar locale={locale} />
            <div className="flex min-h-screen w-full flex-1 flex-col">
              <Header dictionary={dictionary} locale={locale} />
              <main className="container py-8">{children}</main>
              <Footer dictionary={dictionary} />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
