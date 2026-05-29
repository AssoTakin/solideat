import { Router } from 'express';
import { mealController } from '../controllers/meal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createMealSchema, updateMealSchema } from '../validators/meal.validator';

const router = Router();

// Création d'un repas (nécessite authentification)
router.post('/', authenticate, validate(createMealSchema), mealController.createMeal.bind(mealController));

// Liste des repas (accessible sans authentification, mais avec coordonnées si connecté)
// Le controller gère les deux cas (avec ou sans authentification)
router.get('/', mealController.getMeals.bind(mealController));

// Repas "Sauvez-les" (accessible sans authentification, mais avec coordonnées si connecté)
import { saveThemController } from '../controllers/savethem.controller';
router.get('/save-them', saveThemController.getSaveThemMeals.bind(saveThemController));

// Détails d'un repas (accessible sans authentification)
router.get('/:id', mealController.getMealById.bind(mealController));

// Modification d'un repas (nécessite authentification)
router.put('/:id', authenticate, validate(updateMealSchema), mealController.updateMeal.bind(mealController));

// Suppression d'un repas (nécessite authentification)
router.delete('/:id', authenticate, mealController.deleteMeal.bind(mealController));

export default router;
