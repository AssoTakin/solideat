# Rapport - Test flow vente de repas premium (5€/repas)

## Résumé exécutif
L'option **"Vendre ce repas"** existe bien dans l'UI (création et édition de repas) pour les utilisateurs Premium, et le backend force le prix à **5€**. En revanche, **le paiement du repas et le payout cuisinier ne sont pas implémentés**. Le prix reste un simple champ `Meal.price` en base, sans flux Stripe de paiement, sans reservation liée à un paiement, sans transfert 4€ au cuisinier, et sans webhook de confirmation de paiement repas.

## Ce qui existe

### UI
- `frontend/src/pages/CreateMeal.tsx` (l. 1426-1498) : checkbox "Vendre ce repas" visible si `isPremium`.
- `frontend/src/pages/EditMeal.tsx` (l. 648-702) : même option, visible si premium ou repas déjà payant.
- Texte affiché : "5€ (frais de service inclus), vous recevrez 4€ après la livraison, la plateforme perçoit 1€".

### Backend - création du repas
- `backend/src/services/meal.service.ts` (l. 20-39) : vérifie abonnement Premium, force `price === 5`, sinon erreur.
- `backend/prisma/schema.prisma` : champ `Meal.price Float?` (nullable).

### Stripe abonnements
- `backend/src/services/stripe.service.ts` : customer, subscriptions, checkout sessions pour les abonnements Premium (weekly/monthly/yearly).
- `backend/src/controllers/stripe.controller.ts` : webhooks abonnement (`customer.subscription.*`, `invoice.payment_*`).
- `.env.example` contient `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_WEEKLY/MONTHLY/YEARLY`.
- Build backend (`npm run build`) OK.

## Ce qui manque / ne fonctionne pas

### 1. Pas de paiement du repas par l'acheteur
- `ReserveMeal.tsx` et `MealDetails.tsx` n'affichent pas le prix et n'intègrent aucun flux de paiement Stripe.
- `backend/src/services/reservation.service.ts` `createReservation` ignore totalement `meal.price`. Une réservation est créée directement sans paiement.
- Aucun endpoint `POST /api/meals/:id/payment-intent` ou `POST /api/meals/:id/checkout`.
- Aucun `PaymentIntent` / `Checkout Session` Stripe pour les repas.

### 2. Pas de payout / virement au cuisinier
- Aucune logique de split 4€/1€.
- Aucun modèle `Payout`, `Transaction`, `Payment` en Prisma.
- Aucun champ `User.stripeConnectedAccountId` (Stripe Connect).
- `reservationService.markAsPickedUp` ne déclenche pas de transfert/payout.
- Aucun webhook `checkout.session.completed` / `payment_intent.succeeded` pour libérer le payout.

### 3. Schéma Prisma incomplet
- Manquent les entités `Transaction` (paiement), `Payout` (reversement cuisinier), et les champs `Meal.platformFeeAmount`, `Meal.netAmount`, `Reservation.paymentStatus`, `Reservation.stripePaymentIntentId`, `User.stripeConnectedAccountId`.

### 4. Webhooks Stripe limités aux abonnements
- `stripe.controller.ts` ne gère que les abonnements. Les événements liés à un paiement repas n'existent pas.

### 5. Pas de tests
- Aucun test couvrant la vente d'un repas premium, le paiement Stripe, ou le payout.

### 6. Variables d'environnement actuelles manquantes
- `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` ne sont pas définies dans l'environnement actuel du repo.

## Plan de corrections proposé

