# 🔑 GUIDE COMPLET - VARIABLES D'ENVIRONNEMENT

**Date** : 23 janvier 2026  
**Statut** : Guide pour configurer toutes les variables manquantes

---

## 📋 RÉCAPITULATIF DES VARIABLES

### ✅ DÉJÀ CONFIGURÉES (Railway)

- [x] `NODE_ENV=production`
- [x] `PORT=3000`
- [x] `API_URL=https://api.solid-eat.com`
- [x] `FRONTEND_URL=https://solid-eat.com`
- [x] `JWT_SECRET=2b2ec64fecf1fde698570721052578783a500e9ca83d20092226f5bed80bef35`
- [x] `JWT_EXPIRES_IN=7d`
- [x] `STRIPE_WEBHOOK_SECRET=whsec_OOXOnpk4Z2KgvFiglEqCaPAiTzcF7Ozi`

### ⏳ À CONFIGURER (Railway)

- [ ] `DATABASE_URL` (Supabase)
- [ ] `STRIPE_SECRET_KEY` (clé LIVE)
- [ ] `STRIPE_PRICE_ID_WEEKLY`
- [ ] `STRIPE_PRICE_ID_MONTHLY`
- [ ] `STRIPE_PRICE_ID_YEARLY`
- [ ] `GOOGLE_MAPS_API_KEY`
- [ ] `EMAIL_FROM=noreply@solid-eat.com`

### ⏳ À CONFIGURER (Vercel)

- [ ] `VITE_API_URL=https://api.solid-eat.com`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (clé LIVE)
- [ ] `VITE_GOOGLE_MAPS_API_KEY`

---

## 🔧 VARIABLE 1 : DATABASE_URL (Supabase)

### Valeur connue

D'après la documentation Supabase, la connection string est :
```
postgresql://postgres:Elektromani%40%231@db.nqoojfbceauiagypmofr.supabase.co:5432/postgres
```

### Comment l'ajouter dans Railway

1. **Railway Dashboard** → Votre projet → **Settings** → **Variables**
2. **New Variable**
3. **Name** : `DATABASE_URL`
4. **Value** : `postgresql://postgres:Elektromani%40%231@db.nqoojfbceauiagypmofr.supabase.co:5432/postgres`
5. **Add**

**⚠️ Vérification** : Si vous avez modifié le mot de passe Supabase, utilisez la nouvelle connection string depuis le dashboard Supabase.

---

## 🔧 VARIABLE 2 : STRIPE_SECRET_KEY (Mode LIVE)

### Comment l'obtenir

1. **Aller sur** : https://dashboard.stripe.com/
2. **Basculer en mode LIVE** (bouton en haut à droite)
3. **Aller sur** : Developers → API keys
4. **Copier** la **Secret key** (commence par `sk_live_...`)

**⚠️ IMPORTANT** :
- Utiliser la clé **LIVE** (pas `sk_test_...`)
- Ne jamais partager cette clé
- Ne jamais la commiter dans Git

### Comment l'ajouter dans Railway

1. **Railway Dashboard** → Votre projet → **Settings** → **Variables**
2. **New Variable**
3. **Name** : `STRIPE_SECRET_KEY`
4. **Value** : `sk_live_...` (la clé copiée)
5. **Add**

---

## 🔧 VARIABLE 3 : STRIPE_PRICE_ID_* (Identifiants des produits)

### Comment les obtenir

1. **Aller sur** : https://dashboard.stripe.com/
2. **Basculer en mode LIVE**
3. **Aller sur** : Products
4. **Pour chaque produit** (Hebdomadaire, Mensuel, Annuel) :
   - Cliquer sur le produit
   - Dans la section "Pricing", trouver le **Price ID** (commence par `price_...`)
   - **Si le Price ID n'apparaît pas** :
     - Vérifier que le produit a un prix configuré
     - Si nécessaire, créer un nouveau prix pour le produit

**Alternative** : Aller directement dans "Prices" du dashboard pour voir tous les Price IDs.

### Comment les ajouter dans Railway

Pour chaque Price ID :

