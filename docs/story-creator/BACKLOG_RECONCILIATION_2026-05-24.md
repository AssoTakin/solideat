# RÉCONCILIATION BACKLOG — SOLID'EAT 2026

**Date** : 24 mai 2026  
**Agent** : STORY-CREATOR  
**Sources** : audit code (`backend/src/`, `frontend/src/pages/`, `backend/tests/`), docs DEV, point SCRUM 24/05/2026  
**Tests vérifiés** : 113/113 tests unitaires backend (Jest, 24/05/2026)

---

## 1. RÉSUMÉ EXÉCUTIF

### Réponse au conflit 44/54 vs ~54/54

| Source | Chiffre | Interprétation | Verdict |
|--------|---------|----------------|---------|
| `docs/dev/COMMUNICATION_AGENTS.md` (24/04/2026) | **44/54** (81 %) | Compte les US « livrées » sans critères stricts ; document antérieur aux corrections stabilisation | **Sous-estime** le backlog réel |
| `docs/dev/RAPPORT_PRODUCTION.md` (23/01/2026) | **~54/54** (100 %) | Compte le code backend présent comme « Done », ignore écarts frontend/prod | **Sur-estime** le backlog réel |
| `docs/dev/AVANCEMENT_GLOBAL.md` | **24/54** | Document obsolète (6 sprints seulement, janvier 2026) | **Non fiable** |
| **Réconciliation STORY-CREATOR (audit 24/05/2026)** | **34 Done / 18 Partial / 2 In Progress / 0 Not Started** | Critères stricts : backend + frontend (si applicable) + tests domaine | **Chiffre défendable** |

**Conclusion** : le projet a **34 US Done (63 %)**, **20 US avec écarts documentés (37 %)**, **0 US Not Started**. En termes fonctionnels, **~52/54 US ont du code** (Partial ou mieux) ; seules **2 US sont en stabilisation active** (US-010, US-043). Le chiffre **44** correspond approximativement à un comptage « backend livré » ; le chiffre **54** ignore les écarts prod (Stripe Elements, Push VAPID, upload photos, rappels commentaires).

### Compteurs backlog

| Statut | Nombre | % |
|--------|--------|---|
| **Done** | 34 | 63 % |
| **Partial** | 18 | 33 % |
| **In Progress** | 2 | 4 % |
| **Not Started** | 0 | 0 % |
| **N/A** | 0 | 0 % |
| **Total** | **54** | 100 % |

### Par priorité

| Priorité | Done | Partial | In Progress | Total |
|----------|------|---------|-------------|-------|
| **P0** | 28 | 14 | 2 | 44 |
| **P1** | 6 | 4 | 0 | 10 |
| **P2** | 0 | 0 | 0 | 1 (US-029 Done) |

*Note : US-029 est P2 et Done.*

---

## 2. TABLEAU COMPLET DES 54 USER STORIES

