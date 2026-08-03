# Flow vente de repas premium (5€/repas) - État actuel

**Date** : 2026-08-01  
**Statut** : ✅ Implémenté, testé E2E en local, déployé en production  
**Branche** : `dev/local-work` (commit `b3e6f92`)

---

## Résumé exécutif

Le flow premium est **fonctionnel de bout en bout** :
- Un cuisinier Premium peut créer un repas à **5€**.
- Un mangeur Premium peut réserver et payer avec Stripe (`PaymentElement`).
- Stripe préserve **1€ de frais de plateforme** et transfère **4€** au compte Stripe Connect du cuisinier.
- Le reversement est déclenché automatiquement au moment du paiement via un `destination charge`.
- Le marquage comme récupéré finalise le statut interne (`PAYOUT_DONE`).

---

## Architecture du flux

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Cuisinier  │────▶│ Création repas │────▶│  price = 5€ forcé   │
│   Premium   │     │   Premium      │     │  vérification       │
└─────────────┘     └──────────────┘     │  compte Connect     │
                                         └─────────────────────┘
                                                       │
                                                       ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   Mangeur   │────▶│  Réservation   │────▶│ PaymentIntent 5€   │
│   Premium   │     │                │     │ application_fee 1€ │
└─────────────┘     └──────────────┘     │ transfer_data.dest  │
                                         │   → compte Connect  │
                                         └─────────────────────┘
                                                       │
                                                       ▼
                                         ┌─────────────────────┐
                                         │   Paiement Stripe     │
                                         │   4€ → cuisinier      │
                                         │   1€ → plateforme     │
                                         └─────────────────────┘
                                                       │
                                                       ▼
                                         ┌─────────────────────┐
                                         │ Webhook payment_intent│
                                         │    .succeeded         │
                                         │ Reservation = PAID    │
                                         │ Transaction créée     │
                                         └─────────────────────┘
                                                       │
                                                       ▼
                                         ┌─────────────────────┐
                                         │  Marquer récupéré     │
                                         │ Reservation = PAYOUT  │
                                         │       _DONE           │
                                         └─────────────────────┘
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `backend/src/services/meal.service.ts` | Création repas premium, prix forcé 5€, vérification compte Connect |
| `backend/src/services/reservation.service.ts` | Création réservation, `initiatePayment`, `markAsPickedUp`, `payoutAfterPickup` |
| `backend/src/services/stripe.service.ts` | `createMealPaymentIntent`, `transferNetAmountToCook`, `createConnectedAccount`, `isConnectedAccountReady` |
| `backend/src/controllers/stripe.controller.ts` | Webhook `payment_intent.succeeded` / `payment_intent.payment_failed` |
| `backend/src/routes/user.routes.ts` | `GET /api/users/stripe-config` (publishable key dynamique) |
| `backend/src/routes/stripe.routes.ts` | Routes Stripe Connect |
| `backend/prisma/schema.prisma` | `Reservation.paymentStatus`, `Reservation.stripePaymentIntentId`, `Reservation.payoutAmount`, `Reservation.payoutTransferId`, modèle `Transaction` |
| `frontend/src/pages/ReserveMeal.tsx` | Stripe Elements, `PaymentElement`, chargement clé publique dynamique |
| `frontend/src/pages/CreateMeal.tsx` | Option "Vendre ce repas", vérification compte Connect |

---

## Schéma de données

### `User`
- `stripeConnectedAccountId String? @unique` : compte Stripe Connect Express du cuisinier

### `Meal`
- `price Float?` : toujours 5€ pour les repas premium
- `platformFeeAmount Float?` : 1€
- `netAmount Float?` : 4€

### `Reservation`
- `paymentStatus String @default("PENDING")` : `PENDING`, `PAID`, `FAILED`, `REFUNDED`, `PAYOUT_DONE`
- `stripePaymentIntentId String? @unique`
- `payoutAmount Float?` : 400 (cents)
- `payoutTransferId String?`

### `Transaction`
- `reservationId`, `mealId`, `buyerId`, `cookId`
- `amount` (5), `platformFee` (1), `netAmount` (4)
- `stripePaymentIntentId`, `status` (`PAID`, `PAYOUT_DONE`)

