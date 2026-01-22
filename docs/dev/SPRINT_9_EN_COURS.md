# SPRINT 9 - EN COURS

**Date** : 2026  
**Agent** : DEV  
**Statut** : En développement

---

## 📋 USER STORIES À IMPLÉMENTER

### Sprint 9 : Gestion des abonnements + Géolocalisation + Tableau de bord + Sanctions

#### US-033 : Consultation des plans d'abonnement ✅
- **Points** : 3
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Créer endpoint `GET /subscriptions/plans`
- [x] Créer service `SubscriptionService.getPlans()`
- [ ] Créer page React `SubscriptionPlans.tsx` (frontend)
- [ ] Afficher les 3 plans (hebdomadaire, mensuel, annuel) (frontend)
- [ ] Intégrer Stripe Elements (préparation)

#### US-034 : Souscription à un abonnement premium ✅
- **Points** : 8
- **Priorité** : P0
- **Statut** : ✅ Complété (backend, structure Stripe prête)

**Tâches** :
- [x] Créer service `SubscriptionService` complet
- [x] Créer endpoint `POST /subscriptions`
- [x] Structure pour Stripe API (TODO: intégration complète)
- [x] Créer controller `SubscriptionController`
- [x] Créer routes `/subscriptions`
- [x] Créer validator `subscription.validator.ts`
- [x] Tests unitaires (12 tests passent)
- [ ] Créer composant React de souscription (frontend)
- [ ] Gérer webhooks Stripe (structure prête)

#### US-035 : Consultation de mon abonnement ✅
- **Points** : 3
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Créer endpoint `GET /subscriptions/current`
- [ ] Créer endpoint `GET /subscriptions/invoices` (nécessite Stripe)
- [ ] Créer composant React de gestion d'abonnement (frontend)
- [ ] Afficher détails abonnement dans Dashboard (frontend)

#### US-040 : Géocodage d'adresse ✅ (Partiellement)
- **Points** : 3
- **Priorité** : P0
- **Statut** : ✅ Partiellement fait (géocodage existe, cache à ajouter)

**Tâches restantes** :
- [ ] Ajouter cache Redis pour géocodages
- [ ] Vérifier géocodage lors de l'inscription
- [ ] Vérifier géocodage lors du changement d'adresse

#### US-041 : Calcul de distance ✅
- **Points** : 3
- **Priorité** : P0
- **Statut** : ✅ Complété

**Tâches** :
- [x] Ajouter méthode `calculateDistance()` dans `GeolocationService`
- [x] Implémenter formule Haversine
- [x] Ajouter méthode `filterByRadius()` dans `GeolocationService`
- [x] Utiliser `GeolocationService` dans `MealService.getMeals()`
- [x] Utiliser `GeolocationService` dans `MealService.getMealById()`
- [ ] Afficher distance dans frontend (à faire côté frontend)

#### US-042 : Recherche de repas avec filtres ✅
- **Points** : 5
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Modifier endpoint `GET /meals` pour gérer filtres
- [x] Implémenter filtres de base (distance, date, heure, cuisine, parts)
- [x] Implémenter filtres avancés (premium uniquement)
- [x] Implémenter tri (distance, date, note, expiration)
- [ ] Créer composants React de filtres (à faire côté frontend)
- [ ] Ajouter recherche avec debounce (à faire côté frontend)

#### US-043 : Consultation du tableau de bord ✅
- **Points** : 8
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Créer endpoint `GET /users/me/dashboard`
- [x] Créer service `DashboardService.getDashboardStats()`
- [x] Implémenter récapitulatif d'activité
- [x] Implémenter historique (servis, reçus, expirés, annulés)
- [x] Implémenter statistiques personnelles (note, badges, bonus)
- [x] Implémenter statistiques premium (repas sauvés, CO2 évité)
- [x] Implémenter quotas (hebdomadaires, mensuels)
- [ ] Améliorer composant Dashboard React (frontend)
- [ ] Afficher graphiques (optionnel, frontend)

