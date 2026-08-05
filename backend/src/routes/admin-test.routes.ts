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

// Create Stripe PaymentIntent and serve payment page
router.get('/pay-test/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    
    if (!reservation) {
      res.status(404).send('Reservation not found');
      return;
    }
    
    const meal = await prisma.meal.findUnique({
      where: { id: reservation.mealId },
    });
    
    if (!meal || meal.price === null) {
      res.status(404).send('Meal not found or not priced');
      return;
    }
    
    const seller = await prisma.user.findUnique({
      where: { id: meal.cookId },
    });
    
    if (!seller || !seller.stripeConnectedAccountId) {
      res.status(400).send('Seller has no Connect account');
      return;
    }
    
    // Reuse existing PI or create new one
    let paymentIntentId = reservation.stripePaymentIntentId;
    let clientSecret: string;
    
    if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status === 'requires_payment_method') {
        clientSecret = pi.client_secret!;
      } else {
        // Create new PI
        const newPi = await stripe.paymentIntents.create({
          amount: Math.round(meal.price * 100),
          currency: 'eur',
          application_fee_amount: Math.round(meal.price * 100 * 0.2),
          transfer_data: {
            destination: seller.stripeConnectedAccountId,
          },
          metadata: {
            reservationId: reservation.id,
            mealId: meal.id,
            buyerId: reservation.userId,
            sellerId: seller.id,
          },
        });
        paymentIntentId = newPi.id;
        clientSecret = newPi.client_secret!;
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { stripePaymentIntentId: paymentIntentId },
        });
      }
    } else {
      const newPi = await stripe.paymentIntents.create({
        amount: Math.round(meal.price * 100),
        currency: 'eur',
        application_fee_amount: Math.round(meal.price * 100 * 0.2),
        transfer_data: {
          destination: seller.stripeConnectedAccountId,
        },
        metadata: {
          reservationId: reservation.id,
          mealId: meal.id,
          buyerId: reservation.userId,
          sellerId: seller.id,
        },
      });
      paymentIntentId = newPi.id;
      clientSecret = newPi.client_secret!;
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { stripePaymentIntentId: paymentIntentId },
      });
    }
    
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement Test Solideat - ${meal.price.toFixed(2).replace('.', ',')}€</title>
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; background: #f8f9fa; }
    .container { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #333; margin-bottom: 10px; }
    .price { font-size: 32px; font-weight: bold; text-align: center; color: #0074d4; margin: 20px 0; }
    .meal { text-align: center; color: #666; margin-bottom: 30px; }
    #card-element { border: 1px solid #ccc; border-radius: 6px; padding: 14px; margin: 20px 0; background: white; }
    button { background: #0074d4; color: white; border: none; border-radius: 6px; padding: 14px 24px; font-size: 16px; cursor: pointer; width: 100%; font-weight: 600; }
    button:disabled { background: #ccc; }
    #error-message { color: #e74c3c; margin-top: 12px; text-align: center; }
    #success-message { color: #27ae60; margin-top: 12px; text-align: center; font-weight: 500; }
    .secure { text-align: center; color: #888; font-size: 12px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍽️ Solideat Premium</h1>
    <div class="price">${meal.price.toFixed(2).replace('.', ',')} €</div>
    <div class="meal">${meal.name}</div>
    
    <form id="payment-form">
      <div id="card-element"></div>
      <button type="submit" id="submit-button">Payer ${meal.price.toFixed(2).replace('.', ',')} €</button>
      <div id="error-message"></div>
      <div id="success-message"></div>
    </form>
    
    <div class="secure">🔒 Paiement sécurisé par Stripe. Véritable test live.</div>
  </div>

  <script>
    const clientSecret = '${clientSecret}';
    const stripe = Stripe('${publishableKey}');
    const elements = stripe.elements();
    const cardElement = elements.create('card', { style: { base: { fontSize: '16px', color: '#32325d' } } });
    cardElement.mount('#card-element');

    const form = document.getElementById('payment-form');
    const submitButton = document.getElementById('submit-button');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submitButton.disabled = true;
      errorMessage.textContent = '';
      successMessage.textContent = '';

      const {paymentIntent, error} = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: 'Test Solideat' }
        }
      });

      if (error) {
        errorMessage.textContent = error.message;
        submitButton.disabled = false;
      } else {
        successMessage.textContent = '✅ Paiement réussi ! Vous allez être redirigé...';
        setTimeout(() => {
          window.location.href = 'https://solid-eat.com/meals/${meal.id}?payment=success&reservation=${reservation.id}';
        }, 2500);
      }
    });
  </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

export default router;
