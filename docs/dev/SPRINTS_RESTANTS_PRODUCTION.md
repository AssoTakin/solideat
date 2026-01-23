# SPRINTS RESTANTS AVANT LA PRODUCTION - SOLID'EAT

**Date** : 23 janvier 2026  
**Agent** : DEV  
**Statut** : Planification des sprints restants

---

## 📊 RÉSUMÉ EXÉCUTIF

### État actuel
- **Sprints complétés** : 10 sprints ✅
- **User Stories complétées** : 44/54 (81%)
- **Points complétés** : 212/250 (85%)
- **MVP P0** : 100% complété ✅

### Sprints restants
- **3 sprints** restants avant la production
- **44 points** à compléter (P1)
- **5 points** optionnels (P2)
- **Durée estimée** : 5-6 semaines

---

## 🎯 SPRINTS RESTANTS

### ✅ Sprint 10 : Finalisation MVP P0 - COMPLÉTÉ
- **User Stories** : US-006, US-008, US-009
- **Points** : 13 points
- **Statut** : ✅ Complété le 23 janvier 2026
- **Fonctionnalités** :
  - Récupération de mot de passe
  - Modification du profil
  - Gestion de la confidentialité Premium

---

### 🔄 Sprint 11 : Fonctionnalités Premium et Bonus
**Durée estimée** : 2-3 semaines  
**Points** : 18 points  
**Priorité** : P1 (Important - MVP)

#### User Stories à implémenter :

1. **US-026** : Statistiques d'impact environnemental Premium (5 pts)
   - Calcul CO₂ évité : `repas sauvés × 2.5 kg CO2/repas`
   - Statistiques mensuelles et annuelles
   - Endpoint : `GET /users/me/environmental-impact`
   - Frontend : Composant avec graphiques (Chart.js ou Recharts)

2. **US-027** : Acquisition d'un bonus donateur (5 pts)
   - Calcul automatique : `(repas servis - repas reçus) >= 5`
   - Principe multiplicateur : `((écart - 5) / 5) + 1`
   - Validité : 2 semaines
   - Job de vérification quotidienne
   - Service `BonusDonorService` à créer

3. **US-028** : Utilisation d'un bonus donateur (3 pts)
   - Intégration dans `ReservationService.createReservation()`
   - Vérification disponibilité bonus valide
   - Quota hebdomadaire : 2 max
   - Frontend : Option dans le formulaire de réservation

4. **US-032** : Attribution automatique de badges (5 pts)
   - Service `BadgeService` à créer
   - Conditions d'attribution :
     - Badge X : 10 repas servis avec note >= 4.0
     - Badge Y : 25 repas servis avec note >= 4.2
     - Badge Cordon bleu : 50 repas servis avec note >= 4.5
     - Badge "Héros anti-gaspillage" (premium) : 10 repas sauvés
   - Job de vérification quotidienne
   - Frontend : Affichage des badges sur le profil

**Fichiers à créer** :
- Backend : `bonus-donor.service.ts`, `badge.service.ts`, `environmental.service.ts`
- Backend : `bonus-donor.controller.ts`, `badge.controller.ts`
- Backend : Routes `/bonus-donors/*`, `/badges/*`
- Backend : Jobs `bonus.jobs.ts`, `badge.jobs.ts`
- Frontend : Services correspondants
- Frontend : Composants statistiques environnementales, badges

---

### 🔄 Sprint 12 : Notifications Push et Abonnements Avancés
**Durée estimée** : 2-3 semaines  
**Points** : 18 points  
**Priorité** : P1 (Important - MVP)

#### User Stories à implémenter :

1. **US-038** : Notifications push PWA (8 pts)
   - Configuration Service Worker
   - Intégration Web Push API
   - Backend : Service de notifications push
   - Endpoint pour enregistrer les subscriptions
   - Frontend : Demande de permission, gestion des notifications

2. **US-036** : Annulation d'un abonnement (5 pts)
   - Endpoint `POST /subscriptions/:id/cancel`
   - Gestion de la fin d'abonnement
   - Rétrogradation en membre gratuit
   - Frontend : Interface d'annulation dans le dashboard

3. **US-054** : Renouvellement d'abonnements (5 pts)
   - Job quotidien de vérification
   - Renouvellement automatique via Stripe
   - Notifications d'expiration (3 jours avant)
   - Rétrogradation automatique si échec
   - Extension de `subscription.jobs.ts`

**Fichiers à créer/modifier** :
- Backend : Service de notifications push
- Backend : Extension `subscription.service.ts` et `subscription.jobs.ts`
- Frontend : Service Worker (`sw.js`)
- Frontend : Service de notifications push
- Frontend : Interface d'annulation d'abonnement

---

### 🔄 Sprint 13 : Finalisation et Fonctionnalités Avancées
**Durée estimée** : 1 semaine  
**Points** : 8 points  
**Priorité** : P1/P2 (Important/Optionnel)

#### User Stories à implémenter :

1. **US-051** : Expiration des bonus donateurs (3 pts) - P1
   - Job quotidien de vérification
   - Notification avant expiration (3 jours, 1 jour)
   - Suppression automatique des bonus expirés
   - Extension de `bonus.jobs.ts`

2. **US-029** : Transfert d'un bonus donateur (5 pts) - P1/P2
   - Endpoint `POST /bonus-donors/:id/transfer`
   - Service `BonusDonorService.transferBonus()`
   - Vérification statut premium
   - Création nouveau bonus pour bénéficiaire
   - Frontend : Interface de transfert dans le dashboard premium

