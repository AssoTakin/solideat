import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { SubscriptionType } from '@prisma/client';

const router = Router();

/**
 * Endpoint temporaire E2E : crée ou met à jour un compte test entièrement vérifié.
 * Protégé par ADMIN_SECRET en header.
 */
router.post('/e2e-create-verified-test-account', async (req: Request, res: Response) => {
  const adminSecret = req.headers['x-admin-secret'];
  const expected = process.env.ADMIN_SECRET;

  if (!expected || adminSecret !== expected) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const email = (req.body.email as string)?.toLowerCase().trim();
  const password = req.body.password as string;
  const phone = (req.body.phone as string) || '+33600000000';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
      phone,
      subscriptionType: SubscriptionType.PREMIUM_MONTHLY,
    },
    create: {
      email,
      passwordHash,
      firstName: 'Test',
      lastName: 'E2E',
      username: email.split('@')[0] + Math.floor(Math.random() * 10000),
      phone,
      emailVerified: true,
      phoneVerified: true,
      subscriptionType: SubscriptionType.PREMIUM_MONTHLY,
      addressStreet: '1 rue de la Test',
      addressZipCode: '75000',
      addressCity: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
    },
  });

  return res.json({
    success: true,
    userId: user.id,
    email: user.email,
    phoneVerified: user.phoneVerified,
    emailVerified: user.emailVerified,
    subscriptionType: user.subscriptionType,
  });
});

export default router;
