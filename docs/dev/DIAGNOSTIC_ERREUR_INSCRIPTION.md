# 🔍 DIAGNOSTIC ERREUR INSCRIPTION - SOLID'EAT

**Date** : 24 janvier 2026  
**Problème** : Erreur lors de l'inscription  
**Statut** : Diagnostic en cours

---

## 🔍 CAUSES POSSIBLES

### 1. Problème de connexion API (CORS ou URL incorrecte)

**Symptôme** : Erreur réseau dans la console du navigateur

**Vérifications** :
1. Ouvrir la console du navigateur (F12 → Console)
2. Tenter une inscription
3. Vérifier les erreurs dans la console

**Erreurs possibles** :
- `CORS policy: No 'Access-Control-Allow-Origin' header`
- `Failed to fetch`
- `Network Error`
- `404 Not Found`

### 2. URL API incorrecte

**Vérification** :
- La variable `VITE_API_URL` dans Vercel doit être : `https://api.solid-eat.com`
- Si le domaine n'est pas encore configuré, utiliser l'URL Railway temporaire

### 3. Backend non accessible

**Vérification** :
```bash
curl https://api.solid-eat.com/health
# ou
curl https://[votre-projet].railway.app/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 4. CORS mal configuré

**Problème** : Le backend autorise seulement `FRONTEND_URL` dans CORS

**Vérification** :
- Dans Railway, `FRONTEND_URL` doit être : `https://solid-eat.com`
- Si le domaine n'est pas encore configuré, utiliser l'URL Vercel temporaire

### 5. Erreur backend (base de données, validation, etc.)

**Vérification** : Vérifier les logs Railway pour voir l'erreur exacte

---

## 🧪 TESTS DE DIAGNOSTIC

### Test 1 : Vérifier l'URL API dans le frontend

1. **Ouvrir** : `https://solid-eat.com`
2. **Console** (F12 → Console)
3. **Exécuter** :
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
4. **Résultat attendu** : `https://api.solid-eat.com` (ou URL Railway temporaire)

### Test 2 : Tester l'API directement

**Dans la console du navigateur** :
```javascript
fetch('https://api.solid-eat.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test1234',
    phone: '+33123456789',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    addressStreet: '123 Rue Test',
    addressZipCode: '75001',
    addressCity: 'Paris',
    cguAccepted: true,
    sanitaryCharterAccepted: true,
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Vérifier** :
- Si erreur CORS → Problème de configuration CORS
- Si erreur 404 → Route non trouvée
- Si erreur 400 → Erreur de validation
- Si erreur 500 → Erreur backend

### Test 3 : Vérifier les logs Railway

1. **Railway Dashboard** → Votre projet
2. **Deployments** → Dernier déploiement → **Logs**
3. **Tenter une inscription** depuis le frontend
4. **Vérifier les logs** pour voir l'erreur exacte

---

## 🔧 SOLUTIONS PAR PROBLÈME

### Solution 1 : CORS - Frontend URL incorrecte

**Problème** : `FRONTEND_URL` dans Railway ne correspond pas à l'URL du frontend

**Solution** :
1. **Railway Dashboard** → Settings → Variables
2. **Vérifier** `FRONTEND_URL` :
   - Si domaine configuré : `https://solid-eat.com`
   - Sinon : URL Vercel temporaire (ex: `https://solideat-xxxxx.vercel.app`)
3. **Modifier** si nécessaire
4. **Railway redéploie automatiquement**

### Solution 2 : URL API incorrecte dans Vercel

**Problème** : `VITE_API_URL` dans Vercel est incorrecte

**Solution** :
1. **Vercel Dashboard** → Settings → Environment Variables
2. **Vérifier** `VITE_API_URL` :
   - Si domaine configuré : `https://api.solid-eat.com`
   - Sinon : URL Railway temporaire (ex: `https://xxxxx.railway.app`)
3. **Modifier** si nécessaire
4. **Vercel redéploie automatiquement**

### Solution 3 : Backend non accessible

**Problème** : Le backend ne répond pas

**Solution** :
1. **Vérifier** le health check : `curl https://api.solid-eat.com/health`
2. **Vérifier les logs Railway** pour voir les erreurs
3. **Vérifier** que toutes les variables d'environnement sont configurées
4. **Vérifier** la connexion à la base de données

### Solution 4 : Erreur de validation backend

**Problème** : Les données envoyées ne passent pas la validation

**Vérification** :
- Vérifier les logs Railway pour voir l'erreur exacte
- Vérifier que tous les champs requis sont remplis
- Vérifier le format des données (email, téléphone, etc.)

---

## 📋 CHECKLIST DE DIAGNOSTIC

### Frontend
- [ ] Console navigateur ouverte (F12)
- [ ] Variable `VITE_API_URL` vérifiée dans la console
- [ ] Erreur réseau identifiée (CORS, 404, 500, etc.)
- [ ] Test fetch direct effectué

### Backend
- [ ] Health check accessible : `/health`
- [ ] Logs Railway consultés
- [ ] Variable `FRONTEND_URL` vérifiée dans Railway
- [ ] Connexion base de données fonctionne

### Configuration
- [ ] `VITE_API_URL` dans Vercel : `https://api.solid-eat.com` (ou Railway temporaire)
- [ ] `FRONTEND_URL` dans Railway : `https://solid-eat.com` (ou Vercel temporaire)
- [ ] CORS configuré correctement

---

## 🆘 ACTIONS IMMÉDIATES

1. **Ouvrir la console du navigateur** (F12 → Console)
2. **Tenter une inscription**
3. **Noter l'erreur exacte** affichée dans la console
4. **Vérifier les logs Railway** pour voir l'erreur backend
5. **Partager les erreurs** pour diagnostic précis

---

**Document créé par** : DEV  
**Date** : 24 janvier 2026
