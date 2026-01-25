# 📊 STATUT DU DÉPLOIEMENT - SOLID'EAT

**Date** : 23 janvier 2026  
**Domaine** : `solid-eat.com`  
**Statut global** : 🟡 En cours

---

## ✅ PHASE 1 : PRÉPARATION - TERMINÉE

- [x] Build Backend vérifié ✅
- [x] Build Frontend vérifié ✅
- [x] JWT_SECRET généré ✅

---

## 🟡 PHASE 2 : DÉPLOIEMENT BACKEND (RAILWAY) - EN COURS

### Configuration Railway
- [x] Projet créé et connecté à GitHub
- [x] Root Directory configuré : `backend`
- [x] Build Command : `npm install && npm run build`
- [x] Start Command : `npm start`

### Variables d'environnement
- [x] `NODE_ENV=production` ✅
- [x] `PORT=3000` ✅
- [x] `API_URL=https://api.solid-eat.com` ✅
- [x] `FRONTEND_URL=https://solid-eat.com` ✅
- [x] `JWT_SECRET=...` ✅
- [x] `JWT_EXPIRES_IN=7d` ✅
- [x] `STRIPE_WEBHOOK_SECRET=whsec_...` ✅
- [x] `DATABASE_URL=...` ⚠️ **À CORRIGER** (encodage URL)
- [x] `STRIPE_SECRET_KEY=sk_live_...` ✅
- [x] `STRIPE_PRICE_ID_WEEKLY=price_...` ✅
- [x] `STRIPE_PRICE_ID_MONTHLY=price_...` ✅
- [x] `STRIPE_PRICE_ID_YEARLY=price_...` ✅
- [ ] `GOOGLE_MAPS_API_KEY=...` ⏳ **À AJOUTER**
- [x] `EMAIL_FROM=noreply@solid-eat.com` ✅

### Domaine
- [ ] Domaine `api.solid-eat.com` ajouté dans Railway
- [ ] DNS configuré chez OVH (CNAME pour `api`)
- [ ] Propagation DNS en cours/terminée

### Vérifications
- [x] Déploiement Railway fonctionne ✅
- [x] Erreur `STRIPE_WEBHOOK_SECRET` résolue ✅
- [ ] Health check accessible : `https://api.solid-eat.com/health`

---

## ⏳ PHASE 3 : DÉPLOIEMENT FRONTEND (VERCEL) - EN ATTENTE

### Configuration Vercel
- [ ] Projet créé et connecté à GitHub
- [ ] Root Directory configuré : `frontend`
- [ ] Build Command : `npm run build`
- [ ] Output Directory : `dist`

### Variables d'environnement
- [x] `VITE_API_URL=https://api.solid-eat.com` ✅
- [x] `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` ✅
- [ ] `VITE_GOOGLE_MAPS_API_KEY=...` ⏳ **À AJOUTER**

### Domaine
- [ ] Domaine `solid-eat.com` ajouté dans Vercel
- [ ] DNS configuré chez OVH (A ou CNAME pour `@`)
- [ ] Propagation DNS en cours/terminée

### Vérifications
- [ ] Site accessible : `https://solid-eat.com`

---

## ⏳ PHASE 4 : CONFIGURATION DNS OVH - EN ATTENTE

- [ ] Domaine principal `solid-eat.com` configuré (A ou CNAME)
- [ ] Sous-domaine `api.solid-eat.com` configuré (CNAME)
- [ ] Propagation DNS vérifiée

---

## ⏳ PHASE 5 : VÉRIFICATIONS POST-DÉPLOIEMENT - EN ATTENTE

- [ ] Backend accessible : `https://api.solid-eat.com/health`
- [ ] Frontend accessible : `https://solid-eat.com`
- [ ] Tests fonctionnels de base
- [ ] Stripe webhook production configuré

---

## 📋 PROCHAINES ÉTAPES

1. **Compléter les variables d'environnement Railway** :
   - DATABASE_URL (Supabase)
   - STRIPE_SECRET_KEY (mode LIVE)
   - STRIPE_PRICE_ID_* (identifiants des produits)
   - GOOGLE_MAPS_API_KEY
   - EMAIL_FROM

2. **Configurer le domaine dans Railway** :
   - Ajouter `api.solid-eat.com` dans Railway
   - Récupérer la valeur CNAME
   - Configurer DNS chez OVH

3. **Déployer le frontend sur Vercel** :
   - Connecter Vercel à GitHub
   - Configurer le projet
   - Ajouter les variables d'environnement
   - Ajouter le domaine `solid-eat.com`

4. **Configurer les DNS chez OVH** :
   - Domaine principal → Vercel
   - Sous-domaine API → Railway

5. **Attendre la propagation DNS** (1-2 heures)

6. **Vérifications finales**

---

## 🎯 PROGRESSION GLOBALE

**Complété** : ~30%  
**En cours** : ~40%  
**En attente** : ~30%

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
