# 🚀 GUIDE DE DÉPLOIEMENT PRODUCTION - SOLID'EAT

**Date** : 23 janvier 2026  
**Domaine** : `solid-eat.com` ✅  
**Plateformes** : Vercel (Frontend) + Railway (Backend) ✅  
**Statut** : Guide étape par étape

---

## ✅ CE QUI EST DÉJÀ FAIT

- [x] Domaine `solid-eat.com` acheté
- [x] Compte Vercel créé
- [x] Compte Railway créé
- [x] Repository GitHub configuré

---

## 📋 CHECKLIST COMPLÈTE DE DÉPLOIEMENT

### PHASE 1 : Préparation (30 minutes)

#### 1.1 Vérifier que le code est prêt

```bash
cd "/Users/samdokpo/Documents/Projets New/Dev/Solid'Eat 2026"

# Backend
cd backend
npm run build  # Vérifier qu'il n'y a pas d'erreurs
cd ..

# Frontend
cd frontend
npm run build  # Vérifier qu'il n'y a pas d'erreurs
cd ..
```

#### 1.2 Générer un JWT_SECRET sécurisé

```bash
# Générer une clé sécurisée de 256 bits
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ IMPORTANT** : Copiez cette clé, vous en aurez besoin pour Railway.

---

### PHASE 2 : Déploiement Backend sur Railway (45 minutes)

#### 2.1 Connecter Railway à GitHub

1. **Aller sur** : https://railway.app/
2. **Se connecter** avec votre compte
3. **Cliquer sur** : "New Project"
4. **Sélectionner** : "Deploy from GitHub repo"
5. **Autoriser Railway** à accéder à GitHub (si demandé)
6. **Sélectionner** votre repository : `AssoTakin/solideat`
7. **Cliquer sur** : "Deploy Now"

#### 2.2 Configurer le projet Railway

Une fois le projet créé, allez dans **Settings** :

1. **Root Directory** :
   - Cliquer sur "Edit"
   - Changer de `/` à `backend`
   - Cliquer sur "Save"

2. **Build Command** :
   - `npm install && npm run build`

3. **Start Command** :
   - `npm start`

#### 2.3 Configurer les variables d'environnement

**Settings** → **Variables** → Cliquer sur "New Variable" pour chaque variable :

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.solid-eat.com
FRONTEND_URL=https://solid-eat.com

# Base de données Supabase (remplacer par votre URL)
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres

# Redis (optionnel pour MVP - peut être ajouté plus tard)
# REDIS_URL=redis://...

# JWT (utiliser la clé générée à l'étape 1.2)
JWT_SECRET=VOTRE_CLE_GENERE_A_L_ETAPE_1_2
JWT_EXPIRES_IN=7d

# Stripe (Mode LIVE pour production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_WEEKLY=price_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

# Google Maps
GOOGLE_MAPS_API_KEY=VOTRE_CLE_GOOGLE_MAPS

# Twilio (SMS - optionnel pour MVP)
# TWILIO_ACCOUNT_SID=AC...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=+33...

# SendGrid (Email - optionnel pour MVP)
# SENDGRID_API_KEY=SG...

# Cloudinary (Images - optionnel pour MVP)
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...

# Email
EMAIL_FROM=noreply@solid-eat.com
```

**⚠️ IMPORTANT** :
- Remplacez toutes les valeurs `VOTRE_...` par vos vraies clés
- Pour Stripe, utilisez les clés **LIVE** (pas les clés de test)
- Les services optionnels (Twilio, SendGrid, Cloudinary) peuvent être configurés plus tard

#### 2.4 Ajouter le domaine personnalisé

1. **Settings** → **Networking** → **Custom Domain**
2. **Cliquer sur** : "Add Custom Domain"
3. **Entrer** : `api.solid-eat.com`
4. **Railway affiche** un CNAME à configurer chez OVH
5. **Copier** la valeur du CNAME (ex: `xxxxx.railway.app`)

