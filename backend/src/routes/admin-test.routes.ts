import { Router } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcrypt';

const router = Router();

// Temporary admin route for live payment test - REMOVE AFTER TEST
router.post('/create-test-premium-accounts', async (_req, res) => {
  try {
    const timestamp = Date.now();
    const hashedPassword = await bcrypt.hash('SolideatTest2026!', 10);
    
    // Create seller premium account
    const seller = await prisma.user.create({
      data: {
        email: `e2e-seller-live-${timestamp}@solid-eat.com`,
        passwordHash: hashedPassword,
        phone: `+336${String(timestamp).slice(-8)}`,
        firstName: 'Seller',
        lastName: 'Live',
        username: `sellerlive${String(timestamp).slice(-6)}`,
        addressStreet: '12 Rue de Test',
        addressZipCode: '75001',
        addressCity: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        cguAcceptedAt: new Date(),
        sanitaryCharterAcceptedAt: new Date(),
        emailVerified: true,
        phoneVerified: true,
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeConnectedAccountId: 'acct_1TzelgERjalkmWOB',
      },
    });
    
    // Create buyer premium account
    const buyerTimestamp = timestamp + 1;
    const buyer = await prisma.user.create({
      data: {
        email: `e2e-buyer-live-${buyerTimestamp}@solid-eat.com`,
        passwordHash: hashedPassword,
        phone: `+336${String(buyerTimestamp).slice(-8)}`,
        firstName: 'Buyer',
        lastName: 'Live',
        username: `buyerlive${String(buyerTimestamp).slice(-6)}`,
        addressStreet: '15 Rue de Test',
        addressZipCode: '75002',
        addressCity: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        cguAcceptedAt: new Date(),
        sanitaryCharterAcceptedAt: new Date(),
        emailVerified: true,
        phoneVerified: true,
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    res.json({
      success: true,
      data: {
        seller: { id: seller.id, email: seller.email, password: 'SolideatTest2026!' },
        buyer: { id: buyer.id, email: buyer.email, password: 'SolideatTest2026!' },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
