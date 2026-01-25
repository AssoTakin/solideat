# 🛰️ SUPABASE NANO + RAILWAY : Compatibilité IPv4/IPv6

**Date** : 24 janvier 2026  
**Contexte** : Déploiement backend sur Railway avec base de données Supabase NANO (plan gratuit)  
**Problème** : Incompatibilité IPv4/IPv6 entre Railway et connexion directe Supabase

---

## 🔍 PROBLÈME IDENTIFIÉ

### Symptômes

- Le backend Railway répond correctement (endpoint `/health` accessible)
- Mais la connexion à la base de données échoue :
  ```json
  {
    "status": "error",
    "database": "disconnected"
  }
  ```
- Les logs Railway montrent des erreurs de connexion PostgreSQL :
  - `timeout`
  - `unreachable`
  - `connection refused`
  - `ECONNREFUSED`

### Cause racine

**Incompatibilité IPv4/IPv6** :

1. **Railway** expose les services backend dans un environnement **IPv4**
2. **Supabase NANO** (plan gratuit) :
   - Les connexions directes à `db.<project>.supabase.co:5432` sont principalement accessibles en **IPv6**
   - Les instances NANO n'ont pas toujours de support IPv4 natif pour les connexions directes
3. **Résultat** : Railway (IPv4) ne peut pas se connecter directement à Supabase (IPv6)

---

## ✅ SOLUTION : Utiliser le Session Pooler Supabase

Supabase fournit un **Session Pooler** (connection pooler) qui est **compatible IPv4** et accessible depuis Railway.

### Différences entre connexion directe et Session Pooler

| Aspect | Connexion directe | Session Pooler |
|--------|-------------------|----------------|
| **Host** | `db.<project>.supabase.co` | `aws-1-eu-west-1.pooler.supabase.com` (ou autre région) |
| **User** | `postgres` | `postgres.<project>` (user spécifique au pooler) |
| **IPv4** | ❌ Non garanti (souvent IPv6 only) | ✅ Compatible IPv4 |
| **IPv6** | ✅ Supporté | ✅ Supporté |
| **Limitations** | Connexions directes limitées | Pool de connexions partagées |

---

## 🔧 MISE EN PLACE

### Étape 1 : Récupérer l'URL du Session Pooler

1. **Supabase Dashboard** → Votre projet
2. **Settings** → **Database**
3. **Connection Info** ou **Connection string**
4. Onglet **Pooling** (Session Pooler)
5. **Copier** l'URL au format **Connection string** PostgreSQL

**Exemple d'URL récupérée** :

```
postgresql://postgres.nqoojfbceauiagypmofr:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### Étape 2 : Encoder le mot de passe (si nécessaire)

Si le mot de passe contient des caractères spéciaux, les encoder en URL :

| Caractère | Encodage URL |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |

**Exemple** :
- Mot de passe : `Elektromani@#1`
- Encodé : `Elektromani%40%231`

### Étape 3 : Construire l'URL complète

**Format** :
```
postgresql://<user>:<password_encodé>@<host_pooler>:<port>/<database>
```

**Exemple concret (Solid'Eat)** :
```
postgresql://postgres.nqoojfbceauiagypmofr:Elektromani%40%231@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Détails** :
- **User** : `postgres.nqoojfbceauiagypmofr` (format `<user>.<project>`)
- **Password** : `Elektromani%40%231` (encodé URL)
- **Host** : `aws-1-eu-west-1.pooler.supabase.com` (pooler, région `eu-west-1`)
- **Port** : `5432` (standard PostgreSQL)
- **Database** : `postgres` (base par défaut)

### Étape 4 : Mettre à jour `DATABASE_URL` dans Railway

1. **Railway Dashboard** → Votre projet
2. **Settings** → **Variables**
3. **Trouver** `DATABASE_URL`
4. **Modifier** la valeur :
   - **Avant** (connexion directe) :
     ```
     postgresql://postgres:Elektromani%40%231@db.nqoojfbceauiagypmofr.supabase.co:5432/postgres
     ```
   - **Après** (Session Pooler) :
     ```
     postgresql://postgres.nqoojfbceauiagypmofr:Elektromani%40%231@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
     ```
5. **Sauvegarder**
6. **Attendre le redéploiement automatique** (1-2 minutes)

### Étape 5 : Vérifier la connexion

**Test via health check** :
```bash
curl https://api.solid-eat.com/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-01-24T..."
}
```

**Si erreur persistante** :
- Vérifier les logs Railway (Dashboard → Deployments → Logs)
- Vérifier que le mot de passe est correctement encodé
- Vérifier que l'URL du pooler est correcte (région, user, host)

---

## 📋 COMPARAISON AVANT/APRÈS

### Avant (connexion directe - échec)

```text
postgresql://postgres:Elektromani%40%231@db.nqoojfbceauiagypmofr.supabase.co:5432/postgres
```

**Problèmes** :
- ❌ Host `db.nqoojfbceauiagypmofr.supabase.co` → IPv6 only
- ❌ Railway (IPv4) ne peut pas se connecter
- ❌ Résultat : `"database":"disconnected"`

### Après (Session Pooler - succès)

```text
postgresql://postgres.nqoojfbceauiagypmofr:Elektromani%40%231@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Avantages** :
- ✅ Host `aws-1-eu-west-1.pooler.supabase.com` → Compatible IPv4
- ✅ Railway (IPv4) peut se connecter
- ✅ Résultat : `"database":"connected"`

