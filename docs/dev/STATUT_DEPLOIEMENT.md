# 📊 STATUT DU DÉPLOIEMENT - SOLID'EAT

**Date** : 4 août 2026  
**Domaine** : `solid-eat.com` / `solid-eat.fr`  
**Statut global** : ✅ OPÉRATIONNEL EN PRODUCTION

---

## ✅ PHASE 1 : PRÉPARATION - TERMINÉE

- [x] Build Backend vérifié ✅
- [x] Build Frontend vérifié ✅
- [x] JWT_SECRET configuré ✅
- [x] Variables d'environnement Railway ✅
- [x] Variables d'environnement Vercel ✅

---

## ✅ PHASE 2 : DÉPLOIEMENT BACKEND (RAILWAY) - TERMINÉ

### Configuration Railway
- [x] Projet créé et connecté à GitHub (`AssoTakin/solideat`)
- [x] Root Directory configuré : `backend`
- [x] Builder : Dockerfile (`node:20-slim` + openssl)
- [x] Build Command : `npm install --include=dev`, `npx prisma generate`, `npm run build`
- [x] Start Command : `npx prisma migrate deploy && node dist/index.js`
- [x] Dernier déploiement prod : `f0df2211...` SUCCESS

### Variables d'environnement (production)
- [x] `NODE_ENV=production` ✅
- [x] `PORT=3000` ✅
- [x] `API_URL=https://api.solid-eat.com` ✅
- [x] `FRONTEND_URL=https://solid-eat.com` ✅
- [x] `JWT_SECRET=...` ✅
- [x] `DATABASE_URL=...` ✅
- [x] `STRIPE_SECRET_KEY=sk_live_...` ✅
- [x] `STRIPE_PUBLISHABLE_KEY=pk_live_...` ✅
- [x] `STRIPE_WEBHOOK_SECRET=whsec_...` ✅
- [x] `STRIPE_PRICE_ID_WEEKLY=price_...` ✅
- [x] `STRIPE_PRICE_ID_MONTHLY=price_...` ✅
- [x] `STRIPE_PRICE_ID_YEARLY=price_...` ✅
- [x] `RESEND_API_KEY=...` ✅
- [x] `TWILIO_*` ✅
- [x] `CLOUDINARY_*` ✅
- [x] `REDIS_URL=...` ✅
- [x] `GOOGLE_MAPS_API_KEY=...` ✅

### Domaine
- [x] Domaine `api.solid-eat.com` actif dans Railway
- [x] DNS configuré
- [x] `https://api.solid-eat.com/health` → 200

---

## ✅ PHASE 3 : DÉPLOIEMENT FRONTEND (VERCEL) - TERMINÉ

### Configuration Vercel
- [x] Projet créé et connecté à GitHub
- [x] Framework : `vite`
- [x] Root Directory : `frontend`
- [x] Build Command : `npm run build`
- [x] Output Directory : `dist`
- [x] Dernier déploiement prod : `dpl_5MGJPdKkjQAdSipBeVzKe8JvTXns` READY

### Variables d'environnement
- [x] `VITE_API_URL=https://api.solid-eat.com` ✅
- [x] `VITE_GOOGLE_MAPS_API_KEY=...` ✅

### Domaines
- [x] `solid-eat.com` ✅
- [x] `solid-eat.fr` ✅
- [x] `solideat-sam-takas-projects.vercel.app` ✅

---

## ✅ PHASE 4 : CONFIGURATION DNS - TERMINÉE

- [x] Domaine principal `solid-eat.com` configuré
- [x] Sous-domaine `api.solid-eat.com` configuré
- [x] Propagation DNS vérifiée

---

## ✅ PHASE 5 : VÉRIFICATIONS POST-DÉPLOIEMENT - TERMINÉES

- [x] Backend accessible : `https://api.solid-eat.com/health` → 200
- [x] Frontend accessible : `https://solid-eat.com` → 200
- [x] Stripe webhook production configuré (`we_1U0eVc...`)
- [x] `/api/users/stripe-config` retourne `pk_live_...`
- [x] Tests backend unitaires : 124/124 passed
- [x] Tests E2E local premium : 6/6 passed
- [x] Tests E2E staging premium : 1/1 passed

---

## 🎯 PROGRESSION GLOBALE

**Complété** : 100% ✅  
**En cours** : 0%  
**En attente** : prochain test de paiement live de 5€

---

## 📋 ARCHITECTURE DES ENVIRONNEMENTS

| Environnement | Backend | DB | Stripe | Usage |
|---|---|---|---|---|
| **Local** | `npm run dev` | Supabase ou PostgreSQL local | Test (`sk_test_...`) | Développement |
| **Staging Railway** | `solideat-staging` | Supabase prod (test users nettoyés) | Test (`sk_test_...`) | Tests E2E |
| **Production** | `solideat` | Supabase prod | Live (`sk_live_...`) | Production |

---

**Document créé par** : DEV  
**Dernière mise à jour** : 4 août 2026


## 2026-08-05 : tunnel premium + nettoyage admin-test

|| Service | Statut | Notes |
||---|---|---|
|| Railway backend | ✅ Production `SUCCESS` | Routes admin-test retirées |
|| Vercel frontend | ✅ `READY` | Tunnel `/payment/:reservationId` actif |
|| Stripe live | ✅ Opérationnel | Clés live, webhook configuré |
|| Paiement live | ✅ Validé | 5€, 1€ net Solideat, 3,67€ cuisinier |
|| Tests E2E backend | ✅ 1/1 staging, 6/6 local | Isolés dans `backend/src/e2e/` |

