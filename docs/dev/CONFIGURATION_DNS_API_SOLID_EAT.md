# 🌐 CONFIGURATION DNS OVH - api.solid-eat.com

**Date** : 23 janvier 2026  
**Sous-domaine** : `api.solid-eat.com`  
**Destination** : Railway (Backend)  
**Hébergeur DNS** : OVH

---

## 📋 CONFIGURATION EXACTE POUR OVH

### Étape 1 : Obtenir la valeur CNAME depuis Railway

1. **Aller sur** : https://railway.app/
2. **Sélectionner** votre projet
3. **Aller dans** : **Settings** → **Networking** → **Custom Domain**
4. **Cliquer sur** : "Add Custom Domain"
5. **Entrer** : `api.solid-eat.com`
6. **Railway affiche** une valeur CNAME à configurer

**Exemple de valeur Railway** :
```
xxxxx.railway.app
```
ou
```
xxxxx.up.railway.app
```

**⚠️ IMPORTANT** : Copiez exactement la valeur affichée par Railway (elle est unique à votre projet).

---

## 🔧 CONFIGURATION OVH - ÉTAPES DÉTAILLÉES

### Étape 1 : Accéder à la zone DNS

1. **Se connecter** à votre compte OVH : https://www.ovh.com/manager/web/
2. **Cliquer sur** : "Domaines" dans le menu de gauche
3. **Sélectionner** : `solid-eat.com`
4. **Cliquer sur** : l'onglet **"Zone DNS"**

### Étape 2 : Ajouter l'enregistrement CNAME

1. **Cliquer sur** : "Ajouter une entrée" ou "Ajouter un enregistrement"
2. **Sélectionner** : Type **CNAME**
3. **Remplir les champs** :

   ```
   Type: CNAME
   Sous-domaine: api
   Cible: [VALEUR_FOURNIE_PAR_RAILWAY]
   TTL: 3600
   ```

   **Exemple concret** :
   ```
   Type: CNAME
   Sous-domaine: api
   Cible: xxxxx.railway.app
   TTL: 3600
   ```

4. **Cliquer sur** : "Valider" ou "Ajouter"

---

## ✅ CONFIGURATION FINALE ATTENDUE

### Dans la zone DNS OVH, vous devriez avoir :

```
Type    Sous-domaine    Cible                    TTL
----------------------------------------------------------
CNAME   api             xxxxx.railway.app        3600
```

**⚠️ IMPORTANT** :
- **Sous-domaine** : `api` (sans le point, sans `.solid-eat.com`)
- **Type** : `CNAME` (pas A, pas AAAA)
- **Cible** : La valeur exacte fournie par Railway
- **TTL** : `3600` (1 heure) est recommandé

---

## 🔍 VÉRIFICATION

### Après configuration, vérifier :

1. **Dans Railway** :
   - Le domaine `api.solid-eat.com` doit apparaître comme "Pending" ou "Configuring"
   - Railway génère automatiquement le certificat SSL (peut prendre 5-10 minutes)

2. **Vérifier la propagation DNS** :
   ```bash
   dig api.solid-eat.com
   # ou
   nslookup api.solid-eat.com
   ```
   
   **Résultat attendu** : Doit pointer vers l'URL Railway

3. **En ligne** :
   - https://dnschecker.org
   - https://www.whatsmydns.net
   - Entrer : `api.solid-eat.com`
   - Vérifier que le CNAME pointe vers Railway

---

## ⏱️ TEMPS DE PROPAGATION

- **Minimum** : 5-15 minutes
- **Typique** : 1-2 heures
- **Maximum** : 24-48 heures (rare)

**Après la propagation** :
- Railway détecte automatiquement le domaine
- Le certificat SSL est généré automatiquement
- Le domaine devient actif : `https://api.solid-eat.com`

---

## 🆘 DÉPANNAGE

### Le domaine ne fonctionne pas après 2 heures

1. **Vérifier la configuration DNS** :
   - Le sous-domaine est bien `api` (pas `api.solid-eat.com`)
   - Le type est bien `CNAME`
   - La cible correspond exactement à celle de Railway

2. **Vérifier dans Railway** :
   - Le domaine est bien ajouté dans Settings → Networking → Custom Domain
   - Le statut n'est pas "Error"

3. **Vérifier la propagation** :
   - Utiliser https://dnschecker.org
   - Vérifier que le CNAME est propagé partout

### Railway affiche une erreur

1. **Vérifier que le CNAME est bien configuré** dans OVH
2. **Attendre** la propagation DNS (1-2 heures)
3. **Vérifier les logs Railway** pour voir les erreurs spécifiques

---

## 📝 RÉCAPITULATIF

### Configuration OVH pour `api.solid-eat.com` :

```
Type: CNAME
Sous-domaine: api
Cible: [Valeur fournie par Railway]
TTL: 3600
```

### Où trouver la valeur de la cible :

1. Railway Dashboard → Votre projet
2. Settings → Networking → Custom Domain
3. Add Custom Domain → Entrer `api.solid-eat.com`
4. Copier la valeur CNAME affichée

---

**Document créé par** : DEV  
**Date** : 23 janvier 2026  
**Domaine** : `api.solid-eat.com` → Railway
