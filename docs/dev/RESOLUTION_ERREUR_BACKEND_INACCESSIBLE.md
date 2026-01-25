# 🆘 RÉSOLUTION : BACKEND INACCESSIBLE

**Date** : 24 janvier 2026  
**Problème** : `Failed to fetch` - Backend non accessible  
**Diagnostic initial** : Le domaine `api.solid-eat.com` n'est pas accessible  
**Diagnostic final** (après correction DNS) : le domaine répond mais la base de données est **`disconnected`** (`{"status":"error","database":"disconnected"}`)

---

## 🔍 PROBLÈME IDENTIFIÉ

Le diagnostic montre :
- ✅ Variables d'environnement correctes
- ❌ Backend non accessible : `Failed to fetch` sur `https://api.solid-eat.com`

**Causes possibles (phase 1 - domaine inaccessible)** :
1. Le domaine `api.solid-eat.com` n'est pas encore configuré dans Railway
2. Le DNS n'est pas encore configuré chez OVH
3. La propagation DNS n'est pas terminée
4. Railway n'est pas déployé/accessible

**Causes possibles (phase 2 - domaine OK mais base `disconnected`)** :
5. `DATABASE_URL` incorrecte (mot de passe mal encodé, mauvais host, mauvais user)
6. Problème de compatibilité **IPv4/IPv6** entre Railway et Supabase NANO :
   - Railway expose un environnement **IPv4**
   - Les instances **Supabase NANO (plan gratuit)** n'acceptent les connexions directes qu'en **IPv6**
   - La connexion directe `db.<project>.supabase.co:5432` peut donc échouer depuis Railway

---

## ✅ SOLUTION TEMPORAIRE : Utiliser l'URL Railway

En attendant la configuration du domaine, utiliser l'URL Railway temporaire.

### Étape 1 : Récupérer l'URL Railway

1. **Railway Dashboard** → Votre projet
2. **Settings** → **Networking**
3. **Copier** l'URL du service (ex: `https://xxxxx.railway.app`)

### Étape 2 : Mettre à jour Vercel

1. **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. **Trouver** `VITE_API_URL`
3. **Modifier** la valeur :
   - **Avant** : `https://api.solid-eat.com`
   - **Après** : `https://xxxxx.railway.app` (URL Railway)
4. **Save**
5. **Vercel redéploie automatiquement**

### Étape 3 : Mettre à jour Railway (CORS)

