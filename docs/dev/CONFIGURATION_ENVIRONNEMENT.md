# CONFIGURATION DES VARIABLES D'ENVIRONNEMENT - PRODUCTION

**Date** : 2026  
**Agent** : DEV  
**Statut** : Guide de configuration

---

## 📋 VUE D'ENSEMBLE

Ce document détaille comment configurer toutes les variables d'environnement nécessaires pour le déploiement en production de SOLID'EAT.

---

## 🔧 VARIABLES BACKEND

### 1. Variables d'application

| Variable | Description | Exemple | Où configurer |
|----------|-------------|---------|----------------|
| `NODE_ENV` | Environnement d'exécution | `production` | Plateforme de déploiement |
| `PORT` | Port d'écoute du serveur | `3000` | Plateforme de déploiement |
| `API_URL` | URL publique de l'API | `https://api.solideat.fr` | Plateforme de déploiement |
| `FRONTEND_URL` | URL publique du frontend | `https://solideat.fr` | Plateforme de déploiement |

### 2. Base de données PostgreSQL

| Variable | Description | Exemple | Où configurer |
|----------|-------------|---------|----------------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:password@host:5432/solideat` | Plateforme de déploiement |

**Options de base de données** :
- **Supabase** (recommandé pour MVP) : Gratuit, setup rapide
- **Railway PostgreSQL** : Simple, intégré
- **AWS RDS** : Scalable, production
- **Google Cloud SQL** : Intégration GCP
- **Render PostgreSQL** : Simple, gratuit pour débuter

**Format de connexion** :
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### 3. Redis (Cache et Queue)

| Variable | Description | Exemple | Où configurer |
|----------|-------------|---------|----------------|
| `REDIS_URL` | URL de connexion Redis | `redis://host:6379` | Plateforme de déploiement |

**Options Redis** :
- **Upstash** (recommandé) : Serverless, gratuit pour débuter
- **Railway Redis** : Simple, intégré
- **AWS ElastiCache** : Scalable
- **Google Cloud Memorystore** : Intégration GCP
- **Redis Cloud** : Gestionné, gratuit pour débuter

**Format de connexion** :
```
redis://[host]:[port]
# ou avec authentification
redis://:[password]@[host]:[port]
```

### 4. JWT (Authentification)

| Variable | Description | Exemple | Où configurer |
|----------|-------------|---------|----------------|
| `JWT_SECRET` | Secret pour signer les tokens JWT | `[générer un secret de 256 bits minimum]` | Plateforme de déploiement (secret) |
| `JWT_EXPIRES_IN` | Durée de validité du token | `7d` | Plateforme de déploiement |

**Génération du JWT_SECRET** :
```bash
# Option 1 : OpenSSL
openssl rand -base64 32

# Option 2 : Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3 : En ligne
# https://generate-secret.vercel.app/32
```

⚠️ **IMPORTANT** : Le secret doit faire au minimum 256 bits (32 caractères en base64).

---

## 🔌 SERVICES EXTERNES

### 5. Google Maps API (Géocodage)

