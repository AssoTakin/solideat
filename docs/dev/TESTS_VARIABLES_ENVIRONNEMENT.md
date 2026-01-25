# ✅ TESTS DES VARIABLES D'ENVIRONNEMENT - SOLID'EAT

**Date** : 23 janvier 2026  
**Statut** : Tests de validation des variables configurées

---

## 📋 VARIABLES CONFIGURÉES

### Railway (Backend) - 13 variables ✅

1. ✅ `NODE_ENV=production`
2. ✅ `PORT=3000`
3. ✅ `API_URL=https://api.solid-eat.com`
4. ✅ `FRONTEND_URL=https://solid-eat.com`
5. ✅ `JWT_SECRET=...` (configuré)
6. ✅ `JWT_EXPIRES_IN=7d`
7. ✅ `STRIPE_WEBHOOK_SECRET=whsec_...` (configuré)
8. ✅ `STRIPE_SECRET_KEY=sk_live_...` (configuré)
9. ✅ `DATABASE_URL=postgresql://...` (configuré)
10. ✅ `EMAIL_FROM=noreply@solid-eat.com`
11. ✅ `STRIPE_PRICE_ID_WEEKLY=price_1Ssjm3EKzPeYzUocoweoqbEg`
12. ✅ `STRIPE_PRICE_ID_MONTHLY=price_1SsjmiEKzPeYzUocRxIQswDF`
13. ✅ `STRIPE_PRICE_ID_YEARLY=price_1SsjneEKzPeYzUocDZAanU7I`
14. ⏳ `GOOGLE_MAPS_API_KEY=AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4` (à ajouter)

### Vercel (Frontend) - 2 variables ✅

1. ✅ `VITE_API_URL=https://api.solid-eat.com`
2. ✅ `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` (configuré)
3. ⏳ `VITE_GOOGLE_MAPS_API_KEY=AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4` (à ajouter)

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Vérification Backend Railway

**Objectif** : Vérifier que le backend démarre correctement avec toutes les variables

**Méthode** :
1. Vérifier les logs Railway
2. Tester le health check endpoint

**Commandes** :
```bash
# Si le domaine est configuré
curl https://api.solid-eat.com/health

# Sinon, utiliser l'URL Railway temporaire
curl https://[votre-projet].railway.app/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

### Test 2 : Vérification Variables Backend

**Objectif** : Vérifier que toutes les variables sont accessibles dans le code

**Variables à vérifier** :
- ✅ `DATABASE_URL` → Connexion à Supabase
- ✅ `STRIPE_SECRET_KEY` → Initialisation Stripe
- ✅ `STRIPE_WEBHOOK_SECRET` → Vérification webhook
- ✅ `JWT_SECRET` → Génération tokens
- ✅ `STRIPE_PRICE_ID_*` → IDs produits Stripe

**Méthode** : Vérifier les logs Railway au démarrage

---

### Test 3 : Vérification Frontend Vercel

**Objectif** : Vérifier que le frontend peut accéder aux variables

**Variables à vérifier** :
- ✅ `VITE_API_URL` → Appels API backend
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` → Intégration Stripe frontend
- ⏳ `VITE_GOOGLE_MAPS_API_KEY` → Carte Google Maps

**Méthode** :
1. Ouvrir la console du navigateur (F12)
2. Vérifier qu'il n'y a pas d'erreurs
3. Vérifier que les appels API fonctionnent

---

### Test 4 : Test Connexion Base de Données

**Objectif** : Vérifier que la connexion Supabase fonctionne

**Méthode** : Le health check doit retourner `"database": "connected"`

**Si erreur** :
- Vérifier le format de `DATABASE_URL`
- Vérifier que le mot de passe est correctement encodé
- Vérifier que Supabase autorise les connexions depuis Railway

---

### Test 5 : Test Stripe Configuration

**Objectif** : Vérifier que Stripe est correctement configuré

**Méthodes** :
1. Vérifier les logs Railway (pas d'erreur Stripe au démarrage)
2. Tester un webhook Stripe (si possible)
3. Vérifier que les Price IDs sont valides

**Commandes** :
```bash
# Tester avec Stripe CLI (si installé)
stripe trigger customer.subscription.created
```

---

### Test 6 : Test Google Maps API Key

**Objectif** : Vérifier que la clé Google Maps est valide

**Méthode** :
1. Ajouter la clé dans Railway et Vercel
2. Tester dans le frontend
3. Vérifier qu'il n'y a pas d'erreurs dans la console

**URL de test** :
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4
```

---

## ✅ CHECKLIST DE VALIDATION

### Backend (Railway)
- [ ] Backend démarre sans erreur
- [ ] Health check accessible : `/health`
- [ ] Connexion base de données fonctionne
- [ ] Stripe initialisé correctement
- [ ] JWT fonctionne
- [ ] Toutes les variables sont accessibles

### Frontend (Vercel)
- [ ] Frontend déployé avec succès
- [ ] Variables `VITE_*` accessibles
- [ ] Appels API backend fonctionnent
- [ ] Stripe frontend configuré
- [ ] Google Maps fonctionne (après ajout de la clé)

### Services externes
- [ ] Stripe webhook configuré et fonctionnel
- [ ] Google Maps API activée et fonctionnelle
- [ ] Base de données Supabase accessible

---

## 🔧 ACTIONS RESTANTES

### À ajouter dans Railway
- [ ] `GOOGLE_MAPS_API_KEY=AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4`

### À ajouter dans Vercel
- [ ] `VITE_GOOGLE_MAPS_API_KEY=AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4`

---

**Document créé par** : DEV  
**Date** : 23 janvier 2026
