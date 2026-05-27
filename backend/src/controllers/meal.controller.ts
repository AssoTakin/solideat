import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { mealService } from '../services/meal.service';
import prisma from '../config/database';

export class MealController {
  /**
   * POST /meals
   * Création d'un repas
   */
  async createMeal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const meal = await mealService.createMeal(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Repas créé avec succès',
        data: meal,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la création du repas',
      });
    }
  }

  /**
   * GET /meals
   * Liste des repas disponibles
   * Accessible avec ou sans authentification
   */
  async getMeals(req: AuthRequest | any, res: Response): Promise<void> {
    try {
      const filters: any = {
        status: req.query.status as string,
        date: req.query.date as string,
        timeSlot: (req.query.timeSlot || req.query.hour) as string, // "midi", "soir", "all" ou heure HH:MM
        cuisine: req.query.cuisine as string,
        portions: req.query.portions ? parseInt(req.query.portions as string) : undefined,
        distance: req.query.distance ? parseFloat(req.query.distance as string) : undefined,
        sortBy: req.query.sortBy as string, // "distance", "date", "rating", "expiration"
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      // Filtres avancés (premium uniquement)
      if (req.query.minRating) {
        filters.minRating = parseFloat(req.query.minRating as string);
      }
      if (req.query.preparationDate) {
        filters.preparationDate = req.query.preparationDate as string;
      }

      // Si l'utilisateur est connecté, récupérer ses coordonnées pour calculer les distances
      if (req.user && 'id' in req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { latitude: true, longitude: true, subscriptionType: true },
        });
        if (user) {
          filters.userId = req.user.id;
          filters.userLat = user.latitude;
          filters.userLng = user.longitude;
        }
      }

      const result = await mealService.getMeals(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des repas',
      });
    }
  }

  /**
   * GET /meals/:id
   * Détails d'un repas
   * Accessible avec ou sans authentification
   */
  async getMealById(req: AuthRequest | any, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Récupérer les coordonnées de l'utilisateur si connecté
      let userLat: number | undefined;
      let userLng: number | undefined;

      if (req.user && 'id' in req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { latitude: true, longitude: true },
        });
        if (user) {
          userLat = user.latitude;
          userLng = user.longitude;
        }
      }

      const meal = await mealService.getMealById(id, userLat, userLng);

      res.json({
        success: true,
        data: meal,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Repas non trouvé',
      });
    }
  }

  /**
   * PUT /meals/:id
   * Modification d'un repas
   */
  async updateMeal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const meal = await mealService.updateMeal(id, req.user!.id, req.body);

      res.json({
        success: true,
        message: 'Repas modifié avec succès',
        data: meal,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la modification du repas',
      });
    }
  }

  /**
   * DELETE /meals/:id
   * Suppression d'un repas
   */
  async deleteMeal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await mealService.deleteMeal(id, req.user!.id);

      res.json({
        success: true,
        message: 'Repas supprimé avec succès',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la suppression du repas',
      });
    }
  }
}

export const mealController = new MealController();
