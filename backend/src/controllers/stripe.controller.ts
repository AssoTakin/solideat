import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';
import { SubscriptionType } from '@prisma/client';
import { stripeService } from '../services/stripe.service';
import { notificationService } from '../services/notification.service';
import { emailService } from '../services/email.service';

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeWebhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET n\'est pas définie dans les variables d\'environnement');
}

export class StripeController {
  /**
   * POST /webhooks/stripe
   * Gère les webhooks Stripe
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    let event: Stripe.Event;

    try {
      const { stripe } = await import('../services/stripe.service');
      if (!stripeWebhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET non configuré');
      }
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } catch (err: any) {
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }

    // Gérer les différents types d'événements
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          // Événement non géré, ignoré
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Gère la création/mise à jour d'une subscription
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;

    // Trouver l'utilisateur par customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true },
    });

    if (!user) {
      return;
    }

    // Déterminer le type d'abonnement depuis le price ID
    const priceId = subscription.items.data[0]?.price.id;
    let subscriptionType: SubscriptionType = SubscriptionType.FREE;

    if (priceId === process.env.STRIPE_PRICE_ID_WEEKLY) {
      subscriptionType = SubscriptionType.PREMIUM_WEEKLY;
    } else if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) {
      subscriptionType = SubscriptionType.PREMIUM_MONTHLY;
    } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
      subscriptionType = SubscriptionType.PREMIUM_YEARLY;
    } else {
      return; // Ne pas mettre à jour si le price ID n'est pas reconnu
    }

    // Mettre à jour l'utilisateur
    const subscriptionEnd = stripeService.getSubscriptionEndDate(subscription);
    const periodStart = (subscription as any).current_period_start;
    const subscriptionStart = periodStart ? new Date(periodStart * 1000) : new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionType,
        subscriptionStart,
        subscriptionEnd,
        stripeSubscriptionId: subscription.id,
      },
    });

    // Si la subscription est active, envoyer une notification
    if (stripeService.isSubscriptionActive(subscription)) {
      await notificationService.createNotification(
        user.id,
        'SYSTEM_MESSAGE',
        'Abonnement mis à jour',
        'Votre abonnement premium a été mis à jour avec succès.',
        '/dashboard'
      );
    }
  }

  /**
   * Gère la suppression d'une subscription
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;

    // Trouver l'utilisateur par customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true },
    });

    if (!user) {
      return;
    }

    // Rétrograder en membre gratuit
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionType: SubscriptionType.FREE,
        subscriptionStart: null,
        subscriptionEnd: null,
        stripeSubscriptionId: null,
      },
    });

    // Envoyer une notification
    await notificationService.createNotification(
      user.id,
      'SYSTEM_MESSAGE',
      'Abonnement terminé',
      'Votre abonnement premium a été terminé. Vous êtes maintenant membre gratuit.',
      '/subscriptions'
    );

    // Envoyer un email
    emailService.sendSubscriptionExpiredEmail(user.email).catch(() => {
      // Erreur silencieuse
    });
  }

  /**
   * Gère le paiement réussi d'une invoice
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;

    // Trouver l'utilisateur par customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true },
    });

    if (!user) {
      return;
    }

    // Si c'est un renouvellement (subscription existe)
    const subscriptionId = (invoice as any).subscription;
    if (subscriptionId) {
      const subscription = await stripeService.getSubscription(subscriptionId as string);
      const subscriptionEnd = stripeService.getSubscriptionEndDate(subscription);

      // Mettre à jour la date de fin
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionEnd,
        },
      });

      // Envoyer une notification
      await notificationService.createNotification(
        user.id,
        'SYSTEM_MESSAGE',
        'Abonnement renouvelé',
        'Votre abonnement premium a été renouvelé avec succès.',
        '/dashboard'
      );
    }
  }

  /**
   * Gère l'échec de paiement d'une invoice
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;

    // Trouver l'utilisateur par customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, email: true },
    });

    if (!user) {
      return;
    }

    // Envoyer une notification
    await notificationService.createNotification(
      user.id,
      'SYSTEM_MESSAGE',
      'Échec de paiement',
      'Le paiement de votre abonnement premium a échoué. Veuillez mettre à jour votre méthode de paiement.',
      '/dashboard'
    );

    // Envoyer un email
    emailService.sendSubscriptionPaymentFailedEmail(user.email).catch(() => {
      // Erreur silencieuse
    });
  }
}

export const stripeController = new StripeController();
