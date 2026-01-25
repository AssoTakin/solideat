# 🚫 RÉSOLUTION : ERREUR CORS - Inscription bloquée

**Date** : 24 janvier 2026  
**Problème** : Erreur CORS lors de l'inscription  
**Erreur** : `Access-Control-Allow-Origin header has a value 'http://localhost:5173' that is not equal to the supplied origin 'https://solid-eat.com'`

---

## 🔍 PROBLÈME IDENTIFIÉ

### Symptôme

Lors de l'inscription, la console du navigateur affiche :

```
Access to XMLHttpRequest at 'https://api.solid-eat.com/api/auth/register' 
from origin 'https://solid-eat.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' 
that is not equal to the supplied origin.
```

### Cause racine

Le backend Railway renvoie un header CORS avec la valeur `http://localhost:5173` (valeur par défaut) au lieu de `https://solid-eat.com`.

**Explication** :
- Le backend utilise `process.env.FRONTEND_URL` pour configurer CORS
- Si `FRONTEND_URL` n'est pas définie ou est incorrecte dans Railway, le backend utilise la valeur par défaut : `http://localhost:5173`
- Le frontend déployé sur `https://solid-eat.com` ne correspond pas à cette valeur
- Le navigateur bloque la requête pour des raisons de sécurité CORS

---

## ✅ SOLUTION : Mettre à jour `FRONTEND_URL` dans Railway

### Étape 1 : Accéder aux variables Railway

1. **Railway Dashboard** → https://railway.app/
2. **Se connecter** avec votre compte
3. **Sélectionner** votre projet Solid'Eat
4. **Settings** (menu de gauche) → **Variables**

### Étape 2 : Vérifier/modifier `FRONTEND_URL`

1. **Chercher** la variable `FRONTEND_URL` dans la liste
2. **Vérifier** sa valeur actuelle :
   - ❌ **Incorrect** : `http://localhost:5173` (ou vide)
   - ✅ **Correct** : `https://solid-eat.com`

3. **Si incorrect** :
   - **Cliquer** sur l'icône de modification (crayon) à côté de `FRONTEND_URL`
   - **Remplacer** la valeur par : `https://solid-eat.com`
   - **Sauvegarder**

### Étape 3 : Attendre le redéploiement

- Railway redéploie automatiquement après modification d'une variable (1-2 minutes)
- Surveiller les logs pour confirmer le redéploiement

### Étape 4 : Vérifier la correction

**Test 1 : Vérifier les headers CORS**

```bash
curl -H "Origin: https://solid-eat.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.solid-eat.com/api/auth/register \
     -v
```

**Résultat attendu** :
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: https://solid-eat.com
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
```

**Test 2 : Tester l'inscription depuis le frontend**

1. **Ouvrir** : `https://solid-eat.com/register`
2. **Remplir** le formulaire d'inscription
3. **Soumettre**
4. **Vérifier** :
   - ✅ Pas d'erreur CORS dans la console
   - ✅ L'inscription fonctionne

---

## 🔧 CONFIGURATION BACKEND

Le backend configure CORS dans `backend/src/index.ts` :

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

**Important** :
- `FRONTEND_URL` doit correspondre **exactement** à l'URL du frontend déployé
- Pas de slash final (`https://solid-eat.com` et non `https://solid-eat.com/`)
- Utiliser `https://` en production (pas `http://`)

---

## 📋 VALEURS CORRECTES PAR ENVIRONNEMENT

### Production (domaine configuré)

**Railway** :
- `FRONTEND_URL` = `https://solid-eat.com`

**Vercel** :
- `VITE_API_URL` = `https://api.solid-eat.com`

### Développement local

**Railway** (si backend déployé) :
- `FRONTEND_URL` = `http://localhost:5173`

**Local** :
- Pas besoin de configurer (valeur par défaut utilisée)

### Temporaire (domaines non configurés)

**Railway** :
- `FRONTEND_URL` = URL Vercel temporaire (ex: `https://solideat-xxxxx.vercel.app`)

**Vercel** :
- `VITE_API_URL` = URL Railway temporaire (ex: `https://xxxxx.railway.app`)

---

## 🆘 DÉPANNAGE

### Erreur CORS persiste après modification

**Vérifications** :

1. **Railway a-t-il redéployé ?**
   - Vérifier les logs Railway (Dashboard → Deployments → Logs)
   - Chercher un message de redéploiement

2. **La variable est-elle correcte ?**
   - Vérifier dans Railway : `FRONTEND_URL` = `https://solid-eat.com`
   - Pas de slash final, pas d'espace
   - Utiliser `https://` (pas `http://`)

3. **Le cache du navigateur**
   - Vider le cache du navigateur (Ctrl+Shift+Delete)
   - Ou tester en navigation privée

4. **Forcer un redéploiement Railway**
   - Railway Dashboard → Deployments
   - Cliquer sur "Redeploy" si disponible

### Erreur : "Multiple origins not allowed"

**Cause** : Le backend ne supporte qu'une seule origine CORS

**Solution** : Si vous avez besoin de plusieurs origines (dev + prod), modifier le code backend pour accepter un tableau d'origines :

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || 'http://localhost:5173',
  credentials: true,
}));
```

Puis dans Railway, définir : `FRONTEND_URL=https://solid-eat.com,http://localhost:5173`

---

## ✅ CHECKLIST RAPIDE

- [ ] Ouvrir Railway Dashboard → Settings → Variables
- [ ] Trouver `FRONTEND_URL`
- [ ] Vérifier que la valeur est `https://solid-eat.com`
- [ ] Modifier si nécessaire
- [ ] Sauvegarder
- [ ] Attendre le redéploiement Railway (1-2 min)
- [ ] Tester l'inscription depuis `https://solid-eat.com/register`
- [ ] Vérifier qu'il n'y a plus d'erreur CORS dans la console

---

## 🎯 RÉSUMÉ

**Problème** : CORS bloque l'inscription car `FRONTEND_URL` dans Railway pointe vers `http://localhost:5173` au lieu de `https://solid-eat.com`

**Solution** : Mettre à jour `FRONTEND_URL` dans Railway avec `https://solid-eat.com`

**Résultat** : L'inscription fonctionne sans erreur CORS ✅

---

**Document créé par** : DEV  
**Date** : 24 janvier 2026  
**Cas d'usage** : Solid'Eat 2026 - Erreur CORS lors de l'inscription
