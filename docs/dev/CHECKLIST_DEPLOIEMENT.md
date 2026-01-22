# CHECKLIST DE PRÉ-DÉPLOIEMENT - SOLID'EAT

**Date** : 2026  
**Agent** : DEV  
**Statut** : ✅ Prêt pour déploiement

---

## ✅ VÉRIFICATIONS TECHNIQUES

### Backend
- [x] Compilation TypeScript sans erreurs (`npm run build`)
- [x] Tests unitaires passent (`npm test`)
- [x] Tests d'intégration passent (`npm run test:integration`)
- [x] Linting sans erreurs (`npm run lint`)
- [x] Tous les logs de debug retirés
- [x] Variables d'environnement documentées (`.env.example`)
- [x] Scripts de build et start configurés
- [x] Health check endpoint configuré (`/health`)

### Frontend
- [x] Compilation TypeScript sans erreurs (`npm run build`)
- [x] Build de production fonctionne (`npm run build`)
- [x] Tests unitaires passent (`npm test`)
- [x] Tests E2E configurés (`npm run test:e2e`)
- [x] Linting sans erreurs (`npm run lint`)
- [x] Tous les logs de debug retirés
- [x] Variables d'environnement documentées (`.env.example`)

### Base de données
- [ ] Migrations Prisma préparées et testées
- [ ] Backup de la base de données effectué (si migration)
- [ ] Schéma Prisma à jour
- [ ] Index et contraintes vérifiés

### Infrastructure
- [ ] Variables d'environnement de production configurées
- [ ] Secrets et clés API configurés (SendGrid, Twilio, Stripe, Cloudinary, Google Maps)
- [ ] Base de données PostgreSQL accessible
- [ ] Redis accessible
- [ ] Domaine et DNS configurés
- [ ] Certificats SSL configurés (HTTPS)

---

## 📋 CHECKLIST DE DÉPLOIEMENT

### Pré-déploiement
- [ ] Backup complet de la base de données
- [ ] Backup des fichiers (si applicable)
- [ ] Vérification des variables d'environnement
- [ ] Tests de smoke sur environnement de staging (si disponible)

### Déploiement Backend
1. [ ] Build du backend (`npm run build`)
2. [ ] Déploiement sur la plateforme (Railway/Render/AWS/Google Cloud Run)
3. [ ] Vérification des variables d'environnement
4. [ ] Exécution des migrations Prisma (`npx prisma migrate deploy`)
5. [ ] Génération du client Prisma (`npx prisma generate`)
6. [ ] Vérification du health check (`GET /health`)
7. [ ] Vérification des logs de démarrage

### Déploiement Frontend
1. [ ] Build du frontend (`npm run build`)
2. [ ] Déploiement sur la plateforme (Vercel/Netlify/Google Cloud Storage + CDN)
3. [ ] Configuration des variables d'environnement (préfixées par `VITE_`)
4. [ ] Vérification de l'URL de l'API backend
5. [ ] Test de chargement de la page d'accueil
6. [ ] Vérification du CDN et cache

### Post-déploiement
- [ ] Tests smoke sur les fonctionnalités critiques :
  - [ ] Authentification (inscription, connexion)
  - [ ] Création d'un repas
  - [ ] Réservation d'un repas
  - [ ] Messagerie
- [ ] Vérification des jobs cron (logs)
- [ ] Vérification des notifications (email/SMS)
- [ ] Monitoring actif (Sentry, logs)
- [ ] Vérification des métriques
- [ ] Communication équipe

---

## 🔧 CONFIGURATION REQUISE

### Variables d'environnement Backend

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.solideat.fr
FRONTEND_URL=https://solideat.fr

# Base de données
DATABASE_URL=postgresql://user:password@host:5432/solideat

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=<secret-min-256-bits>
JWT_EXPIRES_IN=7d

# Services externes
GOOGLE_MAPS_API_KEY=<key>
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

### Variables d'environnement Frontend

```env
VITE_API_URL=https://api.solideat.fr
VITE_GOOGLE_MAPS_API_KEY=<key>
```

---

## 🚀 COMMANDES DE DÉPLOIEMENT

### Backend
```bash
cd backend
npm install
npm run build
npx prisma migrate deploy
npx prisma generate
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
# Déployer le dossier dist/
```

---

## 📊 MONITORING

### À surveiller après déploiement
- [ ] Taux d'erreur HTTP (doit être < 1%)
- [ ] Temps de réponse API (doit être < 500ms)
- [ ] Utilisation CPU/Mémoire
- [ ] Connexions base de données
- [ ] Jobs cron s'exécutent correctement
- [ ] Envoi d'emails/SMS fonctionne

---

## 🔄 ROLLBACK

En cas de problème :
1. [ ] Arrêter le déploiement
2. [ ] Restaurer la version précédente
3. [ ] Restaurer la base de données si nécessaire
4. [ ] Vérifier que l'ancienne version fonctionne
5. [ ] Analyser les logs pour identifier le problème

---

## ✅ VALIDATION FINALE

- [ ] Tous les tests passent
- [ ] Builds fonctionnent
- [ ] Aucun log de debug
- [ ] Variables d'environnement configurées
- [ ] Documentation à jour
- [ ] Code review effectué (si applicable)

---

**Document créé par** : DEV  
**Dernière mise à jour** : 2026