| ID | Titre | P | Statut | Sprint | Pts | Preuve (audit) | Commentaire |
|----|-------|---|--------|--------|-----|----------------|-------------|
| US-001 | Inscription membre | P0 | Partial | 1 | 8 | `auth.routes.ts`, `auth.service.ts`, `Register.tsx`, `auth.service.test.ts` | Vérif. téléphone non bloquante à l'activation ; code SMS accepté sans validation Redis |
| US-002 | Vérification email | P0 | Done | 1 | 3 | `POST /auth/verify-email`, `Verify.tsx`, `auth.service.test.ts` | JWT 24h, renvoi email OK |
| US-003 | Vérification téléphone | P0 | Partial | 1 | 3 | `Verify.tsx`, `auth.service.verifyPhone()` (TODO Redis) | Code 6 chiffres UI OK ; backend accepte tout code ; login sans phoneVerified |
| US-004 | Connexion | P0 | Partial | 1 | 5 | `Login.tsx`, `auth.service.login()`, `auth.service.test.ts` | Pas de rate limiting ; connexion sans téléphone vérifié |
| US-005 | Déconnexion | P0 | Done | 1 | 2 | `POST /auth/logout`, `Navigation.tsx` | Token supprimé côté client |
| US-006 | Récupération mot de passe | P1 | Done | 10 | 5 | `ForgotPassword.tsx`, `ResetPassword.tsx`, `auth.service.sprint10.test.ts` | Email reset 1h OK |
| US-007 | Profil public | P0 | Done | 1 | 3 | `GET /users/:id`, `UserProfile.tsx`, `user.service.test.ts` | Badges, stats, compteur repas sauvés premium |
| US-008 | Modification profil | P0 | Partial | 10 | 5 | `EditProfile.tsx`, `PUT /users/me/*`, `user.service.test.ts` | Pas d'upload photo Cloudinary ; URL manuelle seulement |
| US-009 | Confidentialité Premium | P1 | Done | 10 | 3 | `PUT /users/me/privacy`, `EditProfile.tsx` (onglet), `user.service.test.ts` | hidePhoneNumber OK |
| US-010 | Création fiche repas | P0 | In Progress | 2 | 8 | `CreateMeal.tsx`, `POST /meals`, `meal.service.test.ts` | Stabilisation formulaire (commit mai 2026) ; upload photo TODO ; carte Google partielle |
| US-011 | Liste repas disponibles | P0 | Done | 2 | 5 | `MealList.tsx`, `GET /meals`, `meal-filters.test.ts` | Filtres, pagination, distance OK |
| US-012 | Détails repas | P0 | Done | 2 | 3 | `MealDetails.tsx`, `GET /meals/:id` | Boutons réserver/contacter OK |
| US-013 | Modification repas | P1 | Partial | 2 | 5 | `PUT /meals/:id`, `meal.service.updateMeal()` | **Pas de page frontend** d'édition |
| US-014 | Annulation repas | P1 | Partial | 2 | 3 | `DELETE /meals/:id`, `meal.service.ts` | Service frontend `deleteMeal` sans UI |
| US-015 | Réservation repas | P0 | Done | 3 | 8 | `ReserveMeal.tsx`, `reservation.service.ts`, `reservation.service.test.ts` | Bonus donateur intégré |
| US-016 | Mes réservations | P0 | Done | 3 | 3 | `MyReservations.tsx`, `GET /reservations` | Filtres et actions annulation OK |
| US-017 | Annulation réservation | P0 | Done | 3 | 8 | `MyReservations.tsx`, `DELETE /reservations/:id`, tests | Quotas, Sauvez-les, sanctions OK |
| US-018 | Signalement non récupéré | P0 | Partial | 3 | 8 | `POST /reservations/:id/report-not-picked-up`, `reservation.service.ts` | API backend OK ; **pas de bouton UI** cuisinier |
| US-019 | Marquage récupéré | P1 | Partial | 3 | 3 | `PUT /reservations/:id/pickup`, `reservation.service.ts` | API OK ; **pas de bouton UI** dashboard/repas |
| US-020 | Contacter cuisinier | P0 | Done | 4 | 5 | `Conversation.tsx`, `POST /messages`, `message.service.test.ts` | Modération intégrée |
| US-021 | Liste conversations | P0 | Done | 4 | 3 | `Conversations.tsx`, `GET /messages` | Tri, non lus OK |
| US-022 | Consultation conversation | P0 | Done | 4 | 3 | `Conversation.tsx`, `GET /messages/conversation/:mealId` | Marquage lu OK |
| US-023 | Modération messages | P0 | Done | 4 | 5 | `message.service.detectPhoneNumber()`, `message.service.test.ts` | Regex FR + toutes lettres |
| US-024 | Rubrique Sauvez-les | P0 | Done | 5 | 5 | `SaveThem.tsx`, `GET /meals/save-them`, `savethem.service.ts` | Compte à rebours OK |
| US-025 | Réservation Sauvez-les | P0 | Done | 5 | 3 | Réutilise `ReservationService`, `SaveThem.tsx` | Comptabilisation stats OK |
| US-026 | Impact environnemental Premium | P1 | Done | 11 | 5 | `EnvironmentalStats.tsx`, `environmental.service.test.ts` | Graphiques Chart.js |
| US-027 | Acquisition bonus donateur | P1 | Done | 11 | 5 | `bonus-donor.service.ts`, `bonus-donor.service.test.ts` | Calcul auto après repas servi |
| US-028 | Utilisation bonus donateur | P1 | Done | 11 | 3 | `ReserveMeal.tsx`, `bonus-donor.service.test.ts` | Quota 2/semaine OK |
| US-029 | Transfert bonus (Premium) | P2 | Done | 13 | 5 | `BonusDonorTransfer.tsx`, `POST /bonus-donors/:id/transfer` | UI dans Dashboard via BonusDonorList |
| US-030 | Notation obligatoire | P0 | Partial | 6 | 8 | `CreateReview.tsx`, `POST /reviews`, `review.service.test.ts` | Job rappels avec TODO ; restrictions 24h/48h/72h non appliquées |
| US-031 | Calcul note globale | P0 | Done | 6 | 3 | `review.service.calculateGlobalRating()`, tests | Impact repas non récupérés OK |
| US-032 | Attribution badges | P1 | Done | 11 | 5 | `badge.service.ts`, `BadgeList.tsx`, `badge.service.test.ts` | 4 badges + Héros anti-gaspillage |
| US-033 | Plans abonnement | P0 | Done | 9 | 3 | `SubscriptionPlans.tsx`, `GET /subscriptions/plans` | 3 plans affichés |
| US-034 | Souscription premium | P0 | Partial | 9 | 8 | `subscription.service.ts`, `stripe.service.ts`, `SubscriptionPlans.tsx` | **Stripe Elements TODO** frontend ; backend Stripe OK |
| US-035 | Consultation abonnement | P0 | Partial | 9 | 3 | `SubscriptionPlans.tsx`, `GET /subscriptions/current` | Pas d'endpoint **factures** ; pas de téléchargement |
| US-036 | Annulation abonnement | P1 | Done | 12 | 3 | `DELETE /subscriptions`, modal `SubscriptionPlans.tsx`, `subscription.service.test.ts` | Fin période en cours OK |
| US-037 | Notifications email | P0 | Partial | 8 | 8 | `email.service.ts`, `notification.service.ts` | Templates partiels ; pas tous types US ; pas de préférences activables |
| US-038 | Notifications push PWA | P1 | Partial | 12 | 5 | `push-notification.service.ts` (stub), `sw.js`, `pushNotifications.ts` | **web-push non installé** ; envoi push non fonctionnel |
| US-039 | Notifications in-app | P0 | Done | 8 | 5 | `Notifications.tsx`, `notification.routes.ts` | Centre notifs, marquer lu OK |
| US-040 | Géocodage adresse | P0 | Partial | 9 | 3 | `geolocation.service.ts`, `geolocation.service.test.ts` | Pas de **cache Redis** géocodages |
| US-041 | Calcul distance | P0 | Done | 9 | 3 | `geolocation.service.calculateDistance()`, tests | Haversine, affichage km OK |
| US-042 | Recherche avec filtres | P0 | Done | 9 | 5 | `MealFilters.tsx`, `meal-filters.test.ts` | Filtres base + premium OK |
| US-043 | Tableau de bord | P0 | In Progress | 9 | 8 | `Dashboard.tsx`, `dashboard.service.test.ts`, `dashboard.test.ts` | **Stabilisation auth 401** (commits mai 2026) |
| US-044 | Messages système | P0 | Done | 9 | 5 | `SystemMessages.tsx`, `system-messages.test.ts` | Messages obligatoires OK |
| US-045 | Sanctions annulations | P0 | Done | 9 | 8 | `sanction.service.ts`, `sanction.jobs.ts`, `sanctions.test.ts` | Plafond 4/mois OK |
| US-046 | Sanctions non récupérés | P0 | Done | 9 | 8 | `sanction.service.ts`, tests | Progression 1 puis 2/mois OK |
| US-047 | Quotas réduits | P0 | Done | 9 | 5 | `quota.service.getQuotaStatus()`, `QuotaStatus.tsx`, `quotas.test.ts` | Affichage dashboard OK |
| US-048 | Expiration repas (cron) | P0 | Done | 7 | 5 | `meal.jobs.ts` `setupMealExpirationJob` | Toutes les heures OK |
| US-049 | Ajout Sauvez-les (cron) | P0 | Done | 7 | 5 | `meal.jobs.ts` `setupSaveThemJob` | 24h avant expiration OK |
| US-050 | Rappels commentaires (cron) | P0 | Partial | 7 | 5 | `meal.jobs.ts` `setupReviewReminderJob` | Job squelette ; **TODO** notifications et restrictions |
| US-051 | Expiration bonus (cron) | P1 | Done | 13 | 3 | `bonus.jobs.ts`, `bonus-donor.service.test.ts` | Notif J-3 et J-1 OK |
| US-052 | Quotas hebdomadaires (cron) | P0 | Partial | 7 | 3 | `quota.service.ts` (calcul dynamique) | Pas de job lundi dédié ; logique par fenêtre glissante |
| US-053 | Quotas mensuels (cron) | P0 | Partial | 7 | 3 | `quota.service.ts`, `sanction.jobs.ts` | Pas de job 1er du mois ; calcul dynamique + sanctions |
| US-054 | Renouvellement abonnements | P1 | Partial | 12 | 5 | `subscription.jobs.ts`, `stripe.controller.ts` (webhooks) | Job notif OK ; **renouvellement Stripe auto incomplet** |

