# AUDIT STRIPE - FONCTIONNALITÉS TESTÉES vs À TESTER

**Date** : 2026-08-29  
**Agent** : SolidProjectBot  
**Statut** : Inventaire des flows Stripe et identification des tests manquants

---

## ✅ CE QUI EST DÉJÀ IMPLÉMENTÉ ET TESTÉ EN RÉEL

### 1. Vente de repas Premium (5€ / repas)

| Élément | État | Preuve |
| :-- | :-- | :-- |
| Création repas payant (5€) | ✅ | `meal.service.ts` force price=5 + vérifie compte Connect |
| Réservation + paiement Stripe Elements | ✅ | `ReserveMeal.tsx` + `reservation.service.ts` |
| Destination charge (4€ cuisinier, 1€+frais plateforme) | ✅ | `stripe.service.ts:createMealPaymentIntent` |
| Webhook `payment_intent.succeeded` | ✅ | `stripe.controller.ts` |
| Marquage récupéré + `PAYOUT_DONE` | ✅ | `reservation.service.ts:payoutAfterPickup` |
| Test E2E local | ✅ | `backend/src/e2e/premium-flow.e2e.test.ts` pass |
| Test E2E staging | ✅ | `backend/src/e2e/premium-flow.staging.e2e.test.ts` pass |
| Test live en production (5€) | ✅ | `docs/PREMIUM_MEAL_SALE_AUDIT.md` |

**Conclusion** : le flow de vente de repas premium est **validé de bout en bout, y compris en production**.

---

## ⚠️ FONCTIONNALITÉS STRIPE IMPLÉMENTÉES MAIS NON TESTÉES EN RÉEL

### 2. Abonnements Premium (weekly/monthly/yearly)

| Élément | État | Commentaire |
| :-- | :-- | :-- |
| Page frontend `/subscriptions/plans` | ✅ | Affichage + choix de plan |
| Session Stripe Checkout | ✅ | `subscription.service.ts:createCheckoutSession` |
| 90 jours d'essai gratuit configurés | ✅ | `trial_period_days: 90` dans `stripe.service.ts` |
| Webhook `customer.subscription.updated` | ✅ | Met à jour `subscriptionType`, `subscriptionEnd`, `stripeSubscriptionId` |
| Webhook `customer.subscription.deleted` | ✅ | Rétrograde en FREE |
| Webhook `invoice.payment_succeeded/failed` | ✅ | Gère renouvellement/échec |
| Annulation d'abonnement | ✅ | `DELETE /api/subscriptions` |
| Réactivation d'abonnement | ✅ | `stripeService.reactivateSubscription` |
| Job cron de renouvellement | ✅ | `subscription.jobs.ts` |
| Tests E2E réels avec paiement | ⚠️ **NON VÉRIFIÉ** | Aucun doc d'audit trouvé |

**Risques identifiés** :
1. Le handler `customer.subscription.updated` **force `cancel_at: trial_end`** dès la création — cela signifie qu'un abonnement avec essai gratuit sera automatiquement annulé à la fin de la période d'essai. À vérifier si c'est l'intention produit.
2. Aucune trace de test end-to-end réel d'un abonnement Stripe Checkout (carte test 4242, webhook, annulation).
3. Le renouvellement automatique **Stripe** n'est pas testé : c'est Stripe qui renouvelle, pas notre job. Notre job ne fait que notifier/rétrograder.
4. La route `POST /api/subscriptions` (création directe avec `paymentMethodId`) semble obsolète face à Stripe Checkout.

### 3. Stripe Connect (onboarding cuisinier)

| Élément | État | Commentaire |
| :-- | :-- | :-- |
| Création compte Connect Express | ✅ | `POST /api/users/me/connect-account` |
| Lien d'onboarding | ✅ | `stripeService.createAccountLink` |
| Vérification capability `transfers` | ✅ | `isConnectedAccountReady` |
| Webhook `account.updated` | ✅ | Handler présent mais quasi vide |
| Page/interface d'onboarding côté frontend | ⚠️ | Recherche n'a trouvé aucune page dédiée |
| Test E2E onboarding Connect complet | ⚠️ **NON VÉRIFIÉ** | Le test E2E premium mock le compte Connect |

