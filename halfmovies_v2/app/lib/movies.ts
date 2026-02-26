export type Movie = {
  id: string;
  title: string;
  overview: string;
  poster: string;
  genres: string[];
  language: string;
  year: number;
  rating: number;
};

export const sampleMovies: Movie[] = [
  {
    id: '1',
    title: 'Edge of Tomorrow',
    overview: 'A soldier relives the same day, improving skills to stop an alien invasion.',
    poster: 'https://image.tmdb.org/t/p/w500/uUHvlkLavotfGsNtosDy8ShsIYF.jpg',
    genres: ['Action', 'Sci-Fi'],
    language: 'en',
    year: 2014,
    rating: 7.9
  },
  {
    id: '2',
    title: 'Aladdin',
    overview: 'A street urchin discovers a magical lamp and a powerful genie.',
    poster: 'https://image.tmdb.org/t/p/w500/3iYQTLGoy7QnjcUYRJy4YrAgGvp.jpg',
    genres: ['Family', 'Adventure'],
    language: 'ar',
    year: 1992,
    rating: 8.0
  },
  {
    id: '3',
    title: 'Pan’s Labyrinth',
    overview: 'A young girl enters a mythical labyrinth during post-Civil War Spain.',
    poster: 'https://image.tmdb.org/t/p/w500/s0C78plmx3dFcO3WMnoXCz56FiN.jpg',
    genres: ['Fantasy', 'Drama'],
    language: 'es',
    year: 2006,
    rating: 8.2
  }
];
