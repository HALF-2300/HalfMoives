'use client';

import { useState } from 'react';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../lib/movies';

export type FavoriteMovie = Movie & { movieId?: string };

interface FavoritesGridProps {
  items: FavoriteMovie[];
}

export function FavoritesGrid({ items }: FavoritesGridProps) {
  const [movies, setMovies] = useState(items);

  const toggleFavorite = async (movieId: string, next: boolean) => {
    const method = next ? 'POST' : 'DELETE';
    const res = await fetch('/api/favorites', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId })
    });
    if (!res.ok) {
      throw new Error('Request failed');
    }
    setMovies((prev) => {
      if (next) return prev;
      return prev.filter((m) => (m.movieId ?? m.id) !== movieId);
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {movies.map((m) => (
        <MovieCard
          key={m.id}
          movie={m}
          isFavorite
          showFavoriteToggle
          onToggleFavorite={(next) => toggleFavorite(m.movieId ?? m.id, next)}
        />
      ))}
      {movies.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 text-sm text-slate-300">
          No favorites yet. Tap the heart on any movie to save it.
        </div>
      )}
    </div>
  );
}
