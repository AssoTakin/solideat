# 🔧 CORRECTION DNS HOSTINGER - SOLID-EAT.COM

**Date** : 25 janvier 2026  
**Problème** : Erreur 403 Forbidden sur solid-eat.com  
**Cause** : Configuration DNS incorrecte pointant vers une mauvaise IP

---

## 🚨 PROBLÈMES IDENTIFIÉS

### 1. Enregistrement A incorrect pour le domaine racine

**Actuel** :
- Type : A
- Nom : (vide = domaine racine)
- Contenu : `9.13.86.33`
- TTL : 50

**Problème** : Cette IP ne correspond pas à Vercel. Elle pointe probablement vers un ancien hébergement ou un serveur qui n'a plus le site, d'où l'erreur 403.

### 2. CNAME pour api incomplet

**Actuel** :
- Type : CNAME
- Nom : `api`
- Contenu : `solidgroup.railwayapp` ❌

**Problème** : Il manque le point final. Devrait être `solidgroup.railway.app` ou similaire.

### 3. Enregistrements CAA avec nom "jp"

**Problème** : Les enregistrements CAA ont le nom `jp` au lieu de `@` (domaine racine). Cela peut causer des problèmes de certificats SSL.

---

## ✅ SOLUTION : CONFIGURATION CORRECTE

### Étape 1 : Obtenir les valeurs correctes depuis Vercel

1. **Aller sur** : https://vercel.com/dashboard
2. **Sélectionner** votre projet Solid'Eat
3. **Aller dans** : **Settings** → **Domains**
4. **Vérifier** que `solid-eat.com` est ajouté
5. **Si le domaine n'est pas ajouté** :
   - Cliquer sur **"Add Domain"**
   - Entrer : `solid-eat.com`
   - Suivre les instructions

6. **Vercel affichera** les instructions DNS avec :
   - **Option A** : Une ou plusieurs IPs (enregistrements A)
   - **Option B** : Un CNAME (ex: `cname.vercel-dns.com`)

**⚠️ IMPORTANT** : Copiez exactement les valeurs affichées par Vercel.

### Étape 2 : Obtenir la valeur correcte depuis Railway

1. **Aller sur** : https://railway.app/
2. **Sélectionner** votre projet backend
3. **Aller dans** : **Settings** → **Networking** → **Custom Domain**
4. **Vérifier** que `api.solid-eat.com` est configuré
5. **Si le domaine n'est pas configuré** :
   - Cliquer sur **"Add Custom Domain"**
   - Entrer : `api.solid-eat.com`
   - Railway affichera une valeur CNAME

6. **Copier** la valeur CNAME exacte (ex: `xxxxx.railway.app` ou `xxxxx.up.railway.app`)

---

## 🔧 CORRECTION DANS HOSTINGER

### Étape 1 : Accéder à la gestion DNS

1. **Se connecter** à votre compte Hostinger
2. **Aller dans** : **Domaines** → **Gestionnaire DNS** (ou **Zone DNS**)
3. **Sélectionner** le domaine `solid-eat.com`

### Étape 2 : Corriger l'enregistrement A pour le domaine racine

**Option A : Si Vercel fournit des IPs (recommandé pour Hostinger)**

1. **Trouver** l'enregistrement A avec le nom vide (ou `@`)
2. **Cliquer sur** "Modifier"
3. **Remplacer** la valeur `9.13.86.33` par l'IP fournie par Vercel
4. **Modifier le TTL** : `3600` (au lieu de 50)
5. **Sauvegarder**

**Option B : Si Vercel fournit un CNAME (si Hostinger le permet)**

1. **Supprimer** l'enregistrement A actuel
2. **Ajouter** un nouvel enregistrement :
   - **Type** : CNAME
   - **Nom** : `@` (ou laisser vide)
   - **Contenu** : La valeur fournie par Vercel (ex: `cname.vercel-dns.com`)
   - **TTL** : `3600`
3. **Sauvegarder**

**⚠️ Note** : Certains registrars (comme Hostinger) ne permettent pas de CNAME sur le domaine racine. Dans ce cas, utilisez l'Option A avec les IPs.

### Étape 3 : Corriger le CNAME pour api

1. **Trouver** l'enregistrement CNAME avec le nom `api`
2. **Cliquer sur** "Modifier"
3. **Vérifier** que le contenu est exactement celui fourni par Railway
   - Devrait être : `xxxxx.railway.app` ou `xxxxx.up.railway.app`
   - **Ne doit PAS être** : `solidgroup.railwayapp` (sans le point)
