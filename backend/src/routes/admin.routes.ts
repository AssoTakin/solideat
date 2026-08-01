import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { stripe } from '../services/stripe.service';

const router = Router();

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