#### 2.5 Vérifier le déploiement

1. **Railway déploie automatiquement** après la configuration
2. **Vérifier les logs** : Railway Dashboard → Deployments → Logs
3. **Attendre** que le déploiement soit terminé (2-5 minutes)
4. **Tester** : `https://[votre-url-railway].railway.app/health` (avant DNS)

---

### PHASE 3 : Déploiement Frontend sur Vercel (30 minutes)

#### 3.1 Connecter Vercel à GitHub

1. **Aller sur** : https://vercel.com/
2. **Se connecter** avec votre compte
3. **Cliquer sur** : "Add New..." → "Project"
4. **Importer** votre repository GitHub
5. **Autoriser Vercel** à accéder à GitHub (si demandé)
6. **Sélectionner** votre repository : `AssoTakin/solideat`
7. **Cliquer sur** : "Import"

#### 3.2 Configurer le projet Vercel

**Configuration** :

1. **Framework Preset** : Vite (détecté automatiquement) ✅

2. **Root Directory** :
   - Cliquer sur "Edit"
   - Changer de `/` à `frontend`
   - Cliquer sur "Save"

3. **Build Command** :
   - `npm run build` (déjà configuré) ✅

4. **Output Directory** :
   - `dist` (déjà configuré) ✅

5. **Install Command** :
   - `npm install` (déjà configuré) ✅

#### 3.3 Configurer les variables d'environnement

**Settings** → **Environment Variables** → Cliquer sur "Add" pour chaque variable :

```env
VITE_API_URL=https://api.solid-eat.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=VOTRE_CLE_GOOGLE_MAPS
```

**⚠️ IMPORTANT** : Les variables doivent commencer par `VITE_` pour être accessibles dans le frontend.

#### 3.4 Ajouter le domaine personnalisé

1. **Settings** → **Domains** → **Add Domain**
2. **Entrer** : `solid-eat.com`
3. **Vercel affiche** des instructions DNS
4. **Copier** les valeurs à configurer chez OVH

**Vercel peut fournir** :
- Un enregistrement **A** (IP) OU
- Un enregistrement **CNAME** (URL)

---

### PHASE 4 : Configuration DNS chez OVH (15 minutes)

#### 4.1 Accéder à la zone DNS

1. **Se connecter** à votre compte OVH
2. **Aller sur** : https://www.ovh.com/manager/web/
3. **Sélectionner** le domaine `solid-eat.com`
4. **Cliquer sur** : "Zone DNS" ou "Gestionnaire de zone DNS"

#### 4.2 Configurer le domaine principal (Frontend)

**Pour `solid-eat.com` → Vercel**

1. **Ajouter/Modifier** un enregistrement :

   **Si Vercel fournit une IP** :
   ```
   Type: A
   Sous-domaine: @ (ou laisser vide)
   Cible: [IP fournie par Vercel]
   TTL: 3600
   ```

   **Si Vercel fournit un CNAME** :
   ```
   Type: CNAME
   Sous-domaine: @ (ou laisser vide)
   Cible: [URL fournie par Vercel, ex: cname.vercel-dns.com]
   TTL: 3600
   ```

   **⚠️ Note** : Si OVH n'autorise pas CNAME sur `@`, utiliser un enregistrement A avec l'IP.

#### 4.3 Configurer le sous-domaine API

**Pour `api.solid-eat.com` → Railway**

1. **Ajouter** un enregistrement :

   ```
   Type: CNAME
   Sous-domaine: api
   Cible: [Valeur fournie par Railway, ex: xxxxx.railway.app]
   TTL: 3600
   ```

2. **Cliquer sur** : "Valider" ou "Ajouter"

#### 4.4 Vérifier la configuration DNS

**Configuration finale attendue** :