4. **Corriger** si nécessaire en ajoutant le point manquant
5. **Modifier le TTL** : `3600` (au lieu de 3600, c'est déjà bon)
6. **Sauvegarder**

### Étape 4 : Corriger les enregistrements CAA

1. **Trouver** tous les enregistrements CAA avec le nom `jp`
2. **Pour chaque enregistrement CAA** :
   - **Cliquer sur** "Modifier"
   - **Changer le nom** de `jp` à `@` (ou laisser vide pour le domaine racine)
   - **Sauvegarder**

**OU** (si vous n'utilisez pas ces enregistrements CAA) :
- **Supprimer** tous les enregistrements CAA avec le nom `jp`
- Les plateformes (Vercel, Railway) gèrent automatiquement les certificats SSL

### Étape 5 : Vérifier le CNAME pour www

1. **Vérifier** que l'enregistrement CNAME pour `www` existe :
   - **Type** : CNAME
   - **Nom** : `www`
   - **Contenu** : `solid-eat.com`
   - **TTL** : `3600`

2. **Si correct**, laisser tel quel
3. **Si incorrect**, corriger

---

## ✅ CONFIGURATION FINALE ATTENDUE

### Dans Hostinger, vous devriez avoir :

```
Type    Nom      Contenu                          TTL
----------------------------------------------------------
A       @        [IP fournie par Vercel]          3600
CNAME   www      solid-eat.com                    3600
CNAME   api      [Valeur exacte Railway]         3600
```

**Exemple concret** :
```
Type    Nom      Contenu                          TTL
----------------------------------------------------------
A       @        76.76.21.21                      3600
CNAME   www      solid-eat.com                    3600
CNAME   api      solidgroup.up.railway.app        3600
```

**⚠️ IMPORTANT** :
- Les valeurs exactes dépendent de ce que Vercel et Railway vous fournissent
- Ne copiez pas les exemples ci-dessus, utilisez vos propres valeurs

---

## 🔍 VÉRIFICATIONS

### Vérification 1 : Vérifier que Vercel a le domaine

1. **Dans Vercel Dashboard** → **Settings** → **Domains**
2. **Vérifier** que `solid-eat.com` est listé
3. **Vérifier** le statut :
   - ✅ **Valid Configuration** = DNS correct
   - ⚠️ **Invalid Configuration** = DNS incorrect, vérifier les valeurs
   - ⏳ **Pending** = Propagation DNS en cours

### Vérification 2 : Vérifier que Railway a le domaine

1. **Dans Railway Dashboard** → **Settings** → **Networking** → **Custom Domain**
2. **Vérifier** que `api.solid-eat.com` est listé
3. **Vérifier** le statut :
   - ✅ **Valid** = DNS correct
   - ⚠️ **Invalid** = DNS incorrect, vérifier la valeur CNAME

### Vérification 3 : Tester la résolution DNS

**Après avoir modifié les DNS, attendre 5-15 minutes, puis tester** :

```bash
# Tester le domaine principal
dig solid-eat.com
# ou
nslookup solid-eat.com

# Tester le sous-domaine API
dig api.solid-eat.com
# ou
nslookup api.solid-eat.com
```

**En ligne** :
- https://dnschecker.org
- https://www.whatsmydns.net

### Vérification 4 : Tester l'accès au site

**Après propagation DNS (1-2 heures)** :

1. **Ouvrir** : https://solid-eat.com
2. **Vérifier** :
   - ✅ Le site charge (pas d'erreur 403)
   - ✅ Le cadenas HTTPS est vert
   - ✅ Pas d'avertissement de sécurité

3. **Tester l'API** :
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

---

## ⏱️ TEMPS DE PROPAGATION

### Après modification DNS

- **Minimum** : 5-15 minutes
- **Typique** : 1-2 heures
- **Maximum** : 24-48 heures (rare)

### Que faire pendant la propagation ?

1. **Vérifier** dans Vercel/Railway que les domaines sont configurés
2. **Vérifier** que les valeurs DNS dans Hostinger sont correctes
3. **Attendre** 1-2 heures
4. **Tester** à nouveau

---

## 🆘 DÉPANNAGE

### Erreur 403 persiste après correction

**Causes possibles** :

1. **Propagation DNS pas terminée** :
   - Attendre 1-2 heures supplémentaires
   - Vérifier avec https://dnschecker.org

2. **Valeurs DNS incorrectes** :
   - Vérifier dans Vercel/Railway les valeurs exactes
   - Comparer avec celles dans Hostinger
   - Corriger si nécessaire

3. **Domaine non configuré dans Vercel** :
   - Vérifier que `solid-eat.com` est bien ajouté dans Vercel
   - Si non, l'ajouter dans Settings → Domains

4. **Cache navigateur** :
   - Vider le cache du navigateur
   - Tester en navigation privée
   - Tester avec un autre navigateur

### Le domaine ne se propage pas

1. **Vérifier** que les valeurs DNS sont correctes
2. **Vérifier** que le TTL n'est pas trop élevé (utiliser 3600)
3. **Vérifier** avec plusieurs outils DNS (dnschecker.org, whatsmydns.net)
4. **Contacter** le support Hostinger si le problème persiste après 24h

### Erreur SSL/Certificat

1. **Vercel et Railway gèrent automatiquement** les certificats SSL
2. **Attendre** 1-2 heures après configuration DNS
3. **Si le problème persiste** :
   - Vérifier que les DNS sont corrects
   - Vérifier dans Vercel/Railway que les domaines sont validés
   - Contacter le support Vercel/Railway si nécessaire

---

## 📋 CHECKLIST DE CORRECTION

- [ ] Obtenir les valeurs DNS depuis Vercel
- [ ] Obtenir la valeur CNAME depuis Railway
- [ ] Corriger l'enregistrement A pour le domaine racine dans Hostinger
- [ ] Corriger le CNAME pour `api` dans Hostinger
- [ ] Corriger/supprimer les enregistrements CAA avec nom `jp`
- [ ] Vérifier le CNAME pour `www`
- [ ] Vérifier dans Vercel que le domaine est validé
- [ ] Vérifier dans Railway que le domaine est validé
- [ ] Attendre 1-2 heures pour la propagation
- [ ] Tester l'accès au site : https://solid-eat.com
- [ ] Tester l'accès à l'API : https://api.solid-eat.com/health

---

## 🎯 RÉSUMÉ RAPIDE

**Actions principales** :

1. **Remplacer l'IP** `9.13.86.33` par l'IP fournie par Vercel (ou utiliser le CNAME si possible)
2. **Corriger** le CNAME `api` : ajouter le point manquant (ex: `solidgroup.railway.app`)
3. **Corriger/supprimer** les enregistrements CAA avec nom `jp`
4. **Attendre** 1-2 heures pour la propagation DNS
5. **Tester** l'accès au site

---

**Document créé par** : DEV  
**Date** : 25 janvier 2026
