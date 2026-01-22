import { z } from 'zod';

// Schéma de validation pour la création d'un avis
export const createReviewSchema = z.object({
  mealId: z.string().uuid('ID de repas invalide'),
  rating: z.number().int().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5'),
  comment: z.string().min(20, 'Le commentaire doit contenir au moins 20 caractères').max(500, 'Le commentaire ne peut pas dépasser 500 caractères'),
  photos: z.array(z.string().url()).max(3, 'Maximum 3 photos').optional(),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