```
Type    Sous-domaine    Cible                                    TTL
----------------------------------------------------------------------------
A       @               [IP Vercel]                              3600
CNAME   api             xxxxx.railway.app                        3600
```

---

### PHASE 5 : Attendre la propagation DNS (1-2 heures)

#### 5.1 Temps de propagation

- **Minimum** : 5-15 minutes
- **Typique** : 1-2 heures
- **Maximum** : 24-48 heures (rare)

#### 5.2 Vérifier la propagation

**En ligne** :
- https://dnschecker.org
- https://www.whatsmydns.net

**En ligne de commande** :
```bash
dig solid-eat.com
dig api.solid-eat.com
```

---

### PHASE 6 : Vérifications post-déploiement (30 minutes)

#### 6.1 Vérifier le Backend

1. **Health Check** :
   ```bash
   curl https://api.solid-eat.com/health
   ```
   **Résultat attendu** : `{"status":"ok","database":"connected"}`

2. **Vérifier les logs Railway** :
   - Railway Dashboard → Deployments → Logs
   - Vérifier qu'il n'y a pas d'erreurs

#### 6.2 Vérifier le Frontend

1. **Ouvrir** : https://solid-eat.com
2. **Vérifier** :
   - La page se charge correctement
   - Pas d'erreurs dans la console (F12)
   - Les appels API fonctionnent

#### 6.3 Tests fonctionnels de base

- [ ] Page d'accueil charge
- [ ] Authentification (inscription/connexion)
- [ ] Création d'un repas (si applicable)
- [ ] Réservation d'un repas (si applicable)

---

### PHASE 7 : Configuration Stripe Webhook Production (15 minutes)

#### 7.1 Créer le webhook dans Stripe Dashboard

1. **Aller sur** : https://dashboard.stripe.com/
2. **Basculer en mode LIVE** (bouton en haut à droite)
3. **Aller sur** : Developers → Webhooks
4. **Cliquer sur** : "+ Add endpoint"
5. **Endpoint URL** : `https://api.solid-eat.com/webhooks/stripe`
6. **Description** : "SolidEat - Webhook Production"
7. **Sélectionner les événements** :
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
8. **Cliquer sur** : "Add endpoint"
9. **Récupérer le Webhook Secret** :
   - Cliquer sur le webhook créé
   - Dans "Signing secret", cliquer sur "Reveal"
   - **Copier le secret** (commence par `whsec_...`)

#### 7.2 Mettre à jour Railway

1. **Railway Dashboard** → **Settings** → **Variables**
2. **Modifier** `STRIPE_WEBHOOK_SECRET` avec le nouveau secret
3. **Railway redéploie automatiquement**

---

## 🎯 RÉCAPITULATIF DES ÉTAPES

### Ordre d'exécution

1. ✅ **Préparation** (30 min)
   - Vérifier les builds
   - Générer JWT_SECRET

2. ✅ **Railway Backend** (45 min)
   - Connecter GitHub
   - Configurer Root Directory
   - Ajouter variables d'environnement
   - Ajouter domaine `api.solid-eat.com`

3. ✅ **Vercel Frontend** (30 min)
   - Connecter GitHub
   - Configurer Root Directory
   - Ajouter variables d'environnement
   - Ajouter domaine `solid-eat.com`

4. ✅ **DNS OVH** (15 min)
   - Configurer domaine principal
   - Configurer sous-domaine API

5. ⏳ **Attendre propagation DNS** (1-2 heures)

6. ✅ **Vérifications** (30 min)
   - Tester backend
   - Tester frontend
   - Tests fonctionnels

7. ✅ **Stripe Webhook** (15 min)
   - Créer webhook production
   - Mettre à jour Railway

---

## 📝 VARIABLES D'ENVIRONNEMENT À PRÉPARER

### Pour Railway (Backend)

