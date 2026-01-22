import { z } from 'zod';
import { SubscriptionType } from '@prisma/client';

export const createSubscriptionSchema = z.object({
  planType: z.nativeEnum(SubscriptionType, {
    errorMap: () => ({ message: 'Type d\'abonnement invalide' }),
  }),
  paymentMethodId: z.string().optional(), // Stripe payment method ID
});

export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
