import { Router } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { stripe } from '../services/stripe.service';

const router = Router();

// Reset password for a user (temporary)
router.post('/reset-password/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const newPassword = 'SolideatTest2026!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
      select: { id: true, email: true },
    });
    
    res.json({ success: true, data: { user, password: newPassword } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Stripe Checkout session for a reservation (temporary for live test)
router.post('/create-checkout/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    
    if (!reservation) {
      res.status(404).json({ success: false, error: 'Reservation not found' });
      return;
    }
    
    if (reservation.paymentStatus !== 'PENDING') {
      res.status(400).json({ success: false, error: `Payment status is ${reservation.paymentStatus}` });
      return;
    }
    
    const meal = await prisma.meal.findUnique({
      where: { id: reservation.mealId },
    });
    
    if (!meal || meal.price === null || meal.price === undefined) {
      res.status(404).json({ success: false, error: 'Meal not found or not priced' });
      return;
    }
    
    const seller = await prisma.user.findUnique({
      where: { id: meal.cookId },
    });
    
    if (!seller || !seller.stripeConnectedAccountId) {
      res.status(400).json({ success: false, error: 'Seller has no Connect account' });
      return;
    }
    
    const buyer = await prisma.user.findUnique({
      where: { id: reservation.userId },
    });
    
    if (!buyer) {
      res.status(404).json({ success: false, error: 'Buyer not found' });
      return;
    }
    
    // Create or retrieve Stripe customer for buyer
    let customerId = buyer.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: buyer.email,
        name: `${buyer.firstName} ${buyer.lastName}`,
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: buyer.id },
        data: { stripeCustomerId: customerId },
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: meal.name,
              description: meal.description || undefined,
            },
            unit_amount: Math.round(meal.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://solid-eat.com/meals/${meal.id}?payment=success&reservation=${reservation.id}`,
      cancel_url: `https://solid-eat.com/meals/${meal.id}?payment=cancel&reservation=${reservation.id}`,
      payment_intent_data: {
        application_fee_amount: Math.round(meal.price * 100 * 0.2),
        transfer_data: {
          destination: seller.stripeConnectedAccountId,
        },
        metadata: {
          reservationId: reservation.id,
          mealId: meal.id,
          buyerId: buyer.id,
          sellerId: seller.id,
        },
      },
      metadata: {
        reservationId: reservation.id,
        mealId: meal.id,
        buyerId: buyer.id,
        sellerId: seller.id,
      },
    });
    
    // Store payment intent id on reservation
    if (session.payment_intent) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { stripePaymentIntentId: session.payment_intent as string },
      });
    }
    
    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
