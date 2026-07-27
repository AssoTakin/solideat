import cron from 'node-cron';
import { MealStatus, NotificationType } from '@prisma/client';
import prisma from '../config/database';
import { antiGaspiService } from '../services/antigaspi.service';
import { notificationService } from '../services/notification.service';

/**
 * Job : Expiration automatique des repas
 * Exécuté toutes les heures
 */
export function setupMealExpirationJob(): void {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      // Trouver les repas expirés (expirationDate < now et statut AVAILABLE ou RESERVED)
      const expiredMeals = await prisma.meal.findMany({
        where: {
          expirationDate: {
            lt: now,
          },
          status: {
            in: [MealStatus.AVAILABLE, MealStatus.RESERVED],
          },
        },
        include: {
          cook: {
            select: {
              id: true,
              email: true,
            },
          },
          reservation: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      for (const meal of expiredMeals) {
        // Mettre à jour le statut
        await prisma.meal.update({
          where: { id: meal.id },
          data: { status: MealStatus.EXPIRED },
        });

        // Incrémenter le compteur de repas expirés du cuisinier
        await prisma.user.update({
          where: { id: meal.cookId },
          data: {
            mealsExpired: {
              increment: 1,
            },
          },
        });

        // Envoyer notification au cuisinier
        await notificationService
          .sendNotification(
            meal.cookId,
            NotificationType.MEAL_EXPIRED,
            'Repas expiré',
            `Votre repas "${meal.name}" a expiré sans être récupéré.`,
            `/meals/${meal.id}`,
            true
          )
          .catch(() => {
            // Erreur silencieuse
          });

        // Si le repas était réservé, notifier le membre qui avait réservé
        if (meal.reservation) {
          await notificationService
            .sendNotification(
              meal.reservation.userId,
              NotificationType.MEAL_CANCELLED,
              'Réservation annulée - Repas expiré',
              `Le repas "${meal.name}" que vous aviez réservé a expiré et la réservation a été annulée.`,
              `/reservations`,
              true
            )
            .catch(() => {
              // Erreur silencieuse
            });
        }
      }
    } catch (error) {
      // Erreur silencieuse - le job sera réexécuté à la prochaine heure
    }
  });
}

/**
 * Job : Ajout automatique dans "Anti-Gaspi"
 * Exécuté toutes les heures
 */
export function setupAntiGaspiJob(): void {
  cron.schedule('0 * * * *', async () => {
    try {
      await antiGaspiService.processExpiringMeals();
    } catch (error) {
      // Erreur silencieuse - le job sera réexécuté à la prochaine heure
    }
  });
}

/**
 * Job : Rappels de commentaires obligatoires
 * Exécuté toutes les 30 minutes
 */
export function setupReviewReminderJob(): void {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date();
      const reminderThreshold = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const restrictionThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      // 1. Envoyer un rappel 2h après récupération
      const reservationsToRemind = await prisma.reservation.findMany({
        where: {
          pickedUpAt: {
            not: null,
            lte: reminderThreshold,
          },
          reviewReminderSent: false,
          cancelledAt: null,
          meal: {
            status: MealStatus.SERVED,
          },
        },
        include: {
          meal: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      for (const reservation of reservationsToRemind) {
        const existingReview = await prisma.review.findUnique({
          where: {
            mealId_reviewerId: {
              mealId: reservation.mealId,
              reviewerId: reservation.userId,
            },
          },
        });

        if (existingReview) {
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { reviewReminderSent: true },
          });
          continue;
        }

        await notificationService
          .sendNotification(
            reservation.userId,
            NotificationType.REVIEW_REMINDER,
            'Avis obligatoire',
            `N'oubliez pas de laisser un avis sur le repas "${reservation.meal.name}" pour maintenir votre compte actif.`,
            `/meals/${reservation.mealId}/review`,
            true
          )
          .catch(() => {
            // Erreur silencieuse
          });

        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reviewReminderSent: true },
        });
      }

      // 2. Restreindre les utilisateurs avec un avis en retard > 48h
      const overdueReservations = await prisma.reservation.findMany({
        where: {
          pickedUpAt: {
            not: null,
            lte: restrictionThreshold,
          },
          cancelledAt: null,
          meal: {
            status: MealStatus.SERVED,
          },
        },
        include: {
          meal: {
            select: {
              id: true,
            },
          },
        },
      });

      for (const reservation of overdueReservations) {
        const existingReview = await prisma.review.findUnique({
          where: {
            mealId_reviewerId: {
              mealId: reservation.mealId,
              reviewerId: reservation.userId,
            },
          },
        });

        if (existingReview) continue;

        // Vérifier s'il y a déjà une sanction active de type RESERVATION_BLOCK
        const activeSanction = await prisma.sanction.findFirst({
          where: {
            userId: reservation.userId,
            type: 'RESERVATION_BLOCK',
            active: true,
            reason: { contains: 'avis en retard', mode: 'insensitive' },
          },
        });

        if (activeSanction) continue;

        await prisma.sanction.create({
          data: {
            userId: reservation.userId,
            type: 'RESERVATION_BLOCK',
            reason: `Avis en retard : repas "${reservation.meal.id}" non noté depuis plus de 48h`,
            startDate: now,
            active: true,
          },
        });

        await notificationService
          .sendNotification(
            reservation.userId,
            NotificationType.SANCTION_APPLIED,
            'Compte temporairement restreint',
            "Vous avez un avis en retard de plus de 48h. Vous ne pouvez plus réserver de repas tant que vous n'avez pas noté ce repas.",
            `/meals/${reservation.mealId}/review`,
            true
          )
          .catch(() => {
            // Erreur silencieuse
          });
      }
    } catch (error) {
      // Erreur silencieuse - le job sera réexécuté à la prochaine fenêtre
    }
  });
}
