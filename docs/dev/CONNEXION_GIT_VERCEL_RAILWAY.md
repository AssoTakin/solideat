# 🔗 CONNEXION GIT - VERCEL & RAILWAY

**Date** : 23 janvier 2026  
**Domaine** : `solid-eat.com`  
**Statut** : Guide de connexion Git pour déploiement automatique

---

## ✅ OUI, C'EST LA MEILLEURE APPROCHE !

Connecter Vercel et Railway directement à votre repository Git permet :

- ✅ **Déploiement automatique** à chaque push
- ✅ **Configuration simple** (une seule fois)
- ✅ **Pas besoin de build manuel**
- ✅ **Historique des déploiements**
- ✅ **Rollback facile** en cas de problème

---

## 🎯 PRÉREQUIS

### 1. Repository Git

Votre projet doit être sur :
- **GitHub** (recommandé) ✅
- **GitLab**
- **Bitbucket**

**Si pas encore sur Git** :
```bash
cd "/Users/samdokpo/Documents/Projets New/Dev/Solid'Eat 2026"
git init
git add .
git commit -m "Initial commit"
# Créer un repository sur GitHub et pousser
```

---

## 🚀 ÉTAPE 1 : CONNECTER RAILWAY (Backend)

### 1.1 Créer un nouveau projet Railway

1. **Aller sur** : https://railway.app/
2. **Se connecter** avec votre compte
3. **Cliquer sur** : "New Project"
4. **Sélectionner** : "Deploy from GitHub repo"

### 1.2 Sélectionner le repository

1. **Autoriser Railway** à accéder à GitHub (si demandé)
2. **Sélectionner** votre repository : `Solid'Eat 2026`
3. **Cliquer sur** : "Deploy Now"

### 1.3 Configurer le projet

Railway détecte automatiquement Node.js, mais vous devez configurer :

1. **Settings** → **Root Directory** :
   - Changer de `/` à `backend`

2. **Settings** → **Build Command** :
   - `npm install && npm run build`

3. **Settings** → **Start Command** :
   - `npm start`

### 1.4 Configurer les variables d'environnement

**Settings** → **Variables** → Ajouter :

```env
NODE_ENV=production
PORT=3000
API_URL=https://api.solid-eat.com
FRONTEND_URL=https://solid-eat.com

# Base de données Supabase (déjà configuré)
DATABASE_URL=postgresql://postgres:Elektromani%40%231@db.nqoojfbceauiagypmofr.supabase.co:5432/postgres

# Redis (Upstash ou Railway)
REDIS_URL=redis://...

# JWT
JWT_SECRET=<générer-une-clé-sécurisée>
JWT_EXPIRES_IN=7d

# Stripe (Mode Live pour production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_WEEKLY=price_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

# Autres services
GOOGLE_MAPS_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

EMAIL_FROM=noreply@solid-eat.com
```

### 1.5 Ajouter le domaine personnalisé

1. **Settings** → **Domains** → **Add Custom Domain**
2. **Entrer** : `api.solid-eat.com`
3. **Railway affiche** un CNAME à configurer chez OVH
4. **Copier** la valeur du CNAME

### 1.6 Configurer les DNS chez OVH

Dans OVH, ajouter :
```
Type: CNAME
Sous-domaine: api
Cible: [Valeur fournie par Railway]
TTL: 3600
```

### 1.7 Vérifier le déploiement

1. **Railway déploie automatiquement** après le push
2. **Vérifier** : `https://api.solid-eat.com/health`
3. **Voir les logs** : Railway Dashboard → Deployments → Logs

---

## 🎨 ÉTAPE 2 : CONNECTER VERCEL (Frontend)

### 2.1 Créer un nouveau projet Vercel

1. **Aller sur** : https://vercel.com/
2. **Se connecter** avec votre compte
3. **Cliquer sur** : "Add New..." → "Project"
4. **Importer** votre repository GitHub

### 2.2 Sélectionner le repository

1. **Autoriser Vercel** à accéder à GitHub (si demandé)
2. **Sélectionner** votre repository : `Solid'Eat 2026`
3. **Cliquer sur** : "Import"

### 2.3 Configurer le projet

**Configuration** :

1. **Framework Preset** : Vite (détecté automatiquement)

2. **Root Directory** :
   - Cliquer sur "Edit"
   - Changer de `/` à `frontend`

3. **Build Command** :
   - `npm run build` (déjà configuré)

4. **Output Directory** :
   - `dist` (déjà configuré)

5. **Install Command** :
   - `npm install` (déjà configuré)

### 2.4 Configurer les variables d'environnement

**Settings** → **Environment Variables** → Ajouter :

```env
VITE_API_URL=https://api.solid-eat.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=...
```

**⚠️ IMPORTANT** : Les variables doivent commencer par `VITE_` pour être accessibles dans le frontend.

### 2.5 Ajouter le domaine personnalisé

1. **Settings** → **Domains** → **Add Domain**
2. **Entrer** : `solid-eat.com`
3. **Vercel affiche** des instructions DNS
4. **Suivre** les instructions pour OVH

### 2.6 Configurer les DNS chez OVH

**Selon les instructions Vercel** :

**Option A : Si Vercel fournit une IP** :
```
Type: A
Sous-domaine: @ (ou vide)
Cible: [IP fournie par Vercel]
TTL: 3600
```

