import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';

const router = Router();

router.post('/clear-connect-account', async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const { email } = req.body;
  try {
    await prisma.user.update({ where: { email }, data: { stripeConnectedAccountId: null } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/reset-cook-quota', async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    try { await redis.del(`weekly_meals_proposed:${user.id}`); } catch {}
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/delete-test-meals', async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const deleted = await prisma.meal.deleteMany({
      where: { cookId: user.id, name: { contains: 'E2E' } },
    });
    res.json({ success: true, deleted: deleted.count });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
