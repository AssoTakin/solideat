import prisma from '../config/database';
import { SubscriptionType } from '@prisma/client';

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
    };
  }

  /**
   * Crée un abonnement (à compléter avec Stripe)
   */
  async createSubscription(
    userId: string,
    planType: SubscriptionType,
    _stripePaymentMethodId?: string
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Calculer les dates selon le type d'abonnement
    const now = new Date();
    let subscriptionEnd: Date;

    switch (planType) {
      case SubscriptionType.PREMIUM_WEEKLY:
        subscriptionEnd = new Date(now);
        subscriptionEnd.setDate(subscriptionEnd.getDate() + 7);
        break;
      case SubscriptionType.PREMIUM_MONTHLY:
        subscriptionEnd = new Date(now);
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        break;
      case SubscriptionType.PREMIUM_YEARLY:
        subscriptionEnd = new Date(now);
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        break;
      default:
        throw new Error('Type d\'abonnement invalide');
    }

    // TODO: Intégrer Stripe pour créer la subscription
    // - Créer ou récupérer le customer Stripe
    // - Créer la subscription avec le payment method
    // - Stocker l'ID de la subscription Stripe

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: planType,
        subscriptionStart: now,
        subscriptionEnd,
        // stripeCustomerId sera mis à jour lors de l'intégration Stripe
      },
      select: {
        id: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
      },
    });

    return updatedUser;
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
        email: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.subscriptionType === 'FREE') {
      throw new Error('Aucun abonnement actif');
    }

    // TODO: Annuler la subscription Stripe si stripeCustomerId existe
    // Stripe gérera automatiquement la fin de l'abonnement à la fin de la période

    // Marquer l'abonnement pour annulation (on garde jusqu'à la fin de la période)
    // On ne change rien pour l'instant, le job de renouvellement gérera la rétrogradation
    // Pour une implémentation complète, on pourrait ajouter un champ cancelledAt

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