**Option B : Si Vercel fournit un CNAME** :
```
Type: CNAME
Sous-domaine: @ (ou vide)
Cible: [URL fournie par Vercel]
TTL: 3600
```

**⚠️ Note** : Si OVH n'autorise pas CNAME sur `@`, utiliser un enregistrement A.

### 2.7 Déployer

1. **Cliquer sur** : "Deploy"
2. **Vercel déploie automatiquement**
3. **Vérifier** : `https://solid-eat.com`
4. **Voir les logs** : Vercel Dashboard → Deployments → Logs

---

## 🔄 DÉPLOIEMENT AUTOMATIQUE

### Comment ça fonctionne

**À chaque push sur GitHub** :

1. **Railway détecte** le changement
2. **Railway rebuild** automatiquement le backend
3. **Railway redéploie** avec la nouvelle version

4. **Vercel détecte** le changement
5. **Vercel rebuild** automatiquement le frontend
6. **Vercel redéploie** avec la nouvelle version

**Résultat** : Déploiement automatique en quelques minutes ! ✅

### Workflow recommandé

```bash
# 1. Faire vos modifications
# 2. Commit
git add .
git commit -m "Description des changements"

# 3. Push vers GitHub
git push origin main

# 4. Railway et Vercel déploient automatiquement !
# (Pas besoin de faire autre chose)
```

---

## 📋 CHECKLIST COMPLÈTE

### Railway (Backend)

- [ ] Compte Railway créé
- [ ] Projet créé et connecté à GitHub
- [ ] Root Directory configuré : `backend`
- [ ] Build Command : `npm install && npm run build`
- [ ] Start Command : `npm start`
- [ ] Variables d'environnement configurées
- [ ] Domaine `api.solid-eat.com` ajouté
- [ ] DNS configuré chez OVH (CNAME pour `api`)
- [ ] Déploiement réussi
- [ ] Test : `https://api.solid-eat.com/health` fonctionne

### Vercel (Frontend)

- [ ] Compte Vercel créé
- [ ] Projet créé et connecté à GitHub
- [ ] Root Directory configuré : `frontend`
- [ ] Build Command : `npm run build`
- [ ] Output Directory : `dist`
- [ ] Variables d'environnement configurées (préfixées `VITE_`)
- [ ] Domaine `solid-eat.com` ajouté
- [ ] DNS configuré chez OVH (selon instructions Vercel)
- [ ] Déploiement réussi
- [ ] Test : `https://solid-eat.com` fonctionne

---

## 🎯 AVANTAGES DE CETTE APPROCHE

### ✅ Déploiement automatique
- Push sur GitHub → Déploiement automatique
- Pas besoin de build manuel
- Pas besoin de FTP ou SSH

### ✅ Historique
- Voir tous les déploiements
- Rollback facile en cas de problème
- Logs de chaque déploiement

### ✅ Simplicité
- Configuration une seule fois
- Tout est automatisé
- Focus sur le code, pas sur le déploiement

### ✅ Sécurité
- Variables d'environnement sécurisées
- Pas de secrets dans le code
- HTTPS automatique

---

## 🔧 CONFIGURATION AVANCÉE (Optionnel)

### Branches de déploiement

**Railway** :
- **Production** : Déploie depuis `main` ou `master`
- **Staging** : Peut déployer depuis une autre branche

**Vercel** :
- **Production** : Déploie depuis `main` ou `master`
- **Preview** : Déploie automatiquement les Pull Requests

### Variables d'environnement par environnement

**Railway** :
- Variables globales (production)
- Variables par environnement (staging, production)

**Vercel** :
- Variables pour Production
- Variables pour Preview
- Variables pour Development

---

## 🆘 DÉPANNAGE

### Le déploiement échoue

1. **Vérifier les logs** :
   - Railway : Dashboard → Deployments → Logs
   - Vercel : Dashboard → Deployments → Logs

2. **Vérifier les variables d'environnement** :
   - Toutes les variables sont-elles configurées ?
   - Les noms sont-ils corrects ?

3. **Vérifier les commandes de build** :
   - Build Command correct ?
   - Start Command correct ?

### Le domaine ne fonctionne pas

1. **Vérifier la propagation DNS** :
   ```bash
   dig api.solid-eat.com
   dig solid-eat.com
   ```

2. **Vérifier la configuration DNS** :
   - Les enregistrements sont-ils corrects ?
   - Le TTL est-il raisonnable (3600) ?

3. **Attendre** : La propagation DNS peut prendre 1-2 heures

---

## 📚 RESSOURCES

- **Railway Docs** : https://docs.railway.app/
- **Vercel Docs** : https://vercel.com/docs
- **Railway Dashboard** : https://railway.app/
- **Vercel Dashboard** : https://vercel.com/dashboard

---

## ✅ RÉSUMÉ

**Oui, connecter directement au Git est la meilleure approche !**

**Avantages** :
- ✅ Déploiement automatique
- ✅ Configuration simple
- ✅ Historique et rollback
- ✅ Pas de build manuel

**Étapes** :
1. Railway → Connecter GitHub → Configurer backend
2. Vercel → Connecter GitHub → Configurer frontend
3. Configurer les DNS chez OVH
4. C'est tout ! Les déploiements sont automatiques 🚀

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026  
**Domaine** : `solid-eat.com` ✅
