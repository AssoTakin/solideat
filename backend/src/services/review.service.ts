import prisma from '../config/database';
import { CreateReviewDto } from '../validators/review.validator';
import { badgeService } from './badge.service';

export class ReviewService {
  /**
   * Crée un avis/notation
   */
  async createReview(userId: string, data: CreateReviewDto): Promise<any> {
    // Vérifier que le repas existe et a été servi
    const meal = await prisma.meal.findUnique({
      where: { id: data.mealId },
      include: {
        reservation: true,
        cook: true,
      },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    // Vérifier que l'utilisateur a réservé et récupéré ce repas
    if (!meal.reservation || meal.reservation.userId !== userId || !meal.reservation.pickedUpAt) {
      throw new Error('Vous n\'avez pas réservé ce repas ou il n\'a pas été récupéré');
    }

    // Vérifier qu'un avis n'existe pas déjà
    const existingReview = await prisma.review.findUnique({
      where: {
        mealId_reviewerId: {
          mealId: data.mealId,
          reviewerId: userId,
        },
      },
    });

    if (existingReview) {
      throw new Error('Vous avez déjà noté ce repas');
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        mealId: data.mealId,
        reviewerId: userId,
        cookId: meal.cookId,
        rating: data.rating,
        comment: data.comment,
        photos: data.photos || [],
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          },
        },
        meal: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    });

    // Recalculer la note globale du cuisinier
    await this.calculateGlobalRating(meal.cookId);

    // Vérifier l'éligibilité aux badges (US-032)
    badgeService.checkAndAwardBadges(meal.cookId).catch(() => {
      // Erreur silencieuse
    });

    return review;
  }

  /**
   * Calcule la note globale d'un cuisinier
   * Formule : (Somme des notes / Nombre de notes) - (Repas non récupérés × 0.5)
   */
  async calculateGlobalRating(cookId: string): Promise<number> {
    // Récupérer toutes les notes reçues
    const reviews = await prisma.review.findMany({
      where: { cookId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await prisma.user.update({
        where: { id: cookId },
        data: { globalRating: 0 },
      });
      return 0;
    }

    // Calculer la moyenne des notes
    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = sumRatings / reviews.length;

    // Compter les repas non récupérés
    const notPickedUpCount = await prisma.meal.count({
      where: {
        cookId,
        status: 'NOT_PICKED_UP',
      },
    });

    // Appliquer la pénalité
    const penalty = notPickedUpCount * 0.5;
    const globalRating = Math.max(0, averageRating - penalty);

    // Arrondir à 1 décimale
    const roundedRating = Math.round(globalRating * 10) / 10;

    // Mettre à jour la note globale
    await prisma.user.update({
      where: { id: cookId },
      data: { globalRating: roundedRating },
    });

    return roundedRating;
  }

  /**
   * Récupère les avis d'un cuisinier
   */
  async getCookReviews(cookId: string, page: number = 1, limit: number = 20): Promise<{ reviews: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { cookId },
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              profilePhoto: true,
            },
          },
          meal: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { cookId },
      }),
    ]);

    return { reviews, total };
  }
}

export const reviewService = new ReviewService();
