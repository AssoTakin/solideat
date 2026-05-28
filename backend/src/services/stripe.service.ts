import Stripe from 'stripe';
import prisma from '../config/database';
import { SubscriptionType } from '@prisma/client';

// Initialiser Stripe avec la clé API
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY n\'est pas définie dans les variables d\'environnement');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-02-25.clover' as any,
});

// IDs des produits Stripe (à configurer dans Stripe Dashboard)
const STRIPE_PRODUCT_IDS = {
  [SubscriptionType.PREMIUM_WEEKLY]: process.env.STRIPE_PRICE_ID_WEEKLY || '',
  [SubscriptionType.PREMIUM_MONTHLY]: process.env.STRIPE_PRICE_ID_MONTHLY || '',
  [SubscriptionType.PREMIUM_YEARLY]: process.env.STRIPE_PRICE_ID_YEARLY || '',
};

export class StripeService {
  /**
   * Crée ou récupère un customer Stripe pour un utilisateur
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    // Si le customer existe déjà, le retourner
    if (user?.stripeCustomerId) {
      try {
        await stripe.customers.retrieve(user.stripeCustomerId);
        return user.stripeCustomerId;
      } catch (error) {
        // Le customer n'existe plus dans Stripe, on en crée un nouveau
      }
    }

    // Créer un nouveau customer Stripe
    const customer = await stripe.customers.create({
      email,
      name: name || email,
      metadata: {
        userId,
      },
    });

    // Mettre à jour l'utilisateur avec le customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /**
   * Crée une subscription Stripe
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string
  ): Promise<Stripe.Subscription> {
    // Attacher le payment method au customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Définir comme payment method par défaut
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Créer la subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  }

  /**
   * Récupère le price ID selon le type d'abonnement
   */
  getPriceId(subscriptionType: SubscriptionType): string {
    if (subscriptionType === SubscriptionType.FREE) {
      throw new Error('Le type FREE n\'a pas de price ID Stripe');
    }
    const priceId = STRIPE_PRODUCT_IDS[subscriptionType];
    if (!priceId) {
      throw new Error(`Price ID non configuré pour le type d'abonnement: ${subscriptionType}`);
    }
    return priceId;
  }

  /**
   * Annule une subscription Stripe
   * L'abonnement reste actif jusqu'à la fin de la période
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Réactive une subscription annulée
   */
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * Renouvelle une subscription (création d'un nouvel invoice)
   */
  async renewSubscription(subscriptionId: string): Promise<Stripe.Invoice> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Créer un invoice pour le renouvellement
    const invoice = await stripe.invoices.create({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      auto_advance: true, // Auto-finaliser l'invoice
    });

    // Finaliser et payer l'invoice
    await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.pay(invoice.id);

    return invoice;
  }

  /**
   * Récupère une subscription Stripe
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Récupère les invoices d'un customer
   */
  async getInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  }

  /**
   * Vérifie le statut d'une subscription
   */
  isSubscriptionActive(subscription: Stripe.Subscription): boolean {
    return subscription.status === 'active' || subscription.status === 'trialing';
  }

  /**
   * Vérifie si une subscription est annulée mais toujours active
   */
  isSubscriptionCancelled(subscription: Stripe.Subscription): boolean {
    return subscription.cancel_at_period_end === true;
  }

  /**
   * Calcule la date de fin d'abonnement depuis une subscription Stripe
   */
  getSubscriptionEndDate(subscription: Stripe.Subscription): Date {
    const periodEnd = (subscription as any).current_period_end;
    if (!periodEnd) {
      throw new Error('current_period_end non disponible dans la subscription');
    }
    return new Date(periodEnd * 1000);
  }
}

export const stripeService = new StripeService();
