# FINALISATION DES SPRINTS RESTANTS - SOLID'EAT

**Date** : 23 janvier 2026  
**Agent** : DEV  
**Statut** : En cours de finalisation

---

## ✅ SPRINT 10 - COMPLÉTÉ

- ✅ US-006 : Récupération de mot de passe
- ✅ US-008 : Modification du profil
- ✅ US-009 : Gestion de la confidentialité Premium

**Total** : 13 points ✅

---

## 🔄 SPRINTS RESTANTS À FINALISER

### Sprint 11 : Fonctionnalités Premium et Bonus (18 points)

#### US-026 : Statistiques d'impact environnemental (5 pts)
**Backend** :
- Endpoint `GET /users/me/environmental-impact` à créer
- Calcul : `repas sauvés × 2.5 kg CO2/repas`
- Statistiques mensuelles et annuelles

**Frontend** :
- Composant de statistiques environnementales
- Graphiques (Chart.js ou Recharts)
- Affichage dans le dashboard premium

#### US-027 : Acquisition bonus donateur (5 pts)
**Backend** :
- Service `BonusDonorService` à créer
- Calcul automatique : `(repas servis - repas reçus) >= 5`
- Principe multiplicateur : `((écart - 5) / 5) + 1`
- Validité : 2 semaines
- Job de vérification quotidienne

**Frontend** :
- Affichage des bonus dans le dashboard
- Notifications

#### US-028 : Utilisation bonus donateur (3 pts)
**Backend** :
- Intégration dans `ReservationService.createReservation()`
- Vérification disponibilité bonus valide
- Quota hebdomadaire : 2 max
- Marquer bonus comme utilisé

**Frontend** :
- Option "Utiliser un bonus donateur" dans le formulaire de réservation

#### US-032 : Attribution automatique badges (5 pts)
**Backend** :
- Service `BadgeService` à créer
- Conditions d'attribution :
  - Badge X : 10 repas servis avec note >= 4.0
  - Badge Y : 25 repas servis avec note >= 4.2
  - Badge Cordon bleu : 50 repas servis avec note >= 4.5
  - Badge "Héros anti-gaspillage" (premium) : 10 repas sauvés
- Vérification après chaque note/review
- Job de vérification quotidienne

**Frontend** :
- Affichage des badges sur le profil
- Notifications d'attribution

---

### Sprint 12 : Notifications Push et Abonnements (18 points)

#### US-038 : Notifications push PWA (8 pts)
**Backend** :
- Service de notifications push
- Configuration Web Push API
- Endpoint pour enregistrer les subscriptions

**Frontend** :
- Service Worker
- Demande de permission
- Gestion des notifications push

#### US-036 : Annulation abonnement (5 pts)
**Backend** :
- Endpoint `POST /subscriptions/:id/cancel`
- Gestion de la fin d'abonnement
- Rétrogradation en membre gratuit

**Frontend** :
- Interface d'annulation dans le dashboard

#### US-054 : Renouvellement abonnements (5 pts)
**Backend** :
- Job quotidien de vérification
- Renouvellement automatique via Stripe
- Notifications d'expiration (3 jours avant)
- Rétrogradation automatique si échec

**Frontend** :
- Notifications dans l'app

---

### Sprint 13 : Finalisation (8 points)

#### US-051 : Expiration bonus donateurs (3 pts)
**Backend** :
- Job quotidien de vérification
- Notification avant expiration (3 jours, 1 jour)
- Suppression automatique des bonus expirés

**Frontend** :
- Notifications

#### US-029 : Transfert bonus donateur (5 pts)
**Backend** :
- Endpoint `POST /bonus-donors/:id/transfer`
- Service `BonusDonorService.transferBonus()`
- Vérification statut premium
- Création nouveau bonus pour bénéficiaire

**Frontend** :
- Interface de transfert dans le dashboard premium

---

## 📋 STRUCTURE À CRÉER

### Backend Services
- `bonus-donor.service.ts` : Gestion des bonus donateurs
- `badge.service.ts` : Gestion des badges
- `environmental.service.ts` : Statistiques environnementales

### Backend Controllers
- `bonus-donor.controller.ts`
- `badge.controller.ts`
- Extension de `user.controller.ts` pour statistiques environnementales

### Backend Routes
- `/bonus-donors/*`
- `/badges/*`
- Extension de `/users/me/environmental-impact`

### Backend Jobs
- `bonus.jobs.ts` : Vérification acquisition et expiration
- `badge.jobs.ts` : Vérification attribution badges
- Extension de `subscription.jobs.ts` pour renouvellement

### Frontend Services
- `bonus-donor.service.ts`
- `badge.service.ts`
- `environmental.service.ts`

### Frontend Pages/Components
- Composant statistiques environnementales
- Interface de transfert de bonus
- Extension du formulaire de réservation pour bonus
- Notifications push (Service Worker)

---

## ⚠️ NOTES IMPORTANTES

1. **Tests** : Tous les services doivent avoir des tests unitaires
2. **Validation** : Utiliser Zod pour toutes les validations
3. **Sécurité** : Vérifier les permissions (premium, authentification)
4. **Notifications** : Implémenter les notifications email + app
5. **Jobs Cron** : Configurer tous les jobs nécessaires

---

## 🎯 PRIORITÉS

1. **Sprint 11** : Fonctionnalités Premium et Bonus (essentiel pour MVP)
2. **Sprint 12** : Notifications Push et Abonnements (amélioration UX)
3. **Sprint 13** : Finalisation (fonctionnalités optionnelles)

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
