import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const movies = await prisma.movie.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
  res.json(movies);
});

router.post('/', async (req, res) => {
  const { title, overview, poster, language, year, rating } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const movie = await prisma.movie.create({
    data: {
      title,
      overview: overview ?? '',
      poster: poster ?? '',
      language: language ?? 'en',
      year: year ?? new Date().getFullYear(),
      rating: rating ?? 0
    }
  });
  res.status(201).json(movie);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const movie = await prisma.movie.update({ where: { id }, data: payload });
  res.json(movie);
});

export default router;
