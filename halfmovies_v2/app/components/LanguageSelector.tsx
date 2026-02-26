"use client";

import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '../lib/i18n';

const labels: Record<Locale, string> = {
  ar: 'العربية',
  en: 'EN',
  es: 'ES'
};

interface LanguageSelectorProps {
  locale: Locale;
}

export function LanguageSelector({ locale }: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      router.push(`/${nextLocale}`);
      return;
    }
    segments[0] = nextLocale;
    router.push(`/${segments.join('/')}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/5 p-1">
      {locales.map((code) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            code === locale ? 'bg-orange-500 text-black' : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  );
}
