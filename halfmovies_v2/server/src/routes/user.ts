import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'not found' });
  res.json(user);
});

router.get('/:id/favorites', async (req, res) => {
  const favorites = await prisma.favorite.findMany({ where: { userId: req.params.id } });
  res.json(favorites);
});

export default router;
