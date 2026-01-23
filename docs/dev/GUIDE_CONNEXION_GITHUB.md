# 🔗 GUIDE : CONNECTER LE PROJET À GITHUB

**Date** : 23 janvier 2026  
**Statut** : Projet Git local → GitHub → Railway/Vercel

---

## 📋 SITUATION ACTUELLE

- ✅ Projet sur Git (branche `develop`)
- ❌ Pas de remote GitHub configuré
- ✅ Historique Git existant

---

## 🚀 ÉTAPE 1 : CRÉER UN REPOSITORY SUR GITHUB

### 1.1 Créer le repository

1. **Aller sur** : https://github.com/new
2. **Repository name** : `solid-eat` (ou `solideat`)
3. **Description** : "Plateforme de cuisine collaborative entre particuliers"
4. **Visibilité** : Public ou Private (selon votre choix)
5. **⚠️ IMPORTANT** : Ne pas cocher "Initialize with README" (le projet existe déjà)
6. **Cliquer sur** : "Create repository"

### 1.2 Copier l'URL du repository

GitHub affichera quelque chose comme :
```
https://github.com/VOTRE_USERNAME/solid-eat.git
```

**Copier cette URL** (vous en aurez besoin)

---

## 🔗 ÉTAPE 2 : CONNECTER LE PROJET LOCAL À GITHUB

### 2.1 Ajouter le remote

```bash
cd "/Users/samdokpo/Documents/Projets New/Dev/Solid'Eat 2026"

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/solid-eat.git

# Vérifier
git remote -v
```

**Résultat attendu** :
```
origin  https://github.com/VOTRE_USERNAME/solid-eat.git (fetch)
origin  https://github.com/VOTRE_USERNAME/solid-eat.git (push)
```

### 2.2 Commiter les changements actuels

```bash
# Voir les changements
git status

# Ajouter tous les changements
git add .

# Commiter
git commit -m "feat: Configuration Supabase et préparation déploiement"
```

### 2.3 Pousser vers GitHub

```bash
# Pousser la branche develop
git push -u origin develop

# OU créer une branche main et pousser
git checkout -b main
git push -u origin main
```

**⚠️ Note** : Railway et Vercel utilisent généralement `main` ou `master` pour la production.

---

## 🎯 ÉTAPE 3 : CONNECTER RAILWAY

### 3.1 Dans Railway

1. **Aller sur** : https://railway.app/
2. **New Project** → **Deploy from GitHub repo**
3. **Autoriser Railway** à accéder à GitHub (si demandé)
4. **Sélectionner** : `solid-eat` (votre repository)
5. **Cliquer sur** : "Deploy Now"

### 3.2 Configurer le projet

**Settings** → **Service** :

1. **Root Directory** : `backend`
2. **Build Command** : `npm install && npm run build`
3. **Start Command** : `npm start`

### 3.3 Variables d'environnement

**Settings** → **Variables** → Ajouter toutes les variables (voir guide complet)

---

## 🎨 ÉTAPE 4 : CONNECTER VERCEL

### 4.1 Dans Vercel

1. **Aller sur** : https://vercel.com/
2. **Add New...** → **Project**
3. **Import Git Repository**
4. **Autoriser Vercel** à accéder à GitHub (si demandé)
5. **Sélectionner** : `solid-eat` (votre repository)
6. **Cliquer sur** : "Import"

### 4.2 Configurer le projet

**Configuration** :

1. **Root Directory** : `frontend` (cliquer sur "Edit")
2. **Framework Preset** : Vite (détecté automatiquement)
3. **Build Command** : `npm run build` (déjà configuré)
4. **Output Directory** : `dist` (déjà configuré)

### 4.3 Variables d'environnement

**Environment Variables** → Ajouter :
- `VITE_API_URL=https://api.solid-eat.com`
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- etc.

---

## ✅ RÉSULTAT

Après ces étapes :

- ✅ Projet sur GitHub
- ✅ Railway connecté → Déploie automatiquement le backend
- ✅ Vercel connecté → Déploie automatiquement le frontend
- ✅ Chaque `git push` → Déploiement automatique

---

## 🔄 WORKFLOW FUTUR

```bash
# 1. Faire vos modifications
# 2. Commiter
git add .
git commit -m "Description des changements"

# 3. Pousser vers GitHub
git push origin main

# 4. Railway et Vercel déploient automatiquement !
# (Pas besoin de faire autre chose)
```

---

## 📚 GUIDE COMPLET

Pour les détails complets, voir : `docs/dev/CONNEXION_GIT_VERCEL_RAILWAY.md`

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
