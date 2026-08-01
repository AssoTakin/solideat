import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import { stripe } from '../services/stripe.service';

const router = Router();

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
    const meals = await prisma.meal.findMany({
      where: { cookId: user.id, name: { contains: 'E2E' } },
      select: { id: true },
    });
    const mealIds = meals.map(m => m.id);
    let deletedReservations = 0;
    let deletedTransactions = 0;
    let deletedReviews = 0;
    if (mealIds.length > 0) {
      deletedReviews = (await prisma.review.deleteMany({ where: { mealId: { in: mealIds } } })).count;
      const reservations = await prisma.reservation.findMany({
        where: { mealId: { in: mealIds } },
        select: { id: true },
      });
      const resIds = reservations.map(r => r.id);
      if (resIds.length > 0) {
        deletedTransactions = (await prisma.transaction.deleteMany({ where: { reservationId: { in: resIds } } })).count;
        deletedReservations = (await prisma.reservation.deleteMany({ where: { id: { in: resIds } } })).count;
      }
    }
    const deletedMeals = (await prisma.meal.deleteMany({
      where: { cookId: user.id, name: { contains: 'E2E' } },
    })).count;
    res.json({ success: true, deletedMeals, deletedReservations, deletedTransactions, deletedReviews });
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

router.post('/confirm-test-payment', async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const { reservationId } = req.body;
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { meal: { include: { cook: true } } },
    });
    if (!reservation || !reservation.stripePaymentIntentId) {
      res.status(400).json({ success: false, error: 'Reservation or payment intent not found' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.confirm(reservation.stripePaymentIntentId, {
      payment_method: 'pm_card_visa',
    });

    res.json({ success: true, status: paymentIntent.status, id: paymentIntent.id });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
