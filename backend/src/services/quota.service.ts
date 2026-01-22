import prisma from '../config/database';

export type QuotaType = 'weekly' | 'monthly';

export interface QuotaStatus {
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}

export class QuotaService {
  /**
   * Vérifie le quota hebdomadaire de réservations
   */
  async checkWeeklyReservationQuota(userId: string): Promise<QuotaStatus> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Calculer le début de la semaine (lundi)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Compter les réservations cette semaine (non annulées)
    const reservationsThisWeek = await prisma.reservation.count({
      where: {
        userId,
        reservedAt: {
          gte: startOfWeek,
        },
        cancelledAt: null,
      },
    });

    // Quota selon le type d'abonnement
    const limit = user.subscriptionType === 'FREE' ? 1 : 3;

    if (reservationsThisWeek >= limit) {
      return {
        allowed: false,
        current: reservationsThisWeek,
        limit,
        message: `Quota hebdomadaire de réservations atteint (${limit} réservations/semaine)`,
      };
    }

    return {
      allowed: true,
      current: reservationsThisWeek,
      limit,
    };
  }

  /**
   * Vérifie le quota mensuel de réservations
   */
  async checkMonthlyReservationQuota(userId: string): Promise<QuotaStatus> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Calculer le début du mois
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Compter les réservations ce mois (non annulées)
    const reservationsThisMonth = await prisma.reservation.count({
      where: {
        userId,
        reservedAt: {
          gte: startOfMonth,
        },
        cancelledAt: null,
      },
    });

    // Quota mensuel : 4 pour gratuit, 12 pour premium
    const limit = user.subscriptionType === 'FREE' ? 4 : 12;

    if (reservationsThisMonth >= limit) {
      return {
        allowed: false,
        current: reservationsThisMonth,
        limit,
        message: `Quota mensuel de réservations atteint (${limit} réservations/mois)`,
      };
    }

    return {
      allowed: true,
      current: reservationsThisMonth,
      limit,
    };
  }

  /**
   * Vérifie le quota d'annulation hebdomadaire
   */
  async checkWeeklyCancellationQuota(userId: string): Promise<QuotaStatus> {
    // Calculer le début de la semaine
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Compter les annulations cette semaine
    const cancellationsThisWeek = await prisma.reservation.count({
      where: {
        userId,
        cancelledAt: {
          gte: startOfWeek,
        },
      },
    });

    const limit = 1; // Maximum 1 annulation par semaine

    if (cancellationsThisWeek >= limit) {
      return {
        allowed: false,
        current: cancellationsThisWeek,
        limit,
        message: 'Quota hebdomadaire d\'annulations atteint (1 annulation/semaine)',
      };
    }

    return {
      allowed: true,
      current: cancellationsThisWeek,
      limit,
    };
  }

  /**
   * Vérifie le quota d'annulation mensuel
   */
  async checkMonthlyCancellationQuota(userId: string): Promise<QuotaStatus> {
    // Calculer le début du mois
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Compter les annulations + repas non récupérés ce mois
    const [cancellations, notPickedUp] = await Promise.all([
      prisma.reservation.count({
        where: {
          userId,
          cancelledAt: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.meal.count({
        where: {
          reservation: {
            userId,
          },
          status: 'NOT_PICKED_UP',
          updatedAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    const total = cancellations + notPickedUp;
    const limit = 4; // Maximum 4 (annulations + non récupérés) par mois

    if (total >= limit) {
      return {
        allowed: false,
        current: total,
        limit,
        message: 'Plafond mensuel atteint (4 annulations + repas non récupérés/mois)',
      };
    }

    return {
      allowed: true,
      current: total,
      limit,
    };
  }
}

export const quotaService = new QuotaService();
