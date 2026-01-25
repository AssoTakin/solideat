# 🆘 RÉSOLUTION ERREUR 404 VERCEL - SOLID'EAT

**Date** : 24 janvier 2026  
**Problème** : Erreur 404 NOT_FOUND sur Vercel  
**Cause** : Configuration routing SPA manquante

---

## 🔍 PROBLÈME IDENTIFIÉ

L'erreur 404 sur Vercel est due au fait que votre application React utilise **React Router** (Single Page Application). 

Quand vous accédez à `https://solid-eat.com/`, Vercel cherche un fichier `/index.html` qui existe. Mais si vous accédez à `https://solid-eat.com/dashboard` ou toute autre route, Vercel cherche un fichier `/dashboard` qui n'existe pas, d'où l'erreur 404.

**Solution** : Configurer Vercel pour rediriger toutes les routes vers `index.html` afin que React Router puisse gérer le routing côté client.

---

## ✅ SOLUTION : CRÉER vercel.json

Un fichier `vercel.json` a été créé dans le dossier `frontend/` avec la configuration suivante :

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Cette configuration indique à Vercel de rediriger toutes les routes (`(.*)`) vers `/index.html`, permettant à React Router de gérer le routing.

---

## 🔧 ÉTAPES POUR APPLIQUER LA SOLUTION

### Option 1 : Le fichier est déjà créé (recommandé)

Le fichier `frontend/vercel.json` a été créé automatiquement. Il suffit de :

1. **Commit et push** le fichier vers GitHub :
   ```bash
   cd "/Users/samdokpo/Documents/Projets New/Dev/Solid'Eat 2026"
   git add frontend/vercel.json
   git commit -m "fix: Ajouter configuration Vercel pour routing SPA"
   git push origin main
   ```

2. **Vercel redéploie automatiquement** après le push (2-3 minutes)

3. **Tester** : `https://solid-eat.com` devrait fonctionner

### Option 2 : Vérifier la configuration Vercel

Si le problème persiste, vérifier dans Vercel Dashboard :

1. **Vercel Dashboard** → Votre projet → **Settings** → **General**
2. **Vérifier** :
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

3. **Settings** → **Deployments**
   - Vérifier que le dernier déploiement inclut le fichier `vercel.json`

---

## 🧪 TESTS

### Test 1 : Page d'accueil
```
https://solid-eat.com/
```
**Résultat attendu** : Page d'accueil s'affiche

### Test 2 : Route React Router
```
https://solid-eat.com/dashboard
https://solid-eat.com/meals
https://solid-eat.com/login
```
**Résultat attendu** : Les routes fonctionnent (pas d'erreur 404)

### Test 3 : Route inexistante
```
https://solid-eat.com/route-inexistante
```
**Résultat attendu** : React Router gère l'erreur (pas d'erreur 404 Vercel)

---

## 📋 VÉRIFICATION CONFIGURATION VERCEL

### Configuration attendue

**Root Directory** : `frontend`  
**Build Command** : `npm run build`  
**Output Directory** : `dist`  
**Install Command** : `npm install`

### Fichier vercel.json

Le fichier doit être dans : `frontend/vercel.json`

**Contenu** :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🆘 DÉPANNAGE

### L'erreur 404 persiste après le déploiement

1. **Vérifier que le fichier est bien poussé** :
   ```bash
   git log --oneline -5
   # Vérifier que le commit avec vercel.json est présent
   ```

2. **Vérifier dans Vercel** :
   - Vercel Dashboard → Deployments → Dernier déploiement
   - Vérifier que `vercel.json` est présent dans les fichiers déployés

3. **Forcer un nouveau déploiement** :
   - Vercel Dashboard → Deployments → "Redeploy" sur le dernier déploiement

### Le fichier vercel.json n'est pas pris en compte

1. **Vérifier l'emplacement** :
   - Le fichier doit être dans `frontend/vercel.json` (pas à la racine)

2. **Vérifier le Root Directory** :
   - Dans Vercel Settings → General
   - Root Directory doit être `frontend`

3. **Vérifier le format JSON** :
   - Le fichier doit être un JSON valide
   - Pas de commentaires dans le JSON

### Erreur "Build failed"

1. **Vérifier les logs** :
   - Vercel Dashboard → Deployments → Logs
   - Chercher les erreurs de build

2. **Vérifier le Build Command** :
   - Doit être : `npm run build`

3. **Vérifier l'Output Directory** :
   - Doit être : `dist`

---

## ✅ CHECKLIST

- [ ] Fichier `frontend/vercel.json` créé
- [ ] Fichier commité et poussé vers GitHub
- [ ] Vercel a redéployé automatiquement
- [ ] Configuration Vercel vérifiée (Root Directory: `frontend`)
- [ ] Page d'accueil accessible : `https://solid-eat.com/`
- [ ] Routes React Router fonctionnent (ex: `/dashboard`)

---

## 📝 RÉSUMÉ

**Problème** : Erreur 404 sur Vercel pour les routes React Router  
**Cause** : Vercel ne sait pas rediriger les routes vers `index.html`  
**Solution** : Fichier `vercel.json` avec configuration `rewrites`  
**Action** : Commit et push le fichier, Vercel redéploie automatiquement

---

**Document créé par** : DEV  
**Date** : 24 janvier 2026
