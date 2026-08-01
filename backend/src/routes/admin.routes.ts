import { Router, Request, Response } from 'express';

const router = Router();

router.get('/stripe-mode', async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const sk = process.env.STRIPE_SECRET_KEY || '';
  const pk = process.env.STRIPE_PUBLISHABLE_KEY || '';
  res.json({
    secretPrefix: sk.substring(0, 7),
    publishablePrefix: pk.substring(0, 7),
    hasSecret: !!sk,
    hasPublishable: !!pk,
  });
});

export default router;
