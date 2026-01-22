import { z } from 'zod';

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  phone: z.string().regex(/^\+33[1-9]\d{8}$/, 'Numéro de téléphone invalide (format: +33XXXXXXXXX)'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  username: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères').max(20, 'Le pseudo ne peut pas dépasser 20 caractères'),
  addressStreet: z.string().min(1, 'L\'adresse est requise'),
  addressZipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  addressCity: z.string().min(1, 'La ville est requise'),
  cguAccepted: z.boolean().refine((val) => val === true, 'Vous devez accepter les CGU'),
  sanitaryCharterAccepted: z.boolean().refine((val) => val === true, 'Vous devez accepter la charte sanitaire'),
  description: z.string().optional(),
  culinaryStyle: z.string().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginDto = z.infer<typeof loginSchema>;

// Schéma de validation pour la vérification email
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

// Schéma de validation pour la vérification téléphone
export const verifyPhoneSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres'),
});

export type VerifyPhoneDto = z.infer<typeof verifyPhoneSchema>;
