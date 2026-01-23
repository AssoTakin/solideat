import prisma from '../config/database';
import { SubscriptionType } from '@prisma/client';
import { stripeService } from './stripe.service';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionType;
  price: number;
  period: 'week' | 'month' | 'year';
  pricePerMonth: number;
  savings?: number;
  features: string[];
}

export class SubscriptionService {
  /**
   * Récupère les plans d'abonnement disponibles
   */
  getPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'weekly',
        name: 'Hebdomadaire',
        type: SubscriptionType.PREMIUM_WEEKLY,
        price: 2.5,
        period: 'week',
        pricePerMonth: 10.83, // 2.5 * 52 / 12
        features: [
          '3 repas réservés par semaine',
          '3 repas proposés par semaine',
          'Accès à "Sauvez-les"',
          'Filtres de recherche avancés',
          'Statistiques d\'impact environnemental',
          'Masquer votre numéro de téléphone',
        ],
      },
      {
        id: 'monthly',
        name: 'Mensuel',
        type: SubscriptionType.PREMIUM_MONTHLY,
        price: 9,
        period: 'month',
        pricePerMonth: 9,
        features: [
          '3 repas réservés par semaine',
          '3 repas proposés par semaine',
          'Accès à "Sauvez-les"',
          'Filtres de recherche avancés',
          'Statistiques d\'impact environnemental',
          'Masquer votre numéro de téléphone',
        ],
      },
      {
        id: 'yearly',
        name: 'Annuel',
        type: SubscriptionType.PREMIUM_YEARLY,
        price: 90,
        period: 'year',
        pricePerMonth: 7.5, // 90 / 12
        savings: 18, // (9 * 12) - 90
        features: [
          '3 repas réservés par semaine',
          '3 repas proposés par semaine',
          'Accès à "Sauvez-les"',
          'Filtres de recherche avancés',
          'Statistiques d\'impact environnemental',
          'Masquer votre numéro de téléphone',
          'Économisez 18€ par an !',
        ],
      },
    ];
  }

  /**
   * Récupère l'abonnement actuel d'un utilisateur
   */
  async getCurrentSubscription(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.subscriptionType === 'FREE') {
      return {
        type: 'FREE',
        active: false,
      };
    }

    const now = new Date();
    const isActive = user.subscriptionEnd ? user.subscriptionEnd > now : false;

    return {
      type: user.subscriptionType,
      startDate: user.subscriptionStart,
      endDate: user.subscriptionEnd,
      active: isActive,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
    };
  }

  /**
   * Crée un abonnement avec Stripe
   */
  async createSubscription(
    userId: string,
    planType: SubscriptionType,
    paymentMethodId: string
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (!paymentMethodId) {
      throw new Error('Payment method ID requis');
    }

    try {
      // Créer ou récupérer le customer Stripe
      const customerId = await stripeService.getOrCreateCustomer(
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`
      );

      // Récupérer le price ID
      const priceId = stripeService.getPriceId(planType);

      // Créer la subscription Stripe
      const stripeSubscription = await stripeService.createSubscription(
        customerId,
        priceId,
        paymentMethodId
      );

      // Calculer les dates selon le type d'abonnement
      const now = new Date();
      const subscriptionEnd = stripeService.getSubscriptionEndDate(stripeSubscription);

      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionType: planType,
          subscriptionStart: now,
          subscriptionEnd,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSubscription.id,
        },
        select: {
          id: true,
          subscriptionType: true,
          subscriptionStart: true,
          subscriptionEnd: true,
        },
      });

      // Envoyer une notification
      const { notificationService } = await import('./notification.service');
      await notificationService.createNotification(
        userId,
        'SYSTEM_MESSAGE',
        'Abonnement créé',
        `Votre abonnement premium ${planType.replace('PREMIUM_', '').toLowerCase()} a été activé avec succès !`,
        '/dashboard'
      );

      // Envoyer un email
      const { emailService } = await import('./email.service');
      emailService.sendSubscriptionCreatedEmail(user.email, planType).catch(() => {
        // Erreur silencieuse
      });

      return updatedUser;
    } catch (error: any) {
      throw new Error(`Erreur lors de la création de l'abonnement Stripe: ${error.message}`);
    }
  }

  /**
   * Annule un abonnement (US-036)
   * L'abonnement reste actif jusqu'à la fin de la période en cours
   */
  async cancelSubscription(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscriptionType: true,
        subscriptionEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.subscriptionType === 'FREE') {
      throw new Error('Aucun abonnement actif');
    }

    // Annuler la subscription Stripe si elle existe
    if (user.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(user.stripeSubscriptionId);
      } catch (error: any) {
        // Si l'abonnement n'existe plus dans Stripe, on continue quand même
        console.error('Erreur lors de l\'annulation Stripe:', error.message);
      }
    }

    // Envoyer une notification
    const { notificationService } = await import('./notification.service');
    await notificationService.createNotification(
      userId,
      'SYSTEM_MESSAGE',
      'Abonnement annulé',
      `Votre abonnement premium restera actif jusqu'au ${user.subscriptionEnd?.toLocaleDateString('fr-FR') || 'fin de la période'}. Vous serez rétrogradé en membre gratuit après cette date.`,
      '/dashboard'
    );

    // Envoyer un email
    const { emailService } = await import('./email.service');
    emailService.sendSubscriptionCancelledEmail(user.email, user.subscriptionEnd).catch(() => {
      // Erreur silencieuse
    });
  }
}

export const subscriptionService = new SubscriptionService();
