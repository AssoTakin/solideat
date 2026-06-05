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
        await notificationService.sendNotification(
          meal.cookId,
          NotificationType.MEAL_EXPIRED,
          'Repas expiré',
          `Votre repas "${meal.name}" a expiré sans être récupéré.`,
          `/meals/${meal.id}`,
          true
        ).catch(() => {
          // Erreur silencieuse
        });

        // Si le repas était réservé, notifier le membre qui avait réservé
        if (meal.reservation) {
          await notificationService.sendNotification(
            meal.reservation.userId,
            NotificationType.MEAL_CANCELLED,
            'Réservation annulée - Repas expiré',
            `Le repas "${meal.name}" que vous aviez réservé a expiré et la réservation a été annulée.`,
            `/reservations`,
            true
          ).catch(() => {
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
 * Exécuté toutes les heures
 */
export function setupReviewReminderJob(): void {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      // Repas servis il y a 4h sans commentaire
      const meals4h = await prisma.meal.findMany({
        where: {
          status: MealStatus.SERVED,
          updatedAt: {
            gte: fourHoursAgo,
            lt: new Date(fourHoursAgo.getTime() + 60 * 60 * 1000), // Dans la dernière heure
          },
        },
        include: {
          reservation: {
            include: {
              user: true,
            },
          },
          reviews: true,
        },
      });

      for (const meal of meals4h) {
        if (meal.reservation && meal.reviews.length === 0) {
          const userId = meal.reservation.userId;
          const link = `/meals/${meal.id}/review`;

          // Vérifier si un rappel a déjà été envoyé pour ce repas
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId,
              type: NotificationType.REVIEW_REMINDER,
              link,
            },
          });

          if (!existingNotification) {
            await notificationService.sendNotification(
              userId,
              NotificationType.REVIEW_REMINDER,
              'Avis obligatoire',
              `N'oubliez pas de laisser un avis sur le repas "${meal.name}" pour maintenir votre compte actif.`,
              link,
              true
            ).catch(() => {
              // Erreur silencieuse
            });
          }
        }
      }

      // Repas servis il y a 24h sans commentaire
      const meals24h = await prisma.meal.findMany({
        where: {
          status: MealStatus.SERVED,
          updatedAt: {
            gte: twentyFourHoursAgo,
            lt: new Date(twentyFourHoursAgo.getTime() + 60 * 60 * 1000),
          },
        },
        include: {
          reservation: {
            include: {
              user: true,
            },
          },
          reviews: true,
        },
      });

      for (const meal of meals24h) {
        if (meal.reservation && meal.reviews.length === 0) {
          // Appliquer restriction : peut proposer mais pas choisir
          // TODO: Implémenter système de restrictions
        }
      }

      // Repas servis il y a 48h sans commentaire
      const meals48h = await prisma.meal.findMany({
        where: {
          status: MealStatus.SERVED,
          updatedAt: {
            gte: fortyEightHoursAgo,
            lt: new Date(fortyEightHoursAgo.getTime() + 60 * 60 * 1000),
          },
        },
        include: {
          reservation: {
            include: {
              user: true,
            },
          },
          reviews: true,
        },
      });

      for (const meal of meals48h) {
        if (meal.reservation && meal.reviews.length === 0) {
          // Appliquer restriction : connexion + commentaire uniquement
          // TODO: Implémenter système de restrictions
        }
      }
    } catch (error) {
      // Erreur silencieuse - le job sera réexécuté à la prochaine heure
    }
  });
}