---

## 3. US P0 NON DONE — RESTANTES POUR MVP PROD

| ID | Titre | Statut | Blocage principal |
|----|-------|--------|-------------------|
| US-001 | Inscription | Partial | Activation sans double vérif email+téléphone |
| US-003 | Vérification téléphone | Partial | Validation code Redis absente |
| US-004 | Connexion | Partial | Rate limiting absent ; phoneVerified non exigé |
| US-008 | Modification profil | Partial | Upload photo Cloudinary |
| US-010 | Création repas | In Progress | Upload photo ; autocomplétion Maps ; bugs formulaire |
| US-013 | Modification repas | Partial | UI frontend manquante |
| US-014 | Annulation repas | Partial | UI frontend manquante |
| US-018 | Signalement non récupéré | Partial | Bouton cuisinier UI manquant |
| US-019 | Marquage récupéré | Partial | Bouton cuisinier UI manquant |
| US-030 | Notation obligatoire | Partial | Rappels/restrictions progressives non implémentés |
| US-034 | Souscription premium | Partial | Stripe Elements frontend |
| US-035 | Consultation abonnement | Partial | Historique factures |
| US-037 | Notifications email | Partial | Templates incomplets ; préférences utilisateur |
| US-040 | Géocodage | Partial | Cache Redis |
| US-043 | Tableau de bord | In Progress | Erreurs 401 session (stabilisation) |
| US-050 | Rappels commentaires | Partial | Job non fonctionnel (TODOs) |
| US-052 | Quotas hebdo | Partial | Pas de job reset explicite (acceptable si calcul OK) |
| US-053 | Quotas mensuels | Partial | Idem |

