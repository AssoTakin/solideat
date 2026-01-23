# DÉMARRAGE RAPIDE - APERÇU DE L'APPLICATION

**Date** : 2026  
**Agent** : DEV

---

## 🎯 OBJECTIF

Lancer l'application SOLID'EAT en local pour avoir un aperçu de toutes les fonctionnalités avant le déploiement.

---

## 📋 PRÉREQUIS

### Obligatoires
- ✅ Node.js 18+ installé
- ⚠️ PostgreSQL 15+ installé et en cours d'exécution
- ⚠️ Redis 7+ installé et en cours d'exécution

### Optionnels (pour fonctionnalités complètes)
- Google Maps API (pour géocodage)
- SendGrid (pour emails)
- Twilio (pour SMS)
- Cloudinary (pour images)

---

## 🚀 DÉMARRAGE EN 5 ÉTAPES

### 1. Vérifier les prérequis

```bash
# Vérifier Node.js
node --version  # Doit être >= 18

# Vérifier PostgreSQL
psql --version  # Doit être >= 15

# Vérifier Redis
redis-cli ping  # Doit répondre "PONG"
```

### 2. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurer la base de données

```bash
cd backend

# Créer la base de données (si elle n'existe pas)
createdb solideat
# ou via psql:
# psql -U postgres -c "CREATE DATABASE solideat;"

# Appliquer les migrations
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate
```

### 4. Démarrer les services

**Terminal 1 - Backend** :
```bash
cd backend
npm run dev
```
Le backend devrait démarrer sur `http://localhost:3000`

**Terminal 2 - Frontend** :
```bash
cd frontend
npm run dev
```
Le frontend devrait démarrer sur `http://localhost:5173`

### 5. Accéder à l'application

Ouvrir dans le navigateur : **http://localhost:5173**

---

## 📱 PAGES DISPONIBLES

### Authentification
- `/register` - Inscription
- `/login` - Connexion
- `/verify` - Vérification email/téléphone

### Navigation principale
- `/dashboard` - Tableau de bord (nécessite authentification)
- `/meals` - Liste des repas disponibles
- `/meals/:id` - Détails d'un repas
- `/meals/:id/reserve` - Réserver un repas
- `/save-them` - Repas à sauver (expirant bientôt)

### Gestion
- `/reservations` - Mes réservations
- `/messages` - Conversations
- `/messages/:mealId` - Conversation pour un repas
- `/meals/:mealId/review` - Créer un avis
- `/users/:id` - Profil utilisateur

### Abonnements
- `/subscriptions/plans` - Plans d'abonnement

---

## 🧪 TESTER L'APPLICATION

### 1. Créer un compte
1. Aller sur `/register`
2. Remplir le formulaire :
   - Email (ex: `test@example.com`)
   - Téléphone (ex: `+33612345678`)
   - Mot de passe
   - Adresse
3. Cliquer sur "S'inscrire"

⚠️ **Note** : En développement, les emails/SMS ne seront pas envoyés si les clés API ne sont pas configurées. Le token de vérification sera affiché dans les logs du backend (mode dev).

### 2. Se connecter
1. Aller sur `/login`
2. Entrer email et mot de passe
3. Cliquer sur "Se connecter"

### 3. Explorer le dashboard
- Vue d'ensemble : Statistiques, activité
- Messages système : Notifications importantes
- Quotas : État des quotas hebdomadaires/mensuels

### 4. Créer un repas
1. Aller sur `/dashboard`
2. Chercher le bouton "Créer un repas" (ou `/meals`)
3. Remplir le formulaire de création

### 5. Réserver un repas
1. Aller sur `/meals`
2. Cliquer sur un repas
3. Cliquer sur "Réserver"

---

## 🔧 MODE DÉVELOPPEMENT

### Services externes non configurés

Si les services externes ne sont pas configurés, l'application fonctionnera en mode "développement" :

- **Emails** : Non envoyés (logs dans la console backend)
- **SMS** : Non envoyés (logs dans la console backend)
- **Géocodage** : Coordonnées par défaut (Paris)
- **Images** : Upload non fonctionnel (Cloudinary requis)

### Base de données

En développement, vous pouvez utiliser :
- PostgreSQL local
- Ou une base de données distante (Supabase, Railway, etc.)

### Redis

En développement, vous pouvez utiliser :
- Redis local
- Ou un service cloud (Upstash, Railway, etc.)

---

## 🐛 DÉPANNAGE

### Erreur : "Cannot connect to database"
- Vérifier que PostgreSQL est démarré
- Vérifier la `DATABASE_URL` dans `backend/.env`
- Vérifier que la base de données `solideat` existe

### Erreur : "Cannot connect to Redis"
- Vérifier que Redis est démarré
- Vérifier la `REDIS_URL` dans `backend/.env`
- Tester avec `redis-cli ping`

### Erreur : "Port already in use"
- Changer le `PORT` dans `backend/.env`
- Ou arrêter le processus qui utilise le port

### Erreur : "Prisma migrate"
- Vérifier que la base de données existe
- Vérifier les permissions PostgreSQL
- Essayer `npx prisma migrate reset` (⚠️ supprime les données)

---

## 📊 DONNÉES DE TEST

### Créer des données de test

Vous pouvez utiliser Prisma Studio pour visualiser et créer des données :

```bash
cd backend
npx prisma studio
```

Cela ouvrira une interface web sur `http://localhost:5555`

### Seed la base de données (si un fichier seed existe)

```bash
cd backend
npm run prisma:seed
```

---

## 🎨 INTERFACE UTILISATEUR

L'application utilise un design simple et fonctionnel. Les composants principaux sont :

- **Dashboard** : Tableau de bord avec onglets
- **MealList** : Liste des repas avec filtres
- **MealDetails** : Détails d'un repas
- **SystemMessages** : Messages système avec badges
- **QuotaStatus** : Barres de progression pour les quotas

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de continuer vers le déploiement, vérifier :

- [ ] L'application démarre sans erreur
- [ ] La base de données est accessible
- [ ] Redis est accessible
- [ ] L'inscription fonctionne
- [ ] La connexion fonctionne
- [ ] Le dashboard s'affiche
- [ ] La liste des repas s'affiche
- [ ] Les réservations fonctionnent
- [ ] Les messages fonctionnent

---

**Document créé par** : DEV  
**Dernière mise à jour** : 2026
