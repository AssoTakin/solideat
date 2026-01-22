import { z } from 'zod';

// Schéma de validation pour l'envoi d'un message
export const sendMessageSchema = z.object({
  mealId: z.string().uuid('ID de repas invalide'),
  content: z.string().min(1, 'Le message ne peut pas être vide').max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
