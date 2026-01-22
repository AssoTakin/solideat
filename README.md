# SOLID'EAT - Plateforme de cuisine collaborative entre particuliers

**SOLID'EAT** est une plateforme qui permet aux particuliers de partager leurs repas cuisinés, de réduire le gaspillage alimentaire et de créer du lien social autour de la cuisine.

## 📋 Vue d'ensemble

SOLID'EAT connecte les cuisiniers amateurs qui ont préparé trop de repas avec des personnes qui souhaitent récupérer ces repas. La plateforme gère les réservations, les quotas, les notations et un système de bonus pour encourager le partage.

## 🏗️ Architecture

- **Frontend** : React 18+ avec TypeScript, Vite
- **Backend** : Node.js avec Express.js et TypeScript
- **Base de données** : PostgreSQL 15+ avec Prisma ORM
- **Cache/Queue** : Redis 7+
- **Stockage** : Cloudinary (images)

## 📁 Structure du projet

```
solideat/
├── backend/          # API Backend (Node.js + Express + Prisma)
├── frontend/         # Application React
└── docs/             # Documentation (analyst, pm, archi, story-creator, ux, scrum)
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ installé
- PostgreSQL 15+ installé et configuré
- Redis 7+ installé et configuré
- Comptes API externes :
  - Google Maps API (géocodage)
  - SendGrid (emails)
  - Twilio (SMS)
  - Cloudinary (images)
  - Stripe (paiements - optionnel pour MVP)

### Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd "Solid'Eat 2026"
   ```

2. **Installer les dépendances**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Copier les fichiers `.env.example` et remplir les valeurs :
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Initialiser la base de données**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Démarrer les services**
   
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 📚 Documentation

Toute la documentation du projet se trouve dans le dossier `/docs` :

- **ANALYST** : Analyse complète du projet
- **PM** : Spécifications fonctionnelles
- **ARCHITECT** : Architecture technique détaillée
- **STORY-CREATOR** : User Stories avec critères d'acceptation
- **UX** : Design System et maquettes
- **SCRUM** : Planification des sprints

## 🧪 Tests

```bash
# Backend
cd backend
npm test              # Tests unitaires
npm run test:coverage  # Avec couverture
npm run test:integration  # Tests d'intégration

# Frontend
cd frontend
npm test              # Tests unitaires
npm run test:coverage # Avec couverture
npm run test:e2e      # Tests E2E (Playwright)
```

## 🔧 Scripts disponibles

### Backend
- `npm run dev` : Démarre le serveur en mode développement
- `npm run build` : Compile TypeScript
- `npm run start` : Démarre le serveur en production
- `npm test` : Lance les tests unitaires
- `npm run lint` : Vérifie le code avec ESLint
- `npm run format` : Formate le code avec Prettier

### Frontend
- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Prévisualise le build de production
- `npm test` : Lance les tests
- `npm run lint` : Vérifie le code avec ESLint
- `npm run format` : Formate le code avec Prettier

## 📝 Workflow Git

- **Branches principales** :
  - `main` : Code en production
  - `develop` : Code de développement
  - `feature/US-XXX` : Branches pour chaque User Story

- **Convention de commits** : `type(scope): description [US-XXX]`
  - Types : `feat`, `fix`, `test`, `docs`, `refactor`, `style`, `chore`

## 🎯 Sprint 1 - En cours

**Objectif** : Mettre en place les fondations (authentification et gestion des utilisateurs)

**User Stories** :
- US-001 : Inscription d'un nouveau membre
- US-002 : Vérification de l'email
- US-003 : Vérification du téléphone
- US-004 : Connexion à la plateforme
- US-005 : Déconnexion
- US-007 : Consultation du profil public

## 📄 Licence

[À définir]

## 👥 Équipe

Développement suivant la méthode d'orchestration BMAD avec les agents :
- ANALYST, PM, ARCHITECT, UX, SCRUM-MASTER, STORY-CREATOR, DEV, TESTER
