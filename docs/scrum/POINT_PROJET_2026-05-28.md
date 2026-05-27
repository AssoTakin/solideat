# POINT PROJET — SOLID'EAT 2026

**Date** : 28 mai 2026  
**Agent** : DEV / STABILISATION  
**Branche active** : `dev/local-work`  
**Sources** : exécution tests/build, corrections récentes (cuisine, filtres, édition premium)

---

## 1. RÉSUMÉ EXÉCUTIF

Solid'Eat 2026 a franchi ses étapes majeures de développement fonctionnel (Sprints 1 à 13). Ces derniers jours ont été consacrés à la **stabilisation fine des parcours clés** : le type de cuisine, le système de filtrage (distance, portions, cuisine, date, heure, filtres premium), la correction des pages blanches d'édition et la mise en conformité de la modification des repas pour l'option de vente Premium.

**Métriques vérifiées au 28 mai 2026 :**
- **Tests unitaires Backend** : 113/113 ✅ (14 suites Jest validées avec succès)
- **Tests unitaires Frontend** : 2/2 suites ✅ (y compris la validation de la vue `EditMeal.tsx` avec mock)
- **Typecheck global frontend & backend** : ✅ 100% OK (`npx tsc --noEmit` passe sans aucune erreur)

---

## 2. ÉTAT PAR PHASE BMAD

| Phase | Dossier | Statut | Document(s) clé(s) | Commentaire / Avancement récent |
|-------|---------|--------|-------------------|---------------------------------|
| **ANALYSE** | `/docs/analyst/` | ✅ Terminé | `ANALYSE_PROJET_SOLIDEAT.md` | Vision MVP stable |
| **SPEC (PM)** | `/docs/pm/` | ✅ Terminé | `SPECIFICATIONS_FONCTIONNELLES.md` | Spécifications fonctionnelles validées |
| **ARCHITECTURE** | `/docs/archi/` | ✅ Terminé | `ARCHITECTURE_TECHNIQUE.md` | Structure monorepo, DB Postgres + Prisma |
| **UX** | `/docs/ux/` | ✅ Terminé | `UX_DESIGN.md` | Design system implémenté |
| **STORY-CREATOR** | `/docs/story-creator/` | ✅ Terminé | `USER_STORIES.md` | 54 US définies ; stabilisation en cours |
| **SCRUM** | `/docs/scrum/` | 🟡 Partiel | Ce rapport + `POINT_PROJET_2026-05-24.md` | Suivi et points de situation réintégrés |
| **DEV** | `/docs/dev/` | ✅ Stabilisé | `walkthrough.md` | Fin des corrections sur la création/édition des repas et les filtres |
| **TESTER** | `/docs/tester/` | ❌ À structurer | — | Manque le dossier formel de test agent (tests E2E Playwright à ajouter) |

---

## 3. AVANCEMENT ET CORRECTIONS RÉCENTES (MAI 2026)

### 3.1 Type de cuisine & Filtres de recherche
- **Prisma SQL & Validation** : Ajout et application de la colonne `cuisine` dans le schéma de la base de données PostgreSQL/Prisma.
- **Backend getMeals** : Réécriture pour exécuter de façon hybride les filtres SQL et en mémoire (distance, plages horaires et notes cuisinier). Cela garantit un filtrage précis, compatible SQLite/PostgreSQL et sans fausser la pagination.
- **Frontend** : Intégration du champ select de style culinaire à la création et modification.

### 3.2 Fiche de modification & Option de vente Premium
- **Résolution Page Blanche** : Sécurisation du rendu de la carte Google Maps et des dates en cas de données incomplètes.
- **Vente de repas** : Intégration de l'option **"Vendre ce repas"** (Premium) sur la fiche de modification de repas. Les utilisateurs Premium (ou ayant initialement mis en vente leur repas) peuvent à présent l'activer ou la désactiver. Le prix de 5€ est correctement transmis au backend.

---

## 4. CE QUI RESTE INÉVITABLEMENT À FAIRE (AVANT PROD / TESTS GRANDEUR NATURE)

Pour déployer sereinement l'application auprès de vrais utilisateurs, les étapes suivantes sont **bloquantes et obligatoires** :

1. **Intégration Stripe en Production** :
   - Tester et valider les **webhooks Stripe** en mode réel (notamment les événements de renouvellement, d'annulation d'abonnement et de paiement de repas).
   - Passer les clés de test Stripe en clés réelles (`Live mode`) sécurisées.
2. **Notifications Push (PWA) de production** :
   - Configurer les clés VAPID sur l'environnement de production.
   - S'assurer que le service worker est bien enregistré sur le domaine HTTPS de production pour l'envoi de push en temps réel.
3. **Services de communication tiers** :
   - Valider et passer en mode réel les comptes **SendGrid** (e-mails transactionnels) et **Twilio** (SMS de confirmation).
4. **Mise en place de tests E2E (End-to-End)** :
   - Rédiger les scripts de tests E2E avec **Playwright** pour valider les parcours critiques : Inscription/Connexion → Création de repas → Recherche avec filtres → Réservation → Paiement Stripe.
5. **Déploiement Staging & Smoke Tests** :
   - Configurer les variables d'environnement de production sur Vercel (Frontend) et Railway (Backend).
   - Lancer un déploiement de staging pour exécuter des tests à blanc avec des testeurs restreints.

---

## 5. EVOLUTIONS FUTURES ENVISAGEABLES (POST-MVP / V2)

Une fois le modèle validé en conditions réelles, voici les chantiers d'amélioration qui pourront être développés :

1. **Intégration des Appels / Messagerie vocale** :
   - Permettre aux utilisateurs de s'appeler directement depuis l'application via un proxy (type Twilio Masked Phone Numbers) pour protéger la vie privée sans exposer les vrais numéros de téléphone.
2. **Système de Parrainage & Gamification** :
   - Intégrer un système de badges plus poussé, des défis de cuisine solidaire et des récompenses/promotions de frais de service pour stimuler le partage de repas.
3. **Optimisation des Itinéraires de Récupération** :
   - Proposer un calcul d'itinéraire optimal (via l'API Google Maps Directions) si un bénéficiaire réserve plusieurs repas lors d'une même tournée.
4. **Gestion de Profils d'Associations** :
   - Créer des accès dédiés pour les associations caritatives partenaires afin qu'elles puissent collecter des repas en lot pour les distribuer.
