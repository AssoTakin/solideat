import prisma from '../config/database';
import { sanctionService } from './sanction.service';

export type QuotaType = 'weekly' | 'monthly';

export interface QuotaStatus {
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}

export interface QuotaStatusDetailed {
  weekly: {
    reservations: { current: number; limit: number; isReduced?: boolean };
    proposals: { current: number; limit: number };
  };
  monthly: {
    cancellations: { current: number; limit: number; isReduced?: boolean; explanation?: string };
    notPickedUp: { current: number; limit: number; isReduced?: boolean; explanation?: string };
  };
  sanctions?: {
    reservationBlocked: boolean;
    cancellationBlocked: boolean;
    activeSanctions: any[];
  };
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
   * Vérifie le quota d'annulation mensuel (prend en compte les sanctions)
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
    
    // Vérifier si un quota réduit est actif
    const reducedQuota = await sanctionService.getReducedQuota(userId);
    const limit = reducedQuota?.cancellations || 4; // Maximum 4 (annulations + non récupérés) par mois, ou quota réduit

    if (total >= limit) {
      return {
        allowed: false,
        current: total,
        limit,
        message: `Plafond mensuel atteint (${limit} annulations + repas non récupérés/mois)`,
      };
    }

    return {
      allowed: true,
      current: total,
      limit,
    };
  }

  /**
   * Récupère le statut détaillé de tous les quotas (US-047)
   */
  async getQuotaStatus(userId: string): Promise<QuotaStatusDetailed> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const now = new Date();
    
    // Calculer le début de la semaine (lundi)
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculer le début du mois
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Compter toutes les métriques
    const [
      weeklyReservations,
      weeklyProposals,
      monthlyCancellations,
      monthlyNotPickedUp,
    ] = await Promise.all([
      prisma.reservation.count({
        where: {
          userId,
          reservedAt: { gte: startOfWeek },
          cancelledAt: null,
        },
      }),
      prisma.meal.count({
        where: {
          cookId: userId,
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.reservation.count({
        where: {
          userId,
          cancelledAt: { gte: startOfMonth },
        },
      }),
      prisma.meal.count({
        where: {
          reservation: { userId },
          status: 'NOT_PICKED_UP',
          updatedAt: { gte: startOfMonth },
        },
      }),
    ]);

    // Vérifier les quotas réduits
    const reducedQuota = await sanctionService.getReducedQuota(userId);
    const isPremium = user.subscriptionType !== 'FREE';

    // Vérifier les sanctions actives
    const [reservationBlocked, cancellationBlocked, activeSanctions] = await Promise.all([
      sanctionService.isReservationBlocked(userId),
      sanctionService.isCancellationBlocked(userId),
      prisma.sanction.findMany({
        where: {
          userId,
          active: true,
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      weekly: {
        reservations: {
          current: weeklyReservations,
          limit: isPremium ? 3 : 1,
        },
        proposals: {
          current: weeklyProposals,
          limit: isPremium ? 3 : 1,
        },
      },
      monthly: {
        cancellations: {
          current: monthlyCancellations,
          limit: reducedQuota?.cancellations || 4,
          isReduced: !!reducedQuota?.cancellations,
          explanation: reducedQuota?.cancellations
            ? `Quota réduit à ${reducedQuota.cancellations} suite à une sanction`
            : undefined,
        },
        notPickedUp: {
          current: monthlyNotPickedUp,
          limit: reducedQuota?.notPickedUp || 2,
          isReduced: !!reducedQuota?.notPickedUp,
          explanation: reducedQuota?.notPickedUp
            ? `Quota réduit à ${reducedQuota.notPickedUp} suite à une sanction`
            : undefined,
        },
      },
      sanctions: {
        reservationBlocked,
        cancellationBlocked,
        activeSanctions: activeSanctions.map((s) => ({
          id: s.id,
          type: s.type,
          reason: s.reason,
          startDate: s.startDate,
          endDate: s.endDate,
        })),
      },
    };
  }
}

export const quotaService = new QuotaService();
