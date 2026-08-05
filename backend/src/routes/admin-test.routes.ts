import { Router } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcrypt';

const router = Router();

// Temporary admin route for live payment test - REMOVE AFTER TEST
router.post('/create-test-premium-accounts', async (req, res) => {
  try {
    const timestamp = Date.now();
    const hashedPassword = await bcrypt.hash('SolideatTest2026!', 10);
    
    // Create seller premium account
    const seller = await prisma.user.create({
      data: {
        email: `e2e-seller-live-${timestamp}@solid-eat.com`,
        password: hashedPassword,
        phone: `+336${String(timestamp).slice(-8)}`,
        firstName: 'Seller',
        lastName: 'Live',
        username: `sellerlive${String(timestamp).slice(-6)}`,
        addressStreet: '12 Rue de Test',
        addressZipCode: '75001',
        addressCity: 'Paris',
        addressLatitude: 48.8566,
        addressLongitude: 2.3522,
        cguAccepted: true,
        sanitaryCharterAccepted: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionType: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        stripeConnectedAccountId: 'acct_1TzelgERjalkmWOB',
      },
    });
    
    // Create buyer premium account
    const buyerTimestamp = timestamp + 1;
    const buyer = await prisma.user.create({
      data: {
        email: `e2e-buyer-live-${buyerTimestamp}@solid-eat.com`,
        password: hashedPassword,
        phone: `+336${String(buyerTimestamp).slice(-8)}`,
        firstName: 'Buyer',
        lastName: 'Live',
        username: `buyerlive${String(buyerTimestamp).slice(-6)}`,
        addressStreet: '15 Rue de Test',
        addressZipCode: '75002',
        addressCity: 'Paris',
        addressLatitude: 48.8566,
        addressLongitude: 2.3522,
        cguAccepted: true,
        sanitaryCharterAccepted: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionType: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
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
