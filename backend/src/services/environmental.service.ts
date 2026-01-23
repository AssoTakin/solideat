import prisma from '../config/database';

export class EnvironmentalService {
  /**
   * Calcule les statistiques d'impact environnemental pour un utilisateur
   * Formule : repas sauvés × 2.5 kg CO2/repas
   */
  async getEnvironmentalImpact(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
        mealsSaved: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur est premium
    if (user.subscriptionType === 'FREE') {
      throw new Error('Cette fonctionnalité est réservée aux membres premium');
    }

    const totalMealsSaved = user.mealsSaved || 0;
    const co2Avoided = totalMealsSaved * 2.5; // kg CO2

    // Calculer les statistiques mensuelles
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Compter les repas sauvés ce mois-ci
    // On utilise le champ mealsSaved qui est mis à jour lors des réservations "Sauvez-les"
    // Pour une vraie statistique mensuelle, il faudrait une table de logs
    // Pour l'instant, on utilise une approximation basée sur les réservations de repas "Sauvez-les"
    const monthlyMealsSaved = await prisma.reservation.count({
      where: {
        userId,
        meal: {
          inSaveThem: true,
          status: 'SERVED',
        },
        pickedUpAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculer les statistiques annuelles
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const yearlyMealsSaved = await prisma.reservation.count({
      where: {
        userId,
        meal: {
          inSaveThem: true,
          status: 'SERVED',
        },
        pickedUpAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    // Calculer les statistiques mensuelles sur les 12 derniers mois pour les graphiques
    const monthlyStats = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const mealsSavedInMonth = await prisma.reservation.count({
        where: {
          userId,
          meal: {
            inSaveThem: true,
            status: 'SERVED',
          },
          pickedUpAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyStats.push({
        month: monthStart.toISOString().substring(0, 7), // Format YYYY-MM
        mealsSaved: mealsSavedInMonth,
        co2Avoided: mealsSavedInMonth * 2.5,
      });
    }

    return {
      total: {
        mealsSaved: totalMealsSaved,
        co2Avoided: co2Avoided, // kg CO2
      },
      monthly: {
        mealsSaved: monthlyMealsSaved,
        co2Avoided: monthlyMealsSaved * 2.5, // kg CO2
      },
      yearly: {
        mealsSaved: yearlyMealsSaved,
        co2Avoided: yearlyMealsSaved * 2.5, // kg CO2
      },
      monthlyHistory: monthlyStats,
    };
  }
}

export const environmentalService = new EnvironmentalService();