**Changements clés** :
- **Host** : `db.nqoojfbceauiagypmofr.supabase.co` → `aws-1-eu-west-1.pooler.supabase.com`
- **User** : `postgres` → `postgres.nqoojfbceauiagypmofr`

---

## 🧪 TESTS ET VALIDATION

### Test 1 : Health check backend

```bash
curl https://api.solid-eat.com/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Test 2 : Logs Railway

1. **Railway Dashboard** → **Deployments** → **Logs**
2. **Vérifier** :
   - ✅ Pas d'erreurs `ECONNREFUSED`
   - ✅ Pas d'erreurs `timeout`
   - ✅ Messages de connexion PostgreSQL réussie

### Test 3 : Test de connexion directe (optionnel)

Pour vérifier que la connexion directe échoue bien depuis Railway :

```bash
# Depuis Railway (via logs ou SSH si disponible)
psql "postgresql://postgres:Elektromani%40%231@db.nqoojfbceauiagypmofr.supabase.co:5432/postgres"
```

**Résultat attendu** : Timeout ou `ECONNREFUSED`

---

## 🆘 DÉPANNAGE

### Erreur : "database":"disconnected" après changement

**Causes possibles** :

1. **Mot de passe mal encodé**
   - Vérifier que `@` → `%40`, `#` → `%23`, etc.
   - Utiliser un outil d'encodage URL si nécessaire

2. **URL du pooler incorrecte**
   - Vérifier la région (ex. `eu-west-1`, `us-east-1`)
   - Vérifier le format du user : `postgres.<project>`
   - Vérifier le host : `aws-1-<region>.pooler.supabase.com`

3. **Railway n'a pas redéployé**
   - Vérifier les logs Railway
   - Forcer un redéploiement si nécessaire

4. **Problème de permissions Supabase**
   - Vérifier que le user `postgres.<project>` a les permissions nécessaires
   - Vérifier dans Supabase Dashboard → Settings → Database

### Erreur : "password authentication failed"

**Cause** : Mot de passe incorrect ou mal encodé

**Solution** :
1. Vérifier le mot de passe dans Supabase Dashboard
2. Ré-encoder correctement en URL
3. Mettre à jour `DATABASE_URL` dans Railway

### Erreur : "SSL required"

**Cause** : Supabase peut exiger SSL pour certaines connexions

**Solution** : Ajouter `?sslmode=require` à la fin de l'URL :

```
postgresql://postgres.nqoojfbceauiagypmofr:Elektromani%40%231@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

---

## 📚 RESSOURCES

- [Supabase Connection Pooling Documentation](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Supabase Connection String Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-string)
- [Railway Documentation](https://docs.railway.app/)

---

## ✅ CHECKLIST RAPIDE

- [ ] Récupérer l'URL du Session Pooler dans Supabase Dashboard
- [ ] Encoder le mot de passe en URL si nécessaire (`@` → `%40`, `#` → `%23`)
- [ ] Construire l'URL complète : `postgresql://postgres.<project>:<password_encodé>@<host_pooler>:5432/postgres`
- [ ] Mettre à jour `DATABASE_URL` dans Railway
- [ ] Attendre le redéploiement Railway (1-2 min)
- [ ] Tester : `curl https://api.solid-eat.com/health`
- [ ] Vérifier que `"database":"connected"` apparaît dans la réponse
- [ ] Vérifier les logs Railway pour confirmer la connexion

---

## 🎯 RÉSUMÉ

**Problème** : Railway (IPv4) ne peut pas se connecter directement à Supabase NANO (IPv6 only)

**Solution** : Utiliser le **Session Pooler Supabase** (compatible IPv4)

**URL format** :
```
postgresql://postgres.<project>:<password_encodé>@aws-1-<region>.pooler.supabase.com:5432/postgres
```

**Résultat** : Connexion base de données fonctionnelle depuis Railway ✅

---

**Document créé par** : DEV  
**Date** : 24 janvier 2026  
**Cas d'usage** : Solid'Eat 2026 - Backend Railway + Supabase NANO
