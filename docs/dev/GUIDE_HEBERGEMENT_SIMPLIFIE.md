# 🚀 GUIDE HÉBERGEMENT SIMPLIFIÉ - SOLID'EAT

**Date** : 23 janvier 2026  
**Domaine** : `solid-eat.com`  
**Statut** : Guide simplifié pour comprendre l'hébergement

---

## 🎯 CONCEPT SIMPLE

Votre application a **2 parties** qui doivent être hébergées **séparément** :

### 1. Frontend (Interface utilisateur)
- **C'est quoi** : L'application React que les utilisateurs voient dans leur navigateur
- **Fichiers** : Dossier `frontend/`
- **Où héberger** : **Vercel** ou **Netlify**
- **URL** : `https://solid-eat.com`

### 2. Backend (API)
- **C'est quoi** : Le serveur Node.js qui gère la logique, la base de données, etc.
- **Fichiers** : Dossier `backend/`
- **Où héberger** : **Railway** ou **Render**
- **URL** : `https://api.solid-eat.com`

---

## 📊 COMPARAISON VISUELLE

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEUR                          │
│              (Navigateur web)                           │
└────────────────────┬──────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
        ┌────────────────────────┐
        │   FRONTEND (React)     │
        │   Vercel ou Netlify    │
        │   solid-eat.com        │
        └────────────┬───────────┘
                     │
                     │ Appels API
                     ▼
        ┌────────────────────────┐
        │   BACKEND (Node.js)    │
        │   Railway ou Render    │
        │   api.solid-eat.com    │
        └────────────┬───────────┘
                     │
                     │ Connexion DB
                     ▼
        ┌────────────────────────┐
        │   BASE DE DONNÉES      │
        │   Supabase PostgreSQL  │
        └────────────────────────┘
```

---

## 🎨 PARTIE 1 : FRONTEND (Vercel ou Netlify)

### C'est quoi ?

**Frontend** = L'interface que les utilisateurs voient
- Pages web (React)
- Boutons, formulaires, navigation
- Ce qui s'affiche dans le navigateur

**Fichiers** : Tout ce qui est dans le dossier `frontend/`

### Choix : Vercel ou Netlify ?

| Critère | Vercel | Netlify |
|---------|--------|---------|
| **Recommandation** | ⭐⭐⭐ Excellent | ⭐⭐ Bon |
| **Optimisé pour** | React, Vite, Next.js | React, Vue, Angular |
| **Gratuit** | ✅ Oui | ✅ Oui |
| **CDN** | ✅ Inclus | ✅ Inclus |
| **SSL** | ✅ Auto | ✅ Auto |
| **Facilité** | ⚡ Très simple | ⚡ Simple |

**Recommandation** : **Vercel** (optimisé pour React/Vite)

### Ce que vous devez faire

1. **Créer un compte** sur Vercel (ou Netlify)
2. **Connecter** votre repository GitHub
3. **Configurer** :
   - Root Directory : `frontend`
   - Build Command : `npm run build`
   - Output Directory : `dist`
4. **Ajouter le domaine** : `solid-eat.com`
5. **Configurer les DNS** chez OVH (selon instructions Vercel)

**Résultat** : `https://solid-eat.com` → Votre application React

---

## ⚙️ PARTIE 2 : BACKEND (Railway ou Render)

### C'est quoi ?

**Backend** = Le serveur qui fait le travail
- API REST (routes `/api/...`)
- Gestion de la base de données
- Logique métier
- Webhooks Stripe

**Fichiers** : Tout ce qui est dans le dossier `backend/`

### Choix : Railway ou Render ?

| Critère | Railway | Render |
|---------|---------|--------|
| **Recommandation** | ⭐⭐⭐ Excellent | ⭐⭐ Bon |
| **Gratuit** | ✅ Oui (limité) | ✅ Oui (limité) |
| **PostgreSQL** | ✅ Inclus | ✅ Inclus |
| **Redis** | ✅ Inclus | ✅ Inclus |
| **Facilité** | ⚡ Très simple | ⚡ Simple |
| **Déploiement** | Auto depuis GitHub | Auto depuis GitHub |

**Recommandation** : **Railway** (plus simple, meilleure UX)

### Ce que vous devez faire

1. **Créer un compte** sur Railway (ou Render)
2. **Créer un nouveau projet**
3. **Connecter** votre repository GitHub
4. **Configurer** :
   - Root Directory : `backend`
   - Build Command : `npm install && npm run build`
   - Start Command : `npm start`
5. **Ajouter PostgreSQL** (ou utiliser Supabase - déjà configuré ✅)
6. **Ajouter Redis** (Upstash gratuit recommandé)
7. **Configurer les variables d'environnement**
8. **Ajouter le domaine** : `api.solid-eat.com`
9. **Configurer les DNS** chez OVH (CNAME pour `api`)

