# 🚀 PLAN DE PRODUCTION - SOLID'EAT

**Date** : 23 janvier 2026  
**Agent** : DEV  
**Statut** : ⏳ En préparation

---

## 📊 ÉTAT ACTUEL

### ✅ Ce qui est fait

- ✅ **Code** : Tous les sprints complétés (13/13)
- ✅ **Tests** : 112 tests unitaires + 37 tests d'intégration (100% réussis)
- ✅ **Compilation** : Backend et Frontend compilent sans erreurs
- ✅ **Stripe** : Configuration complète en mode **TEST**
- ✅ **Backend** : Routes, controllers, services fonctionnels
- ✅ **Frontend** : Interface utilisateur complète
- ✅ **Base de données** : Schéma Prisma à jour

### ⏳ Ce qui reste à faire

- ✅ **Domaine** : `solid-eat.com` acheté ✅
- ⏳ **Stripe Production** : Passer en mode LIVE
- ⏳ **Infrastructure** : Choisir et configurer l'hébergement
- ⏳ **Configuration DNS** : Configurer `solid-eat.com` et `api.solid-eat.com`
- ⏳ **Variables d'environnement** : Configurer les secrets de production
- ⏳ **Monitoring** : Mettre en place Sentry/logs
- ⏳ **Tests de charge** : Valider les performances
- ⏳ **Sécurité** : Audit et renforcement

---

## 🎯 PROCHAINES ÉTAPES (Par ordre de priorité)

### PHASE 1 : Finalisation Stripe Production (Priorité HAUTE) - 2-3 jours

#### 1.1 Passer Stripe en mode LIVE

**Actions** :
1. **Activer le mode Live dans Stripe Dashboard**
   - Aller sur : https://dashboard.stripe.com/settings/account
   - Activer le mode Live (toggle en haut à droite)

2. **Récupérer les clés API Live**
   - Aller sur : https://dashboard.stripe.com/apikeys
   - Copier la **Secret Key Live** (commence par `sk_live_...`)
   - Copier la **Publishable Key Live** (commence par `pk_live_...`)

3. **Vérifier les Price IDs en mode Live**
   - Aller sur : https://dashboard.stripe.com/products
   - Vérifier que les 3 produits existent en mode Live
   - Si non, créer les produits avec les mêmes prix :
     - Premium Hebdomadaire : 2,50 € / semaine
     - Premium Mensuel : 9,00 € / mois
     - Premium Annuel : 90,00 € / an
   - Récupérer les **Price IDs Live** (commencent par `price_...`)

4. **Créer le webhook en mode Live** (après déploiement du backend)
   - Aller sur : https://dashboard.stripe.com/webhooks
   - Cliquer sur "+ Add endpoint"
   - **URL** : `https://api.solid-eat.com/webhooks/stripe`
   - **Description** : "SolidEat - Webhook Production"
   - **Événements à écouter** :
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - **Récupérer le Webhook Secret** (cliquer sur "Reveal")

**Fichiers à mettre à jour** :
- `backend/.env` (production) : Remplacer les clés test par les clés live
- `frontend/.env` (production) : Remplacer la publishable key

---

### PHASE 2 : Choix et Configuration Infrastructure (Priorité HAUTE) - 1 semaine

#### 2.1 Choisir les plateformes d'hébergement

**Options recommandées** :

**Backend** :
- **Railway** (recommandé) : Simple, PostgreSQL inclus, Redis disponible
- **Render** : Alternative simple
- **Google Cloud Run** : Plus flexible, plus complexe
- **AWS Elastic Beanstalk** : Entreprise, plus complexe

**Frontend** :
- **Vercel** (recommandé) : Optimisé pour React/Vite, CDN inclus
- **Netlify** : Alternative simple
- **Cloudflare Pages** : CDN performant