**Obligatoires** :
- `NODE_ENV=production`
- `PORT=3000`
- `API_URL=https://api.solid-eat.com`
- `FRONTEND_URL=https://solid-eat.com`
- `DATABASE_URL=...` (URL Supabase)
- `JWT_SECRET=...` (générer avec la commande de l'étape 1.2)
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_PUBLISHABLE_KEY=pk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (après création du webhook)
- `STRIPE_PRICE_ID_WEEKLY=price_...`
- `STRIPE_PRICE_ID_MONTHLY=price_...`
- `STRIPE_PRICE_ID_YEARLY=price_...`
- `GOOGLE_MAPS_API_KEY=...`
- `EMAIL_FROM=noreply@solid-eat.com`

**Optionnelles** (pour MVP) :
- `REDIS_URL=...` (peut être ajouté plus tard)
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `SENDGRID_API_KEY=...`
- `CLOUDINARY_CLOUD_NAME=...`

### Pour Vercel (Frontend)

**Obligatoires** :
- `VITE_API_URL=https://api.solid-eat.com`
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- `VITE_GOOGLE_MAPS_API_KEY=...`

---

## 🆘 DÉPANNAGE

### Le déploiement Railway échoue

1. **Vérifier les logs** :
   - Railway Dashboard → Deployments → Logs
   - Chercher les erreurs en rouge

2. **Vérifier les variables d'environnement** :
   - Toutes les variables obligatoires sont-elles configurées ?
   - Les valeurs sont-elles correctes ?

3. **Vérifier le Root Directory** :
   - Doit être `backend` (pas `/`)

### Le déploiement Vercel échoue

1. **Vérifier les logs** :
   - Vercel Dashboard → Deployments → Logs

2. **Vérifier le Root Directory** :
   - Doit être `frontend` (pas `/`)

3. **Vérifier les variables d'environnement** :
   - Doivent commencer par `VITE_`

### Le domaine ne fonctionne pas

1. **Vérifier la propagation DNS** :
   - https://dnschecker.org
   - Attendre 1-2 heures

2. **Vérifier la configuration DNS** :
   - Les enregistrements sont-ils corrects ?
   - Le TTL est-il 3600 ?

3. **Vérifier sur les plateformes** :
   - Railway : Le domaine est-il configuré ?
   - Vercel : Le domaine est-il configuré ?

---

## ✅ CHECKLIST FINALE

### Railway (Backend)
- [ ] Projet créé et connecté à GitHub
- [ ] Root Directory : `backend`
- [ ] Build Command : `npm install && npm run build`
- [ ] Start Command : `npm start`
- [ ] Toutes les variables d'environnement configurées
- [ ] Domaine `api.solid-eat.com` ajouté
- [ ] DNS configuré chez OVH
- [ ] Health check fonctionne : `https://api.solid-eat.com/health`

### Vercel (Frontend)
- [ ] Projet créé et connecté à GitHub
- [ ] Root Directory : `frontend`
- [ ] Build Command : `npm run build`
- [ ] Output Directory : `dist`
- [ ] Variables d'environnement configurées (préfixées `VITE_`)
- [ ] Domaine `solid-eat.com` ajouté
- [ ] DNS configuré chez OVH
- [ ] Site accessible : `https://solid-eat.com`

### Stripe
- [ ] Webhook production créé
- [ ] Webhook secret configuré dans Railway
- [ ] Clés LIVE configurées (pas les clés de test)

### Tests
- [ ] Backend accessible
- [ ] Frontend accessible
- [ ] Authentification fonctionne
- [ ] Pas d'erreurs dans les logs

---

## 🎉 FÉLICITATIONS !

Une fois toutes ces étapes terminées, votre application SOLID'EAT sera en ligne sur :
- **Frontend** : https://solid-eat.com
- **Backend** : https://api.solid-eat.com

**Les déploiements futurs seront automatiques** : à chaque push sur GitHub, Railway et Vercel déploieront automatiquement les nouvelles versions ! 🚀

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026  
**Domaine** : `solid-eat.com` ✅
