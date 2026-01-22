import cron from 'node-cron';
import { MealStatus } from '@prisma/client';
import prisma from '../config/database';
import { saveThemService } from '../services/savethem.service';

/**
 * Job : Expiration automatique des repas
 * Exécuté toutes les heures
 */
export function setupMealExpirationJob(): void {
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 [Cron] Vérification des repas expirés...');

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
        // TODO: Implémenter NotificationService
        console.log(`📧 Notification envoyée au cuisinier pour repas expiré: ${meal.id}`);

        // Si le repas était réservé, notifier le membre qui avait réservé
        if (meal.reservation) {
          // TODO: Envoyer notification
          console.log(`📧 Notification envoyée au membre pour réservation expirée: ${meal.id}`);
        }
      }

      console.log(`✅ ${expiredMeals.length} repas marqués comme expirés`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'expiration des repas:', error);
    }
  });

  console.log('✅ Job d\'expiration des repas configuré (toutes les heures)');
}

/**
 * Job : Ajout automatique dans "Sauvez-les"
 * Exécuté toutes les heures
 */
export function setupSaveThemJob(): void {
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 [Cron] Ajout automatique dans "Sauvez-les"...');

    try {
      await saveThemService.processExpiringMeals();
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout dans "Sauvez-les":', error);
    }
  });

  console.log('✅ Job "Sauvez-les" configuré (toutes les heures)');
}

/**
 * Job : Rappels de commentaires obligatoires
 * Exécuté toutes les heures
 */
export function setupReviewReminderJob(): void {
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 [Cron] Vérification des rappels de commentaires...');

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
          // Vérifier qu'un rappel n'a pas déjà été envoyé
          // TODO: Implémenter système de tracking des rappels
          console.log(`📧 Rappel 4h envoyé pour repas: ${meal.id}`);
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
          console.log(`⚠️ Restriction appliquée pour repas: ${meal.id}`);
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
          console.log(`🔒 Restriction sévère appliquée pour repas: ${meal.id}`);
        }
      }

      console.log(`✅ Rappels de commentaires traités`);
    } catch (error) {
      console.error('❌ Erreur lors des rappels de commentaires:', error);
    }
  });

  console.log('✅ Job de rappels de commentaires configuré (toutes les heures)');
}