---

## Endpoints API

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/meals` | Créer un repas (premium si `price: 5`) |
| `POST` | `/api/reservations` | Réserver un repas |
| `POST` | `/api/reservations/:id/pay` | Créer un `PaymentIntent` Stripe |
| `PUT` | `/api/reservations/:id/pickup` | Marquer récupéré + finaliser payout |
| `POST` | `/api/users/me/connect-account` | Créer un compte Stripe Connect Express |
| `GET` | `/api/users/stripe-config` | Récupérer `STRIPE_PUBLISHABLE_KEY` |
| `POST` | `/webhooks/stripe` | Recevoir événements Stripe |

---

## Logique de paiement

### Création du PaymentIntent

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 500,              // 5€
  currency: 'eur',
  application_fee_amount: 100,  // 1€ commission plateforme
  transfer_data: {
    destination: cook.stripeConnectedAccountId,  // compte Connect cuisinier
  },
  metadata: {
    reservationId: reservation.id,
    type: 'meal_payment',
  },
});
```

### Pourquoi pas de second Transfer ?

Le `destination charge` transfère automatiquement **4€** au compte Connect du cuisinier. Stripe gère le split.  
Créer un second `transfers.create` avec `source_transaction: chargeId` provoque l'erreur :

> "Transfers using this transaction as a source must not exceed the source amount"

`payoutAfterPickup` ne fait donc plus qu'un **mise à jour interne** :
- `Reservation.paymentStatus = 'PAYOUT_DONE'`
- `Reservation.payoutAmount = 400`
- `Transaction.status = 'PAYOUT_DONE'`

---

## Webhook Stripe

Événements écoutés :
- `payment_intent.succeeded` → `Reservation.paymentStatus = PAID` + création `Transaction`
- `payment_intent.payment_failed` → `Reservation.paymentStatus = FAILED`
- `account.updated` → mise à jour état compte Connect

Endpoint : `POST https://api.solid-eat.com/webhooks/stripe`

---

## Test E2E local (2026-08-01)

Clés Stripe test utilisées :
- `sk_test_...`
- `pk_test_...`

Étapes validées :
1. Création compte cook premium + compte Connect test
2. Création compte eater premium
3. Création repas premium 5€
4. Réservation
5. Initiation paiement (`/api/reservations/:id/pay`) → 200
6. Confirmation avec `pm_card_visa` → 200
7. Webhook `payment_intent.succeeded` → 200
8. `Reservation.paymentStatus = PAID`
9. Transaction créée : amount=5, platformFee=1, netAmount=4
10. Marquage récupéré → `paymentStatus = PAYOUT_DONE`, `payoutAmount = 400`

---

## Variables d'environnement

| Variable | Description | Obligatoire |
|---|---|---|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (live ou test) | ✅ |
| `STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | ✅ (sert aussi via `/api/users/stripe-config`) |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature webhook | ✅ |
| `STRIPE_PRICE_ID_WEEKLY` | Prix abonnement hebdo | ✅ abonnements |
| `STRIPE_PRICE_ID_MONTHLY` | Prix abonnement mensuel | ✅ abonnements |
| `STRIPE_PRICE_ID_YEARLY` | Prix abonnement annuel | ✅ abonnements |

---

## Contraintes en production

- Les clés Stripe en production sont en **mode live** (`sk_live_...`).
- Les cartes de test Stripe (`pm_card_visa`) ne fonctionnent qu'en mode test.
- Les cuisiniers doivent **terminer l'onboarding Stripe Connect** avant de pouvoir vendre un repas premium.
- L'helper `isConnectedAccountReady` vérifie que `transfers` capability est active avant autorisation de création de repas payant.

---

## Prochaines améliorations

- [ ] Créer un environnement Railway **staging** avec clés Stripe test pour tester sans toucher à la production.
- [ ] Ajouter des tests automatisés backend sur le flow premium (supertest + mock Stripe).
- [ ] Ajouter un test E2E Playwright complet (UI) une fois `computer_use` disponible.
- [ ] Documenter la procédure d'onboarding Stripe Connect pour les cuisiniers.