**Total P0 non Done : 18 US** (16 Partial + 2 In Progress)

---

## 4. US P1/P2 REPORTABLES POST-MVP

| ID | Titre | P | Statut | Recommandation |
|----|-------|---|--------|----------------|
| US-006 | Récupération mot de passe | P1 | Done | — |
| US-009 | Confidentialité Premium | P1 | Done | — |
| US-013 | Modification repas | P1 | Partial | Post-MVP si édition rare |
| US-014 | Annulation repas | P1 | Partial | Prioriser si cuisinier bloqué |
| US-019 | Marquage récupéré | P1 | Partial | **Prioriser** — bloque flux notation |
| US-026 | Impact environnemental | P1 | Done | — |
| US-027 | Acquisition bonus | P1 | Done | — |
| US-028 | Utilisation bonus | P1 | Done | — |
| US-032 | Badges | P1 | Done | — |
| US-036 | Annulation abonnement | P1 | Done | — |
| US-038 | Push PWA | P1 | Partial | **Report v1.1** (non bloquant MVP) |
| US-051 | Expiration bonus | P1 | Done | — |
| US-054 | Renouvellement abo | P1 | Partial | **Critique revenus** — ne pas reporter |
| US-029 | Transfert bonus | P2 | Done | — |

**Reportables sans impact MVP core** : US-038 (Push), US-013/014 (si workaround admin).

**Ne pas reporter** : US-054 (Stripe), US-019 (flux servi → avis), US-034 (monétisation).

---