1. **Railway Dashboard** → Votre projet → **Settings** → **Variables**
2. **New Variable**
3. **Name** : `STRIPE_PRICE_ID_WEEKLY` (ou `MONTHLY`, `YEARLY`)
4. **Value** : `price_...` (l'ID récupéré)
5. **Add**

**Exemple** :
- `STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz`
- `STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3`
- `STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry`

**⚠️ Note** : Ces IDs sont différents entre mode TEST et mode LIVE. Utiliser les IDs du mode LIVE.

---

## 🔧 VARIABLE 4 : GOOGLE_MAPS_API_KEY

### Comment l'obtenir

1. **Aller sur** : https://console.cloud.google.com/
2. **Créer un projet** (ou sélectionner un projet existant)
3. **Activer l'API Google Maps JavaScript API** :
   - APIs & Services → Library
   - Chercher "Maps JavaScript API"
   - Cliquer sur "Enable"
4. **Créer une clé API** :
   - APIs & Services → Credentials
   - Cliquer sur "Create Credentials" → "API Key"
   - Copier la clé générée
5. **Restreindre la clé** (recommandé) :
   - Cliquer sur la clé créée
   - Application restrictions → HTTP referrers
   - Ajouter : `https://solid-eat.com/*` et `https://api.solid-eat.com/*`
   - API restrictions → Restrict key → Sélectionner "Maps JavaScript API"
   - Save

### Comment l'ajouter dans Railway

1. **Railway Dashboard** → Votre projet → **Settings** → **Variables**
2. **New Variable**
3. **Name** : `GOOGLE_MAPS_API_KEY`
4. **Value** : `AIza...` (la clé copiée)
5. **Add**

### Comment l'ajouter dans Vercel

1. **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. **Add**
3. **Name** : `VITE_GOOGLE_MAPS_API_KEY`
4. **Value** : `AIza...` (la même clé)
5. **Environments** : Production, Preview, Development
6. **Save**

---

## 🔧 VARIABLE 5 : EMAIL_FROM

### Valeur

```
EMAIL_FROM=noreply@solid-eat.com
```

### Comment l'ajouter dans Railway

1. **Railway Dashboard** → Votre projet → **Settings** → **Variables**
2. **New Variable**
3. **Name** : `EMAIL_FROM`
4. **Value** : `noreply@solid-eat.com`
5. **Add**

**⚠️ Note** : Pour que les emails fonctionnent, vous devrez aussi configurer SendGrid ou un autre service d'email plus tard.

---

## 🔧 VARIABLE 6 : VITE_API_URL (Vercel)

### Valeur

```
VITE_API_URL=https://api.solid-eat.com
```

### Comment l'ajouter dans Vercel

1. **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. **Add**
3. **Name** : `VITE_API_URL`
4. **Value** : `https://api.solid-eat.com`
5. **Environments** : Production, Preview, Development
6. **Save**

**⚠️ Note** : Si le domaine `api.solid-eat.com` n'est pas encore configuré, utiliser temporairement l'URL Railway : `https://[votre-projet].railway.app`

---

## 🔧 VARIABLE 7 : VITE_STRIPE_PUBLISHABLE_KEY (Vercel)

### Comment l'obtenir

1. **Aller sur** : https://dashboard.stripe.com/
2. **Basculer en mode LIVE**
3. **Aller sur** : Developers → API keys
4. **Copier** la **Publishable key** (commence par `pk_live_...`)

**⚠️ IMPORTANT** :
- Utiliser la clé **LIVE** (pas `pk_test_...`)
- Cette clé est publique et peut être utilisée dans le frontend

### Comment l'ajouter dans Vercel

1. **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. **Add**
3. **Name** : `VITE_STRIPE_PUBLISHABLE_KEY`
4. **Value** : `pk_live_...` (la clé copiée)
5. **Environments** : Production, Preview, Development
6. **Save**

---

## 📋 CHECKLIST COMPLÈTE

### Railway (Backend)

- [x] `NODE_ENV=production` ✅
- [x] `PORT=3000` ✅
- [x] `API_URL=https://api.solid-eat.com` ✅
- [x] `FRONTEND_URL=https://solid-eat.com` ✅
- [x] `JWT_SECRET=...` ✅
- [x] `JWT_EXPIRES_IN=7d` ✅
- [x] `STRIPE_WEBHOOK_SECRET=whsec_...` ✅
- [ ] `DATABASE_URL=postgresql://...` (Supabase)
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_PRICE_ID_WEEKLY=price_...`
- [ ] `STRIPE_PRICE_ID_MONTHLY=price_...`
- [ ] `STRIPE_PRICE_ID_YEARLY=price_...`
- [ ] `GOOGLE_MAPS_API_KEY=...`
- [ ] `EMAIL_FROM=noreply@solid-eat.com`

### Vercel (Frontend)

- [ ] `VITE_API_URL=https://api.solid-eat.com`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] `VITE_GOOGLE_MAPS_API_KEY=...`

---

## 🚀 ORDRE RECOMMANDÉ DE CONFIGURATION

### 1. Variables essentielles (pour que l'app démarre)

1. ✅ `DATABASE_URL` (Supabase)
2. ✅ `EMAIL_FROM` (simple, pas de service externe nécessaire)

### 2. Variables Stripe (pour les paiements)

3. ✅ `STRIPE_SECRET_KEY` (Railway)
4. ✅ `STRIPE_PRICE_ID_WEEKLY`, `MONTHLY`, `YEARLY` (Railway)
5. ✅ `VITE_STRIPE_PUBLISHABLE_KEY` (Vercel)

### 3. Variables Google Maps (pour la géolocalisation)

6. ✅ `GOOGLE_MAPS_API_KEY` (Railway)
7. ✅ `VITE_GOOGLE_MAPS_API_KEY` (Vercel)

### 4. Variables frontend

8. ✅ `VITE_API_URL` (Vercel)

---

## ⚠️ NOTES IMPORTANTES

### Mode TEST vs LIVE

- **Développement** : Utiliser les clés de TEST (`sk_test_...`, `pk_test_...`)
- **Production** : Utiliser les clés LIVE (`sk_live_...`, `pk_live_...`)

### Sécurité

- Ne jamais commiter les clés dans Git
- Ne jamais partager les clés publiquement
- Utiliser les variables d'environnement des plateformes

### Vercel - Préfixe VITE_

- Toutes les variables frontend doivent commencer par `VITE_`
- Sinon elles ne seront pas accessibles dans le code

---

## 🆘 DÉPANNAGE

### "La variable n'est pas accessible dans le code"

**Vercel** : Vérifier que la variable commence par `VITE_`

**Railway** : Vérifier que la variable est bien ajoutée et que Railway a redéployé

### "Stripe ne fonctionne pas"

- Vérifier que vous utilisez les clés LIVE (pas TEST)
- Vérifier que les Price IDs sont ceux du mode LIVE

### "Google Maps ne fonctionne pas"

- Vérifier que l'API est activée dans Google Cloud Console
- Vérifier que la clé n'est pas restreinte de manière trop stricte
- Vérifier que la clé est bien ajoutée dans Vercel (pas Railway)

---

**Document créé par** : DEV  
**Date** : 23 janvier 2026
