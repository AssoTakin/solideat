import { MealStatus } from '@prisma/client';
import prisma from '../config/database';
import { quotaService } from './quota.service';
import { emailService } from './email.service';
import { sanctionService } from './sanction.service';
import { bonusDonorService } from './bonus-donor.service';

export class ReservationService {
  /**
   * Crée une réservation
   */
  async createReservation(userId: string, mealId: string, useBonusDonor?: boolean): Promise<any> {
    // Vérifier que le repas existe et est disponible
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        cook: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        reservation: true,
      },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    if (meal.status !== MealStatus.AVAILABLE) {
      throw new Error('Ce repas n\'est plus disponible');
    }

    if (meal.reservation) {
      throw new Error('Ce repas est déjà réservé');
    }

    // Vérifier que la date d'expiration n'est pas atteinte
    if (new Date(meal.expirationDate) < new Date()) {
      throw new Error('Ce repas a expiré');
    }

    // Vérifier que l'utilisateur ne réserve pas son propre repas
    if (meal.cookId === userId) {
      throw new Error('Vous ne pouvez pas réserver votre propre repas');
    }

    // Vérifier si les réservations sont bloquées (sanction)
    const isReservationBlocked = await sanctionService.isReservationBlocked(userId);
    if (isReservationBlocked) {
      throw new Error('Vos réservations sont temporairement bloquées suite à une sanction. Consultez vos messages système pour plus d\'informations.');
    }

    // Vérifier les quotas hebdomadaires
    const weeklyQuota = await quotaService.checkWeeklyReservationQuota(userId);
    if (!weeklyQuota.allowed && !useBonusDonor) {
      throw new Error(weeklyQuota.message || 'Quota hebdomadaire atteint');
    }

