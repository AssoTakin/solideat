# 🔧 GUIDE ÉTAPE PAR ÉTAPE - CORRECTION DES VARIABLES

**Date** : 23 janvier 2026  
**Objectif** : Corriger et compléter les variables d'environnement

---

## 📋 ACTIONS À EFFECTUER

1. ✅ Corriger `DATABASE_URL` dans Railway (encodage URL)
2. ✅ Ajouter `GOOGLE_MAPS_API_KEY` dans Railway
3. ✅ Ajouter `VITE_GOOGLE_MAPS_API_KEY` dans Vercel
4. ✅ Tester que tout fonctionne

---

## 🔧 ÉTAPE 1 : CORRIGER DATABASE_URL DANS RAILWAY

### Problème
Le mot de passe contient `@` et `#` qui doivent être encodés en URL.

### Solution

1. **Aller sur** : https://railway.app/
2. **Se connecter** avec votre compte
3. **Sélectionner** votre projet Solid'Eat
4. **Cliquer sur** : **Settings** (dans le menu de gauche)
5. **Cliquer sur** : **Variables** (dans le sous-menu)
6. **Trouver** la variable `DATABASE_URL` dans la liste
7. **Cliquer sur** l'icône de modification (crayon) à côté de `DATABASE_URL`
8. **Remplacer** la valeur actuelle par :
   ```
   postgresql://postgres:Elektromani%40%231@db.nqoojfbceauiagypmofr.supabase.co:5432/postgres
   ```
   **⚠️ IMPORTANT** : Utiliser `%40` pour `@` et `%23` pour `#`
9. **Cliquer sur** : **Save** ou **Update**
10. **Railway redéploie automatiquement** (attendre 1-2 minutes)

### Vérification
- Vérifier les logs Railway pour confirmer que le redéploiement est réussi
- Le backend devrait démarrer sans erreur de connexion base de données

---

## 🔧 ÉTAPE 2 : AJOUTER GOOGLE_MAPS_API_KEY DANS RAILWAY

1. **Dans Railway** (même page Settings → Variables)
2. **Cliquer sur** : **New Variable** (bouton en haut à droite)
3. **Remplir** :
   - **Name** : `GOOGLE_MAPS_API_KEY`
  - **Value** : `AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4`
4. **Cliquer sur** : **Add**
5. **Railway redéploie automatiquement**

### Vérification
- La variable apparaît dans la liste des variables Railway
- Le backend redéploie sans erreur

---

## 🔧 ÉTAPE 3 : AJOUTER VITE_GOOGLE_MAPS_API_KEY DANS VERCEL

1. **Aller sur** : https://vercel.com/
2. **Se connecter** avec votre compte
3. **Sélectionner** votre projet Solid'Eat
4. **Cliquer sur** : **Settings** (dans le menu de gauche)
5. **Cliquer sur** : **Environment Variables** (dans le sous-menu)
6. **Cliquer sur** : **Add** (bouton en haut à droite)
7. **Remplir** :
   - **Name** : `VITE_GOOGLE_MAPS_API_KEY`
  - **Value** : `AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4`
   - **Environments** : Cocher les 3 cases :
     - ✅ Production
     - ✅ Preview
     - ✅ Development
8. **Cliquer sur** : **Save**
9. **Vercel redéploie automatiquement** (ou déclencher un nouveau déploiement)

### Vérification
- La variable apparaît dans la liste des variables Vercel
- Le frontend redéploie sans erreur

---

## 🧪 ÉTAPE 4 : TESTS DE VALIDATION

### Test 1 : Backend Health Check

**Si le domaine est configuré** :
```bash
curl https://api.solid-eat.com/health
```

**Si le domaine n'est pas encore configuré** :
```bash
curl https://[votre-projet].railway.app/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Si erreur** :
- Vérifier les logs Railway
- Vérifier que `DATABASE_URL` est correctement encodé
- Vérifier que Supabase autorise les connexions depuis Railway

### Test 2 : Frontend

1. **Ouvrir** : `https://solid-eat.com` (ou URL Vercel temporaire)
2. **Ouvrir la console** (F12 → Console)
3. **Vérifier** :
   - ✅ Pas d'erreurs de variables manquantes
   - ✅ Pas d'erreurs `VITE_GOOGLE_MAPS_API_KEY is not defined`
   - ✅ Les appels API fonctionnent

