import express from 'express';
import { stripeController } from '../controllers/stripe.controller';

const router = express.Router();

/**
 * POST /webhooks/stripe
 * Webhook Stripe pour gérer les événements de paiement
 * 
 * IMPORTANT: Cette route doit utiliser express.raw() pour parser le body brut
 * car Stripe envoie les webhooks avec un body signé.
 * 
 * Configuration dans index.ts:
 * app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeRoutes);
 */
router.post('/stripe', (req, res) => {
  stripeController.handleWebhook(req, res);
});

export default router;