**Base de données** :
- **⭐ Supabase PostgreSQL** (recommandé pour MVP) : Gratuit, setup rapide, 100% compatible Prisma
- **PostgreSQL** : Railway/Render (inclus) ou Google Cloud SQL
- **Redis** : Railway/Render (inclus) ou Upstash (gratuit jusqu'à 10K commands/jour)

#### 2.2 Configurer le domaine

**Actions** :
1. ✅ Domaine `solid-eat.com` acheté
2. Configurer les sous-domaines :
   - `api.solid-eat.com` → Backend
   - `solid-eat.com` → Frontend
3. Configurer les DNS :
   - A record pour le domaine principal
   - CNAME pour le sous-domaine API
4. Configurer les certificats SSL (généralement automatique avec les plateformes)

---

### PHASE 3 : Configuration Variables d'Environnement (Priorité HAUTE) - 1-2 jours

#### 3.1 Backend - Variables de production

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.solid-eat.com
FRONTEND_URL=https://solid-eat.com

# Base de données
DATABASE_URL=postgresql://user:password@host:5432/solideat

# Redis
REDIS_URL=redis://host:6379

# JWT (⚠️ Générer une clé sécurisée de 256 bits minimum)
JWT_SECRET=<générer-une-clé-sécurisée-min-256-bits>
JWT_EXPIRES_IN=7d

# Services externes
GOOGLE_MAPS_API_KEY=<clé-production>
STRIPE_SECRET_KEY=sk_live_...  # Clé LIVE
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Clé LIVE
STRIPE_WEBHOOK_SECRET=whsec_...  # Secret du webhook LIVE
STRIPE_PRICE_ID_WEEKLY=price_...  # Price ID LIVE
STRIPE_PRICE_ID_MONTHLY=price_...  # Price ID LIVE
STRIPE_PRICE_ID_YEARLY=price_...  # Price ID LIVE
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...
SENDGRID_API_KEY=SG...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
EMAIL_FROM=noreply@solid-eat.com
```

#### 3.2 Frontend - Variables de production

```env
VITE_API_URL=https://api.solid-eat.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=<clé-production>
```

**⚠️ IMPORTANT** :
- Ne jamais commiter les fichiers `.env` de production
- Utiliser les variables d'environnement de la plateforme d'hébergement
- Générer un `JWT_SECRET` sécurisé (256 bits minimum)

---

### PHASE 4 : Déploiement Backend (Priorité HAUTE) - 1 jour

#### 4.1 Préparer le déploiement

**Actions** :
1. **Vérifier le build** :
   ```bash
   cd backend
   npm run build
   ```

2. **Préparer les migrations** :
   ```bash
   npx prisma migrate deploy --preview-feature
   ```

3. **Vérifier les scripts** dans `package.json` :
   - `start` : Doit démarrer le serveur en production
   - `build` : Doit compiler TypeScript

#### 4.2 Déployer sur la plateforme

**Exemple avec Railway** :
1. Créer un compte Railway
2. Créer un nouveau projet
3. Connecter le repository GitHub
4. Configurer les variables d'environnement
5. Railway détecte automatiquement Node.js et déploie

**Commandes de déploiement** (si manuel) :
```bash
cd backend
npm install --production
npm run build
npx prisma migrate deploy
npx prisma generate
npm start
```

#### 4.3 Vérifications post-déploiement

- [ ] Health check : `GET https://api.solid-eat.com/health`
- [ ] Vérifier les logs de démarrage
- [ ] Vérifier que les migrations sont appliquées
- [ ] Tester une route API : `GET https://api.solid-eat.com/`

---

### PHASE 5 : Déploiement Frontend (Priorité HAUTE) - 1 jour

#### 5.1 Préparer le build

**Actions** :
1. **Vérifier le build** :
   ```bash
   cd frontend
   npm run build
   ```

2. **Vérifier le dossier `dist/`** :
   - Doit contenir les fichiers compilés
   - Vérifier que les variables d'environnement sont correctes

#### 5.2 Déployer sur la plateforme

**Exemple avec Vercel** :
1. Créer un compte Vercel
2. Importer le projet depuis GitHub
3. Configurer :
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
4. Configurer les variables d'environnement (préfixées par `VITE_`)
5. Déployer

#### 5.3 Vérifications post-déploiement

- [ ] Page d'accueil charge correctement
- [ ] API backend accessible depuis le frontend
- [ ] Pas d'erreurs dans la console
- [ ] HTTPS activé
- [ ] CDN fonctionne

---

### PHASE 6 : Configuration Stripe Webhook Production (Priorité HAUTE) - 1 jour

#### 6.1 Créer le webhook dans Stripe Dashboard

**Actions** :
1. Aller sur : https://dashboard.stripe.com/webhooks (mode Live)
2. Cliquer sur "+ Add endpoint"
3. **URL** : `https://api.solid-eat.com/webhooks/stripe`
4. **Description** : "SolidEat - Webhook Production"
5. **Événements** :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Cliquer sur "Add endpoint"
7. **Récupérer le Webhook Secret** :
   - Cliquer sur l'endpoint créé
   - Section "Signing secret"
   - Cliquer sur "Reveal"
   - Copier le secret (commence par `whsec_...`)

#### 6.2 Mettre à jour la configuration

**Actions** :
1. Ajouter le webhook secret dans les variables d'environnement du backend
2. Redémarrer le backend pour prendre en compte le nouveau secret
3. Tester avec un webhook de test depuis Stripe Dashboard

---

### PHASE 7 : Monitoring et Logs (Priorité MOYENNE) - 2-3 jours

#### 7.1 Configurer Sentry

**Actions** :
1. Créer un compte Sentry
2. Créer un projet pour le backend
3. Installer le SDK :
   ```bash
   cd backend
   npm install @sentry/node
   ```
4. Configurer dans `backend/src/index.ts`
5. Ajouter la clé DSN dans les variables d'environnement

#### 7.2 Configurer les logs

**Actions** :
1. Configurer un service de logs (ex: Logtail, Datadog)
2. Ou utiliser les logs de la plateforme (Railway, Render)
3. Configurer les niveaux de log (ERROR, WARN, INFO)

#### 7.3 Métriques

**Actions** :
1. Configurer des alertes sur :
   - Taux d'erreur HTTP (> 1%)
   - Temps de réponse (> 1s)
   - Utilisation CPU/Mémoire (> 80%)
2. Dashboard de monitoring

---

### PHASE 8 : Tests et Validation (Priorité HAUTE) - 3-5 jours

#### 8.1 Tests Smoke

**Actions** :
- [ ] Inscription utilisateur
- [ ] Connexion utilisateur
- [ ] Création d'un repas
- [ ] Réservation d'un repas
- [ ] Messagerie
- [ ] Abonnement Stripe (test avec carte de test)

#### 8.2 Tests de charge

**Actions** :
1. Utiliser un outil comme k6 ou Artillery
2. Tester avec 100, 500, 1000 utilisateurs simultanés
3. Vérifier les temps de réponse
4. Identifier les goulots d'étranglement

#### 8.3 Tests de sécurité

**Actions** :
- [ ] Audit de sécurité (OWASP)
- [ ] Vérification des headers de sécurité
- [ ] Tests d'injection SQL
- [ ] Vérification des tokens JWT
- [ ] Vérification CORS

---

### PHASE 9 : Documentation et Communication (Priorité MOYENNE) - 1-2 jours

#### 9.1 Documentation

**Actions** :
- [ ] Documenter les URLs de production
- [ ] Documenter les procédures de déploiement
- [ ] Documenter les procédures de rollback
- [ ] Documenter les contacts d'urgence

#### 9.2 Communication

**Actions** :
- [ ] Informer l'équipe du lancement
- [ ] Préparer un plan de communication utilisateurs
- [ ] Préparer un plan de support

---

## 📋 CHECKLIST GLOBALE

### Pré-production
- [ ] Stripe configuré en mode Live
- [ ] Infrastructure choisie et configurée
- [ ] Domaine configuré avec SSL
- [ ] Variables d'environnement configurées
- [ ] Base de données de production créée
- [ ] Redis de production configuré

### Déploiement
- [ ] Backend déployé et fonctionnel
- [ ] Frontend déployé et fonctionnel
- [ ] Webhook Stripe configuré en production
- [ ] Health checks passent
- [ ] Migrations appliquées

### Post-déploiement
- [ ] Tests smoke passent
- [ ] Monitoring actif
- [ ] Logs configurés
- [ ] Alertes configurées
- [ ] Documentation à jour

---

## ⏱️ ESTIMATION TEMPORELLE

- **Phase 1** (Stripe Production) : 2-3 jours
- **Phase 2** (Infrastructure) : 1 semaine
- **Phase 3** (Variables d'environnement) : 1-2 jours
- **Phase 4** (Déploiement Backend) : 1 jour
- **Phase 5** (Déploiement Frontend) : 1 jour
- **Phase 6** (Webhook Stripe) : 1 jour
- **Phase 7** (Monitoring) : 2-3 jours
- **Phase 8** (Tests) : 3-5 jours
- **Phase 9** (Documentation) : 1-2 jours

**Total estimé** : **3-4 semaines**

---

## 🎯 PRIORITÉS IMMÉDIATES

1. **Cette semaine** :
   - [x] ✅ Domaine `solid-eat.com` acheté
   - [ ] Finaliser Stripe en mode Live
   - [ ] Choisir les plateformes d'hébergement
   - [ ] Configurer le domaine (DNS)

2. **Semaine prochaine** :
   - [ ] Déployer le backend
   - [ ] Déployer le frontend
   - [ ] Configurer le webhook Stripe production

3. **Semaine suivante** :
   - [ ] Tests et validation
   - [ ] Monitoring
   - [ ] Documentation

---

## 📚 RESSOURCES

- **Checklist déploiement** : `docs/dev/CHECKLIST_DEPLOIEMENT.md`
- **Rapport production** : `docs/dev/RAPPORT_PRODUCTION.md`
- **Configuration Stripe** : `docs/dev/STRIPE_CONFIGURATION_COMPLETE.md`
- **Architecture technique** : `docs/archi/ARCHITECTURE_TECHNIQUE.md`

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
