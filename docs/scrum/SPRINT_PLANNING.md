# PLANIFICATION SPRINT - SOLID'EAT

**Date de création** : 2026  
**Agent** : SCRUM-MASTER  
**Statut** : Planification avant développement  
**Basé sur** : 
- ANALYSE_PROJET_SOLIDEAT.md (Agent ANALYST)
- SPECIFICATIONS_FONCTIONNELLES.md (Agent PM)
- ARCHITECTURE_TECHNIQUE.md (Agent ARCHITECT)
- USER_STORIES.md (Agent STORY-CREATOR)
- UX_DESIGN.md (Agent UX)

---

## TABLE DES MATIÈRES

1. [État des lieux](#1-état-des-lieux)
2. [Prérequis avant développement](#2-prérequis-avant-développement)
3. [Backlog priorisé Sprint 1](#3-backlog-priorisé-sprint-1)
4. [Dépendances techniques](#4-dépendances-techniques)
5. [Environnement de développement](#5-environnement-de-développement)
6. [Stratégie de tests](#6-stratégie-de-tests)
7. [Gestion Git et versioning](#7-gestion-git-et-versioning)
8. [Critères de définition de "Done"](#8-critères-de-définition-de-done)
9. [Workflow de validation](#9-workflow-de-validation)
10. [Risques et points d'attention](#10-risques-et-points-dattention)

---

## 1. ÉTAT DES LIEUX

### 1.1 Documents disponibles

✅ **ANALYST** : `/docs/analyst/ANALYSE_PROJET_SOLIDEAT.md`
- Analyse complète du projet
- Vision globale et fonctionnalités principales
- Contraintes et objectifs MVP

✅ **PM** : `/docs/pm/SPECIFICATIONS_FONCTIONNELLES.md`
- Spécifications fonctionnelles détaillées
- Règles métier complètes
- Cas d'usage détaillés

✅ **ARCHITECT** : `/docs/archi/ARCHITECTURE_TECHNIQUE.md`
- Stack technique définie (React + Node.js + PostgreSQL)
- Architecture système complète
- Modèle de données
- Intégrations externes (Google Maps, Stripe, Twilio, SendGrid)

✅ **STORY-CREATOR** : `/docs/story-creator/USER_STORIES.md`
- 54 User Stories complètes avec critères d'acceptation
- Priorisation P0/P1/P2
- Estimations en points (Fibonacci)
- Dépendances identifiées

✅ **UX** : `/docs/ux/UX_DESIGN.md`
- Design System complet
- Wireframes et maquettes
- Principes d'interaction
- Guidelines d'accessibilité et responsive

### 1.2 Statut de préparation

**✅ PRÊT POUR DÉVELOPPEMENT**

Tous les documents nécessaires sont disponibles et complets. Le projet est prêt pour la phase de développement.

---

## 2. PRÉREQUIS AVANT DÉVELOPPEMENT

### 2.1 Checklist technique

Avant de commencer le développement, il faut s'assurer que :

- [ ] **Environnement de développement configuré**
  - Node.js 18+ installé
  - PostgreSQL 15+ installé et configuré
  - Redis 7+ installé et configuré
  - Git configuré

- [ ] **Comptes API externes créés**
  - [ ] Google Maps API (clé API pour géocodage)
  - [ ] Stripe (compte de test pour paiements)
  - [ ] Twilio (compte pour SMS)
  - [ ] SendGrid (compte pour emails)
  - [ ] Cloudinary ou AWS S3 (stockage fichiers)

- [ ] **Structure du projet initialisée**
  - [ ] Repository Git créé
  - [ ] Structure de dossiers backend/frontend
  - [ ] Configuration TypeScript
  - [ ] Configuration ESLint/Prettier
  - [ ] Fichiers .env.example créés

- [ ] **Base de données initialisée**
  - [ ] Schéma Prisma créé (basé sur ARCHITECTURE_TECHNIQUE.md)
  - [ ] Migrations initiales
  - [ ] Seeds pour données de test

### 2.2 Dépendances critiques

**Dépendances fonctionnelles** (ordre de développement recommandé) :

1. **Fondations** (Sprint 1)
   - US-001 : Inscription → Base pour toutes les autres fonctionnalités
   - US-002 : Vérification email
   - US-003 : Vérification téléphone
   - US-004 : Connexion → Nécessaire pour toutes les pages authentifiées

2. **Gestion des repas** (Sprint 2)
   - US-010 : Création de repas → Dépend de US-001, US-004
   - US-011 : Modification de repas
   - US-012 : Suppression de repas

3. **Réservations** (Sprint 3)
   - US-015 : Réservation → Dépend de US-010
   - US-016 : Annulation de réservation

4. **Fonctionnalités avancées** (Sprints suivants)
   - Messagerie, "Sauvez-les", Notation, Abonnements, etc.

---

## 3. BACKLOG PRIORISÉ SPRINT 1

### 3.1 Objectif du Sprint 1

**Objectif** : Mettre en place les fondations de l'application (authentification et gestion des utilisateurs de base)

**Durée estimée** : 2 semaines  
**Vélocité cible** : 20-25 points

### 3.2 User Stories Sprint 1

#### US-001 : Inscription d'un nouveau membre
- **Priorité** : P0
- **Estimation** : 8 points
- **Dépendances** : Aucune (fondation)
- **Tâches principales** :
  - Backend : Endpoint POST /auth/register
  - Backend : Validation Zod
  - Backend : Intégration Google Maps Geocoding
  - Backend : Services email (SendGrid) et SMS (Twilio)
  - Backend : Modèle Prisma User
  - Frontend : Composant d'inscription
  - Frontend : Gestion des états de vérification

#### US-002 : Vérification de l'email
- **Priorité** : P0
- **Estimation** : 3 points
- **Dépendances** : US-001
- **Tâches principales** :
  - Backend : Endpoint POST /auth/verify-email
  - Backend : Génération token de vérification
  - Backend : Template email
  - Frontend : Page de vérification

#### US-003 : Vérification du téléphone
- **Priorité** : P0
- **Estimation** : 3 points
- **Dépendances** : US-001
- **Tâches principales** :
  - Backend : Endpoint POST /auth/verify-phone
  - Backend : Génération code 6 chiffres
  - Backend : Intégration Twilio SMS
  - Frontend : Composant de vérification téléphone

#### US-004 : Connexion à la plateforme
- **Priorité** : P0
- **Estimation** : 5 points
- **Dépendances** : US-001, US-002, US-003
- **Tâches principales** :
  - Backend : Endpoint POST /auth/login
  - Backend : Génération JWT
  - Backend : Rate limiting (Redis)
  - Backend : Middleware d'authentification
  - Frontend : Composant de connexion
  - Frontend : Gestion du token

#### US-005 : Déconnexion
- **Priorité** : P0
- **Estimation** : 2 points
- **Dépendances** : US-004
- **Tâches principales** :
  - Backend : Endpoint POST /auth/logout
  - Frontend : Fonction de déconnexion

#### US-007 : Consultation du profil public
- **Priorité** : P0
- **Estimation** : 3 points
- **Dépendances** : US-001
- **Tâches principales** :
  - Backend : Endpoint GET /users/:id
  - Backend : Filtrage des données sensibles
  - Frontend : Composant de profil public

**Total Sprint 1** : 24 points

### 3.3 Tâches techniques transverses Sprint 1

- [ ] **Configuration projet**
  - [ ] Initialisation backend (Express + TypeScript + Prisma)
  - [ ] Initialisation frontend (React + TypeScript + Vite)
  - [ ] Configuration ESLint/Prettier
  - [ ] Configuration Git (branches, .gitignore)

- [ ] **Base de données**
  - [ ] Schéma Prisma User (basé sur ARCHITECTURE_TECHNIQUE.md)
  - [ ] Migration initiale
  - [ ] Seeds pour données de test

- [ ] **Infrastructure**
  - [ ] Configuration Redis (sessions, rate limiting)
  - [ ] Configuration variables d'environnement (.env)
  - [ ] Configuration Docker (optionnel pour MVP)

- [ ] **Intégrations externes**
  - [ ] Configuration Google Maps API
  - [ ] Configuration SendGrid (emails)
  - [ ] Configuration Twilio (SMS)
  - [ ] Configuration Cloudinary (upload fichiers)

---

## 4. DÉPENDANCES TECHNIQUES

### 4.1 Dépendances entre User Stories

**Ordre de développement recommandé** :

```
US-001 (Inscription)
  ├── US-002 (Vérification email)
  ├── US-003 (Vérification téléphone)
  └── US-004 (Connexion)
      └── US-005 (Déconnexion)

US-001 (Inscription)
  └── US-007 (Profil public)
```

### 4.2 Dépendances techniques

**Services externes requis** :
- Google Maps API : Géocodage des adresses
- SendGrid : Envoi d'emails de vérification
- Twilio : Envoi de SMS de vérification
- Cloudinary/S3 : Stockage des photos de profil (optionnel Sprint 1)

**Infrastructure requise** :
- PostgreSQL : Base de données principale
- Redis : Cache, sessions, rate limiting

---

## 5. ENVIRONNEMENT DE DÉVELOPPEMENT

### 5.1 Stack technique (confirmée)

**Frontend** :
- React 18+ avec TypeScript
- Vite (bundler)
- React Router v6
- Material-UI ou Chakra UI
- React Hook Form + Zod
- Axios

**Backend** :
- Node.js 18+ avec Express.js et TypeScript
- Prisma (ORM)
- Zod (validation)
- Passport.js + JWT (authentification)
- Nodemailer + SendGrid (emails)
- Twilio (SMS)
- Bull + Redis (tâches asynchrones)
- node-cron (cron jobs)

**Base de données** :
- PostgreSQL 15+
- Redis 7+

### 5.2 Structure de dossiers recommandée

```
solideat/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── public/
├── docs/
│   ├── analyst/
│   ├── pm/
│   ├── archi/
│   ├── story-creator/
│   ├── ux/
│   └── scrum/
└── README.md
```

---

## 6. STRATÉGIE DE TESTS

### 6.1 Principes de test

**Règle d'or** : **Aucune User Story ne peut être considérée comme "Done" sans tests validés. Aucune étape suivante ne peut être commencée tant que les tests de l'étape précédente ne sont pas tous au vert.**

**Pyramide de tests** :
```
        /\
       /E2E\        ← Tests End-to-End (10%)
      /------\
     /  Intégration \  ← Tests d'intégration (30%)
    /----------------\
   /    Unitaires      \  ← Tests unitaires (60%)
  /----------------------\
```

### 6.2 Types de tests

#### 6.2.1 Tests unitaires

**Objectif** : Tester les fonctions, méthodes et composants de manière isolée.

**Backend** :
- **Outils** : Jest + Supertest
- **Couverture cible** : > 80% pour les services et controllers
- **Exemples** :
  - Services de validation (Zod schemas)
  - Services métier (calculs de quotas, expiration)
  - Utilitaires (hashage, formatage)
  - Controllers (logique de traitement)

**Frontend** :
- **Outils** : Vitest + React Testing Library
- **Couverture cible** : > 70% pour les composants critiques
- **Exemples** :
  - Composants de formulaire (validation)
  - Hooks personnalisés
  - Utilitaires (formatage dates, calculs)
  - Services API (mocks)

**Critères de validation** :
- [ ] Tous les tests unitaires passent (`npm test`)
- [ ] Couverture minimale atteinte
- [ ] Pas de tests en échec
- [ ] Pas de tests ignorés (skip/pending)

#### 6.2.2 Tests d'intégration

**Objectif** : Tester l'interaction entre plusieurs composants/modules.

**Backend** :
- **Outils** : Jest + Supertest + Base de données de test
- **Couverture** : Tous les endpoints API
- **Exemples** :
  - Endpoints d'authentification (register, login, verify)
  - Endpoints CRUD (repas, réservations)
  - Intégration avec services externes (mocks)
  - Validation des règles métier complexes

**Frontend** :
- **Outils** : Vitest + React Testing Library + MSW (Mock Service Worker)
- **Couverture** : Flux utilisateur complets
- **Exemples** :
  - Flux d'inscription complet
  - Flux de connexion
  - Flux de création de repas
  - Gestion des erreurs API

**Critères de validation** :
- [ ] Tous les endpoints testés
- [ ] Cas de succès et d'erreur couverts
- [ ] Tests avec base de données de test isolée
- [ ] Mocks des services externes fonctionnels

#### 6.2.3 Tests End-to-End (E2E)

**Objectif** : Tester les parcours utilisateur complets dans un environnement proche de la production.

**Outils** : Playwright (recommandé) ou Cypress

**Parcours critiques à tester** :
1. **Inscription complète** :
   - Remplir le formulaire
   - Vérifier email
   - Vérifier téléphone
   - Accès au tableau de bord

2. **Connexion et navigation** :
   - Connexion avec identifiants valides
   - Accès aux pages protégées
   - Déconnexion

3. **Création de repas** :
   - Créer un repas complet
   - Upload photo
   - Validation et publication

4. **Réservation** :
   - Rechercher un repas
   - Réserver un repas
   - Voir la réservation dans le tableau de bord

**Critères de validation** :
- [ ] Parcours critiques testés
- [ ] Tests exécutables en CI/CD
- [ ] Screenshots en cas d'échec
- [ ] Tests sur navigateurs multiples (Chrome, Firefox)

### 6.3 Workflow de tests par User Story

**Pour chaque User Story, suivre ce workflow** :

```
1. Développement
   ↓
2. Tests unitaires (TDD recommandé)
   ↓
3. Tests d'intégration
   ↓
4. Tests manuels (validation UX)
   ↓
5. Tests E2E (si parcours critique)
   ↓
6. Validation "Done"
   ↓
7. Passage à l'étape suivante
```

**Checkpoint obligatoire** : Les tests doivent tous être au vert avant de commencer une nouvelle User Story dépendante.

### 6.4 Configuration des tests

**Backend** (`backend/package.json`) :
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js"
  }
}
```

**Frontend** (`frontend/package.json`) :
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

### 6.5 Tests dans le CI/CD

**Pipeline de tests** (à configurer avec GitHub Actions, GitLab CI, etc.) :

```yaml
# Exemple GitHub Actions
- Lint (ESLint)
- Tests unitaires backend (avec couverture)
- Tests unitaires frontend (avec couverture)
- Tests d'intégration backend
- Tests E2E (sur environnement de staging)
- Build production
```

**Règle** : Le pipeline doit échouer si :
- Un test échoue
- La couverture de code est inférieure au seuil
- Le linting échoue
- Le build échoue

### 6.6 Mocks et données de test

**Services externes** :
- Google Maps API : Mocker les réponses de géocodage
- SendGrid : Utiliser le mode test (pas d'envoi réel)
- Twilio : Utiliser le mode test (pas d'envoi réel)
- Stripe : Utiliser les clés de test

**Base de données de test** :
- Base PostgreSQL dédiée pour les tests
- Seeds pour données de test reproductibles
- Reset de la base avant chaque suite de tests

---

## 7. GESTION GIT ET VERSIONING

### 7.1 Workflow Git (Git Flow adapté)

**Branches principales** :
- `main` : Code en production (protégée, merge uniquement via PR)
- `develop` : Code de développement (branche d'intégration)
- `feature/US-XXX` : Branches pour chaque User Story
- `hotfix/XXX` : Corrections urgentes en production
- `release/vX.X.X` : Préparation de release

### 7.2 Convention de nommage des branches

**Format** : `type/US-XXX-description-courte`

**Types** :
- `feature/` : Nouvelles fonctionnalités (User Stories)
- `bugfix/` : Corrections de bugs
- `hotfix/` : Corrections urgentes
- `refactor/` : Refactorisation
- `test/` : Ajout/amélioration de tests
- `docs/` : Documentation

**Exemples** :
- `feature/US-001-inscription-membre`
- `bugfix/US-015-correction-reservation`
- `test/US-010-tests-creation-repas`

### 7.3 Convention de commits

**Format** : `type(scope): description courte`

**Types** :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `test` : Ajout/modification de tests
- `docs` : Documentation
- `refactor` : Refactorisation
- `style` : Formatage (pas de changement de code)
- `chore` : Tâches de maintenance
- `perf` : Amélioration de performance

**Scopes** (optionnel) :
- `auth` : Authentification
- `meal` : Gestion des repas
- `reservation` : Réservations
- `user` : Gestion utilisateurs
- `api` : API backend
- `ui` : Interface utilisateur

**Exemples** :
```
feat(auth): implémentation inscription avec vérification email
fix(meal): correction calcul expiration repas
test(reservation): ajout tests intégration réservation
docs(api): mise à jour documentation Swagger
refactor(user): simplification service profil
```

**Règles** :
- Message en français (cohérent avec le projet)
- Description courte (max 50 caractères)
- Corps du commit optionnel pour détails
- Référence à la User Story si applicable : `[US-001]`

### 7.4 Workflow de développement

**Pour chaque User Story** :

1. **Créer une branche** :
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/US-001-inscription-membre
   ```

2. **Développer avec commits fréquents** :
   ```bash
   git add .
   git commit -m "feat(auth): formulaire inscription [US-001]"
   git commit -m "test(auth): tests unitaires validation [US-001]"
   git commit -m "feat(auth): intégration Google Maps [US-001]"
   ```

3. **Pousser régulièrement** :
   ```bash
   git push origin feature/US-001-inscription-membre
   ```

4. **Créer une Pull Request** vers `develop` :
   - Titre : `[US-001] Inscription d'un nouveau membre`
   - Description : Lien vers la User Story, checklist des critères d'acceptation
   - Assigner des reviewers (si équipe)
   - Attacher les screenshots si changement UI

5. **Validation de la PR** :
   - [ ] Tous les tests passent (CI/CD)
   - [ ] Couverture de code respectée
   - [ ] Code review approuvé
   - [ ] Conformité UX validée
   - [ ] Pas de conflits avec `develop`

6. **Merge dans develop** :
   - Merge via PR (squash recommandé pour historique propre)
   - Supprimer la branche feature après merge

7. **Validation avant merge dans main** :
   - Tests E2E passent
   - Validation manuelle sur environnement de staging
   - Approbation finale

### 7.5 Protection des branches

**Branche `main`** :
- Protection activée
- Merge uniquement via PR
- Approbation requise (si équipe)
- Tests CI/CD obligatoires
- Pas de push direct

**Branche `develop`** :
- Protection activée
- Merge uniquement via PR
- Tests CI/CD obligatoires
- Pas de push direct (sauf hotfixes urgents)

### 7.6 Tags et releases

**Convention de versioning** : SemVer (Semantic Versioning)

**Format** : `vMAJOR.MINOR.PATCH`

- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités rétro-compatibles
- **PATCH** : Corrections de bugs

**Exemples** :
- `v1.0.0` : MVP initial
- `v1.1.0` : Nouvelle fonctionnalité (ex: "Sauvez-les")
- `v1.1.1` : Correction bug critique

**Création de tag** :
```bash
git tag -a v1.0.0 -m "Release MVP - Sprint 1"
git push origin v1.0.0
```

### 7.7 .gitignore

**Fichiers à ignorer** :
```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Tests
coverage/
.nyc_output/

# Database
*.db
*.sqlite
```

### 7.8 Règles de commit (si vous avez des règles existantes)

**Si vous avez déjà des règles Git** :
- Les règles existantes ont la priorité
- Ce document peut être adapté pour s'aligner avec vos conventions
- Merci de partager vos règles pour harmonisation

**Points à clarifier** :
- [ ] Convention de nommage des branches (actuelle ?)
- [ ] Format des messages de commit (actuel ?)
- [ ] Workflow de branches (Git Flow, GitHub Flow, autre ?)
- [ ] Processus de review (si équipe)

---

## 8. CRITÈRES DE DÉFINITION DE "DONE"

Une User Story est considérée comme "Done" lorsque **TOUS** les critères suivants sont remplis :

### 8.1 Code développé

- [ ] **Backend**
  - [ ] Code implémenté et fonctionnel
  - [ ] Endpoints API créés et documentés
  - [ ] Validation des entrées (Zod)
  - [ ] Gestion des erreurs appropriée
  - [ ] Code conforme aux guidelines (ESLint, Prettier)

- [ ] **Frontend**
  - [ ] Code implémenté et fonctionnel
  - [ ] Composants React créés
  - [ ] Gestion des états (loading, error, success)
  - [ ] Responsive design respecté
  - [ ] Code conforme aux guidelines (ESLint, Prettier)

### 8.2 Tests (OBLIGATOIRE - Bloquant)

**⚠️ RÈGLE CRITIQUE** : Aucune User Story ne peut être "Done" sans que tous les tests soient au vert.

- [ ] **Tests unitaires**
  - [ ] Backend : Couverture > 80% pour services/controllers
  - [ ] Frontend : Couverture > 70% pour composants critiques
  - [ ] Tous les tests unitaires passent (`npm test`)

- [ ] **Tests d'intégration**
  - [ ] Endpoints API testés (succès + erreurs)
  - [ ] Flux utilisateur testés (frontend)
  - [ ] Intégration avec services externes (mocks)
  - [ ] Tous les tests d'intégration passent

- [ ] **Tests E2E** (si parcours critique)
  - [ ] Parcours utilisateur complet testé
  - [ ] Tests passent sur environnement de staging

- [ ] **Tests manuels**
  - [ ] Validation fonctionnelle manuelle
  - [ ] Validation UX (conformité avec UX_DESIGN.md)
  - [ ] Tests sur navigateurs multiples (Chrome, Firefox)

### 8.3 Documentation

- [ ] **Code**
  - [ ] JSDoc pour fonctions complexes
  - [ ] Commentaires pour logique métier non évidente
  - [ ] README mis à jour si nécessaire

- [ ] **API**
  - [ ] Documentation Swagger/OpenAPI mise à jour
  - [ ] Exemples de requêtes/réponses

### 8.4 Validation fonctionnelle

- [ ] **Critères d'acceptation**
  - [ ] Tous les critères d'acceptation de la User Story validés
  - [ ] Cas limites testés
  - [ ] Gestion des erreurs validée

- [ ] **Non-régression**
  - [ ] Pas de régression sur fonctionnalités existantes
  - [ ] Tests de régression passent

### 8.5 Git et versioning

- [ ] **Commits**
  - [ ] Commits selon convention définie
  - [ ] Messages de commit clairs et descriptifs
  - [ ] Référence à la User Story dans les commits

- [ ] **Pull Request**
  - [ ] PR créée vers `develop`
  - [ ] Description complète avec checklist
  - [ ] Tous les tests CI/CD passent
  - [ ] Code review approuvé (si équipe)

### 8.6 Conformité

- [ ] **UX**
  - [ ] Conformité avec UX_DESIGN.md
  - [ ] Design System respecté
  - [ ] Accessibilité WCAG AA (si applicable)

- [ ] **Sécurité**
  - [ ] Validation des entrées
  - [ ] Pas de données sensibles exposées
  - [ ] Authentification/autorisation correctes

### 8.7 Checklist finale

**Avant de marquer une User Story comme "Done"** :

```
□ Code développé (backend + frontend)
□ Tests unitaires passent (couverture OK)
□ Tests d'intégration passent
□ Tests E2E passent (si applicable)
□ Tests manuels effectués
□ Documentation à jour
□ PR créée et approuvée
□ Merge dans develop effectué
□ Aucune régression détectée
□ Conformité UX validée
```

**⚠️ IMPORTANT** : Si une étape échoue, la User Story reste "In Progress" jusqu'à correction.

---

## 9. WORKFLOW DE VALIDATION

### 9.1 Principe : Validation à chaque étape

**Règle fondamentale** : **Aucune étape suivante ne peut être commencée tant que l'étape précédente n'est pas validée et tous ses tests ne sont pas au vert.**

### 9.2 Workflow par User Story

```
┌─────────────────────────────────────────┐
│ 1. DÉVELOPPEMENT                         │
│    - Code backend                        │
│    - Code frontend                       │
│    - Conformité ESLint/Prettier          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. TESTS UNITAIRES (OBLIGATOIRE)        │
│    - Tests backend (Jest)                 │
│    - Tests frontend (Vitest)             │
│    - Couverture minimale atteinte        │
│    ⚠️ BLOQUANT : Tous les tests doivent  │
│       passer avant de continuer          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. TESTS D'INTÉGRATION (OBLIGATOIRE)    │
│    - Tests endpoints API                 │
│    - Tests flux utilisateur              │
│    - Mocks services externes             │
│    ⚠️ BLOQUANT : Tous les tests doivent  │
│       passer avant de continuer          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. TESTS MANUELS                        │
│    - Validation fonctionnelle            │
│    - Validation UX                       │
│    - Tests navigateurs multiples         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. TESTS E2E (si parcours critique)     │
│    - Parcours utilisateur complet        │
│    - Tests sur staging                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. PULL REQUEST                          │
│    - Création PR vers develop           │
│    - CI/CD : Tous les tests passent      │
│    - Code review (si équipe)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. VALIDATION "DONE"                    │
│    - Checklist complète validée          │
│    - Merge dans develop                  │
│    - User Story marquée "Done"          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 8. PASSAGE À L'ÉTAPE SUIVANTE           │
│    ✅ User Story suivante peut commencer │
└─────────────────────────────────────────┘
```

### 9.3 Checkpoints obligatoires

**Checkpoint 1 : Après développement**
- [ ] Code écrit et fonctionnel
- [ ] Pas d'erreurs de compilation
- [ ] ESLint/Prettier OK
- **Action** : Commencer les tests unitaires

**Checkpoint 2 : Après tests unitaires**
- [ ] Tous les tests unitaires passent
- [ ] Couverture minimale atteinte
- [ ] Pas de tests ignorés
- **Action** : Commencer les tests d'intégration
- **⚠️ BLOQUANT** : Si échec, corriger avant de continuer

**Checkpoint 3 : Après tests d'intégration**
- [ ] Tous les tests d'intégration passent
- [ ] Endpoints testés
- [ ] Flux utilisateur testés
- **Action** : Tests manuels
- **⚠️ BLOQUANT** : Si échec, corriger avant de continuer

**Checkpoint 4 : Après tests manuels**
- [ ] Validation fonctionnelle OK
- [ ] Validation UX OK
- [ ] Pas de régression
- **Action** : Tests E2E (si applicable) ou PR

**Checkpoint 5 : Après PR et merge**
- [ ] PR approuvée et mergée
- [ ] User Story marquée "Done"
- **Action** : User Story suivante peut commencer

### 9.4 Gestion des échecs de tests

**Si un test échoue** :

1. **Analyser l'échec**
   - Lire le message d'erreur
   - Identifier la cause (bug, test incorrect, etc.)

2. **Corriger**
   - Si bug : Corriger le code
   - Si test incorrect : Corriger le test
   - Si régression : Analyser l'impact

3. **Re-tester**
   - Relancer les tests
   - Vérifier que tous passent

4. **Valider**
   - S'assurer qu'aucune régression n'a été introduite
   - Continuer le workflow

**⚠️ RÈGLE STRICTE** : **Aucune User Story dépendante ne peut être commencée tant que les tests de la User Story précédente ne sont pas tous au vert.**

### 9.5 Validation entre User Stories

**Avant de commencer une User Story dépendante** :

```
Exemple : US-002 dépend de US-001

1. Vérifier que US-001 est "Done"
   □ Tous les tests US-001 passent
   □ US-001 mergée dans develop
   □ Aucun bug critique connu

2. Vérifier l'environnement
   □ Code à jour (git pull develop)
   □ Base de données à jour (migrations)
   □ Services externes disponibles

3. Commencer US-002
   ✅ Développement peut commencer
```

### 9.6 Validation de sprint

**En fin de sprint** :

1. **Review de sprint**
   - [ ] Toutes les User Stories "Done" sont validées
   - [ ] Tous les tests passent
   - [ ] Démo fonctionnelle effectuée
   - [ ] Rétrospective (si équipe)

2. **Préparation release**
   - [ ] Tests E2E complets sur staging
   - [ ] Validation manuelle complète
   - [ ] Documentation à jour
   - [ ] Tag de version créé

3. **Déploiement**
   - [ ] Déploiement sur staging validé
   - [ ] Tests de smoke sur production
   - [ ] Déploiement production (si prêt)

---

## 10. RISQUES ET POINTS D'ATTENTION

### 7.1 Risques techniques

**Risque 1 : Intégrations API externes**
- **Impact** : Bloquant pour l'inscription
- **Mitigation** : Créer des mocks pour le développement, tester avec comptes de test

**Risque 2 : Complexité de la géolocalisation**
- **Impact** : Validation des adresses
- **Mitigation** : Utiliser Google Maps Geocoding API, gérer les erreurs

**Risque 3 : Gestion des quotas et sanctions**
- **Impact** : Logique métier complexe
- **Mitigation** : Implémenter progressivement, bien tester les cas limites

### 7.2 Points d'attention

1. **Sécurité** :
   - Hashage des mots de passe (bcrypt)
   - Validation stricte des entrées (Zod)
   - Rate limiting sur les endpoints sensibles
   - Protection CSRF
   - Headers de sécurité (helmet)

2. **Performance** :
   - Cache Redis pour les requêtes fréquentes
   - Indexation des bases de données
   - Optimisation des requêtes Prisma

3. **UX** :
   - Respecter les guidelines UX_DESIGN.md
   - Feedback utilisateur à chaque action
   - Gestion des erreurs claire

4. **RGPD** :
   - Consentement explicite (CGU, charte sanitaire)
   - Chiffrement des données sensibles
   - Droit à l'oubli (suppression compte)

---

## 11. PROCHAINES ÉTAPES

### 11.1 Avant de solliciter /dev

✅ **Tous les prérequis sont remplis** :
- Documents complets (ANALYST, PM, ARCHITECT, STORY-CREATOR, UX)
- Backlog priorisé Sprint 1 défini
- Dépendances identifiées
- Stack technique confirmée
- **Stratégie de tests définie** ✅
- **Workflow Git défini** ✅
- **Workflow de validation défini** ✅
- Critères de "Done" renforcés ✅

### 11.2 Actions immédiates

1. **Créer la structure du projet**
   - Initialiser backend et frontend
   - Configurer les outils de développement
   - **Configurer les outils de test** (Jest, Vitest, Playwright)

2. **Configurer Git**
   - Initialiser le repository
   - Créer les branches (main, develop)
   - Configurer .gitignore
   - **Configurer les hooks Git** (pre-commit, pre-push si souhaité)

3. **Configurer les comptes API**
   - Obtenir les clés API nécessaires
   - Configurer les variables d'environnement
   - **Configurer les mocks pour les tests**

4. **Initialiser la base de données**
   - Créer le schéma Prisma
   - Effectuer les migrations initiales
   - **Créer les seeds pour tests**

5. **Configurer CI/CD**
   - Pipeline de tests (GitHub Actions, GitLab CI, etc.)
   - Validation automatique des tests
   - Validation de la couverture de code

6. **Solliciter /dev pour Sprint 1**
   - Transmettre ce document de planification
   - **Rappeler les règles de tests et Git**
   - Commencer par US-001 (Inscription)
   - **S'assurer que /dev comprend le workflow de validation**

---

---

## 12. RÉSUMÉ DES RÈGLES CRITIQUES

### 12.1 Règles de tests (OBLIGATOIRES)

1. **Aucune User Story "Done" sans tests validés**
2. **Tous les tests doivent être au vert avant de passer à l'étape suivante**
3. **Couverture minimale** : 80% backend, 70% frontend
4. **Tests unitaires + intégration obligatoires pour chaque User Story**
5. **Tests E2E pour les parcours critiques**

### 12.2 Règles Git (OBLIGATOIRES)

1. **Branche par User Story** : `feature/US-XXX-description`
2. **Commits selon convention** : `type(scope): description [US-XXX]`
3. **PR obligatoire** vers `develop` avant merge
4. **Tous les tests CI/CD doivent passer** avant merge
5. **Pas de push direct** sur `main` ou `develop`

### 12.3 Règles de validation (OBLIGATOIRES)

1. **Aucune étape suivante sans validation de l'étape précédente**
2. **Checkpoints obligatoires** à chaque étape
3. **User Story dépendante ne peut commencer** si la précédente n'est pas "Done"
4. **Validation manuelle** en plus des tests automatisés

---

**Document créé par** : SCRUM-MASTER  
**Dernière mise à jour** : 2026  
**Prochaine étape** : Solliciter /dev pour commencer le Sprint 1  
**Références** : Tous les documents dans `/docs/`

**⚠️ IMPORTANT** : Ce document définit les processus de développement, de tests et de versioning. Toute déviation doit être justifiée et documentée.
