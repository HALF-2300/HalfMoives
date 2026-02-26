import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const movies = await prisma.movie.findMany({ take: 10, orderBy: { rating: 'desc' } });
  res.json({ strategy: 'popularity', items: movies });
});

export default router;
