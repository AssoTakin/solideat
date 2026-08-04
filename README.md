# SOLID'EAT - Plateforme de cuisine collaborative entre particuliers

**SOLID'EAT** est une plateforme qui permet aux particuliers de partager leurs repas cuisinés, de réduire le gaspillage alimentaire et de créer du lien social autour de la cuisine.

## 📋 Vue d'ensemble

SOLID'EAT connecte les cuisiniers amateurs qui ont préparé trop de repas avec des personnes qui souhaitent récupérer ces repas. La plateforme gère les réservations, les quotas, les notations et un système de bonus pour encourager le partage.

## 🏗️ Architecture

- **Frontend** : React 18+ avec TypeScript, Vite, Redux Toolkit, React Hook Form, Zod, Axios
- **Backend** : Node.js 20 avec Express.js et TypeScript
- **ORM** : Prisma
- **Base de données** : Supabase PostgreSQL (ou PostgreSQL 15+ avec Prisma ORM)
- **Cache/Queue** : Redis 7+ (Upstash recommandé)
- **Stockage** : Cloudinary (images)
- **Paiements** : Stripe (abonnements + repas premium 5€)

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
- PostgreSQL 15+ installé et configuré (ou Supabase)
- Redis 7+ installé et configuré (ou Upstash)
- Comptes API externes :
  - Google Maps API (géocodage)
  - SendGrid (emails)
  - Twilio (SMS)
  - Cloudinary (images)
  - Stripe (paiements)

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/AssoTakin/solideat.git
   cd solideat
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
- **DEV** : Guides de développement et déploiement

## 🧪 Tests

```bash
# Backend unitaires
cd backend
npm test              # 124 tests unitaires

# Backend E2E premium (clés Stripe test requises)
cd backend
npx jest src/e2e/premium-flow.e2e.test.ts --testTimeout=60000

# Backend E2E staging Railway (clés Stripe test requises)
cd backend
npx jest src/e2e/premium-flow.staging.e2e.test.ts --testTimeout=60000

# Frontend
cd frontend
npm test              # Tests unitaires
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
  - `main` : Code en production (déployé automatiquement sur Railway + Vercel)
  - `dev/local-work` : Branche de travail active
  - `feature/US-XXX` : Branches pour chaque User Story

- **Convention de commits** : `type(scope): description [US-XXX]`
  - Types : `feat`, `fix`, `test`, `docs`, `refactor`, `style`, `chore`

- **Règle** : ne jamais push directement sur `main`. Pousser sur `dev/local-work`, puis merger dans `main` via une PR ou un merge `--no-ff` avec validation.

## 🚀 Déploiement

### Production

| Composant | Service | URL |
|---|---|---|
| Frontend | Vercel | `https://solid-eat.com` |
| Frontend | Vercel | `https://solid-eat.fr` |
| Backend | Railway | `https://api.solid-eat.com` |
| Base de données | Supabase | PostgreSQL |
| Cache | Upstash | Redis |

### Environnements

| Environnement | Branche | Backend | Stripe | Usage |
|---|---|---|---|---|
| Local | `dev/local-work` | `npm run dev` | Test (`sk_test_...`) | Développement |
| Staging | `main` | `solideat-staging` sur Railway | Test (`sk_test_...`) | Tests E2E |
| Production | `main` | `solideat` sur Railway | Live (`sk_live_...`) | Production |

Voir `docs/dev/STATUT_DEPLOIEMENT.md` et `docs/dev/VARIABLES_RAILWAY.md` pour les détails complets.

## 📄 Licence

[À définir]

## 👥 Équipe

Développement suivant la méthode d'orchestration BMAD avec les agents :
- ANALYST, PM, ARCHITECT, UX, SCRUM-MASTER, STORY-CREATOR, DEV, TESTER
