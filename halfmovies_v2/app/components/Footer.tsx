interface FooterProps {
  dictionary: any;
}

export function Footer({ dictionary }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-900/60 py-6 backdrop-blur">
      <div className="container flex flex-col justify-between gap-3 text-sm text-slate-400 sm:flex-row">
        <p>{dictionary?.brand ?? 'HalfMovies'} © {new Date().getFullYear()}</p>
        <p className="text-slate-500">Phase 1 • Multilingual foundation</p>
      </div>
    </footer>
  );
}