| Variable | Description | Où obtenir |
|----------|-------------|------------|
| `GOOGLE_MAPS_API_KEY` | Clé API Google Maps | [Google Cloud Console](https://console.cloud.google.com/) |

**Étapes** :
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un projet existant
3. Activer l'API "Geocoding API"
4. Créer des identifiants (Clé API)
5. Restreindre la clé (optionnel mais recommandé) :
   - Restrictions d'application : Sites web
   - Ajouter votre domaine : `solideat.fr`
   - Restrictions d'API : Geocoding API uniquement

**Coûts** : 
- 200$ de crédit gratuit par mois
- Puis 5$ pour 1000 requêtes

### 6. SendGrid (Emails)

| Variable | Description | Où obtenir |
|----------|-------------|------------|
| `SENDGRID_API_KEY` | Clé API SendGrid | [SendGrid Dashboard](https://app.sendgrid.com/) |
| `EMAIL_FROM` | Email expéditeur | `noreply@solideat.fr` |

**Étapes** :
1. Créer un compte sur [SendGrid](https://sendgrid.com/)
2. Vérifier votre domaine (ou utiliser l'email de test)
3. Aller dans Settings > API Keys
4. Créer une clé API avec permissions "Full Access" ou "Mail Send"
5. Copier la clé API (elle ne sera affichée qu'une fois)

**Coûts** : 
- Gratuit : 100 emails/jour
- Essentials : À partir de 19.95$/mois (40 000 emails)

**Configuration du domaine** :
- Ajouter votre domaine dans SendGrid
- Configurer les enregistrements DNS (SPF, DKIM, CNAME)
- Vérifier le domaine

### 7. Twilio (SMS)

| Variable | Description | Où obtenir |
|----------|-------------|------------|
| `TWILIO_ACCOUNT_SID` | Identifiant du compte Twilio | [Twilio Console](https://console.twilio.com/) |
| `TWILIO_AUTH_TOKEN` | Token d'authentification | [Twilio Console](https://console.twilio.com/) |
| `TWILIO_PHONE_NUMBER` | Numéro de téléphone Twilio | [Twilio Console](https://console.twilio.com/) |

**Étapes** :
1. Créer un compte sur [Twilio](https://www.twilio.com/)
2. Aller dans le Dashboard
3. Copier l'Account SID et l'Auth Token
4. Acheter un numéro de téléphone (ou utiliser le numéro d'essai)
5. Pour la France : Acheter un numéro français (+33)

**Coûts** : 
- Compte d'essai : Gratuit (crédit de test)
- Numéro français : ~1€/mois + 0.05€/SMS
- Numéro US : Gratuit avec compte d'essai

**Alternative** : OVH SMS (si besoin d'un service français)

### 8. Cloudinary (Stockage d'images)

| Variable | Description | Où obtenir |
|----------|-------------|------------|
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary | [Cloudinary Dashboard](https://cloudinary.com/console) |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | [Cloudinary Dashboard](https://cloudinary.com/console) |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | [Cloudinary Dashboard](https://cloudinary.com/console) |

**Étapes** :
1. Créer un compte sur [Cloudinary](https://cloudinary.com/)
2. Aller dans Dashboard
3. Copier le Cloud Name, API Key et API Secret
4. Configurer les upload presets (optionnel)

**Coûts** : 
- Gratuit : 25 GB de stockage, 25 GB de bande passante/mois
- Plus : À partir de 99$/mois

**Alternative** : AWS S3 + CloudFront (si besoin de plus de contrôle)

### 9. Stripe (Paiements - Optionnel pour MVP)

| Variable | Description | Où obtenir |
|----------|-------------|------------|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | [Stripe Dashboard](https://dashboard.stripe.com/) |
| `STRIPE_WEBHOOK_SECRET` | Secret pour webhooks | [Stripe Dashboard](https://dashboard.stripe.com/) |

**Étapes** :
1. Créer un compte sur [Stripe](https://stripe.com/)
2. Aller dans Developers > API keys
3. Copier la clé secrète (mode Live)
4. Configurer les webhooks :
   - Endpoint : `https://api.solideat.fr/api/stripe/webhook`
   - Événements : `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copier le secret du webhook

**Coûts** : 
- 2.9% + 0.25€ par transaction réussie
- Pas de frais mensuels

⚠️ **IMPORTANT** : Utiliser les clés de test (`sk_test_...`) en développement et les clés live (`sk_live_...`) en production.

---

## 🌐 VARIABLES FRONTEND

### Variables d'environnement

| Variable | Description | Exemple | Où configurer |
|----------|-------------|---------|----------------|
| `VITE_API_URL` | URL de l'API backend | `https://api.solideat.fr` | Plateforme de déploiement |
| `VITE_GOOGLE_MAPS_API_KEY` | Clé API Google Maps | `[clé API]` | Plateforme de déploiement |

⚠️ **IMPORTANT** : Les variables frontend doivent être préfixées par `VITE_` pour être accessibles dans le code.

---

## 📝 FICHIER .env.example COMPLET

### Backend (`backend/.env.example`)

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.solideat.fr
FRONTEND_URL=https://solideat.fr

# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/solideat

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret-key-here-change-in-production-min-256-bits
JWT_EXPIRES_IN=7d

# Services externes
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
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

### Frontend (`frontend/.env.example`)

```env
VITE_API_URL=https://api.solideat.fr
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

---

## 🚀 CONFIGURATION PAR PLATEFORME

### Railway

1. **Backend** :
   - Créer un nouveau projet
   - Connecter le repository
   - Ajouter PostgreSQL (Add Database)
   - Ajouter Redis (Add Database)
   - Configurer les variables d'environnement dans Settings > Variables

2. **Frontend** :
   - Créer un nouveau projet (Static Site)
   - Connecter le repository
   - Build command : `npm run build`
   - Output directory : `dist`
   - Configurer les variables d'environnement

### Render

1. **Backend** :
   - Créer un nouveau Web Service
   - Connecter le repository
   - Build command : `npm install && npm run build`
   - Start command : `npm start`
   - Ajouter PostgreSQL (Add Database)
   - Ajouter Redis (Add Redis)
   - Configurer les variables d'environnement

2. **Frontend** :
   - Créer un nouveau Static Site
   - Connecter le repository
   - Build command : `npm install && npm run build`
   - Publish directory : `dist`
   - Configurer les variables d'environnement

### Vercel (Frontend uniquement)

1. Créer un nouveau projet
2. Connecter le repository
3. Framework preset : Vite
4. Build command : `npm run build`
5. Output directory : `dist`
6. Configurer les variables d'environnement dans Settings > Environment Variables

### Netlify (Frontend uniquement)

1. Créer un nouveau site
2. Connecter le repository
3. Build command : `npm run build`
4. Publish directory : `dist`
5. Configurer les variables d'environnement dans Site settings > Build & deploy > Environment variables

---

## ✅ CHECKLIST DE CONFIGURATION

### Avant le déploiement

- [ ] Toutes les variables backend configurées
- [ ] Toutes les variables frontend configurées
- [ ] Base de données PostgreSQL créée et accessible
- [ ] Redis créé et accessible
- [ ] JWT_SECRET généré (256 bits minimum)
- [ ] Google Maps API activée et clé obtenue
- [ ] SendGrid configuré et clé API obtenue
- [ ] Twilio configuré (ou alternative)
- [ ] Cloudinary configuré (ou alternative)
- [ ] Stripe configuré (si nécessaire)
- [ ] Domaine configuré (DNS)
- [ ] Certificat SSL configuré (HTTPS)

### Tests de validation

- [ ] Test de connexion à la base de données
- [ ] Test de connexion à Redis
- [ ] Test d'envoi d'email (SendGrid)
- [ ] Test d'envoi de SMS (Twilio)
- [ ] Test de géocodage (Google Maps)
- [ ] Test d'upload d'image (Cloudinary)
- [ ] Test de paiement (Stripe - mode test)

---

## 🔒 SÉCURITÉ

### Bonnes pratiques

1. **Ne jamais commiter les fichiers `.env`** (déjà dans `.gitignore`)
2. **Utiliser des secrets différents** pour développement et production
3. **Restreindre les clés API** (domaines, IPs, permissions)
4. **Utiliser des secrets managés** par la plateforme de déploiement
5. **Activer la rotation des secrets** régulièrement
6. **Monitorer l'utilisation** des clés API

### Secrets managés

- **Railway** : Variables d'environnement sécurisées
- **Render** : Variables d'environnement sécurisées
- **Vercel** : Environment Variables (encrypted)
- **AWS** : AWS Secrets Manager
- **Google Cloud** : Secret Manager

---

## 📞 SUPPORT

En cas de problème :
1. Vérifier les logs de la plateforme de déploiement
2. Vérifier que toutes les variables sont bien configurées
3. Tester chaque service individuellement
4. Consulter la documentation de chaque service

---

**Document créé par** : DEV  
**Dernière mise à jour** : 2026