**Risques identifiés** :
1. Le handler `account.updated` ne met à jour aucun champ utilisateur (data vide). Impossible de savoir si le cuisinier a terminé son onboarding.
2. Aucune interface frontend visible pour guider le cuisinier dans l'onboarding Stripe Connect.
3. Le blocage "Vous devez configurer votre compte Stripe Connect" dans `meal.service.ts` est bon, mais l'UX pour résoudre le problème n'est pas claire.

### 4. Transferts / reversements manuels

| Élément | État | Commentaire |
| :-- | :-- | :-- |
| Transfert automatique via destination charge | ✅ | Utilisé en production |
| Méthode `transferNetAmountToCook` manuelle | ✅ | Présente mais commentée comme "normalement plus appelée" |
| Test du transfert manuel | ⚠️ **NON VÉRIFIÉ** | Pas de trace de test |

---

## 📋 SYNTHÈSE DES GAPS STRIPE À TESTER / FINALISER

| Priorité | Flow | Statut | Action recommandée |
| :-- | :-- | :-- | :-- |
| 🔴 Haute | Souscription abonnement premium via Stripe Checkout | Implémenté, non testé E2E | Lancer un test réel avec cartes Stripe test, vérifier webhook + base |
| 🔴 Haute | Renouvellement automatique d'abonnement | Implémenté, non testé | Simuler fin de période + webhook `invoice.payment_succeeded` |
| 🟡 Moyenne | Annulation d'abonnement + fin de période | Implémentée, non testée E2E | Vérifier que le client reste premium jusqu'à la fin de la période puis FREE |
| 🟡 Moyenne | Onboarding Stripe Connect complet | Handler vide + pas de page frontend | Ajouter statut onboarding en base + page frontend |
| 🟢 Basse | Réactivation d'abonnement annulé | Code présent | Vérifier que la route est exposée et testée |
| 🟢 Basse | Transfert manuel `transferNetAmountToCook` | Code mort potentiel | Supprimer ou documenter le cas d'usage |

---

## 🔧 ANOMALIES / POINTS DE CODE À VÉRIFIER

1. **`stripe.controller.ts:handleSubscriptionUpdated`** — ligne ~88 :
   ```typescript
   if (subscription.trial_end && !subscription.cancel_at) {
     await stripe.subscriptions.update(subscription.id, { cancel_at: subscription.trial_end });
   }
   ```
   **Problème** : l'abonnement est annulé automatiquement à la fin de l'essai gratuit. Cela court-circuite le renouvellement payant. À confirmer avec Sam si c'est voulu (offre de lancement 3 mois puis arrêt forcé ?).

2. **`subscription.service.ts:createSubscription`** — route `POST /api/subscriptions` : utilise `payment_behavior: 'default_incomplete'` puis tente de payer immédiatement. Cette route semble obsolète par rapport au Checkout Session utilisé par le frontend.

3. **`stripe.service.ts:renewSubscription`** — crée manuellement un invoice. Cette méthode n'est pas appelée dans le job de renouvellement. Le renouvellement est censé être entièrement géré par Stripe.

4. **`stripe.controller.ts:handleConnectAccountUpdated`** — ne met à jour aucun champ. Impossible de tracker l'état d'onboarding.

---

## 🎯 RECOMMANDATIONS IMMÉDIATES

1. **Lancer un test E2E réel d'abonnement premium** (Checkout → webhook → annulation → rétrogradation).
2. **Corriger ou justifier le `cancel_at: trial_end`** dans le webhook.
3. **Ajouter un champ `stripeConnectOnboardingComplete Boolean`** dans `User` et le mettre à jour via `account.updated`.
4. **Créer une page frontend** "Devenir vendeur / Configurer mon compte Stripe Connect".
5. **Documenter le flow abonnement** comme l'a été `PREMIUM_MEAL_SALE_AUDIT.md`.

---

**Document créé par** : SolidProjectBot  
**Dernière mise à jour** : 2026-08-29