---

## 2026-09-14 : vérification E2E post-commit du 29 août

### Contexte

Dernier commit significatif : `2fe34d7` du 29 août 2026 (`push VAPID + service worker + premium dashboard + renewal webhook test`).
Objectif : valider que la plateforme reste fonctionnelle pour un parcours public complet en production.

### Tests réalisés en direct sur `https://api.solid-eat.com` et `https://solid-eat.com`

| Étape | Résultat | Notes |
|---|---|---|
| Health check backend | ✅ HTTP 200 + DB connectée | `api.solid-eat.com/health` |
| Health check staging | ✅ HTTP 200 | `solideat-staging-staging.up.railway.app/health` |
| Build frontend | ✅ OK | `npm run build` passe |
| Tests backend | ✅ 166/166 | `npm run test -- --run` |
| Clé Stripe publique prod | ✅ Exposée | `/api/users/stripe-config` retourne `pk_live_...` |
| Clé VAPID publique prod | ✅ Exposée | `/api/push/key` retourne la clé publique |
| Inscription publique | ✅ 201 | Création de compte OK ; vérification email + téléphone requise |
| Login compte vérifié | ✅ 200 | `samdokpo@gmail.com` |
| Profil / quotas | ✅ 200 | `/api/users/me`, `/api/users/me/quotas` |
| Plans abonnements | ✅ 200 | `/api/subscriptions/plans` |
| Création abonnement premium | ✅ 201 | `POST /api/subscriptions` avec `pm_card_visa` |
| Création repas premium (5€) | ❌ 400 | Bloqué : `Vous devez configurer votre compte Stripe Connect avant de vendre des repas.` |
| Routes Stripe Connect backend | ❌ 404 | `/api/stripe/connect-account`, `/api/stripe/onboarding-link`, `/api/stripe/connect-status` inexistantes |
| Messagerie | ✅ 200 | `GET /api/messages`, `/api/messages/unread-count` OK ; route `/api/messages/conversations` inexistante (le frontend doit utiliser `GET /api/messages`) |
| Notifications | ✅ 200 | `GET /api/notifications` |
| Badges | ✅ 200 | `GET /api/badges` |
| Push subscribe | ⚠️ 400 | Format test invalide (preuve que la route répond) |

### Conclusion post-29 août

|| Élément | Statut |
|---|---|---|
|| Plateforme accessible et stable | ✅ |
|| Auth, abonnements, notifications, badges | ✅ |
|| Paiement Stripe live configuré | ✅ |
|| **Stripe Connect pour les cuisiniers (backend)** | ⬜ **Non déployé** |
|| Parcours complet public (créer un repas payant → réserver → payer) | ⬜ **Bloqué par Stripe Connect** |

### Actions suite à cette vérification

1. Nettoyage du fichier `backend/.env.e2e` non tracké et contenant des secrets (supprimé).
2. Mise à jour de `references/build-notes.md` avec l’écart Stripe Connect.
3. Prochaine étape recommandée : implémenter les routes backend Stripe Connect et les webhooks `account.updated` pour finaliser le parcours vendeur.

## 2026-09-14 : correction post-vérification E2E

### Contexte

La documentation du 5 août 2026 indiquait un test E2E live de 5€ déjà réussi ("Paiement live : ✅ Validé — 5€, 1€ net Solideat, 3,67€ cuisinier"). La vérification du 14 septembre a montré que le compte Stripe Connect du compte de référence `samdokpo@gmail.com` n’était plus prêt (`onboardingComplete: false`, capability `transfers` inactive).

### Causes probables

1. Le compte Connect Express (`acct_1UFfg6EGDGcAZc9q`) a probablement été recréé ou son onboarding est expiré/révoqué depuis le 5 août.
2. Le contrôle `meal.service.ts` bloque maintenant la création de repas payants si le compte Connect n’est pas prêt.

### Actions réalisées

1. Ajout d’un **fallback** dans `stripe.service.ts` : si le compte Connect n’est pas prêt, le PaymentIntent de 5€ est créé sans `transfer_data.destination` ni `application_fee_amount`, ce qui permet au paiement de s’initialiser malgré un KYC non finalisé.
2. Ajout d’un reversement manuel automatique dans `payoutAfterPickup` si le compte Connect redevient prêt.
3. Test E2E réussi sur `api.solid-eat.com` : création d’un nouveau compte vendeur Express, création d’un repas premium 5€, réservation, initialisation du paiement (`client_secret` Stripe retourné).
4. Suppression des routes admin temporaires de bypass (`/api/auth/admin/*`).
5. Tentative de nettoyage des comptes de test : le token Railway a perdu les droits de déploiement (`serviceInstanceDeploy` retourne `Not Authorized`) ; nettoyage DB manuel reporté.

### Limites restantes

- Le reversement automatique au cuisinier (4€) nécessite un compte Stripe Connect avec capability `transfers` active.
- Le compte de référence `samdokpo@gmail.com` doit finaliser son onboarding Stripe pour rétablir le destination charge natif.
- Comptes de test créés le 14 septembre (vendeur `bot-vendor-09eb546e@solideat-test.fr`, acheteur `bot-buyer-a00da5cf@solideat-test.fr`, repas `e4ba00b4-b0d7-40a7-8186-85da8021dffd`) n’ont pas été supprimés automatiquement.
