import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const [movies, users, reviews] = await Promise.all([
    prisma.movie.count(),
    prisma.user.count(),
    prisma.review.count()
  ]);
  res.json({ movies, users, reviews, phase: '1' });
});

export default router;
