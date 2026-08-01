import { Router, Request, Response } from 'express';
import prisma from '../config/database';

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

export default router;
