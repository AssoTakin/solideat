import { z } from 'zod';

// Schéma de validation pour la création d'un repas
export const createMealSchema = z.object({
  name: z.string().min(1, 'Le nom du repas est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  photo: z.string().url('URL de photo invalide'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  cuisine: z.string().optional().nullable(),
  preparationDate: z.string().datetime().or(z.date()),
  serviceDate: z.string().datetime().or(z.date()),
  pickupTimeStart: z.string().datetime().or(z.date()),
  pickupTimeEnd: z.string().datetime().or(z.date()),
  pickupAddress: z.string().min(1, 'L\'adresse de récupération est requise'),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      allergens: z.array(z.string()).optional(),
    })
  ).min(3, 'Au moins 3 ingrédients sont requis'),
  portions: z.number().int().min(1).max(4),
  price: z.number().min(0).optional().nullable(),
});

export type CreateMealDto = z.infer<typeof createMealSchema>;

// Schéma de validation pour la modification d'un repas
export const updateMealSchema = z.object({
  description: z.string().max(500).optional(),
  cuisine: z.string().optional().nullable(),
  serviceDate: z.string().datetime().or(z.date()).optional(),
  pickupTimeStart: z.string().datetime().or(z.date()).optional(),
  pickupTimeEnd: z.string().datetime().or(z.date()).optional(),
  pickupAddress: z.string().optional(),
  pickupLatitude: z.number().optional(),
  pickupLongitude: z.number().optional(),
  portions: z.number().int().min(1).max(4).optional(),
  price: z.number().min(0).optional().nullable(),
}).partial();

export type UpdateMealDto = z.infer<typeof updateMealSchema>;