## 5. INCOHÉRENCES DOCS DEV CORRIGÉES

| Document | Affirmation | Réalité audit | Action recommandée |
|----------|-------------|---------------|-------------------|
| `COMMUNICATION_AGENTS.md` | 44/54 US Done | 34 Done strict ; 44 ≈ backend-only | DEV : aligner sur 34 Done / 20 écarts |
| `RAPPORT_PRODUCTION.md` | ~54/54 (100 %) | 18 Partial + 2 In Progress | DEV : corriger en « 34 Done, stabilisation en cours » |
| `AVANCEMENT_GLOBAL.md` | 24 US, 6 sprints | Obsolète (13 sprints livrés) | DEV : archiver ou marquer deprecated |
| `POINT_SITUATION.md` | P1 « 9 stories restantes » incl. US-026–032 | US-026–032 Done depuis Sprint 11 | DEV : mettre à jour backlog restant |
| `SPRINTS_11_12_13_COMPLETE.md` | US-038 « complété » | Push stub, web-push absent | Statut Partial documenté ici |
| `RAPPORT_PRODUCTION.md` | Stripe « à finaliser » | Webhooks présents ; Stripe Elements frontend TODO | Cohérent avec US-034/054 Partial |

---

## 6. RECOMMANDATIONS SCRUM — SPRINT 14 (STABILISATION)

**Thème proposé** : Stabilisation MVP prod (pas de nouvelles US majeures)

| Priorité | US / thème | Effort estimé | Owner |
|----------|------------|---------------|-------|
| P0 | US-043 — Corriger auth 401 dashboard | 2–3 j | DEV |
| P0 | US-010 — Finaliser formulaire repas (photo, Maps) | 3–5 j | DEV |
| P0 | US-034 + US-054 — Stripe Elements + renouvellement | 3–5 j | DEV |
| P0 | US-019 + US-018 — UI actions cuisinier | 2 j | DEV |
| P0 | US-030 + US-050 — Rappels commentaires fonctionnels | 3 j | DEV |
| P1 | US-003 + US-001 — Vérif téléphone Redis | 2 j | DEV |
| P1 | US-004 — Rate limiting login | 1 j | DEV |
| P2 | US-038 — Push VAPID prod | 3 j | DEV (v1.1) |

**Definition of Done Sprint 14** : 0 US P0 en In Progress ; ≤ 5 US P0 Partial documentées ; smoke tests TESTER passants.

---

## 7. RECOMMANDATIONS TESTER — PARCOURS E2E PRIORITAIRES

Créer `/docs/tester/` avec plan basé sur cette réconciliation :

| # | Parcours | US couvertes | Priorité |
|---|----------|--------------|----------|
| 1 | Inscription → vérif email → connexion → dashboard | US-001, 002, 004, 043 | P0 |
| 2 | Création repas → liste → détails | US-010, 011, 012 | P0 |
| 3 | Réservation → mes réservations → annulation | US-015, 016, 017 | P0 |
| 4 | Messagerie repas → modération numéro | US-020, 022, 023 | P0 |
| 5 | Sauvez-les → réservation | US-024, 025 | P0 |
| 6 | Repas servi → notation obligatoire | US-019, 030, 031 | P0 |
| 7 | Souscription premium Stripe (staging) | US-033, 034, 035, 036 | P0 |
| 8 | Sanctions quotas (annulation x4) | US-045, 047 | P0 |
| 9 | Profil public + badges | US-007, 032 | P1 |
| 10 | Bonus donateur acquisition/utilisation | US-027, 028 | P1 |

**Outil recommandé** : Playwright (prévu `SPRINT_PLANNING.md`, absent du repo).

---

## 8. SYNTHÈSE MÉTHODOLOGIQUE

- **Source de vérité backlog** : `docs/story-creator/USER_STORIES.md` (mis à jour 24/05/2026)
- **Prochaine réconciliation** : après Sprint 14 stabilisation ou premier rapport TESTER
- **Règle de comptage** : Done = backend + frontend (si UI) + tests domaine ; Partial = écarts documentés

---

**Document créé par** : STORY-CREATOR  
**Prochaine étape** : TESTER (plan validation) + DEV (Sprint 14 stabilisation)