**Fichiers à créer/modifier** :
- Backend : Extension `bonus-donor.service.ts` et `bonus.jobs.ts`
- Frontend : Interface de transfert de bonus

---

## 📋 BACKLOG RESTANT PAR PRIORITÉ

### P0 (Critique - MVP) : ✅ 100% COMPLÉTÉ
**Total P0 restant** : 0 points ✅

### P1 (Important - MVP) : 9 stories restantes
1. **US-026** : Statistiques d'impact environnemental (5 pts)
2. **US-027** : Acquisition d'un bonus donateur (5 pts)
3. **US-028** : Utilisation d'un bonus donateur (3 pts)
4. **US-032** : Attribution automatique de badges (5 pts)
5. **US-036** : Annulation d'abonnement (5 pts)
6. **US-038** : Notifications push (8 pts)
7. **US-051** : Expiration des bonus donateurs (3 pts)
8. **US-054** : Renouvellement d'abonnements (5 pts)
9. **US-029** : Transfert de bonus donateur (5 pts)

**Total P1 restant** : 44 points

### P2 (Souhaitable - MVP) : 1 story restante
1. **US-029** : Transfert de bonus donateur (5 pts) - Si classé P2

**Total P2 restant** : 5 points

---

## 📅 PLANNING ESTIMÉ

### Sprint 11 : Semaines 1-3
- **Objectif** : Système de bonus et badges opérationnel
- **User Stories** : US-026, US-027, US-028, US-032
- **Points** : 18 points

### Sprint 12 : Semaines 4-6
- **Objectif** : Expérience utilisateur complète avec notifications push
- **User Stories** : US-036, US-038, US-054
- **Points** : 18 points

### Sprint 13 : Semaine 7
- **Objectif** : MVP complet et fonctionnel
- **User Stories** : US-051, US-029
- **Points** : 8 points

**Durée totale estimée** : 5-6 semaines (3 sprints)

---

## 🎯 CRITÈRES DE PRODUCTION

### Fonctionnels
- [ ] Toutes les User Stories P0 complétées ✅
- [ ] Toutes les User Stories P1 complétées
- [ ] Tests unitaires > 90% de couverture
- [ ] Tests d'intégration pour les parcours critiques
- [ ] Documentation utilisateur complète

### Techniques
- [ ] Build de production sans erreurs
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée et testée
- [ ] Services externes configurés (Stripe, SendGrid, Twilio, etc.)
- [ ] Monitoring et logging configurés
- [ ] Certificats SSL configurés (HTTPS)

### Qualité
- [ ] Code review effectué
- [ ] Aucun log de debug
- [ ] Linting sans erreurs
- [ ] Performance optimisée
- [ ] Sécurité vérifiée

---

## 📊 MÉTRIQUES DE PROGRESSION

### Vélocité
- **Sprints 1-10** : 212 points en 10 sprints
- **Vélocité moyenne** : ~21 points/sprint
- **Estimation restante** : 44 points (P1) + 5 points (P2) = 49 points
- **Sprints restants estimés** : 3 sprints (5-6 semaines)

### Couverture fonctionnelle
- **MVP P0** : 100% complété ✅
- **MVP P1** : 30% complété (44 points restants)
- **MVP P2** : 0% complété (5 points restants)

---

## ⚠️ POINTS D'ATTENTION

### Techniques
1. **Services externes** : Configurer vraies clés API pour production
2. **Stripe** : Intégration complète pour abonnements (webhooks, renouvellement)
3. **PWA** : Configuration Service Worker pour notifications push
4. **Base de données** : Vérifier que toutes les migrations Prisma sont à jour
5. **Tests** : Compléter les tests pour les nouveaux services

### Fonctionnelles
1. **Bonus donateurs** : Système complet à implémenter (acquisition, utilisation, expiration, transfert)
2. **Badges** : Attribution automatique à finaliser
3. **Notifications push** : Expérience utilisateur améliorée
4. **Abonnements** : Gestion complète (annulation, renouvellement)

---

## 🚀 PROCHAINES ACTIONS IMMÉDIATES

### Sprint 11 (Priorité 1)
1. Créer le service `BonusDonorService` (backend)
2. Créer le service `BadgeService` (backend)
3. Créer le service `EnvironmentalService` (backend)
4. Implémenter les endpoints API correspondants
5. Créer les jobs cron pour vérification automatique
6. Implémenter les interfaces frontend

### Sprint 12 (Priorité 2)
1. Configurer le Service Worker (frontend)
2. Implémenter le service de notifications push (backend)
3. Implémenter l'annulation d'abonnement
4. Implémenter le renouvellement automatique d'abonnements

### Sprint 13 (Priorité 3)
1. Implémenter l'expiration des bonus donateurs
2. Implémenter le transfert de bonus donateur

---

## 📝 NOTES

- **Documentation** : Tous les documents sont à jour dans `/docs/`
- **Planification** : Référence principale : `/docs/scrum/SPRINT_PLANNING.md`
- **User Stories** : Référence complète : `/docs/story-creator/USER_STORIES.md`
- **Architecture** : Référence : `/docs/archi/ARCHITECTURE_TECHNIQUE.md`
- **Checklist déploiement** : `/docs/dev/CHECKLIST_DEPLOIEMENT.md`

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026  
**Prochaine révision** : Après Sprint 11
