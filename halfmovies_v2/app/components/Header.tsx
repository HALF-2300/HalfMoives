"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSelector } from './LanguageSelector';
import { Locale } from '../lib/i18n';
import clsx from 'clsx';

interface HeaderProps {
  dictionary: any;
  locale: Locale;
}

const navItems = [
  { href: '', key: 'home' },
  { href: 'discover', key: 'discover' },
  { href: 'about', key: 'about' },
  { href: 'contact', key: 'contact' }
];

export function Header({ dictionary, locale }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-900/70 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-lg font-bold text-orange-300">
            HM
          </div>
          <div>
            <p className="text-lg font-semibold">{dictionary?.brand ?? 'HalfMovies'}</p>
            <p className="text-sm text-slate-400">{dictionary?.tagline}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => {
            const href = `/${locale}/${item.href}`.replace(/\/$/, '');
            const isActive = pathname === href || pathname === `${href}/`;
            return (
              <Link
                key={item.key}
                href={href || `/${locale}`}
                className={clsx(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-orange-500 text-black' : 'text-slate-200 hover:bg-white/5'
                )}
              >
                {dictionary?.nav?.[item.key] ?? item.key}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSelector locale={locale} />
        </div>
      </div>
    </header>
  );
}
