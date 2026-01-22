import { z } from 'zod';

// Schéma de validation pour la création d'une réservation
export const createReservationSchema = z.object({
  mealId: z.string().uuid('ID de repas invalide'),
  useBonusDonor: z.boolean().optional(),
});

export type CreateReservationDto = z.infer<typeof createReservationSchema>;

// Schéma de validation pour l'annulation d'une réservation
export const cancelReservationSchema = z.object({
  reason: z.string().min(1, 'Le motif est requis').max(200, 'Le motif ne peut pas dépasser 200 caractères'),
});

export type CancelReservationDto = z.infer<typeof cancelReservationSchema>;
