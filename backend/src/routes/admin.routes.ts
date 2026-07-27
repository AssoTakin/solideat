import { Router, Request, Response } from 'express';
import { resetLoginAttempts } from '../middleware/loginRateLimit.middleware';

const router = Router();

router.post('/reset-login-limit', async (req: Request, res: Response) => {
  const adminSecret = req.headers['x-admin-secret'];
  const expected = process.env.ADMIN_SECRET;

  if (!expected || adminSecret !== expected) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  await resetLoginAttempts(email);
  return res.json({ success: true, email });
});

export default router;
