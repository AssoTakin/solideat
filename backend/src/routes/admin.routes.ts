import { Router, Request, Response } from 'express';
import { resetLoginAttempts } from '../middleware/loginRateLimit.middleware';

const router = Router();

router.post('/reset-login-attempts', async (req: Request, res: Response) => {
  const secret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers['x-admin-secret'];

  if (!secret || secret !== providedSecret) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ success: false, error: 'Email requis' });
    return;
  }

  try {
    await resetLoginAttempts(email);
    res.json({ success: true, message: `Compteur réinitialisé pour ${email}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