    // Vérifier et utiliser un bonus donateur si demandé (US-028)
    let bonusDonorId: string | null = null;
    if (useBonusDonor) {
      // Récupérer un bonus disponible
      const availableBonuses = await bonusDonorService.getAvailableBonuses(userId);
      if (availableBonuses.length === 0) {
        throw new Error('Aucun bonus donateur disponible');
      }

      // Utiliser le premier bonus disponible
      const bonusToUse = availableBonuses[0];
      await bonusDonorService.useBonusDonor(userId, bonusToUse.id);
      bonusDonorId = bonusToUse.id;
    }

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        mealId,
        userId,
        usedBonusDonor: useBonusDonor || false,
        bonusDonorId,
      },
      include: {
        meal: {
          include: {
            cook: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePhoto: true,
                globalRating: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Mettre à jour le statut du repas
    await prisma.meal.update({
      where: { id: mealId },
      data: { status: MealStatus.RESERVED },
    });

    // Envoyer les notifications (en arrière-plan)
    emailService.sendVerificationEmail(
      meal.cook.email,
      `Nouvelle réservation pour ${meal.name}`
    ).catch(() => {
      // Erreur silencieuse
    });

    // Incrémenter le compteur de repas reçus
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true },
    });

    const updateData: any = {
      mealsReceived: {
        increment: 1,
      },
    };

    // Si le repas était dans "Sauvez-les", incrémenter mealsSaved (premium uniquement)
    if (meal.inSaveThem && user?.subscriptionType !== 'FREE') {
      updateData.mealsSaved = {
        increment: 1,
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return reservation;
  }

  /**
   * Annule une réservation
   */
  async cancelReservation(reservationId: string, userId: string, reason: string): Promise<void> {
    // Vérifier que la réservation existe et appartient à l'utilisateur
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        meal: {
          include: {
            cook: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    if (reservation.userId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à annuler cette réservation');
    }

    if (reservation.cancelledAt) {
      throw new Error('Cette réservation est déjà annulée');
    }

    // Vérifier si les annulations sont bloquées (sanction)
    const isCancellationBlocked = await sanctionService.isCancellationBlocked(userId);
    if (isCancellationBlocked) {
      throw new Error('Vos annulations sont temporairement bloquées suite à une sanction. Consultez vos messages système pour plus d\'informations.');
    }

    // Vérifier le délai (7h avant l'heure de récupération)
    const pickupTimeStart = new Date(reservation.meal.pickupTimeStart);
    const now = new Date();
    const hoursUntilPickup = (pickupTimeStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilPickup < 7) {
      throw new Error('L\'annulation n\'est plus possible (moins de 7h avant la récupération)');
    }

    // Vérifier les quotas d'annulation
    const weeklyQuota = await quotaService.checkWeeklyCancellationQuota(userId);
    if (!weeklyQuota.allowed) {
      throw new Error(weeklyQuota.message || 'Quota d\'annulation hebdomadaire atteint');
    }

    const monthlyQuota = await quotaService.checkMonthlyCancellationQuota(userId);
    if (!monthlyQuota.allowed) {
      throw new Error(monthlyQuota.message || 'Plafond mensuel d\'annulations atteint');
    }

    // Annuler la réservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Remettre le repas en disponible
    const expirationDate = new Date(reservation.meal.expirationDate);
    const timeRemaining = expirationDate.getTime() - now.getTime();

    if (timeRemaining > 0) {
      // Ajouter dans "Sauvez-les" si temps restant > 0
      await prisma.meal.update({
        where: { id: reservation.mealId },
        data: {
          status: MealStatus.AVAILABLE,
          inSaveThem: true,
        },
      });
    } else {
      await prisma.meal.update({
        where: { id: reservation.mealId },
        data: {
          status: MealStatus.AVAILABLE,
        },
      });
    }

    // Envoyer notification au cuisinier
    emailService.sendVerificationEmail(
      reservation.meal.cook.email,
      `Réservation annulée pour ${reservation.meal.name}`
    ).catch(() => {
      // Erreur silencieuse
    });
  }

  /**
   * Récupère les réservations d'un utilisateur
   */
  async getUserReservations(userId: string, filters?: { status?: string }): Promise<any[]> {
    const where: any = {
      userId,
    };

    if (filters?.status) {
      where.meal = {
        status: filters.status,
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        meal: {
          include: {
            cook: {
              select: {
                id: true,
                username: true,
                profilePhoto: true,
                globalRating: true,
                addressCity: true,
              },
            },
          },
        },
      },
      orderBy: {
        reservedAt: 'desc',
      },
    });

    return reservations;
  }

  /**
   * Marque un repas comme récupéré
   */
  async markAsPickedUp(reservationId: string, cookId: string): Promise<void> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        meal: true,
      },
    });

    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    if (reservation.meal.cookId !== cookId) {
      throw new Error('Vous n\'êtes pas autorisé à marquer ce repas comme récupéré');
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        pickedUpAt: new Date(),
      },
    });

    await prisma.meal.update({
      where: { id: reservation.mealId },
      data: {
        status: MealStatus.SERVED,
      },
    });
  }

  /**
   * Signale un repas non récupéré
   */
  async reportNotPickedUp(reservationId: string, cookId: string): Promise<void> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        meal: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    if (reservation.meal.cookId !== cookId) {
      throw new Error('Vous n\'êtes pas autorisé à signaler ce repas');
    }

    // Vérifier le délai (24h après fin de plage horaire)
    const pickupTimeEnd = new Date(reservation.meal.pickupTimeEnd);
    const now = new Date();
    const hoursSincePickupEnd = (now.getTime() - pickupTimeEnd.getTime()) / (1000 * 60 * 60);

    if (hoursSincePickupEnd < 0) {
      throw new Error('Le repas n\'a pas encore atteint l\'heure de fin de récupération');
    }

    if (hoursSincePickupEnd > 24) {
      throw new Error('Le signalement n\'est plus possible (plus de 24h après la fin de récupération)');
    }

    // Vérifier si les annulations sont bloquées (sanction)
    const isCancellationBlocked = await sanctionService.isCancellationBlocked(reservation.userId);
    if (isCancellationBlocked) {
      throw new Error('Vos annulations sont temporairement bloquées suite à une sanction. Consultez vos messages système pour plus d\'informations.');
    }

    // Vérifier le quota mensuel
    const monthlyQuota = await quotaService.checkMonthlyCancellationQuota(reservation.userId);
    if (!monthlyQuota.allowed) {
      // Les sanctions seront appliquées par le job quotidien
      // On peut quand même signaler le repas non récupéré
    }

    // Vérifier le temps restant avant expiration
    const expirationDate = new Date(reservation.meal.expirationDate);
    const timeRemaining = expirationDate.getTime() - now.getTime();

    if (timeRemaining > 0) {
      // Remettre dans "Sauvez-les"
      await prisma.meal.update({
        where: { id: reservation.mealId },
        data: {
          status: MealStatus.NOT_PICKED_UP,
          inSaveThem: true,
        },
      });
    } else {
      await prisma.meal.update({
        where: { id: reservation.mealId },
        data: {
          status: MealStatus.EXPIRED,
        },
      });
    }

    // Envoyer notification
    emailService.sendVerificationEmail(
      reservation.user.email,
      `Repas non récupéré : ${reservation.meal.name}`
    ).catch(() => {
      // Erreur silencieuse
    });
  }
}

export const reservationService = new ReservationService();
