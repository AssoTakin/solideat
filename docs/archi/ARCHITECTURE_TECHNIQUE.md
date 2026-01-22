# ARCHITECTURE TECHNIQUE - SOLID'EAT

**Date de création** : 2026  
**Agent** : ARCHITECT  
**Statut** : Architecture technique complète - MVP  
**Basé sur** : Spécifications fonctionnelles PM - SPECIFICATIONS_FONCTIONNELLES.md

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture système](#3-architecture-système)
4. [Modèle de données](#4-modèle-de-données)
5. [APIs et services](#5-apis-et-services)
6. [Intégrations externes](#6-intégrations-externes)
7. [Sécurité](#7-sécurité)
8. [Performance et scalabilité](#8-performance-et-scalabilité)
9. [Déploiement et infrastructure](#9-déploiement-et-infrastructure)
10. [Monitoring et logs](#10-monitoring-et-logs)
11. [Plan de migration et évolutivité](#11-plan-de-migration-et-évolutivité)

---

## 1. VUE D'ENSEMBLE

### 1.1 Principes architecturaux

**Choix architectural** : Architecture modulaire monolithique avec séparation claire des couches (MVP), évolutive vers microservices si nécessaire.

**Principes** :
- **Séparation des responsabilités** : Backend API REST, Frontend SPA, Base de données relationnelle
- **Scalabilité** : Architecture prête à évoluer vers microservices
- **Sécurité** : Authentification JWT, chiffrement des données sensibles, validation stricte
- **Performance** : Cache, indexation optimale, requêtes optimisées
- **Maintenabilité** : Code modulaire, documentation, tests

### 1.2 Contraintes techniques

**Contraintes identifiées** :
- Géolocalisation précise (Google Maps API)
- Notifications en temps réel (email, SMS, push)
- Paiements sécurisés (abonnements premium)
- Gestion de fichiers (photos de repas, profils)
- Calculs automatiques (expiration, quotas, bonus)
- Traitement asynchrone (cron jobs, tâches en arrière-plan)

### 1.3 Objectifs techniques du MVP

- **Performance** : Temps de réponse < 200ms pour 95% des requêtes
- **Disponibilité** : 99.5% uptime
- **Sécurité** : Conformité RGPD, chiffrement des données sensibles
- **Scalabilité** : Support de 10 000 utilisateurs actifs simultanés
- **Maintenabilité** : Code testé (couverture > 70%), documentation complète

---

## 2. STACK TECHNIQUE

### 2.1 Frontend

**Framework** : React 18+ avec TypeScript

**Justification** :
- Écosystème mature et performant
- TypeScript pour la sécurité de type
- Grande communauté et ressources disponibles
- Compatible avec PWA (Progressive Web App)

**Bibliothèques principales** :
- **Routing** : React Router v6
- **State Management** : Redux Toolkit + RTK Query (pour cache API)
- **UI Components** : Material-UI (MUI) ou Chakra UI
- **Formulaires** : React Hook Form + Zod (validation)
- **Maps** : Google Maps React (react-google-maps)
- **Notifications** : Service Worker API (PWA)
- **Paiements** : Stripe Elements (intégration Stripe)
- **Upload fichiers** : react-dropzone
- **Dates** : date-fns
- **HTTP Client** : Axios

**Build et outils** :
- **Bundler** : Vite (performance optimale)
- **Linting** : ESLint + Prettier
- **Tests** : Vitest + React Testing Library
- **E2E** : Playwright (optionnel pour MVP)

### 2.2 Backend

**Framework** : Node.js avec Express.js et TypeScript

**Justification** :
- Stack JavaScript unifiée (frontend + backend)
- Écosystème npm riche
- Performance adaptée au MVP
- Facilité de déploiement

**Alternatives considérées** :
- **NestJS** : Trop complexe pour MVP, mais excellent pour évolutivité
- **Python/Django** : Écosystème différent, moins de cohérence avec frontend
- **Go** : Performance excellente mais courbe d'apprentissage plus élevée

**Bibliothèques principales** :
- **Framework** : Express.js
- **ORM** : Prisma (type-safe, migrations automatiques)
- **Validation** : Zod (cohérence frontend/backend)
- **Authentification** : Passport.js + JWT
- **Upload fichiers** : Multer + Cloudinary (ou AWS S3)
- **Email** : Nodemailer + SendGrid (ou Mailgun)
- **SMS** : Twilio (ou OVH SMS)
- **Paiements** : Stripe API
- **Tâches asynchrones** : Bull (Redis-based job queue)
- **Cron jobs** : node-cron
- **Logging** : Winston
- **Tests** : Jest + Supertest

### 2.3 Base de données

**Base de données principale** : PostgreSQL 15+

**Justification** :
- Base de données relationnelle robuste
- Support des types JSON pour flexibilité
- Extensions utiles (PostGIS pour géolocalisation si besoin)
- Performance excellente
- Open source et mature

**Cache** : Redis 7+

**Justification** :
- Cache de sessions
- Cache de requêtes fréquentes
- Queue de tâches asynchrones (Bull)
- Rate limiting

**Stockage fichiers** : Cloudinary ou AWS S3

**Justification** :
- Optimisation automatique des images
- CDN intégré
- Gestion des transformations (redimensionnement, compression)
- Alternative : AWS S3 + CloudFront

### 2.4 Infrastructure et déploiement

**Hébergement** :
- **Backend** : Railway, Render, AWS EC2, ou **Google Cloud Run** / **App Engine**
- **Frontend** : Vercel, Netlify, AWS CloudFront, ou **Google Cloud Storage + CDN**
- **Base de données** : 
  - ⭐ **Supabase PostgreSQL** (recommandé pour MVP - gratuit, setup rapide)
  - Railway PostgreSQL, AWS RDS, ou **Google Cloud SQL (PostgreSQL)**
  - Alternative NoSQL : **Firebase Firestore** (si changement d'architecture)
- **Redis** : Railway Redis, Upstash, AWS ElastiCache, ou **Google Cloud Memorystore (Redis)**

**CI/CD** :
- **GitHub Actions** : Automatisation des tests et déploiements
- **Docker** : Containerisation (optionnel pour MVP, recommandé pour production)

**Monitoring** :
- **Sentry** : Gestion des erreurs
- **LogRocket** ou **Datadog** : Monitoring des performances (optionnel MVP)

---

## 3. ARCHITECTURE SYSTÈME

### 3.1 Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  State   │  │  API     │   │
│  │          │  │          │  │ (Redux)  │  │  Client  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │Services  │  │Business │  │   Data   │   │
│  │          │  │          │  │  Logic  │  │  Access  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Auth    │  │  Jobs    │  │  Cache  │                 │
│  │ (JWT)    │  │  (Bull)  │  │ (Redis) │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐  ┌─────────▼────────┐  ┌──────▼──────┐
│  PostgreSQL  │  │      Redis       │  │ Cloudinary  │
│   (Primary)  │  │   (Cache/Queue)  │  │  (Images)   │
└──────────────┘  └──────────────────┘  └─────────────┘
        │
┌───────▼──────────────────────────────────────────────┐
│           SERVICES EXTERNES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Google  │  │  Stripe  │  │  Twilio  │           │
│  │   Maps   │  │          │  │   SMS    │           │
│  └──────────┘  └──────────┘  └──────────┘           │
└──────────────────────────────────────────────────────┘
```

### 3.2 Structure des modules backend

```
backend/
├── src/
│   ├── config/           # Configuration (DB, env, etc.)
│   ├── controllers/      # Contrôleurs (logique HTTP)
│   ├── services/         # Services métier
│   ├── models/           # Modèles Prisma (générés)
│   ├── routes/           # Définition des routes
│   ├── middleware/      # Middleware (auth, validation, etc.)
│   ├── utils/            # Utilitaires
│   ├── jobs/             # Tâches asynchrones (cron, queues)
│   ├── validators/       # Schémas de validation Zod
│   └── types/            # Types TypeScript
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── migrations/       # Migrations
├── tests/                # Tests unitaires et d'intégration
└── package.json
```

### 3.3 Structure des modules frontend

```
frontend/
├── src/
│   ├── pages/            # Pages (routes)
│   ├── components/       # Composants réutilisables
│   │   ├── common/       # Composants communs
│   │   ├── meals/        # Composants repas
│   │   ├── users/        # Composants utilisateurs
│   │   └── messaging/    # Composants messagerie
│   ├── features/         # Features (Redux slices)
│   │   ├── auth/
│   │   ├── meals/
│   │   ├── users/
│   │   └── messaging/
│   ├── services/         # Services API (RTK Query)
│   ├── hooks/            # Hooks React personnalisés
│   ├── utils/            # Utilitaires
│   ├── types/            # Types TypeScript
│   └── assets/           # Images, fonts, etc.
├── public/               # Fichiers statiques
└── package.json
```

### 3.4 Flux de données

**Authentification** :
1. Utilisateur se connecte → Frontend envoie credentials
2. Backend valide → Génère JWT
3. Frontend stocke JWT (localStorage ou httpOnly cookie)
4. Toutes les requêtes incluent JWT dans header Authorization

**Création de repas** :
1. Utilisateur remplit formulaire → Frontend valide (Zod)
2. Upload photo → Cloudinary → URL retournée
3. Frontend envoie données + URL photo → Backend
4. Backend valide → Crée repas en DB → Retourne repas créé
5. Frontend met à jour state → Affiche confirmation

**Réservation** :
1. Utilisateur clique "Réserver" → Frontend vérifie quotas (cache)
2. Backend vérifie quotas (DB) → Crée réservation
3. Backend envoie notifications (email, push) via queue
4. Frontend met à jour state → Affiche confirmation

---

## 4. MODÈLE DE DONNÉES

### 4.1 Schéma de base de données (Prisma)

```prisma
// Modèle utilisateur
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  passwordHash      String
  phone             String?   @unique
  phoneVerified     Boolean   @default(false)
  emailVerified     Boolean   @default(false)
  firstName         String
  lastName          String
  username          String    @unique
  profilePhoto      String?
  description       String?
  culinaryStyle     String?
  
  // Adresse
  addressStreet     String
  addressZipCode    String
  addressCity       String
  latitude          Float
  longitude         Float
  
  // Abonnement
  subscriptionType  SubscriptionType @default(FREE)
  subscriptionStart DateTime?
  subscriptionEnd   DateTime?
  stripeCustomerId  String?   @unique
  
  // Confidentialité
  hidePhoneNumber   Boolean   @default(false) // Premium uniquement
  
  // Statistiques
  globalRating      Float     @default(0)
  mealsServed       Int       @default(0)
  mealsReceived     Int       @default(0)
  mealsExpired      Int       @default(0)
  mealsSaved        Int       @default(0) // Premium uniquement
  
  // CGU
  cguAcceptedAt     DateTime?
  sanitaryCharterAcceptedAt DateTime?
  
  // Relations
  meals             Meal[]
  reservations      Reservation[]
  reviews           Review[]
  sentMessages      Message[] @relation("MessageSender")
  receivedMessages  Message[] @relation("MessageReceiver")
  badges            UserBadge[]
  bonusDonors       BonusDonor[]
  sanctions         Sanction[]
  notifications     Notification[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum SubscriptionType {
  FREE
  PREMIUM_WEEKLY
  PREMIUM_MONTHLY
  PREMIUM_YEARLY
}

// Modèle repas
model Meal {
  id                String    @id @default(uuid())
  name              String
  photo             String
  description       String?
  
  // Dates
  preparationDate   DateTime
  serviceDate       DateTime
  
  // Heure de récupération
  pickupTimeStart   DateTime  // Heure de début (ou heure fixe si égal à pickupTimeEnd)
  pickupTimeEnd     DateTime  // Heure de fin (peut être égal à pickupTimeStart si heure fixe)
  
  // Adresse de récupération
  pickupAddress     String
  pickupLatitude    Float
  pickupLongitude   Float
  
  expirationDate    DateTime
  postedAt          DateTime  @default(now())
  
  // Ingrédients
  ingredients       Json      // Array d'ingrédients avec allergènes
  
  // Parts et prix
  portions          Int       @default(1)
  price             Float?    // null = gratuit, > 0 = vendu (premium)
  
  // Statut
  status            MealStatus @default(AVAILABLE)
  inSaveThem        Boolean   @default(false) // Dans "Sauvez-les"
  
  // Relations
  cookId            String
  cook              User      @relation(fields: [cookId], references: [id])
  reservation       Reservation?
  reviews           Review[]
  messages          Message[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([cookId])
  @@index([status])
  @@index([expirationDate])
  @@index([inSaveThem])
  @@index([pickupLatitude, pickupLongitude]) // Pour recherches géographiques
}

// Enum TimeSlot supprimé - remplacé par pickupTimeStart et pickupTimeEnd

enum MealStatus {
  AVAILABLE
  RESERVED
  SERVED
  EXPIRED
  NOT_PICKED_UP
}

// Modèle réservation
model Reservation {
  id                String    @id @default(uuid())
  mealId            String    @unique
  meal              Meal      @relation(fields: [mealId], references: [id])
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  // Utilisation bonus donateur
  usedBonusDonor    Boolean   @default(false)
  bonusDonorId      String?
  
  // Dates
  reservedAt        DateTime  @default(now())
  pickedUpAt        DateTime?
  
  // Annulation
  cancelledAt       DateTime?
  cancellationReason String?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([userId])
  @@index([mealId])
}

// Modèle avis/notation
model Review {
  id                String    @id @default(uuid())
  mealId            String
  meal              Meal      @relation(fields: [mealId], references: [id])
  reviewerId        String
  reviewer          User      @relation(fields: [reviewerId], references: [id])
  cookId            String
  cook              User      @relation(fields: [cookId], references: [id])
  
  rating            Int       // 1-5
  comment           String
  photos            String[]  // URLs Cloudinary
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([mealId, reviewerId])
  @@index([cookId])
}

// Modèle message
model Message {
  id                String    @id @default(uuid())
  mealId            String
  meal              Meal      @relation(fields: [mealId], references: [id])
  senderId          String
  sender            User      @relation("MessageSender", fields: [senderId], references: [id])
  receiverId        String
  receiver          User      @relation("MessageReceiver", fields: [receiverId], references: [id])
  
  content           String
  read              Boolean   @default(false)
  readAt            DateTime?
  
  createdAt         DateTime  @default(now())
  
  @@index([mealId])
  @@index([senderId])
  @@index([receiverId])
}

// Modèle badge
model Badge {
  id                String    @id @default(uuid())
  name              String    @unique
  description       String
  icon              String
  condition         String    // Description de la condition
  premiumOnly       Boolean   @default(false)
}

model UserBadge {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  badgeId           String
  badge             Badge     @relation(fields: [badgeId], references: [id])
  earnedAt          DateTime  @default(now())
  
  @@unique([userId, badgeId])
}

// Modèle bonus donateur
model BonusDonor {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  acquiredAt        DateTime  @default(now())
  expiresAt         DateTime
  usedAt            DateTime?
  transferredToId   String?   // Si transféré (premium uniquement)
  
  @@index([userId])
  @@index([expiresAt])
}

// Modèle sanction
model Sanction {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  type              SanctionType
  reason            String
  startDate         DateTime
  endDate           DateTime?
  quotaReduction    Int?      // Réduction du quota mensuel
  
  active            Boolean   @default(true)
  
  createdAt         DateTime  @default(now())
  
  @@index([userId])
  @@index([active])
}

enum SanctionType {
  RESERVATION_BLOCK
  CANCELLATION_BLOCK
  QUOTA_REDUCTION
}

// Modèle notification
model Notification {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  type              NotificationType
  title             String
  message           String
  read              Boolean   @default(false)
  readAt            DateTime?
  link              String?   // URL de redirection
  
  createdAt         DateTime  @default(now())
  
  @@index([userId])
  @@index([read])
}

enum NotificationType {
  MEAL_RESERVED
  MEAL_CANCELLED
  MEAL_EXPIRING
  MEAL_EXPIRED
  REVIEW_REMINDER
  BONUS_DONOR_EXPIRING
  BONUS_DONOR_RECEIVED
  BADGE_EARNED
  SANCTION_APPLIED
  SUBSCRIPTION_RENEWAL
  MESSAGE_RECEIVED
}

// Modèle quota (calculé dynamiquement, pas de table dédiée)
// Les quotas sont calculés via des fonctions/services
```

### 4.2 Index et optimisations

**Index essentiels** :
- `User.email` : Unique (déjà géré par Prisma)
- `User.username` : Unique
- `User.phone` : Unique
- `Meal.cookId` : Pour requêtes par cuisinier
- `Meal.status` : Pour filtres de statut
- `Meal.expirationDate` : Pour cron jobs d'expiration
- `Meal.inSaveThem` : Pour rubrique "Sauvez-les"
- `Reservation.userId` : Pour historique utilisateur
- `Message.receiverId` + `read` : Pour messages non lus
- `Notification.userId` + `read` : Pour notifications non lues

**Optimisations** :
- **Vues matérialisées** (PostgreSQL) : Pour statistiques fréquentes
- **Partitioning** : Pour tables volumineuses (messages, notifications) si > 1M lignes
- **Archivage** : Archivage des données anciennes (> 1 an) dans table séparée

### 4.3 Relations et contraintes

**Contraintes d'intégrité** :
- Un repas ne peut avoir qu'une seule réservation active
- Un utilisateur ne peut noter qu'une fois par repas
- Les quotas sont vérifiés au niveau applicatif (pas de contrainte DB)

**Cascades** :
- Suppression d'un utilisateur → Soft delete (marquer comme supprimé, pas de suppression réelle)
- Suppression d'un repas → Supprimer réservation associée (si existe)

---

## 5. APIs ET SERVICES

### 5.1 API REST - Structure

**Base URL** : `https://api.solideat.fr/v1`

**Authentification** : JWT Bearer Token dans header `Authorization`

### 5.2 Endpoints principaux

#### 5.2.1 Authentification

```
POST   /auth/register              # Inscription
POST   /auth/login                 # Connexion
POST   /auth/logout                # Déconnexion
POST   /auth/refresh               # Rafraîchir token
POST   /auth/verify-email          # Vérifier email
POST   /auth/verify-phone          # Vérifier téléphone
POST   /auth/resend-verification   # Renvoyer code
POST   /auth/forgot-password       # Mot de passe oublié
POST   /auth/reset-password        # Réinitialiser mot de passe
```

#### 5.2.2 Utilisateurs

```
GET    /users/me                   # Profil utilisateur connecté
PUT    /users/me                   # Modifier profil
PUT    /users/me/password          # Changer mot de passe
PUT    /users/me/address           # Changer adresse
GET    /users/:id                  # Profil public
GET    /users/:id/meals            # Repas d'un utilisateur
GET    /users/:id/reviews          # Avis reçus
```

#### 5.2.3 Repas

```
GET    /meals                      # Liste repas (filtres, pagination)
GET    /meals/:id                  # Détails d'un repas
POST   /meals                      # Créer un repas
PUT    /meals/:id                  # Modifier un repas (si disponible)
DELETE /meals/:id                  # Annuler un repas (si disponible)
GET    /meals/save-them            # Liste "Sauvez-les"
POST   /meals/:id/upload-photo     # Upload photo (séparé)
```

#### 5.2.4 Réservations

```
GET    /reservations               # Mes réservations
POST   /reservations               # Réserver un repas
DELETE /reservations/:id           # Annuler réservation
GET    /reservations/:id           # Détails réservation
PUT    /reservations/:id/pickup    # Marquer comme récupéré
```

#### 5.2.5 Avis et notations

```
POST   /reviews                    # Créer un avis
GET    /reviews/:id                # Détails d'un avis
PUT    /reviews/:id                # Modifier un avis
```

#### 5.2.6 Messagerie

```
GET    /messages                   # Liste conversations
GET    /messages/conversation/:mealId  # Messages d'une conversation
POST   /messages                   # Envoyer un message
PUT    /messages/:id/read          # Marquer comme lu
GET    /messages/unread-count      # Nombre de messages non lus
```

#### 5.2.7 Abonnements

```
GET    /subscriptions/plans        # Plans disponibles
POST   /subscriptions              # Souscrire à un abonnement
GET    /subscriptions/current      # Abonnement actuel
PUT    /subscriptions/cancel       # Annuler abonnement
GET    /subscriptions/invoices     # Factures
```

#### 5.2.8 Bonus donateurs

```
GET    /bonus-donors               # Mes bonus donateurs
POST   /bonus-donors/:id/transfer  # Transférer (premium uniquement)
```

#### 5.2.9 Notifications

```
GET    /notifications              # Liste notifications
PUT    /notifications/:id/read     # Marquer comme lu
PUT    /notifications/read-all     # Tout marquer comme lu
GET    /notifications/unread-count # Nombre non lus
```

### 5.3 Services backend

#### 5.3.1 Service d'authentification (`AuthService`)

**Responsabilités** :
- Hashage des mots de passe (bcrypt)
- Génération et validation JWT
- Gestion des sessions
- Vérification email/téléphone

**Méthodes principales** :
```typescript
class AuthService {
  async register(data: RegisterDto): Promise<User>
  async login(email: string, password: string): Promise<{ user: User, token: string }>
  async verifyEmail(userId: string, token: string): Promise<boolean>
  async verifyPhone(userId: string, code: string): Promise<boolean>
  async generateJWT(user: User): Promise<string>
  async validateJWT(token: string): Promise<User>
}
```

#### 5.3.2 Service de repas (`MealService`)

**Responsabilités** :
- Création, modification, suppression de repas
- Calcul automatique de l'expiration (72h)
- Gestion du statut "Sauvez-les"
- Vérification des quotas

**Méthodes principales** :
```typescript
class MealService {
  async createMeal(userId: string, data: CreateMealDto): Promise<Meal>
  async updateMeal(mealId: string, userId: string, data: UpdateMealDto): Promise<Meal>
  
  /**
   * Valide et géocode une adresse de récupération
   */
  async validateAndGeocodeAddress(address: string): Promise<{
    address: string;
    latitude: number;
    longitude: number;
  }>
  
  /**
   * Calcule la distance entre deux points GPS
   */
  calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number
  
  /**
   * Formate l'heure de récupération pour l'affichage
   */
  formatPickupTime(
    start: Date,
    end: Date
  ): string
  async deleteMeal(mealId: string, userId: string): Promise<void>
  async getMeals(filters: MealFilters): Promise<Meal[]>
  async getSaveThemMeals(userId: string, filters: SaveThemFilters): Promise<Meal[]>
  async checkExpiration(): Promise<void> // Cron job
  async addToSaveThem(mealId: string): Promise<void>
}
```

#### 5.3.3 Service de réservation (`ReservationService`)

**Responsabilités** :
- Création de réservations
- Vérification des quotas (hebdomadaires, mensuels)
- Gestion des annulations
- Calcul des délais (7h avant service)

**Méthodes principales** :
```typescript
class ReservationService {
  async createReservation(userId: string, mealId: string, useBonus?: boolean): Promise<Reservation>
  async cancelReservation(reservationId: string, userId: string, reason: string): Promise<void>
  async checkQuotas(userId: string, type: 'weekly' | 'monthly'): Promise<QuotaStatus>
  async markAsPickedUp(reservationId: string, cookId: string): Promise<void>
  async reportNotPickedUp(reservationId: string, cookId: string): Promise<void>
}
```

#### 5.3.4 Service de quotas (`QuotaService`)

**Responsabilités** :
- Calcul des quotas hebdomadaires/mensuels
- Vérification des limites
- Gestion des sanctions et réductions

**Méthodes principales** :
```typescript
class QuotaService {
  async getWeeklyQuota(userId: string, type: QuotaType): Promise<QuotaStatus>
  async getMonthlyQuota(userId: string, type: QuotaType): Promise<QuotaStatus>
  async checkQuota(userId: string, type: QuotaType): Promise<boolean>
  async applySanction(userId: string, sanction: SanctionType): Promise<void>
}
```

#### 5.3.5 Service de notation (`ReviewService`)

**Responsabilités** :
- Création d'avis
- Calcul de la note globale
- Attribution automatique de badges
- Gestion des rappels (4h, 24h, 48h)

**Méthodes principales** :
```typescript
class ReviewService {
  async createReview(userId: string, mealId: string, data: CreateReviewDto): Promise<Review>
  async calculateGlobalRating(cookId: string): Promise<number>
  async checkBadgeEligibility(userId: string): Promise<Badge[]>
  async sendReviewReminders(): Promise<void> // Cron job
}
```

#### 5.3.6 Service de messagerie (`MessageService`)

**Responsabilités** :
- Envoi de messages
- Modération automatique (détection numéros, pièces jointes)
- Gestion des conversations liées aux repas

**Méthodes principales** :
```typescript
class MessageService {
  async sendMessage(senderId: string, mealId: string, content: string): Promise<Message>
  async getConversation(mealId: string, userId: string): Promise<Message[]>
  async markAsRead(messageId: string, userId: string): Promise<void>
  async detectPhoneNumber(content: string): Promise<boolean>
  async filterContent(content: string): Promise<string>
}
```

#### 5.3.7 Service de notifications (`NotificationService`)

**Responsabilités** :
- Création de notifications
- Envoi d'emails (SendGrid)
- Envoi de SMS (Twilio)
- Push notifications (Service Worker)

**Méthodes principales** :
```typescript
class NotificationService {
  async createNotification(userId: string, type: NotificationType, data: any): Promise<Notification>
  async sendEmail(to: string, template: string, data: any): Promise<void>
  async sendSMS(to: string, message: string): Promise<void>
  async sendPushNotification(userId: string, payload: any): Promise<void>
}
```

#### 5.3.8 Service de bonus donateur (`BonusDonorService`)

**Responsabilités** :
- Calcul des bonus (écart repas servis/reçus)
- Attribution automatique
- Gestion de l'expiration (2 semaines)
- Transfert (premium uniquement)

**Méthodes principales** :
```typescript
class BonusDonorService {
  async calculateBonus(userId: string): Promise<number>
  async acquireBonus(userId: string): Promise<BonusDonor>
  async useBonus(bonusId: string, userId: string): Promise<void>
  async transferBonus(bonusId: string, fromUserId: string, toUsername: string): Promise<void>
  async checkExpiringBonuses(): Promise<void> // Cron job
}
```

#### 5.3.9 Service de géolocalisation (`GeolocationService`)

**Responsabilités** :
- Géocodage d'adresses (Google Maps)
  - Adresse du profil (inscription)
  - Adresse de récupération des repas (création de repas)
- Validation des adresses via Google Maps Geocoding API
- Calcul de distances
- Filtrage par rayon

**Méthodes principales** :
```typescript
class GeolocationService {
  async geocodeAddress(address: string): Promise<{ 
    address: string, 
    lat: number, 
    lng: number 
  }>
  async validateAndGeocodeAddress(address: string): Promise<{
    address: string;
    latitude: number;
    longitude: number;
  }>
  async calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): Promise<number>
  async filterByRadius(meals: Meal[], centerLat: number, centerLng: number, radiusKm: number): Promise<Meal[]>
}
```

#### 5.3.10 Service d'abonnement (`SubscriptionService`)

**Responsabilités** :
- Gestion des abonnements Stripe
- Renouvellement automatique
- Facturation

**Méthodes principales** :
```typescript
class SubscriptionService {
  async createSubscription(userId: string, planId: string, paymentMethodId: string): Promise<Subscription>
  async cancelSubscription(userId: string): Promise<void>
  async renewSubscription(subscriptionId: string): Promise<void>
  async handleWebhook(event: Stripe.Event): Promise<void>
}
```

### 5.4 Tâches asynchrones (Jobs)

**Queue système** : Bull (Redis-based)

**Jobs principaux** :

1. **Expiration des repas** (cron: toutes les heures)
   - Vérifie les repas expirés
   - Change le statut à `EXPIRED`
   - Envoie notifications

2. **Ajout dans "Sauvez-les"** (cron: toutes les heures)
   - Vérifie les repas à 24h d'expiration
   - Ajoute dans "Sauvez-les"
   - Envoie notifications

3. **Rappels de commentaires** (cron: toutes les heures)
   - Vérifie les repas servis sans commentaire
   - Envoie rappels (4h, 24h, 48h)
   - Applique restrictions si nécessaire

4. **Expiration des bonus donateurs** (cron: quotidien)
   - Vérifie les bonus expirant dans 3 jours
   - Envoie notifications

5. **Calcul des quotas** (cron: quotidien)
   - Réinitialise les quotas hebdomadaires (lundi)
   - Vérifie les quotas mensuels
   - Applique les sanctions si nécessaire

6. **Renouvellement d'abonnements** (cron: quotidien)
   - Vérifie les abonnements expirant dans 3 jours
   - Envoie notifications
   - Renouvelle automatiquement si carte valide

---

## 6. INTÉGRATIONS EXTERNES

### 6.1 Google Maps API

**Services utilisés** :

1. **Geocoding API** :
   - Validation et géocodage des adresses lors de :
     - Inscription (adresse du profil)
     - Création de repas (adresse de récupération)
     - Modification d'adresse
   - Conversion : Adresse texte → Coordonnées GPS (lat/lng)
   - Validation : Vérifier que l'adresse existe

2. **Places API** (optionnel) :
   - Autocomplétion d'adresses dans les formulaires
   - Amélioration de l'UX lors de la saisie

3. **Distance Matrix API** (optionnel) :
   - Calcul de distance entre deux adresses
   - Alternative : Formule de Haversine (calcul côté serveur)

**Configuration** :
- Clé API dans variables d'environnement
- Limite de requêtes : 25 000/jour (gratuit)
- Cache des géocodages (éviter requêtes répétées)

**Implémentation** :
```typescript
// Service de géolocalisation
class GeolocationService {
  async geocodeAddress(address: string): Promise<Coordinates> {
    // Cache Redis check
    // Appel Google Maps Geocoding API
    // Cache result
  }
}
```

### 6.2 Stripe (Paiements)

**Fonctionnalités** :
- Abonnements récurrents (hebdomadaire, mensuel, annuel)
- Gestion des cartes bancaires
- Webhooks pour événements (renouvellement, annulation)
- Factures automatiques

**Configuration** :
- Clés API (test/production) dans variables d'environnement
- Webhook endpoint : `/api/webhooks/stripe`

**Implémentation** :
```typescript
// Service d'abonnement
class SubscriptionService {
  async createSubscription(userId: string, planId: string): Promise<Subscription> {
    // Créer customer Stripe
    // Créer subscription
    // Enregistrer dans DB
  }
  
  async handleWebhook(event: Stripe.Event): Promise<void> {
    // Gérer événements Stripe (payment_succeeded, subscription_cancelled, etc.)
  }
}
```

### 6.3 Twilio (SMS)

**Fonctionnalités** :
- Envoi de codes de vérification téléphone
- Notifications SMS (optionnel)

**Configuration** :
- Account SID et Auth Token dans variables d'environnement
- Numéro de téléphone Twilio

**Implémentation** :
```typescript
// Service de notifications
class NotificationService {
  async sendVerificationSMS(phone: string, code: string): Promise<void> {
    // Envoi SMS via Twilio
  }
}
```

### 6.4 SendGrid (Email)

**Fonctionnalités** :
- Envoi d'emails transactionnels
- Templates d'emails
- Tracking des ouvertures/clics

**Configuration** :
- API Key dans variables d'environnement
- Templates configurés dans SendGrid

**Templates nécessaires** :
- Vérification email
- Vérification téléphone
- Nouvelle réservation
- Annulation
- Expiration repas
- Rappel commentaire
- Expiration bonus donateur
- Attribution badge
- Renouvellement abonnement

### 6.5 Cloudinary (Images)

**Fonctionnalités** :
- Upload d'images
- Optimisation automatique
- Redimensionnement
- CDN intégré

**Configuration** :
- Cloud name, API key, API secret dans variables d'environnement

**Implémentation** :
```typescript
// Service d'upload
class FileService {
  async uploadPhoto(file: Buffer, folder: string): Promise<string> {
    // Upload vers Cloudinary
    // Retourne URL
  }
}
```

---

## 7. SÉCURITÉ

### 7.1 Authentification et autorisation

**JWT (JSON Web Tokens)** :
- **Secret** : Variable d'environnement forte (min 256 bits)
- **Expiration** : 7 jours (refresh token : 30 jours)
- **Algorithme** : HS256
- **Payload** : `{ userId, email, subscriptionType }`

**Middleware d'authentification** :
```typescript
const authenticate = async (req, res, next) => {
  // Vérifier JWT
  // Attacher user à req.user
  // Gérer refresh token si nécessaire
}
```

**Autorisation** :
- Vérification des rôles (FREE vs PREMIUM)
- Vérification de propriété (un utilisateur ne peut modifier que ses propres données)
- Middleware d'autorisation par endpoint

### 7.2 Validation et sanitization

**Validation** :
- **Frontend** : Zod schemas
- **Backend** : Zod validation middleware
- Validation stricte de tous les inputs

**Sanitization** :
- Nettoyage des inputs (XSS prevention)
- Validation des formats (email, téléphone, etc.)
- Limitation de taille (messages, descriptions)

### 7.3 Protection des données

**Chiffrement** :
- **Mots de passe** : bcrypt (salt rounds: 12)
- **Données sensibles** : Chiffrement au repos (optionnel, si nécessaire)
- **HTTPS** : Obligatoire (TLS 1.3)

**Données personnelles (RGPD)** :
- Consentement explicite (CGU, charte sanitaire)
- Droit à l'oubli (suppression de compte)
- Export des données (format JSON)
- Anonymisation des données après suppression

### 7.4 Rate limiting

**Protection contre les abus** :
- **Authentification** : 5 tentatives max, blocage 30 min
- **API générale** : 100 requêtes/minute par IP
- **Upload** : 10 uploads/heure par utilisateur
- **SMS/Email** : Limites par utilisateur (éviter spam)

**Implémentation** : Redis + express-rate-limit

### 7.5 Sécurité des fichiers

**Upload de photos** :
- Validation du type MIME (image/jpeg, image/png)
- Validation de la taille (max 5MB)
- Scan antivirus (optionnel, ClamAV)
- Stockage sécurisé (Cloudinary avec accès restreint)

### 7.6 Modération automatique

**Messagerie** :
- Détection de numéros de téléphone (regex)
- Blocage des pièces jointes
- Filtrage de contenu inapproprié (optionnel, API de modération)

**Repas** :
- Validation des photos (détection de vraies photos)
- Modération manuelle (optionnel, si nécessaire)

---

## 8. PERFORMANCE ET SCALABILITÉ

### 8.1 Optimisations base de données

**Index** :
- Index sur toutes les colonnes fréquemment filtrées
- Index composites pour requêtes complexes
- Index partiels pour requêtes conditionnelles

**Requêtes optimisées** :
- Pagination systématique (limit/offset ou cursor-based)
- Eager loading (Prisma `include`) pour éviter N+1 queries
- Requêtes agrégées pour statistiques

**Cache** :
- **Redis** : Cache des requêtes fréquentes (30 min TTL)
  - Liste des repas disponibles
  - Profils utilisateurs (public)
  - Statistiques

### 8.2 Optimisations API

**Pagination** :
- Limite par défaut : 20 résultats
- Maximum : 100 résultats
- Cursor-based pagination pour grandes listes

**Compression** :
- Gzip/Brotli pour toutes les réponses
- Compression des images (Cloudinary)

**CDN** :
- Cloudinary CDN pour images
- CloudFront (AWS) pour assets statiques (optionnel)

### 8.3 Optimisations frontend

**Code splitting** :
- Lazy loading des routes
- Dynamic imports pour composants lourds

**Cache** :
- RTK Query cache (Redux Toolkit)
- Service Worker pour cache offline (PWA)

**Optimisation images** :
- Lazy loading des images
- Formats modernes (WebP avec fallback)
- Responsive images (srcset)

### 8.4 Scalabilité

**Architecture évolutive** :
- **MVP** : Monolithique modulaire
- **Évolution** : Séparation en microservices si nécessaire
  - Service d'authentification
  - Service de repas
  - Service de notifications
  - Service de paiements

**Horizontal scaling** :
- Load balancer (Nginx, AWS ALB)
- Plusieurs instances backend (stateless)
- Base de données : Read replicas si nécessaire

**Vertical scaling** :
- Augmentation des ressources serveur si nécessaire

---

## 9. DÉPLOIEMENT ET INFRASTRUCTURE

### 9.1 Environnements

**Développement** :
- Base de données locale (PostgreSQL Docker)
- Redis local (Docker)
- Variables d'environnement via `.env`

**Staging** :
- Environnement de test identique à production
- Données de test
- Tests E2E automatisés

**Production** :
- Infrastructure cloud (Railway, Render, ou AWS)
- Monitoring actif
- Backups automatiques

### 9.2 Configuration

**Variables d'environnement** :

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.solideat.fr
FRONTEND_URL=https://solideat.fr

# Base de données
# Option 1: PostgreSQL standard
DATABASE_URL=postgresql://user:password@host:5432/solideat
# Option 2: Google Cloud SQL (avec Cloud SQL Proxy)
# DATABASE_URL=postgresql://user:password@/solideat?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME

# Redis
# Option 1: Redis standard
REDIS_URL=redis://host:6379
# Option 2: Google Cloud Memorystore
# REDIS_URL=redis://MEMORYSTORE_IP:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Services externes
GOOGLE_MAPS_API_KEY=your-google-maps-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...
SENDGRID_API_KEY=SG...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
EMAIL_FROM=noreply@solideat.fr
```

### 9.3 Déploiement

**Backend** :
1. Build TypeScript → JavaScript
2. Tests automatisés
3. Déploiement sur Railway/Render/AWS/Google Cloud Run
4. Migration base de données (Prisma migrate)
5. Health check

**Frontend** :
1. Build production (Vite)
2. Déploiement sur Vercel/Netlify/Google Cloud Storage + CDN
3. Variables d'environnement configurées
4. CDN activé

**CI/CD Pipeline** (GitHub Actions) :
```yaml
# .github/workflows/deploy.yml
- Tests unitaires
- Tests d'intégration
- Build
- Déploiement staging
- Tests E2E
- Déploiement production (si staging OK)
```

### 9.4 Backups

**Base de données** :
- Backup quotidien automatique
- Rétention : 30 jours
- Backup avant chaque migration

**Fichiers** :
- Cloudinary : Backup automatique (intégré)
- S3 : Versioning activé (si utilisé)

### 9.5 Monitoring

**Health checks** :
- Endpoint `/health` : Vérification DB, Redis, services externes
- Monitoring toutes les 5 minutes

**Logs** :
- Winston pour logging structuré
- Niveaux : error, warn, info, debug
- Centralisation (optionnel : LogRocket, Datadog)

**Alertes** :
- Erreurs critiques → Email/Slack
- Performance dégradée → Alertes
- Services externes down → Alertes

### 9.6 Option Google Cloud Platform (GCP)

**Si choix de Google Cloud pour l'infrastructure** :

#### 9.6.1 Services GCP recommandés

**Base de données** :
- **Google Cloud SQL (PostgreSQL)** ⭐ **Recommandé pour MVP** :
  - Instance PostgreSQL 15+ gérée
  - Backups automatiques quotidiens
  - Read replicas pour scaling
  - Haute disponibilité (HA)
  - Connexion via Cloud SQL Proxy (sécurisé)
  - Compatible avec Prisma sans modification
  - Coût : ~$50-200/mois selon instance

- **Google Cloud Spanner** ⭐ **Alternative scalable** :
  - Base de données relationnelle distribuée globale
  - **SQL compatible** (donc compatible avec Prisma avec adaptation)
  - Scaling horizontal automatique
  - Haute disponibilité globale (multi-région)
  - Transactions ACID
  - Latence < 10ms
  - **Avantage** : Scalabilité infinie sans refonte architecture
  - **Inconvénient** : Plus cher (~$600+/mois minimum)
  - **Idéal pour** : Applications nécessitant scaling global

- **Firebase Firestore** (NoSQL) :
  - NoSQL document database
  - Scaling automatique
  - Real-time updates
  - **Inconvénient** : Nécessite refonte complète (pas de Prisma, pas de SQL)
  - Gratuit jusqu'à 50K reads/jour

- **Cloud Bigtable** (NoSQL wide-column) :
  - Pour très gros volumes (milliards de lignes)
  - **Pas adapté** pour ce projet (trop complexe, pas de relations)

**Cache et Queue** :
- **Google Cloud Memorystore (Redis)** :
  - Instance Redis 7+ gérée
  - Haute disponibilité
  - Compatible avec Bull (queue system)
  - Pas de modification de code nécessaire

**Backend** :
- **Google Cloud Run** :
  - Serverless containers (Node.js)
  - Auto-scaling automatique
  - Pay-per-use
  - HTTPS intégré
  - Alternative : **App Engine** (plus simple, moins flexible)

**Frontend** :
- **Google Cloud Storage + Cloud CDN** :
  - Stockage des fichiers statiques
  - CDN global pour performance
  - Alternative : **Firebase Hosting** (plus simple)

**Stockage fichiers** :
- **Google Cloud Storage** :
  - Alternative à Cloudinary
  - Buckets pour images
  - CDN intégré
  - Versioning et lifecycle management

**Monitoring** :
- **Google Cloud Monitoring** (anciennement Stackdriver) :
  - Métriques, logs, alertes
  - Dashboards personnalisés
  - Intégration avec autres services GCP

#### 9.6.2 Configuration Google Cloud SQL

**Connexion** :
```typescript
// Utilisation de Cloud SQL Proxy (recommandé)
// Ou connexion directe avec IP autorisée
DATABASE_URL=postgresql://user:password@/solideat?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

**Avantages** :
- Backups automatiques
- Patching automatique
- Monitoring intégré
- Scaling vertical/horizontal facile
- Réplication automatique

**Coûts** (estimations) :
- Instance db-f1-micro (développement) : ~$7/mois
- Instance db-n1-standard-1 (production) : ~$50/mois
- Storage : ~$0.17/GB/mois

#### 9.6.3 Alternative : Firebase Firestore (NoSQL)

**Si choix de Firebase au lieu de PostgreSQL** :

**Avantages** :
- NoSQL flexible
- Scaling automatique
- Real-time updates intégrés
- Offline support natif
- Gratuit jusqu'à 50K reads/jour

**Inconvénients** :
- Changement d'architecture nécessaire (pas de Prisma)
- Requêtes complexes plus difficiles
- Pas de relations SQL
- Coûts peuvent augmenter rapidement

**Migration nécessaire** :
- Remplacer Prisma par Firebase Admin SDK
- Restructurer le modèle de données (collections vs tables)
- Adapter les requêtes (Firestore queries vs SQL)

**Recommandation** : Rester sur PostgreSQL (Cloud SQL) pour MVP, plus adapté aux relations complexes du projet.

#### 9.6.4 Alternative : Google Cloud Spanner ⭐

**Cloud Spanner** est probablement l'alternative que vous cherchiez ! C'est une base de données relationnelle distribuée globale de Google.

**Caractéristiques principales** :
- **SQL compatible** : Utilise le dialecte SQL standard (avec quelques spécificités)
- **Relationnelle** : Supporte les relations, transactions ACID, contraintes
- **Distribuée globale** : Réplication automatique multi-région
- **Scaling horizontal** : Scalabilité infinie sans refonte
- **Haute disponibilité** : 99.999% uptime SLA
- **Latence faible** : < 10ms pour la plupart des opérations

**Compatibilité avec Prisma** :
- Prisma supporte Cloud Spanner via le driver `@google-cloud/spanner`
- Nécessite quelques adaptations dans le schéma Prisma
- La plupart des fonctionnalités Prisma fonctionnent

**Configuration Prisma pour Spanner** :
```prisma
// schema.prisma
datasource db {
  provider = "spanner"
  url      = env("SPANNER_DATABASE_URL")
}

// Format de l'URL
// SPANNER_DATABASE_URL="spanner://projects/PROJECT_ID/instances/INSTANCE_ID/databases/DATABASE_NAME"
```

**Avantages pour SOLID'EAT** :
- ✅ Pas de refonte majeure (SQL compatible)
- ✅ Scaling automatique si croissance rapide
- ✅ Performance globale (multi-région)
- ✅ Transactions ACID pour réservations critiques
- ✅ Compatible avec Prisma (avec adaptation)

**Inconvénients** :
- ❌ **Coût élevé** : Minimum ~$600/mois (instance régionale)
- ❌ Plus complexe que Cloud SQL
- ❌ Quelques limitations SQL (fonctions spécifiques)
- ❌ Overkill pour MVP (mais excellent pour scale)

**Quand utiliser Cloud Spanner** :
- Application nécessitant scaling global
- Besoin de haute disponibilité multi-région
- Budget disponible pour infrastructure premium
- Croissance rapide attendue

**Quand rester sur Cloud SQL** :
- MVP et développement initial
- Budget limité
- Scaling régional suffisant
- Simplicité recherchée

**Recommandation** :
- **MVP** : Cloud SQL (PostgreSQL) - Simple, économique, suffisant
- **Scale** : Migration vers Cloud Spanner si nécessaire (croissance rapide, besoin global)

### 9.7 Option Supabase ⭐⭐⭐ **EXCELLENT CHOIX POUR DÉMARRER**

**Supabase** est une excellente alternative open-source à Firebase, basée sur PostgreSQL. C'est **probablement la meilleure option pour démarrer le MVP** de SOLID'EAT.

#### 9.7.1 Pourquoi Supabase est idéal pour SOLID'EAT

**Avantages majeurs** :

1. **PostgreSQL natif** :
   - Base de données PostgreSQL 15+ gérée
   - **100% compatible avec Prisma** (aucune modification nécessaire)
   - SQL standard, pas de limitations
   - Extensions PostgreSQL disponibles

2. **Gratuit pour démarrer** :
   - Plan gratuit : 500MB base de données, 2GB storage, 50K MAU (Monthly Active Users)
   - Parfait pour MVP et développement
   - Pas de coût caché

3. **Fonctionnalités intégrées** :
   - **Auth** : Authentification JWT intégrée (peut remplacer Passport.js)
   - **Storage** : Stockage fichiers (photos de repas, profils)
   - **Real-time** : Subscriptions en temps réel (optionnel)
   - **Edge Functions** : Serverless functions (pour cron jobs)
   - **API REST auto-générée** : Basée sur le schéma DB

4. **Simplicité** :
   - Setup en 5 minutes
   - Dashboard intuitif
   - Migrations Prisma fonctionnent directement
   - Pas de configuration complexe

5. **Open Source** :
   - Code open source (auto-hébergement possible)
   - Communauté active
   - Pas de vendor lock-in strict

6. **Scaling progressif** :
   - Plan Pro : $25/mois (8GB DB, 100GB storage)
   - Plan Team : $599/mois (scaling avancé)
   - Migration vers autre PostgreSQL possible si nécessaire

#### 9.7.2 Architecture avec Supabase

**Ce qui change** :
- ✅ Base de données : Supabase PostgreSQL (au lieu de Cloud SQL)
- ✅ Storage : Supabase Storage (au lieu de Cloudinary)
- ✅ Auth : Supabase Auth (optionnel, peut garder JWT custom)
- ✅ Backend : Peut utiliser Supabase Edge Functions pour certains jobs

**Ce qui reste identique** :
- ✅ Prisma : Fonctionne exactement pareil
- ✅ Schéma de données : Aucun changement
- ✅ Code backend : Minimal (juste la connexion DB)
- ✅ Redis : Toujours nécessaire pour cache/queue (Upstash gratuit)

#### 9.7.3 Configuration avec Prisma

**Connexion Supabase** :
```typescript
// .env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

// Prisma fonctionne directement, aucune modification !
```

**Avantages** :
- Prisma Client généré identique
- Migrations Prisma fonctionnent
- Type-safety conservé
- Pas de changement de code

#### 9.7.4 Comparaison des options pour MVP

| Critère | Supabase | Cloud SQL | Railway PostgreSQL |
|---------|----------|-----------|---------------------|
| **Coût MVP** | **Gratuit** | ~$50/mois | ~$5-20/mois |
| **Setup** | ⚡ 5 min | 30 min | 10 min |
| **Prisma** | ✅ 100% | ✅ 100% | ✅ 100% |
| **Storage intégré** | ✅ Oui | ❌ Non | ❌ Non |
| **Auth intégré** | ✅ Oui | ❌ Non | ❌ Non |
| **Dashboard** | ✅ Excellent | ✅ Bon | ✅ Bon |
| **Scaling** | ✅ Progressif | ✅ Bon | ✅ Bon |
| **Backups** | ✅ Auto | ✅ Auto | ✅ Auto |

#### 9.7.5 Ce que Supabase apporte en plus

**Fonctionnalités bonus** (optionnelles) :

1. **Supabase Auth** :
   - Peut remplacer Passport.js
   - Gestion email/SMS intégrée
   - Social auth (Google, Facebook) facile
   - **Mais** : Peut garder JWT custom si préféré

2. **Supabase Storage** :
   - Alternative à Cloudinary
   - Buckets pour photos de repas
   - CDN intégré
   - Transformations d'images (basiques)
   - **Recommandation** : Garder Cloudinary pour optimisations avancées, ou utiliser Supabase Storage

3. **Real-time** :
   - Subscriptions PostgreSQL en temps réel
   - Utile pour notifications instantanées
   - **Optionnel** pour MVP

4. **Edge Functions** :
   - Serverless functions
   - Peut remplacer certains cron jobs
   - **Optionnel** : Garder Bull/Redis pour queue

#### 9.7.6 Plan de migration future

**Si besoin de migrer plus tard** :
- Migration PostgreSQL → PostgreSQL = **Trivial**
- Export/Import standard
- Prisma fonctionne identique
- Pas de vendor lock-in

**Scénarios de migration** :
- **Supabase → Cloud SQL** : Export SQL, import direct
- **Supabase → Self-hosted** : Supabase est open source
- **Supabase → Spanner** : Nécessite adaptation (mais rare)

#### 9.7.7 Recommandation finale

**Pour SOLID'EAT MVP** : ⭐⭐⭐ **Supabase est le meilleur choix**

**Pourquoi** :
1. ✅ **Gratuit pour démarrer** (500MB DB suffit pour MVP)
2. ✅ **Setup ultra-rapide** (5 minutes vs 30+ minutes)
3. ✅ **100% compatible** avec l'architecture définie
4. ✅ **Fonctionnalités bonus** (Storage, Auth) sans coût
5. ✅ **Pas de risque** : Migration facile si besoin
6. ✅ **Focus développement** : Moins de config, plus de code métier

**Stack recommandée avec Supabase** :
```
Frontend: React + TypeScript (Vercel)
Backend: Node.js + Express + Prisma (Railway/Render)
Database: Supabase PostgreSQL (gratuit)
Cache/Queue: Upstash Redis (gratuit jusqu'à 10K commands/jour)
Storage: Supabase Storage (gratuit 2GB) OU Cloudinary
Auth: Supabase Auth (optionnel) OU JWT custom
```

**Coût total MVP** : **$0/mois** (gratuit) jusqu'à ~1000 utilisateurs actifs

**Quand passer au plan payant** :
- > 500MB de données → Plan Pro $25/mois
- > 2GB storage → Plan Pro $25/mois
- > 50K utilisateurs/mois → Plan Pro $25/mois

**Conclusion** : Supabase permet de démarrer rapidement, sans coût, avec toutes les fonctionnalités nécessaires, et offre une migration simple si besoin.

---

## 10. MONITORING ET LOGS

### 10.1 Logging

**Structure des logs** :
```json
{
  "timestamp": "2026-01-15T10:30:00Z",
  "level": "info",
  "message": "Meal created",
  "userId": "uuid",
  "mealId": "uuid",
  "metadata": {}
}
```

**Niveaux de log** :
- **error** : Erreurs critiques nécessitant intervention
- **warn** : Avertissements (quota atteint, etc.)
- **info** : Actions importantes (création repas, réservation, etc.)
- **debug** : Informations détaillées (développement uniquement)

### 10.2 Métriques

**Métriques à suivre** :
- Temps de réponse API (p50, p95, p99)
- Taux d'erreur
- Nombre de requêtes par endpoint
- Utilisation CPU/Mémoire
- Taille base de données
- Nombre d'utilisateurs actifs

**Outils** :
- **Sentry** : Gestion des erreurs
- **Datadog/New Relic** : APM (optionnel MVP)
- **Grafana** : Dashboards (optionnel MVP)

### 10.3 Alertes

**Alertes critiques** :
- Base de données inaccessible
- Taux d'erreur > 5%
- Temps de réponse p95 > 1s
- Services externes down (Stripe, Google Maps, etc.)

---

## 11. PLAN DE MIGRATION ET ÉVOLUTIVITÉ

### 11.1 Évolutions prévues

**Court terme (post-MVP)** :
- Application mobile native (React Native)
- Authentification sociale (Google, Facebook)
- Système de parrainage
- Points de dépôt/retrait

**Moyen terme** :
- Intégration services de livraison tiers
- Événements communautaires
- Programme de fidélité
- Analytics avancés

**Long terme** :
- Microservices (si nécessaire)
- Internationalisation
- Multi-langues

### 11.2 Migration vers microservices

**Si nécessaire (scale)** :

**Services identifiés** :
1. **Auth Service** : Authentification, JWT, vérifications
2. **Meal Service** : Gestion des repas, réservations
3. **User Service** : Profils, statistiques
4. **Notification Service** : Emails, SMS, push
5. **Payment Service** : Stripe, abonnements
6. **Messaging Service** : Messagerie entre membres

**Communication** :
- API Gateway (Kong, AWS API Gateway)
- Message queue (RabbitMQ, AWS SQS) pour communication asynchrone
- Service mesh (optionnel, Istio)

### 11.3 Optimisations futures

**Base de données** :
- Read replicas pour scaling lecture
- Partitioning pour tables volumineuses
- Archivage des données anciennes

**Cache** :
- Cache distribué (Redis Cluster)
- Cache applicatif (in-memory)

**CDN** :
- CloudFront pour assets statiques
- Edge caching pour API (si possible)

---

## ANNEXES

### A. Schéma de déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                         │
│                    (Nginx / AWS ALB)                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐  ┌─────────▼────────┐  ┌──────▼──────┐
│  Backend 1   │  │   Backend 2       │  │  Backend 3  │
│  (Node.js)   │  │   (Node.js)       │  │  (Node.js)  │
└───────┬──────┘  └─────────┬─────────┘  └──────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐  ┌─────────▼────────┐  ┌──────▼──────┐
│  PostgreSQL  │  │      Redis       │  │ Cloudinary  │
│  (Primary)   │  │   (Cache/Queue)  │  │  (Images)   │
└───────┬──────┘  └──────────────────┘  └─────────────┘
        │
┌───────▼──────┐
│  PostgreSQL  │
│  (Replica)   │
└──────────────┘
```

### B. Checklist de déploiement

**Pré-déploiement** :
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Variables d'environnement configurées
- [ ] Migrations base de données préparées
- [ ] Secrets et clés API configurés
- [ ] Monitoring configuré

**Déploiement** :
- [ ] Backup base de données
- [ ] Déploiement backend
- [ ] Migration base de données
- [ ] Déploiement frontend
- [ ] Vérification health checks
- [ ] Tests smoke (vérification fonctionnalités critiques)

**Post-déploiement** :
- [ ] Monitoring actif
- [ ] Vérification logs
- [ ] Vérification métriques
- [ ] Communication équipe

### C. Technologies alternatives considérées

**Backend** :
- **NestJS** : Framework plus structuré, mais plus complexe pour MVP
- **Python/Django** : Écosystème différent, moins de cohérence avec frontend
- **Go** : Performance excellente, mais courbe d'apprentissage plus élevée

**Base de données** :
- **MongoDB** : NoSQL flexible, mais moins adapté aux relations complexes
- **MySQL** : Alternative à PostgreSQL, mais moins de fonctionnalités avancées

**Frontend** :
- **Vue.js** : Alternative à React, écosystème plus petit
- **Angular** : Plus lourd, moins adapté au MVP
- **Next.js** : Framework React avec SSR, mais complexité supplémentaire pour MVP

---

**Document créé par** : ARCHITECT  
**Basé sur** : SPECIFICATIONS_FONCTIONNELLES.md (Agent PM)  
**Prochaine étape** : STORY-CREATOR (User Stories et tâches de développement)
