'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Movie } from '../lib/movies';

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  onToggleFavorite?: (next: boolean) => Promise<void> | void;
  showFavoriteToggle?: boolean;
}

export function MovieCard({ movie, isFavorite = false, onToggleFavorite, showFavoriteToggle = false }: MovieCardProps) {
  const [fav, setFav] = useState<boolean>(isFavorite);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    if (!showFavoriteToggle || busy) return;
    const next = !fav;
    setFav(next);
    setBusy(true);
    try {
      await onToggleFavorite?.(next);
      setToast(next ? 'Added to favorites' : 'Removed from favorites');
      setTimeout(() => setToast(null), 1800);
    } catch (err) {
      console.error('toggle favorite failed', err);
      setFav(!next);
      setToast('Action failed');
      setTimeout(() => setToast(null), 1800);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-xl">
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-orange-300">
          {movie.rating?.toFixed?.(1) ?? '—'}
        </div>
        {showFavoriteToggle && (
          <button
            onClick={handleToggle}
            className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl transition hover:scale-110 ${fav ? 'text-rose-400' : 'text-slate-200'}`}
            aria-label={fav ? 'Remove favorite' : 'Add favorite'}
          >
            <span className="transition duration-300" aria-hidden>
              {fav ? '❤' : '♡'}
            </span>
          </button>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-lg font-semibold text-white">{movie.title}</p>
        <p className="line-clamp-2 text-sm text-slate-400">{movie.overview}</p>
        <div className="flex flex-wrap gap-2 text-xs text-orange-200">
          {movie.genres.map((g) => (
            <span key={g} className="rounded-full bg-orange-500/20 px-3 py-1">
              {g}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500">{movie.year} • {movie.language.toUpperCase()}</p>
      </div>
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <div className="rounded-full bg-black/80 px-4 py-2 text-xs text-white shadow-lg transition-opacity duration-300">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
