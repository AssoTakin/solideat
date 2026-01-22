import { Prisma, MealStatus } from '@prisma/client';
import prisma from '../config/database';
import { CreateMealDto, UpdateMealDto } from '../validators/meal.validator';
import { geolocationService } from './geolocation.service';

export class MealService {
  /**
   * Crée un nouveau repas
   */
  async createMeal(userId: string, data: CreateMealDto): Promise<any> {
    // Vérifier le quota hebdomadaire
    const quota = await this.checkWeeklyQuota(userId);
    if (!quota.allowed) {
      throw new Error(`Quota hebdomadaire atteint. ${quota.message}`);
    }

    // Calculer la date d'expiration (preparationDate + 72h)
    const preparationDate = new Date(data.preparationDate);
    const expirationDate = new Date(preparationDate);
    expirationDate.setHours(expirationDate.getHours() + 72);

    // Vérifier que la date de préparation n'est pas dans le futur
    const now = new Date();
    if (preparationDate > now) {
      throw new Error('La date de préparation ne peut pas être dans le futur');
    }

    // Vérifier que la date de préparation n'est pas plus de 3 jours dans le passé
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    if (preparationDate < threeDaysAgo) {
      throw new Error('La date de préparation ne peut pas être plus de 3 jours dans le passé');
    }

    // Vérifier que l'heure de fin >= heure de début
    const pickupTimeStart = new Date(data.pickupTimeStart);
    const pickupTimeEnd = new Date(data.pickupTimeEnd);
    if (pickupTimeEnd < pickupTimeStart) {
      throw new Error('L\'heure de fin doit être supérieure ou égale à l\'heure de début');
    }

    // Créer le repas
    const meal = await prisma.meal.create({
      data: {
        name: data.name,
        photo: data.photo,
        description: data.description,
        preparationDate,
        serviceDate: new Date(data.serviceDate),
        pickupTimeStart,
        pickupTimeEnd,
        pickupAddress: data.pickupAddress,
        pickupLatitude: data.pickupLatitude,
        pickupLongitude: data.pickupLongitude,
        expirationDate,
        ingredients: data.ingredients as Prisma.JsonArray,
        portions: data.portions,
        price: data.price,
        status: MealStatus.AVAILABLE,
        cookId: userId,
      },
      include: {
        cook: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
            globalRating: true,
          },
        },
      },
    });

    // Incrémenter le compteur de repas servis
    await prisma.user.update({
      where: { id: userId },
      data: {
        mealsServed: {
          increment: 1,
        },
      },
    });

    return meal;
  }

  /**
   * Vérifie le quota hebdomadaire de repas proposés
   */
  async checkWeeklyQuota(userId: string): Promise<{ allowed: boolean; message?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Calculer le début de la semaine (lundi)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajuster pour lundi
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Compter les repas créés cette semaine
    const mealsThisWeek = await prisma.meal.count({
      where: {
        cookId: userId,
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // Quota selon le type d'abonnement
    const quota = user.subscriptionType === 'FREE' ? 1 : 3;

    if (mealsThisWeek >= quota) {
      return {
        allowed: false,
        message: `Vous avez atteint votre quota hebdomadaire (${quota} repas).`,
      };
    }

    return { allowed: true };
  }

  /**
   * Récupère la liste des repas disponibles avec filtres
   */
  async getMeals(filters: {
    status?: string;
    distance?: number; // Rayon de recherche en km
    date?: string; // Date de service ou "today" ou "this-week"
    timeSlot?: string; // "midi", "soir", "all"
    cuisine?: string; // Type de cuisine ou ingrédient principal
    portions?: number;
    page?: number;
    limit?: number;
    userLat?: number;
    userLng?: number;
    userId?: string; // Pour vérifier le statut premium
    sortBy?: string; // "distance", "date", "rating", "expiration"
    // Filtres avancés (premium uniquement)
    minRating?: number;
    preparationDate?: string;
  }): Promise<{ meals: any[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Vérifier le statut premium de l'utilisateur
    let isPremium = false;
    if (filters.userId) {
      const user = await prisma.user.findUnique({
        where: { id: filters.userId },
        select: { subscriptionType: true },
      });
      isPremium = user?.subscriptionType !== 'FREE';
    }

    // Limite de distance selon le statut
    const maxDistance = isPremium ? 20 : 15;
    const distanceFilter = filters.distance ? Math.min(filters.distance, maxDistance) : maxDistance;

    const where: Prisma.MealWhereInput = {
      status: (filters.status as MealStatus) || MealStatus.AVAILABLE,
      expirationDate: {
        gt: new Date(), // Seulement les repas non expirés
      },
    };

    // Filtre par date de service
    if (filters.date) {
      if (filters.date === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        where.serviceDate = {
          gte: today,
          lt: tomorrow,
        };
      } else if (filters.date === 'this-week') {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        where.serviceDate = {
          gte: startOfWeek,
          lt: endOfWeek,
        };
      } else {
        const serviceDate = new Date(filters.date);
        where.serviceDate = {
          gte: new Date(serviceDate.setHours(0, 0, 0, 0)),
          lt: new Date(serviceDate.setHours(23, 59, 59, 999)),
        };
      }
    }

    // Filtre par plage horaire (Midi/Soir)
    if (filters.timeSlot && filters.timeSlot !== 'all') {
      if (filters.timeSlot === 'midi') {
        // Midi : entre 11h et 15h
        where.pickupTimeStart = {
          gte: new Date('1970-01-01T11:00:00'),
          lt: new Date('1970-01-01T15:00:00'),
        };
      } else if (filters.timeSlot === 'soir') {
        // Soir : après 18h
        where.pickupTimeStart = {
          gte: new Date('1970-01-01T18:00:00'),
        };
      }
    }

    // Filtre par nombre de parts
    if (filters.portions) {
      where.portions = {
        gte: filters.portions,
      };
    }

    // Filtre par type de cuisine (recherche dans les ingrédients)
    if (filters.cuisine) {
      where.ingredients = {
        array_contains: [filters.cuisine],
      } as any;
    }

    // Filtre avancé : date de préparation (premium uniquement)
    if (isPremium && filters.preparationDate) {
      const prepDate = new Date(filters.preparationDate);
      where.preparationDate = {
        gte: new Date(prepDate.setHours(0, 0, 0, 0)),
        lt: new Date(prepDate.setHours(23, 59, 59, 999)),
      };
    }

    // Déterminer l'ordre de tri
    let orderBy: Prisma.MealOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date':
          orderBy = { serviceDate: 'asc' };
          break;
        case 'rating':
          orderBy = { cook: { globalRating: 'desc' } };
          break;
        case 'expiration':
          orderBy = { expirationDate: 'asc' };
          break;
        // Distance sera trié après le calcul
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    const meals = await prisma.meal.findMany({
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
      orderBy,
      skip,
      take: limit,
    });

    // Calculer les distances et filtrer par rayon si coordonnées utilisateur fournies
    let mealsWithDistance = meals;
    if (filters.userLat && filters.userLng) {
      mealsWithDistance = meals
        .map((meal) => {
          const distance = geolocationService.calculateDistance(
            filters.userLat!,
            filters.userLng!,
            meal.pickupLatitude,
            meal.pickupLongitude
          );
          return {
            ...meal,
            distance,
          };
        })
        .filter((meal: any) => meal.distance <= distanceFilter);

      // Trier par distance si demandé
      if (filters.sortBy === 'distance') {
        mealsWithDistance.sort((a: any, b: any) => a.distance - b.distance);
      }
    }

    // Filtre avancé : note minimale (premium uniquement)
    if (isPremium && filters.minRating) {
      mealsWithDistance = mealsWithDistance.filter(
        (meal: any) => meal.cook.globalRating >= filters.minRating!
      );
    }

    return {
      meals: mealsWithDistance,
      total: mealsWithDistance.length, // Total après filtrage par distance
      page,
      limit,
    };
  }

  /**
   * Récupère les détails d'un repas
   */
  async getMealById(mealId: string, userLat?: number, userLng?: number): Promise<any> {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        cook: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
            globalRating: true,
            mealsServed: true,
            mealsReceived: true,
            addressCity: true,
          },
        },
        reservation: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    // Calculer la distance si coordonnées utilisateur fournies
    if (userLat && userLng) {
      const distance = geolocationService.calculateDistance(
        userLat,
        userLng,
        meal.pickupLatitude,
        meal.pickupLongitude
      );
      return {
        ...meal,
        distance,
      };
    }

    return meal;
  }

  /**
   * Modifie un repas
   */
  async updateMeal(mealId: string, userId: string, data: UpdateMealDto): Promise<any> {
    // Vérifier que le repas existe et appartient à l'utilisateur
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    if (meal.cookId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce repas');
    }

    if (meal.status !== MealStatus.AVAILABLE) {
      throw new Error('Seuls les repas disponibles peuvent être modifiés');
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.serviceDate) {
      updateData.serviceDate = new Date(data.serviceDate);
    }

    if (data.pickupTimeStart && data.pickupTimeEnd) {
      const pickupTimeStart = new Date(data.pickupTimeStart);
      const pickupTimeEnd = new Date(data.pickupTimeEnd);
      if (pickupTimeEnd < pickupTimeStart) {
        throw new Error('L\'heure de fin doit être supérieure ou égale à l\'heure de début');
      }
      updateData.pickupTimeStart = pickupTimeStart;
      updateData.pickupTimeEnd = pickupTimeEnd;
    }

    if (data.pickupAddress) {
      // Re-géocoder l'adresse
      const geocodeResult = await geolocationService.validateAndGeocodeAddress(data.pickupAddress);
      updateData.pickupAddress = geocodeResult.address;
      updateData.pickupLatitude = geocodeResult.latitude;
      updateData.pickupLongitude = geocodeResult.longitude;
    }

    if (data.portions !== undefined) {
      updateData.portions = data.portions;
    }

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: updateData,
      include: {
        cook: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
            globalRating: true,
          },
        },
      },
    });

    return updatedMeal;
  }

  /**
   * Supprime un repas
   */
  async deleteMeal(mealId: string, userId: string): Promise<void> {
    // Vérifier que le repas existe et appartient à l'utilisateur
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    if (meal.cookId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer ce repas');
    }

    if (meal.status !== MealStatus.AVAILABLE) {
      throw new Error('Seuls les repas disponibles peuvent être supprimés');
    }

    await prisma.meal.delete({
      where: { id: mealId },
    });
  }


  /**
   * Formate l'heure de récupération pour l'affichage
   */
  formatPickupTime(start: Date, end: Date): string {
    const startTime = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Si les heures sont identiques, c'est une heure fixe
    if (startTime === endTime) {
      return startTime;
    }

    return `Entre ${startTime} et ${endTime}`;
  }
}

export const mealService = new MealService();
