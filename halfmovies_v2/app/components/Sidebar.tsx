import Link from 'next/link';
import { Locale } from '../lib/i18n';

const categories = ['Action', 'Drama', 'Sci-Fi', 'Family', 'Arabic', 'Spanish'];

interface SidebarProps {
  locale: Locale;
}

export function Sidebar({ locale }: SidebarProps) {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-white/5 bg-slate-900/50 p-6 backdrop-blur lg:block">
      <p className="mb-4 text-xs uppercase tracking-widest text-slate-400">Browse</p>
      <div className="space-y-2">
        {categories.map((item) => (
          <Link
            key={item}
            href={`/${locale}/discover?category=${encodeURIComponent(item.toLowerCase())}`}
            className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
          >
            {item}
          </Link>
        ))}
      </div>
    </aside>
  );
}