### Test 3 : Google Maps API

**Test direct de la clé** :
Ouvrir dans le navigateur :
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4
```

**Résultat attendu** :
- Pas d'erreur 403 (clé invalide)
- Le script JavaScript se charge

**Si erreur 403** :
- Vérifier que l'API Google Maps JavaScript API est activée dans Google Cloud Console
- Vérifier les restrictions de la clé API

---

## ✅ CHECKLIST FINALE

### Railway (Backend)
- [ ] `DATABASE_URL` corrigé avec encodage URL
- [ ] `GOOGLE_MAPS_API_KEY` ajouté
- [ ] Backend redéployé avec succès
- [ ] Health check fonctionne : `/health`
- [ ] Connexion base de données fonctionne
- [ ] Pas d'erreurs dans les logs Railway

### Vercel (Frontend)
- [ ] `VITE_GOOGLE_MAPS_API_KEY` ajouté
- [ ] Frontend redéployé avec succès
- [ ] Variables accessibles dans le code
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Appels API fonctionnent

### Services
- [ ] Google Maps API fonctionne
- [ ] Base de données Supabase accessible
- [ ] Stripe configuré correctement

---

## 🆘 DÉPANNAGE

### Erreur : "Database connection failed"

**Cause** : `DATABASE_URL` mal encodé

**Solution** :
1. Vérifier que `@` est encodé en `%40`
2. Vérifier que `#` est encodé en `%23`
3. Vérifier le format complet : `postgresql://postgres:Elektromani%40%231@...`

### Erreur : "GOOGLE_MAPS_API_KEY is not defined"

**Cause** : Variable non ajoutée dans Railway

**Solution** :
1. Vérifier que la variable est bien ajoutée dans Railway
2. Vérifier que Railway a redéployé après l'ajout
3. Vérifier les logs Railway pour confirmer

### Erreur : "VITE_GOOGLE_MAPS_API_KEY is not defined"

**Cause** : Variable non ajoutée dans Vercel ou pas de préfixe `VITE_`

**Solution** :
1. Vérifier que la variable commence par `VITE_`
2. Vérifier que la variable est ajoutée dans Vercel
3. Vérifier que Vercel a redéployé après l'ajout
4. Redémarrer le build Vercel si nécessaire

### Erreur : "Google Maps API key invalid"

**Cause** : Clé API invalide ou restrictions trop strictes

**Solution** :
1. Vérifier que la clé est correcte dans Google Cloud Console
2. Vérifier que l'API "Maps JavaScript API" est activée
3. Vérifier les restrictions de la clé (HTTP referrers)
4. Ajouter `https://solid-eat.com/*` dans les restrictions

---

## 📝 RÉSUMÉ DES VALEURS

### DATABASE_URL (Railway) - Connexion via Session Pooler Supabase (recommandé avec Railway)

> ⚠️ Remarque : avec le plan **Supabase NANO (gratuit)**, la connexion directe `db.<project>.supabase.co` peut être uniquement IPv6.  
> Railway étant en IPv4, il est **recommandé d'utiliser le Session Pooler** Supabase, compatible IPv4.

Connexion utilisée dans Solid'Eat :

```
postgresql://postgres.nqoojfbceauiagypmofr:Elektromani%40%231@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

Changements clés :
- **Host** : `aws-1-eu-west-1.pooler.supabase.com` (pooler) au lieu de `db.nqoojfbceauiagypmofr.supabase.co`
- **User** : `postgres.nqoojfbceauiagypmofr` (user spécifique au pooler)
- **Mot de passe** : toujours encodé URL (`Elektromani%40%231`)

### GOOGLE_MAPS_API_KEY (Railway)
```
AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4
```

### VITE_GOOGLE_MAPS_API_KEY (Vercel)
```
AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4
```

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

1. ✅ **Corriger DATABASE_URL** dans Railway (priorité haute)
2. ✅ **Ajouter GOOGLE_MAPS_API_KEY** dans Railway
3. ✅ **Ajouter VITE_GOOGLE_MAPS_API_KEY** dans Vercel
4. ✅ **Tester le health check** backend
5. ✅ **Tester le frontend**
6. ✅ **Vérifier les logs** pour confirmer

---

**Document créé par** : DEV  
**Date** : 23 janvier 2026