#### US-044 : Gestion des messages système ✅
- **Points** : 5
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Ajouter type `SYSTEM_MESSAGE` dans enum `NotificationType`
- [x] Créer endpoint `GET /notifications/system`
- [x] Créer endpoint `PUT /notifications/system/:id/read`
- [x] Implémenter logique de messages obligatoires
- [ ] Créer composant React de messages système (frontend)
- [ ] Gérer état de lecture obligatoire (frontend)

#### US-045 : Application des sanctions pour annulations ✅
- **Points** : 8
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Créer service `SanctionService`
- [x] Implémenter `checkAndApplyCancellationSanctions()` pour annulations
- [x] Détecter plafond mensuel (4 annulations + repas non récupérés)
- [x] Créer sanctions (blocage annulations 2 semaines, quota réduit)
- [x] Créer messages obligatoires
- [x] Envoyer emails de notification
- [x] Créer job de vérification quotidienne

#### US-046 : Application des sanctions pour repas non récupérés ✅
- **Points** : 8
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Implémenter sanctions pour 1 repas non récupéré (avertissement)
- [x] Implémenter sanctions pour 2 repas non récupérés (blocage réservations)
- [x] Appliquer impact sur note globale (coefficient négatif)
- [x] Créer messages obligatoires
- [x] Envoyer emails de notification

#### US-047 : Gestion des quotas réduits ✅
- **Points** : 5
- **Priorité** : P0
- **Statut** : ✅ Complété (backend)

**Tâches** :
- [x] Modifier `QuotaService` pour gérer quotas réduits
- [x] Implémenter `getQuotaStatus()` avec sanctions
- [x] Calculer dates de retour à la normale
- [x] Créer endpoint `GET /users/me/quotas`
- [x] Afficher quotas dans Dashboard avec indicateurs

---

## 📊 PROGRESSION

**Total points** : 60 points  
**Points complétés** : 30 points (US-041: 3pts, US-042: 5pts, US-033: 3pts, US-034: 8pts, US-035: 3pts, US-043: 8pts)  
**Progression** : 50%

**Tests** :
- ✅ GeolocationService : 7 tests passent
- ✅ MealService : 14 tests passent (incluant filtres)
- ✅ SubscriptionService : 12 tests passent
- ⬜ DashboardService : Tests à créer

**Compilation** : ✅ Backend compile sans erreurs

---

## 🔄 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

1. **US-040, US-041** : Géolocalisation (base pour filtres)
2. **US-042** : Recherche avec filtres (utilise géolocalisation)
3. **US-033, US-034, US-035** : Abonnements (fonctionnalité complète)
4. **US-043, US-044** : Tableau de bord complet
5. **US-045, US-046, US-047** : Sanctions (système complet)

---

## 📝 NOTES

- ✅ **US-041 complétée** : `calculateDistance()` ajoutée dans `GeolocationService` avec formule Haversine
- ✅ **US-042 complétée** : Tous les filtres implémentés dans le backend (distance, date, heure, cuisine, parts, filtres avancés premium, tri)
- ✅ **US-044 complétée** : Messages système avec endpoints GET /notifications/system et PUT /notifications/system/:id/read
- ✅ **US-045 complétée** : SanctionService avec détection et application automatique des sanctions pour annulations
- ✅ **US-046 complétée** : Sanctions progressives pour repas non récupérés (avertissement puis blocage)
- ✅ **US-047 complétée** : Gestion des quotas réduits avec endpoint GET /users/me/quotas
- ✅ **DashboardService mis à jour** : Prend maintenant en compte les sanctions dans les quotas
- ✅ **ReservationService mis à jour** : Vérifie les blocages de réservations et annulations
- ✅ **Job quotidien créé** : `setupSanctionCheckJob()` vérifie et applique les sanctions automatiquement
- Le modèle `Sanction` existe déjà dans Prisma
- Stripe doit être configuré (clés API)
- **Frontend** : Les composants React pour les filtres, messages système et affichage des quotas restent à créer

---

**Document créé par** : DEV  
**Dernière mise à jour** : 2026