**Résultat** : `https://api.solid-eat.com` → Votre API backend

---

## 📋 RÉCAPITULATIF SIMPLE

### Frontend (Vercel)

```
Ce que vous faites :
1. Créer compte Vercel
2. Connecter GitHub
3. Configurer : frontend/, npm run build, dist/
4. Ajouter domaine : solid-eat.com
5. Configurer DNS chez OVH

Résultat : https://solid-eat.com fonctionne
```

### Backend (Railway)

```
Ce que vous faites :
1. Créer compte Railway
2. Créer projet
3. Connecter GitHub
4. Configurer : backend/, npm run build, npm start
5. Ajouter variables d'environnement
6. Ajouter domaine : api.solid-eat.com
7. Configurer DNS chez OVH (sous-domaine api)

Résultat : https://api.solid-eat.com fonctionne
```

---

## 🎯 STACK RECOMMANDÉE POUR SOLID'EAT

### Configuration finale

```
Frontend:  Vercel        → solid-eat.com
Backend:   Railway       → api.solid-eat.com
Database:  Supabase      → (déjà configuré ✅)
Cache:     Upstash Redis → (gratuit)
Storage:   Cloudinary    → (ou Supabase Storage)
```

**Coût total** : **$0/mois** (gratuit) jusqu'à ~1000 utilisateurs

---

## 📝 CHECKLIST SIMPLIFIÉE

### Frontend (Vercel)

- [ ] Créer compte Vercel
- [ ] Connecter repository GitHub
- [ ] Configurer le projet (frontend/, build, dist/)
- [ ] Ajouter domaine `solid-eat.com`
- [ ] Configurer DNS chez OVH (selon instructions Vercel)
- [ ] Vérifier : `https://solid-eat.com` fonctionne

### Backend (Railway)

- [ ] Créer compte Railway
- [ ] Créer nouveau projet
- [ ] Connecter repository GitHub
- [ ] Configurer le projet (backend/, build, start)
- [ ] Ajouter variables d'environnement
- [ ] Ajouter domaine `api.solid-eat.com`
- [ ] Configurer DNS chez OVH (CNAME pour `api`)
- [ ] Vérifier : `https://api.solid-eat.com/health` fonctionne

---

## 🔄 ORDRE D'EXÉCUTION RECOMMANDÉ

### Étape 1 : Backend d'abord (Railway)

**Pourquoi** : Le frontend a besoin de l'URL du backend

1. Déployer le backend sur Railway
2. Récupérer l'URL : `https://xxxxx.railway.app`
3. Configurer le domaine : `api.solid-eat.com`
4. Tester : `https://api.solid-eat.com/health`

### Étape 2 : Frontend ensuite (Vercel)

**Pourquoi** : Maintenant que le backend est prêt, on peut configurer le frontend

1. Déployer le frontend sur Vercel
2. Configurer la variable `VITE_API_URL=https://api.solid-eat.com`
3. Configurer le domaine : `solid-eat.com`
4. Tester : `https://solid-eat.com`

---

## 💡 ANALOGIE SIMPLE

Imaginez un restaurant :

- **Frontend (Vercel)** = La salle du restaurant
  - C'est ce que les clients voient
  - Menu, décoration, tables
  - `solid-eat.com` = L'adresse du restaurant

- **Backend (Railway)** = La cuisine
  - C'est là que le travail se fait
  - Préparation des plats, gestion des stocks
  - `api.solid-eat.com` = L'entrée de service

- **Base de données (Supabase)** = Le stock
  - Tous les ingrédients, les recettes
  - Déjà configuré ✅

---

## ✅ RÉSUMÉ ULTRA-SIMPLE

### Frontend = Vercel
- **C'est** : L'interface web (React)
- **Où** : Vercel
- **URL** : `solid-eat.com`
- **Fichiers** : `frontend/`

### Backend = Railway
- **C'est** : L'API serveur (Node.js)
- **Où** : Railway
- **URL** : `api.solid-eat.com`
- **Fichiers** : `backend/`

**C'est tout !** 🎉

---

## 🚀 PROCHAINES ÉTAPES

1. **Commencer par Railway** (Backend)
   - Créer compte
   - Déployer le backend
   - Configurer `api.solid-eat.com`

2. **Ensuite Vercel** (Frontend)
   - Créer compte
   - Déployer le frontend
   - Configurer `solid-eat.com`

3. **Configurer les DNS** chez OVH
   - Domaine principal → Vercel
   - Sous-domaine `api` → Railway

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026  
**Domaine** : `solid-eat.com` ✅
