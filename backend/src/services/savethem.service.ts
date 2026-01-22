import { MealStatus } from '@prisma/client';
import prisma from '../config/database';
import { MealService } from './meal.service';

const mealService = new MealService();

export class SaveThemService {
  /**
   * Récupère les repas "Sauvez-les"
   * Repas avec inSaveThem = true et expirationDate - now <= 24h
   */
  async getSaveThemMeals(filters: {
    userLat?: number;
    userLng?: number;
    distance?: number;
    cuisine?: string;
    portions?: number;
    page?: number;
    limit?: number;
    subscriptionType?: string;
  }): Promise<{ meals: any[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const where: any = {
      inSaveThem: true,
      status: MealStatus.AVAILABLE,
      expirationDate: {
        gte: now, // Pas encore expiré
        lte: in24Hours, // Expire dans moins de 24h
      },
    };

    // Filtre par nombre de parts
    if (filters.portions) {
      where.portions = {
        gte: filters.portions,
      };
    }

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
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
        orderBy: {
          expirationDate: 'asc', // Tri par temps restant (croissant)
        },
        skip,
        take: limit,
      }),
      prisma.meal.count({ where }),
    ]);

    // Calculer les distances si coordonnées utilisateur fournies
    let mealsWithDistance = meals;
    if (filters.userLat && filters.userLng) {
      mealsWithDistance = meals.map((meal) => {
        const distance = mealService.calculateDistance(
          filters.userLat!,
          filters.userLng!,
          meal.pickupLatitude,
          meal.pickupLongitude
        );

        // Calculer le temps restant avant expiration
        const timeRemaining = meal.expirationDate.getTime() - now.getTime();
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

        return {
          ...meal,
          distance,
          hoursRemaining,
        };
      });

      // Trier par distance si demandé
      if (filters.distance) {
        mealsWithDistance.sort((a: any, b: any) => a.distance - b.distance);
      }
    } else {
      // Calculer seulement le temps restant
      mealsWithDistance = meals.map((meal) => {
        const timeRemaining = meal.expirationDate.getTime() - now.getTime();
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

        return {
          ...meal,
          hoursRemaining,
        };
      });
    }

    return {
      meals: mealsWithDistance,
      total,
      page,
      limit,
    };
  }

  /**
   * Ajoute automatiquement un repas dans "Sauvez-les" si expiration dans 24h
   * Appelé lors de l'annulation d'une réservation ou signalement non récupéré
   */
  async addToSaveThem(mealId: string): Promise<void> {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    const now = new Date();
    const timeRemaining = meal.expirationDate.getTime() - now.getTime();
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);

    // Ajouter seulement si expiration dans moins de 24h et pas encore expiré
    if (hoursRemaining > 0 && hoursRemaining <= 24) {
      await prisma.meal.update({
        where: { id: mealId },
        data: {
          inSaveThem: true,
          status: MealStatus.AVAILABLE,
        },
      });
    }
  }

  /**
   * Job cron : Ajoute automatiquement les repas dans "Sauvez-les"
   * Vérifie tous les repas avec expirationDate - now <= 24h
   */
  async processExpiringMeals(): Promise<void> {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const expiringMeals = await prisma.meal.findMany({
      where: {
        status: MealStatus.AVAILABLE,
        inSaveThem: false,
        expirationDate: {
          gte: now,
          lte: in24Hours,
        },
      },
    });

    // Ajouter dans "Sauvez-les"
    await prisma.meal.updateMany({
      where: {
        id: {
          in: expiringMeals.map((m) => m.id),
        },
      },
      data: {
        inSaveThem: true,
      },
    });

    console.log(`✅ ${expiringMeals.length} repas ajoutés dans "Sauvez-les"`);
  }
}

export const saveThemService = new SaveThemService();
