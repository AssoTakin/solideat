import { Router } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { stripe } from '../services/stripe.service';

const router = Router();

// Create complete premium test scenario for frontend payment test
router.post('/create-payment-test', async (_req, res) => {
  try {
    const timestamp = Date.now();
    const password = await bcrypt.hash('SolideatTest2026!', 10);
    const phone = `+336${String(timestamp).slice(-8)}`;

    // Create seller premium with Connect account
    const sellerEmail = `e2e-seller-${timestamp}@solid-eat.com`;
    const sellerUsername = `seller${String(timestamp).slice(-6)}`;
    
    // Create Stripe Connect account for seller
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: sellerEmail,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_type: 'individual',
      individual: {
        first_name: 'Seller',
        last_name: 'Test',
        email: sellerEmail,
        phone,
        address: {
          line1: '12 Rue de Test',
          city: 'Paris',
          postal_code: '75001',
          country: 'FR',
        },
        dob: { day: 1, month: 1, year: 1990 },
      },
      business_profile: {
        url: 'https://solid-eat.com',
        mcc: '5812', // Restaurants
        name: 'Solideat Test Seller',
      },
    });

    // Create external account (iban) for the connect account
    try {
      await stripe.accounts.createExternalAccount(account.id, {
        external_account: {
          object: 'bank_account',
          country: 'FR',
          currency: 'eur',
          account_number: 'FR1420041010050500013M02606',
        },
      });
    } catch (e: any) {
      console.log('External account warning:', e.message);
    }

    const seller = await prisma.user.create({
      data: {
        email: sellerEmail,
        passwordHash: password,
        phone,
        firstName: 'Seller',
        lastName: 'Test',
        username: sellerUsername,
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
        stripeConnectedAccountId: account.id,
      },
    });

    // Create buyer premium
    const buyerTimestamp = timestamp + 1;
    const buyer = await prisma.user.create({
      data: {
        email: `e2e-buyer-${buyerTimestamp}@solid-eat.com`,
        passwordHash: password,
        phone: `+336${String(buyerTimestamp).slice(-8)}`,
        firstName: 'Buyer',
        lastName: 'Test',
        username: `buyer${String(buyerTimestamp).slice(-6)}`,
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

    // Create meal
    const now = new Date();
    const meal = await prisma.meal.create({
      data: {
        name: 'Repas Premium Frontend Test',
        photo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        description: 'Test tunnel paiement frontend',
        cuisine: 'Française',
        preparationDate: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        serviceDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        pickupTimeStart: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        pickupTimeEnd: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        pickupAddress: '12 Rue de Test, 75001 Paris',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        expirationDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        ingredients: JSON.stringify([
          { name: 'Poulet', allergens: [] },
          { name: 'Riz', allergens: [] },
          { name: 'Carottes', allergens: [] },
        ]),
        portions: 1,
        price: 5,
        platformFeeAmount: 1,
        netAmount: 4,
        status: 'AVAILABLE',
        cookId: seller.id,
      },
    });

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        mealId: meal.id,
        userId: buyer.id,
        paymentStatus: 'PENDING',
      },
    });

    res.json({
      success: true,
      data: {
        seller: { email: seller.email, password: 'SolideatTest2026!' },
        buyer: { email: buyer.email, password: 'SolideatTest2026!' },
        mealId: meal.id,
        reservationId: reservation.id,
        connectAccountId: account.id,
      },
    });
  } catch (error: any) {
    console.error('Payment test setup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
