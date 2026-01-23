import prisma from '../config/database';
import { notificationService } from './notification.service';
import { emailService } from './email.service';

export class BadgeService {
  /**
   * Vérifie l'éligibilité aux badges et les attribue automatiquement (US-032)
   * Appelé après chaque note/review reçue
   */
  async checkAndAwardBadges(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        meals: {
          where: {
            status: 'SERVED',
          },
          include: {
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return;
    }

    // Calculer la note moyenne des repas servis
    const mealsWithReviews = user.meals.filter((meal) => meal.reviews.length > 0);
    const totalRating = mealsWithReviews.reduce((sum, meal) => {
      const mealRating = meal.reviews.reduce((s, r) => s + r.rating, 0) / meal.reviews.length;
      return sum + mealRating;
    }, 0);
    const averageRating = mealsWithReviews.length > 0 ? totalRating / mealsWithReviews.length : 0;

    // Badge X : 10 repas servis avec note moyenne >= 4.0
    if (user.mealsServed >= 10 && averageRating >= 4.0) {
      await this.awardBadge(userId, 'badge-x');
    }

    // Badge Y : 25 repas servis avec note moyenne >= 4.2
    if (user.mealsServed >= 25 && averageRating >= 4.2) {
      await this.awardBadge(userId, 'badge-y');
    }

    // Badge Cordon bleu : 50 repas servis avec note moyenne >= 4.5
    if (user.mealsServed >= 50 && averageRating >= 4.5) {
      await this.awardBadge(userId, 'badge-cordon-bleu');
    }

    // Badge "Héros anti-gaspillage" (premium uniquement) : 10 repas sauvés
    if (user.subscriptionType !== 'FREE' && (user.mealsSaved || 0) >= 10) {
      await this.awardBadge(userId, 'badge-hero-anti-gaspillage');
    }
  }

  /**
   * Attribue un badge à un utilisateur (s'il ne l'a pas déjà)
   */
  private async awardBadge(userId: string, badgeName: string): Promise<void> {
    // Vérifier si le badge existe
    let badge = await prisma.badge.findUnique({
      where: { name: badgeName },
    });

    // Créer le badge s'il n'existe pas
    if (!badge) {
      const badgeConfig = this.getBadgeConfig(badgeName);
      badge = await prisma.badge.create({
        data: {
          name: badgeName,
          description: badgeConfig.description,
          icon: badgeConfig.icon,
          condition: badgeConfig.condition,
          premiumOnly: badgeConfig.premiumOnly,
        },
      });
    }

    // Vérifier si l'utilisateur a déjà ce badge
    const existingUserBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existingUserBadge) {
      return; // L'utilisateur a déjà ce badge
    }

    // Attribuer le badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
    });

    // Envoyer une notification
    await notificationService.createNotification(
      userId,
      'BADGE_EARNED',
      'Nouveau badge obtenu !',
      `Félicitations ! Vous avez obtenu le badge "${badge.description}".`,
      '/dashboard'
    );

    // Envoyer un email (en arrière-plan)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user) {
      emailService
        .sendBadgeEarnedEmail(user.email, badge.description)
        .catch(() => {
          // Erreur silencieuse
        });
    }
  }

  /**
   * Récupère les badges d'un utilisateur
   */
  async getUserBadges(userId: string): Promise<any[]> {
    return await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });
  }

  /**
   * Configuration des badges
   */
  private getBadgeConfig(badgeName: string): {
    description: string;
    icon: string;
    condition: string;
    premiumOnly: boolean;
  } {
    const configs: Record<string, any> = {
      'badge-x': {
        description: 'Badge X',
        icon: '⭐',
        condition: '10 repas servis avec note moyenne >= 4.0',
        premiumOnly: false,
      },
      'badge-y': {
        description: 'Badge Y',
        icon: '⭐⭐',
        condition: '25 repas servis avec note moyenne >= 4.2',
        premiumOnly: false,
      },
      'badge-cordon-bleu': {
        description: 'Cordon bleu',
        icon: '👨‍🍳',
        condition: '50 repas servis avec note moyenne >= 4.5',
        premiumOnly: false,
      },
      'badge-hero-anti-gaspillage': {
        description: 'Héros anti-gaspillage',
        icon: '🌱',
        condition: '10 repas sauvés via "Sauvez-les"',
        premiumOnly: true,
      },
    };

    return configs[badgeName] || {
      description: badgeName,
      icon: '🏆',
      condition: 'Badge spécial',
      premiumOnly: false,
    };
  }
}

export const badgeService = new BadgeService();
