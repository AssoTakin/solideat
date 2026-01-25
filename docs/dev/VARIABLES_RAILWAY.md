# 🔑 VARIABLES D'ENVIRONNEMENT RAILWAY - SOLID'EAT

**Date** : 23 janvier 2026  
**Plateforme** : Railway (Backend)  
**Statut** : Configuration en cours

---

## ✅ VARIABLES À AJOUTER DANS RAILWAY

### Variables OBLIGATOIRES

#### Application
- `NODE_ENV=production`
- `PORT=3000`
- `API_URL=https://api.solid-eat.com`
- `FRONTEND_URL=https://solid-eat.com`

#### Base de données
- `DATABASE_URL=postgresql://...` (URL Supabase)

#### JWT
- `JWT_SECRET=2b2ec64fecf1fde698570721052578783a500e9ca83d20092226f5bed80bef35` ✅ (généré Phase 1)
- `JWT_EXPIRES_IN=7d`

#### Stripe
- `STRIPE_SECRET_KEY=sk_live_...` (Clé API Stripe LIVE)
- `STRIPE_PUBLISHABLE_KEY=pk_live_...` (Clé publique Stripe LIVE)
- `STRIPE_WEBHOOK_SECRET=whsec_...` ✅ (À ajouter - voir ci-dessous)
- `STRIPE_PRICE_ID_WEEKLY=price_...`
- `STRIPE_PRICE_ID_MONTHLY=price_...`
- `STRIPE_PRICE_ID_YEARLY=price_...`

#### Services externes
- `GOOGLE_MAPS_API_KEY=...`
- `EMAIL_FROM=noreply@solid-eat.com`

### Variables OPTIONNELLES (pour MVP)

- `REDIS_URL=redis://...` (peut être ajouté plus tard)
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `SENDGRID_API_KEY=...`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`

---

## 🔧 COMMENT AJOUTER LES VARIABLES DANS RAILWAY

1. **Railway Dashboard** → Votre projet
2. **Settings** → **Variables**
3. **Cliquer sur** : "New Variable"
4. **Remplir** :
   - **Name** : Le nom de la variable (ex: `STRIPE_WEBHOOK_SECRET`)
   - **Value** : La valeur (ex: `whsec_...`)
5. **Cliquer sur** : "Add"
6. **Railway redéploie automatiquement**

---

## ⚠️ IMPORTANT - STRIPE_WEBHOOK_SECRET

**Variable** : `STRIPE_WEBHOOK_SECRET`  
**Valeur** : `whsec_OOXOnpk4Z2KgvFiglEqCaPAiTzcF7Ozi` ✅

**⚠️ SÉCURITÉ** :
- Cette valeur est sensible
- Ne jamais la commiter dans Git
- Ne jamais la partager publiquement
- Conserver uniquement dans Railway (variables d'environnement)

---

## 📋 CHECKLIST VARIABLES RAILWAY

### Application
- [x] `NODE_ENV=production`
- [x] `PORT=3000`
- [x] `API_URL=https://api.solid-eat.com`
- [x] `FRONTEND_URL=https://solid-eat.com`

### Base de données
- [ ] `DATABASE_URL=...` (URL Supabase)

### JWT
- [x] `JWT_SECRET=...` (généré Phase 1)
- [x] `JWT_EXPIRES_IN=7d`

### Stripe
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_PUBLISHABLE_KEY=pk_live_...` (pour référence, mais utilisé dans Vercel)
- [x] `STRIPE_WEBHOOK_SECRET=whsec_...` ✅ **AJOUTÉ**
- [ ] `STRIPE_PRICE_ID_WEEKLY=price_...`
- [ ] `STRIPE_PRICE_ID_MONTHLY=price_...`
- [ ] `STRIPE_PRICE_ID_YEARLY=price_...`

### Services
- [ ] `GOOGLE_MAPS_API_KEY=...`
- [ ] `EMAIL_FROM=noreply@solid-eat.com`

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ **Ajouter `STRIPE_WEBHOOK_SECRET` dans Railway**
2. ✅ **Vérifier que Railway redéploie sans erreur**
3. ✅ **Tester le health check** : `https://api.solid-eat.com/health` (ou URL Railway temporaire)
4. ✅ **Vérifier les logs Railway** pour confirmer le démarrage

---

**Document créé par** : DEV  
**Date** : 23 janvier 2026  
**⚠️ Note** : Ce document ne contient pas les vraies valeurs sensibles pour des raisons de sécurité
