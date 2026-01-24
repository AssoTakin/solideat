# 🔍 UTILISATION DU DIAGNOSTIC AUTOMATIQUE

**Date** : 24 janvier 2026  
**Objectif** : Diagnostic automatique des problèmes de connexion

---

## 🎯 DEUX MÉTHODES DE DIAGNOSTIC

### Méthode 1 : Page de diagnostic (Recommandée)

**URL** : `https://solid-eat.com/diagnostic`

**Avantages** :
- ✅ Interface visuelle claire
- ✅ Tests automatiques au chargement
- ✅ Détails techniques disponibles
- ✅ Pas besoin de console

**Utilisation** :
1. Ouvrir : `https://solid-eat.com/diagnostic`
2. Les tests s'exécutent automatiquement
3. Voir les résultats en temps réel
4. Cliquer sur "Détails techniques" pour plus d'infos

---

### Méthode 2 : Script console (Avancée)

**Utilisation** :
1. Ouvrir : `https://solid-eat.com`
2. Ouvrir la console (F12 → Console)
3. Copier-coller le script depuis `frontend/public/diagnostic-script.js`
4. Appuyer sur Entrée
5. Voir les résultats dans la console

**Avantages** :
- ✅ Plus de détails techniques
- ✅ Tableau récapitulatif
- ✅ Peut être exécuté plusieurs fois

---

## 📋 TESTS EFFECTUÉS

### 1. Variables d'environnement
- ✅ Vérifie que `VITE_API_URL` est définie
- ✅ Vérifie que `VITE_STRIPE_PUBLISHABLE_KEY` est définie
- ✅ Vérifie que `VITE_GOOGLE_MAPS_API_KEY` est définie

### 2. Health Check API
- ✅ Teste la connexion au backend
- ✅ Vérifie que la base de données est accessible
- ✅ Affiche le statut du backend

### 3. Test CORS
- ✅ Vérifie que CORS est configuré correctement
- ✅ Teste les headers CORS

### 4. Route d'inscription
- ✅ Teste que la route `/api/auth/register` est accessible
- ✅ Vérifie que le backend répond correctement
- ✅ Teste avec des données de test

### 5. Configuration Axios
- ✅ Vérifie la configuration de l'instance axios
- ✅ Vérifie la base URL

---

## 🔍 INTERPRÉTATION DES RÉSULTATS

### ✅ Tous les tests passent
**Signification** : La configuration est correcte, le problème vient peut-être des données envoyées.

**Actions** :
- Vérifier que tous les champs du formulaire sont remplis
- Vérifier le format des données (email, téléphone, etc.)

### ❌ Erreur "VITE_API_URL non définie"
**Problème** : Variable d'environnement manquante dans Vercel

**Solution** :
1. Vercel Dashboard → Settings → Environment Variables
2. Ajouter `VITE_API_URL` = `https://api.solid-eat.com` (ou URL Railway)
3. Redéployer

### ❌ Erreur "Health Check failed"
**Problème** : Backend non accessible

**Solutions** :
1. Vérifier que Railway est déployé
2. Vérifier l'URL du backend
3. Vérifier les logs Railway

### ❌ Erreur CORS
**Problème** : CORS mal configuré dans Railway

**Solution** :
1. Railway Dashboard → Settings → Variables
2. Vérifier `FRONTEND_URL` = `https://solid-eat.com` (ou URL Vercel)
3. Redéployer

### ❌ Erreur "Route /api/auth/register"
**Problème** : Route non accessible ou erreur backend

**Solutions** :
1. Vérifier les logs Railway
2. Vérifier que la route existe
3. Vérifier les variables d'environnement backend

---

## 🚀 ACCÈS RAPIDE

### Page de diagnostic
```
https://solid-eat.com/diagnostic
```

### Script console
Copier depuis : `frontend/public/diagnostic-script.js`

---

## 📝 EXEMPLE DE RÉSULTATS

### Succès
```
✅ Variables d'environnement
✅ Health Check API
✅ CORS
✅ Route /api/auth/register
✅ Configuration Axios
```

### Erreurs
```
✅ Variables d'environnement
❌ Health Check API - Erreur de connexion
❌ CORS - Erreur CORS
❌ Route /api/auth/register - Erreur
```

---

**Document créé par** : DEV  
**Date** : 24 janvier 2026