### Phase 1 - Modèle de données
1. Ajouter au schéma Prisma :
   - `User.stripeConnectedAccountId String? @unique`
   - `Meal.platformFeeAmount Float?` (1€)
   - `Meal.netAmount Float?` (4€)
   - `Reservation.paymentStatus String @default("PENDING")` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`, `PAYOUT_DONE`)
   - `Reservation.stripePaymentIntentId String? @unique`
   - `Reservation.payoutAmount Float?`
   - Nouveau modèle `Transaction` : `id`, `reservationId`, `mealId`, `buyerId`, `cookId`, `amount`, `platformFee`, `netAmount`, `currency`, `stripePaymentIntentId`, `status`, `createdAt`, `updatedAt`.
2. Générer et appliquer la migration Prisma.

### Phase 2 - Paiement de la réservation
3. Ajouter dans `backend/src/services/stripe.service.ts` :
   - `createMealPaymentIntent(reservationId, buyerCustomerId, amountCents)` -> `Stripe.PaymentIntent` (amount 500, currency 'eur', application_fee_amount 100, transfer_data.destination = connected account du cook).
   - ou `createMealCheckoutSession(...)` si on préfère Stripe Checkout.
4. Ajouter un endpoint `POST /api/reservations/:id/pay` (authentifié) qui :
   - vérifie que la réservation appartient à l'utilisateur,
   - crée le `PaymentIntent` Stripe,
   - retourne `clientSecret` au frontend.
5. Côté frontend (`ReserveMeal.tsx` / `MealDetails.tsx`) :
   - afficher le prix (5€) et la répartition 4€/1€,
   - intégrer Stripe Elements / Payment Element,
   - confirmer le paiement avec `stripe.confirmPayment`,
   - rediriger vers la réservation après succès.

### Phase 3 - Webhook et payout
6. Dans `backend/src/controllers/stripe.controller.ts`, gérer :
   - `payment_intent.succeeded` : marquer `Reservation.paymentStatus = 'PAID'`, créer la `Transaction`, envoyer notification au cuisinier.
   - `payment_intent.payment_failed` : marquer `FAILED`.
   - `checkout.session.completed` (si checkout utilisé) : idem.
7. Ajouter un endpoint ou job `POST /api/reservations/:id/payout` (ou automatique au `markAsPickedUp`) :
   - vérifier que le repas est récupéré (`pickedUpAt` et `Meal.status === 'SERVED'`),
   - vérifier `paymentStatus === 'PAID'`,
   - utiliser `stripe.transfers.create({ amount: 400, currency: 'eur', destination: cook.stripeConnectedAccountId })`,
   - marquer `Transaction.status = 'PAYOUT_DONE'` et `Reservation.paymentStatus = 'PAYOUT_DONE'`.

### Phase 4 - Stripe Connect (obligatoire pour les reversements)
8. Ajouter un onboarding Stripe Connect Express/Standard :
   - endpoint `POST /api/users/connect-account` qui crée un `Account` Stripe et un `AccountLink`,
   - stocker `stripeConnectedAccountId` sur l'utilisateur,
   - webhook `account.updated` pour activer le compte avant autoriser les payouts.

### Phase 5 - Sécurité & tests
9. Ne pas créer de repas payant sans compte Connect activé.
10. Refuser le payout si l'account Connect n'est pas `charges_enabled` et `payouts_enabled`.
11. Ajouter des tests backend (supertest + mock Stripe) et un test E2E Playwright pour le flow premium.

### Phase 6 - Configuration
12. Renommer / documenter les variables d'environnement Stripe en prod :
    - `STRIPE_SECRET_KEY`
    - `STRIPE_WEBHOOK_SECRET`
    - `STRIPE_PUBLISHABLE_KEY` (frontend)
    - `STRIPE_PRICE_ID_*`
    - `STRIPE_CONNECT_CLIENT_ID` (nouveau)

## Lignes de code clés inspectées
- `frontend/src/pages/CreateMeal.tsx:99,148,439-442,1426-1498`
- `frontend/src/pages/EditMeal.tsx:251,298-301,648-702`
- `frontend/src/pages/ReserveMeal.tsx:95-137,350-379`
- `frontend/src/pages/MealDetails.tsx:157-173`
- `backend/src/services/meal.service.ts:12-123`
- `backend/src/services/reservation.service.ts:12-156,308-359`
- `backend/src/services/stripe.service.ts:1-212`
- `backend/src/controllers/stripe.controller.ts:14-255`
- `backend/prisma/schema.prisma:86-143`
- `backend/.env.example`

## Conclusion
Le flow premium est **partiellement implémenté** : l'option de mise en vente existe, mais le **paiement Stripe du repas et le payout cuisinier sont absents**. Il faut implémenter Stripe Connect + PaymentIntent/Checkout + webhook + modèle de transactions pour rendre le flow fonctionnel.
