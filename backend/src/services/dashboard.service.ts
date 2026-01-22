import prisma from '../config/database';
import { MealStatus } from '@prisma/client';
import { quotaService } from './quota.service';

export interface DashboardStats {
  // Récapitulatif d'activité
  activity: {
    mealsProposed: {
      available: number;
      reserved: number;
    };
    mealsReserved: {
      reserved: number;
      upcoming: number;
    };
    mealsPendingReview: number;
  };
  // Historique
  history: {
    mealsServed: number;
    mealsReceived: number;
    mealsExpired: number;
    mealsCancelled: number;
  };
  // Statistiques personnelles
  personal: {
    globalRating: number;
    mealsServed: number;
    mealsReceived: number;
    bonusDonorsAvailable: number;
    badges: any[];
    registrationDate: Date;
  };
  // Statistiques premium (si premium)
  premium?: {
    mealsSaved: number;
    co2Avoided: number; // Estimation en kg
    monthlyImpact: {
      mealsSaved: number;
      co2Avoided: number;
    };
    yearlyImpact: {
      mealsSaved: number;
      co2Avoided: number;
    };
  };
  // Quotas
  quotas: {
    weekly: {
      reservations: { current: number; limit: number };
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
  };
}

export class DashboardService {
  /**
   * Récupère toutes les statistiques du tableau de bord
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
        globalRating: true,
        mealsServed: true,
        mealsReceived: true,
        mealsExpired: true,
        mealsSaved: true,
        createdAt: true,
        badges: {
          include: {
            badge: true,
          },
        },
        bonusDonors: {
          where: {
            usedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
        },
      },
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

    // Récapitulatif d'activité
    const [mealsProposed, mealsReserved, mealsPendingReview] = await Promise.all([
      // Repas proposés
      prisma.meal.findMany({
        where: {
          cookId: userId,
          status: {
            in: [MealStatus.AVAILABLE, MealStatus.RESERVED],
          },
        },
        select: {
          status: true,
        },
      }),
      // Repas réservés (non annulés)
      prisma.reservation.findMany({
        where: {
          userId,
          cancelledAt: null,
        },
        select: {
          meal: {
            select: {
              serviceDate: true,
              status: true,
            },
          },
        },
      }),
      // Repas en attente de commentaire (repas servis sans review)
      prisma.reservation.count({
        where: {
          userId,
          cancelledAt: null,
          meal: {
            status: MealStatus.SERVED,
            reviews: {
              none: {
                reviewerId: userId,
              },
            },
          },
        },
      }),
    ]);

    const activity = {
      mealsProposed: {
        available: mealsProposed.filter((m) => m.status === MealStatus.AVAILABLE).length,
        reserved: mealsProposed.filter((m) => m.status === MealStatus.RESERVED).length,
      },
      mealsReserved: {
        reserved: mealsReserved.filter((r) => r.meal.status === MealStatus.RESERVED).length,
        upcoming: mealsReserved.filter(
          (r) => r.meal.status === MealStatus.RESERVED && r.meal.serviceDate > now
        ).length,
      },
      mealsPendingReview,
    };

    // Historique
    const [mealsCancelled] = await Promise.all([
      prisma.reservation.count({
        where: {
          userId,
          cancelledAt: {
            not: null,
          },
        },
      }),
    ]);

    const history = {
      mealsServed: user.mealsServed,
      mealsReceived: user.mealsReceived,
      mealsExpired: user.mealsExpired,
      mealsCancelled,
    };

    // Statistiques personnelles
    const personal = {
      globalRating: user.globalRating,
      mealsServed: user.mealsServed,
      mealsReceived: user.mealsReceived,
      bonusDonorsAvailable: user.bonusDonors.length,
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt,
      })),
      registrationDate: user.createdAt,
    };

    // Statistiques premium
    let premium;
    if (user.subscriptionType !== 'FREE') {
      // Calculer CO2 évité (estimation : 2.5 kg CO2 par repas sauvé)
      const co2PerMeal = 2.5;
      const co2Avoided = user.mealsSaved * co2PerMeal;

      premium = {
        mealsSaved: user.mealsSaved,
        co2Avoided,
        monthlyImpact: {
          mealsSaved: user.mealsSaved, // TODO: Calculer réellement pour le mois
          co2Avoided: user.mealsSaved * co2PerMeal,
        },
        yearlyImpact: {
          mealsSaved: user.mealsSaved, // TODO: Calculer réellement pour l'année
          co2Avoided: user.mealsSaved * co2PerMeal,
        },
      };
    }

    // Récupérer le statut détaillé des quotas (prend en compte les sanctions)
    const quotaStatus = await quotaService.getQuotaStatus(userId);

    const quotas = {
      weekly: {
        reservations: quotaStatus.weekly.reservations,
        proposals: quotaStatus.weekly.proposals,
      },
      monthly: {
        cancellations: quotaStatus.monthly.cancellations,
        notPickedUp: quotaStatus.monthly.notPickedUp,
      },
      sanctions: quotaStatus.sanctions,
    };

    return {
      activity,
      history,
      personal,
      premium,
      quotas,
    };
  }
}

export const dashboardService = new DashboardService();
