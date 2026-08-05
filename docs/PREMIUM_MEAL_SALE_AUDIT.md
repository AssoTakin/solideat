# Flow vente de repas premium (5€/repas) - État actuel

| **Date** : 2026-08-04  
|**Statut** : ✅ Implémenté, testé E2E local + staging, déployé en production avec clés Stripe live  
|**Branche** : `dev/local-work` / `main` (commits `d5846e7`, `5b238b6`, `975a98e`)
|
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
| `backend/src/e2e/premium-flow.e2e.test.ts` | Test E2E premium local (6/6 pass) |
| `backend/src/e2e/premium-flow.staging.e2e.test.ts` | Test E2E premium contre Railway staging (1/1 pass) |
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

## Test E2E local (2026-08-04)

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

## Test E2E Railway staging (2026-08-04)

- Service staging : `solideat-staging` (`bcf202f3-...`), domaine `https://solideat-staging-staging.up.railway.app`
- Clés Stripe test utilisées, base de production Supabase (comptes de test nettoyés en `afterAll`)
- Le test crée un vrai PaymentIntent Stripe test, envoie un webhook `payment_intent.succeeded` signé manuellement (la livraison asynchrone Stripe vers le staging n'était pas fiable), puis marque le repas comme récupéré et vérifie `PAYOUT_DONE`
- **Résultat : 1/1 pass**

## Production (2026-08-04)

- Clés Stripe **live** injectées dans Railway production : `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Webhook Stripe production recréé : `we_1U0eVc...` pointant sur `https://api.solid-eat.com/webhooks/stripe`
- Événements webhook : `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`, abonnements
- Déploiement backend prod `f0df2211...` SUCCESS, `/api/users/stripe-config` retourne `pk_live_...`
- Les paiements en production utilisent des **vraies cartes** (pas de `pm_card_visa`)
- Les cuisiniers doivent **terminer l'onboarding Stripe Connect** avant de pouvoir vendre un repas premium

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
- Le build Railway production nécessite `typescript` dans les `dependencies` (et non les `devDependencies`) et un `Dockerfile` avec `openssl` pour Prisma.
- Les tests E2E premium sont isolés dans `backend/src/e2e/` et ignorés par `npm test` ; ils s'exécutent explicitement avec `npx jest src/e2e/premium-flow.e2e.test.ts`.

---

## Prochaines améliorations

- [x] Créer un environnement Railway **staging** avec clés Stripe test pour tester sans toucher à la production.
- [x] Ajouter des tests automatisés backend sur le flow premium (supertest + Stripe test).
- [ ] Ajouter un test E2E Playwright complet (UI) une fois `computer_use` disponible.
- [ ] Documenter la procédure d'onboarding Stripe Connect pour les cuisiniers.
- [ ] Valider un vrai paiement live de 5€ en production avec onboarding Connect complet.


## Mise à jour 2026-08-05 : modèle économique premium validé

### Choix retenu : prix psychologique 5 €, frais de transaction au cuisinier

| Poste | Montant | Commentaire |
|---|---|---|
| Prix affiché / payé par le client | 5,00 € | Prix psychologique maintenu |
| Commission Solideat (net) | 1,00 € | Ce que la plateforme encaisse réellement |
| Frais de transaction Stripe | ~0,33 € | Jamais affiché comme "Stripe" au client/cuisinier |
| Reversement net au cuisinier | 3,67 € | Transfert automatique après récupération du repas |

> **Nommage** : les frais Stripe sont présentés comme **"frais de transaction"** ou **"frais de paiement sécurisé"** dans la communication produit. Le terme "Stripe" n'apparaît pas.

### Implémentation

- `backend/src/services/stripe.service.ts`
  - Calcul des frais Stripe estimés (1,5% + 0,25€)
  - `application_fee_amount = 100 centimes (Solideat) + frais transaction`
  - Le montant net reversé au cuisinier devient `5€ − 1,33€ = 3,67€`

- `backend/src/services/meal.service.ts`
  - `platformFeeAmount = 1,33€`
  - `netAmount = 3,67€` stockés sur le repas

- `backend/src/services/reservation.service.ts`
  - `payoutAmount` calculé à partir de `meal.netAmount`

- `frontend/src/pages/CreateMeal.tsx`
  - UI mise à jour : "Vous recevrez environ 3,67€ après livraison"
  - Explication : "Frais de service + frais de transaction déduits du reversement"

### Validation live (2026-08-05)

- Paiement Stripe live de 5 € via tunnel frontend (`/payment/:reservationId`)
- `application_fee_amount` : 133 centimes
- Reversement net calculé : 367 centimes (3,67 €)
- Webhook `payment_intent.succeeded` traité correctement
- Marquage "récupéré" par le vendeur → `PAYOUT_DONE`
- Routes admin-test temporaires supprimées après validation
