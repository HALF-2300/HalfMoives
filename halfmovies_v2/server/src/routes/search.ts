import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q as string) ?? '';
  if (!q) return res.json([]);
  const movies = await prisma.movie.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { overview: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: 20
  });
  res.json(movies);
});

export default router;