1. **Railway Dashboard** → Settings → Variables
2. **Trouver** `FRONTEND_URL`
3. **Modifier** la valeur :
   - **Avant** : `https://solid-eat.com`
   - **Après** : `https://solid-eat.com` (ou URL Vercel temporaire si le domaine n'est pas configuré)
4. **Railway redéploie automatiquement**

---

## ✅ SOLUTION DÉFINITIVE : Configurer le domaine

### Étape 1 : Ajouter le domaine dans Railway

1. **Railway Dashboard** → Votre projet
2. **Settings** → **Networking** → **Custom Domain**
3. **Cliquer sur** : "Add Custom Domain"
4. **Entrer** : `api.solid-eat.com`
5. **Railway affiche** une valeur CNAME à configurer chez OVH
6. **Copier** la valeur CNAME (ex: `xxxxx.railway.app`)

### Étape 2 : Configurer DNS chez OVH

1. **OVH Manager** → Domaines → `solid-eat.com` → Zone DNS
2. **Ajouter** un enregistrement :
   ```
   Type: CNAME
   Sous-domaine: api
   Cible: [Valeur fournie par Railway]
   TTL: 3600
   ```
3. **Valider**

### Étape 3 : Attendre la propagation DNS (1-2 heures)

### Étape 4 : Mettre à jour Vercel

1. **Vercel Dashboard** → Settings → Environment Variables
2. **Modifier** `VITE_API_URL` :
   - **Valeur** : `https://api.solid-eat.com`
3. **Save**

### Étape 5 : Vérifier

1. **Tester** : `curl https://api.solid-eat.com/health`
2. **Résultat attendu** : `{"status":"ok","database":"connected"}`

---

## 🧪 TESTS

### Test 1 : Vérifier Railway directement

```bash
curl https://[votre-projet].railway.app/health
```

**Si ça fonctionne** : Railway est accessible, le problème vient du domaine.

**Si ça ne fonctionne pas** : Vérifier les logs Railway.

### Test 2 : Vérifier la propagation DNS

```bash
dig api.solid-eat.com
# ou
nslookup api.solid-eat.com
```

**Résultat attendu** : Doit pointer vers Railway.

### Test 3 : Vérifier dans Railway

1. **Railway Dashboard** → Settings → Networking → Custom Domain
2. **Vérifier** que `api.solid-eat.com` est configuré
3. **Vérifier** le statut (Pending, Active, Error)

### Test 3 bis : Vérifier la base de données

1. **Tester** : `curl https://api.solid-eat.com/health`
2. **Cas 1** :  
   - Réponse : `{"status":"ok","database":"connected"}`  
   - ✅ Domaine + base OK
3. **Cas 2** :  
   - Réponse : `{"status":"error","database":"disconnected"}`  
   - ✅ Domaine OK mais **problème de connexion base de données**  
   - 📖 **Voir le guide détaillé** : [`SUPABASE_RAILWAY_IPV4_IPV6.md`](./SUPABASE_RAILWAY_IPV4_IPV6.md)

---

## 🛰️ CAS SPÉCIFIQUE : SUPABASE NANO + RAILWAY (IPv4 / IPv6)

> 📖 **Guide complet disponible** : [`SUPABASE_RAILWAY_IPV4_IPV6.md`](./SUPABASE_RAILWAY_IPV4_IPV6.md)

### Contexte

- **Railway** expose les services en **IPv4**
- **Supabase NANO** (plan gratuit) : connexions directes souvent **IPv6 only**
- **Résultat** : incompatibilité → `"database":"disconnected"`

### Solution rapide

Utiliser le **Session Pooler Supabase** (compatible IPv4) au lieu de la connexion directe.

**URL format** :
```
postgresql://postgres.<project>:<password_encodé>@aws-1-<region>.pooler.supabase.com:5432/postgres
```

**Exemple concret (Solid'Eat)** :
```
postgresql://postgres.nqoojfbceauiagypmofr:Elektromani%40%231@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Étapes** :
1. Supabase Dashboard → Settings → Database → **Pooling** (Session Pooler)
2. Copier l'URL du Session Pooler
3. Mettre à jour `DATABASE_URL` dans Railway
4. Attendre le redéploiement
5. Re-tester `/health`

Pour plus de détails, voir [`SUPABASE_RAILWAY_IPV4_IPV6.md`](./SUPABASE_RAILWAY_IPV4_IPV6.md).

---

## 📋 CHECKLIST

### Solution temporaire (URL Railway)
- [ ] URL Railway récupérée
- [ ] `VITE_API_URL` mis à jour dans Vercel
- [ ] `FRONTEND_URL` vérifié dans Railway
- [ ] Vercel redéployé
- [ ] Test : `/diagnostic` fonctionne

### Solution définitive (Domaine)
- [ ] Domaine `api.solid-eat.com` ajouté dans Railway
- [ ] Valeur CNAME récupérée
- [ ] DNS configuré chez OVH
- [ ] Propagation DNS attendue (1-2 heures)
- [ ] `VITE_API_URL` mis à jour : `https://api.solid-eat.com`
- [ ] Test : `curl https://api.solid-eat.com/health`

### Cas spécifique : Supabase NANO + Railway
- [ ] Vérifier que `https://api.solid-eat.com/health` répond
- [ ] Si `"database":"disconnected"` → problème de connexion base
- [ ] Récupérer l'URL du **Session Pooler** dans Supabase (onglet *Pooling*)
- [ ] Mettre à jour `DATABASE_URL` dans Railway avec l'URL du Session Pooler  
  (ex. `postgresql://postgres.<project>:<motdepasse_encodé>@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`)
- [ ] Attendre le redéploiement Railway
- [ ] Re-tester `/health` jusqu'à obtenir `"database":"connected"`

---

## 🆘 DÉPANNAGE

### Railway n'est pas accessible même avec l'URL temporaire

1. **Vérifier les logs Railway** :
   - Railway Dashboard → Deployments → Logs
   - Chercher les erreurs

2. **Vérifier les variables d'environnement** :
   - Toutes les variables obligatoires sont-elles configurées ?
   - `DATABASE_URL` est-il correct ?

3. **Vérifier le déploiement** :
   - Le déploiement est-il réussi ?
   - Y a-t-il des erreurs de build ?

### Le domaine ne fonctionne pas après configuration DNS

1. **Vérifier la propagation DNS** :
   - https://dnschecker.org
   - Entrer : `api.solid-eat.com`

2. **Vérifier dans Railway** :
   - Le domaine est-il configuré ?
   - Le statut n'est pas "Error" ?

3. **Attendre** : La propagation peut prendre jusqu'à 2 heures

### La base de données est "disconnected" après configuration du domaine

**Symptôme** : Le domaine répond (`/health` accessible) mais `"database":"disconnected"`

**Causes possibles** :
1. `DATABASE_URL` incorrecte (mot de passe mal encodé, mauvais host/user)
2. **Incompatibilité IPv4/IPv6** entre Railway et Supabase NANO (plan gratuit)

**Solution** :
- 📖 **Voir le guide détaillé** : [`SUPABASE_RAILWAY_IPV4_IPV6.md`](./SUPABASE_RAILWAY_IPV4_IPV6.md)
- Utiliser le **Session Pooler Supabase** au lieu de la connexion directe
- Mettre à jour `DATABASE_URL` dans Railway avec l'URL du pooler

---

**Document créé par** : DEV  
**Date** : 24 janvier 2026
