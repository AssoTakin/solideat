# 🌐 CONFIGURATION DNS OVH - SOLID-EAT.COM

**Date** : 23 janvier 2026  
**Domaine** : `solid-eat.com`  
**Hébergeur** : OVH  
**Statut** : ⏳ À configurer

---

## 📋 STRUCTURE DES DOMAINES

### Domaines à configurer

1. **Domaine principal** : `solid-eat.com`
   - → Frontend (Vercel/Netlify)
   - Type : **A** ou **CNAME**

2. **Sous-domaine API** : `api.solid-eat.com`
   - → Backend (Railway/Render)
   - Type : **CNAME**

---

## ✅ OUI, `api.solid-eat.com` EST UN SOUS-DOMAINE

**Définition** :
- **Domaine principal** : `solid-eat.com`
- **Sous-domaine** : `api.solid-eat.com` (le préfixe `api.` fait le sous-domaine)

**À faire chez OVH** :
- ✅ Créer un enregistrement DNS de type **CNAME** pour `api`
- ✅ Pointer vers l'URL fournie par Railway/Render

---

## 🔧 CONFIGURATION CHEZ OVH

### Étape 1 : Accéder à la gestion DNS

1. **Se connecter** à votre compte OVH
2. **Aller sur** : https://www.ovh.com/manager/web/
3. **Sélectionner** le domaine `solid-eat.com`
4. **Cliquer sur** : "Zone DNS" ou "Gestionnaire de zone DNS"

### Étape 2 : Configurer le domaine principal (Frontend)

**Pour `solid-eat.com` → Vercel/Netlify**

1. **Dans la zone DNS OVH**, ajouter/modifier :

   **Option A : Si Vercel/Netlify fournit une IP** :
   ```
   Type: A
   Sous-domaine: @ (ou laisser vide)
   Cible: [IP fournie par Vercel/Netlify]
   TTL: 3600 (ou Auto)
   ```

   **Option B : Si Vercel/Netlify fournit un CNAME** :
   ```
   Type: CNAME
   Sous-domaine: @ (ou laisser vide)
   Cible: [URL fournie par Vercel/Netlify, ex: cname.vercel-dns.com]
   TTL: 3600 (ou Auto)
   ```

   **⚠️ Note** : Certains registrars ne permettent pas de CNAME sur le domaine racine (`@`). Dans ce cas, utilisez un enregistrement A avec l'IP.

### Étape 3 : Configurer le sous-domaine API

**Pour `api.solid-eat.com` → Railway/Render**

1. **Dans la zone DNS OVH**, ajouter :

   ```
   Type: CNAME
   Sous-domaine: api
   Cible: [URL fournie par Railway/Render]
   TTL: 3600 (ou Auto)
   ```

2. **Exemples de cibles** :
   - **Railway** : `xxxxx.railway.app`
   - **Render** : `xxxxx.onrender.com`

---

## 📝 EXEMPLE DE CONFIGURATION COMPLÈTE

### Configuration DNS OVH

```
Type    Sous-domaine    Cible                                    TTL
----------------------------------------------------------------------------
A       @               [IP Vercel]                              3600
CNAME   api             xxxxx.railway.app                        3600
```

**OU** (si CNAME autorisé sur racine) :

```
Type    Sous-domaine    Cible                                    TTL
----------------------------------------------------------------------------
CNAME   @               cname.vercel-dns.com                     3600
CNAME   api             xxxxx.railway.app                        3600
```

---

## 🚀 ÉTAPES DÉTAILLÉES OVH

### 1. Accéder à la zone DNS

1. Connectez-vous à : https://www.ovh.com/manager/web/
2. Cliquez sur **"Domaines"** dans le menu de gauche
3. Sélectionnez **`solid-eat.com`**
4. Cliquez sur l'onglet **"Zone DNS"**

### 2. Ajouter le sous-domaine API

1. **Cliquez sur** : "Ajouter une entrée" ou "Ajouter un enregistrement"
2. **Sélectionnez** : Type **CNAME**
3. **Remplissez** :
   - **Sous-domaine** : `api` (sans le point final)
   - **Cible** : L'URL fournie par Railway/Render (ex: `xxxxx.railway.app`)
   - **TTL** : 3600 (ou laisser par défaut)
4. **Cliquez sur** : "Valider" ou "Ajouter"

### 3. Configurer le domaine principal

**Pour Vercel** :
1. Dans Vercel Dashboard → Settings → Domains → Add Domain
2. Entrez : `solid-eat.com`
3. Vercel vous donnera des instructions DNS
4. Suivez les instructions dans OVH

**Pour Netlify** :
1. Dans Netlify Dashboard → Site settings → Domain management
2. Ajoutez : `solid-eat.com`
3. Suivez les instructions DNS dans OVH

---

## ⏱️ PROPAGATION DNS

### Temps de propagation

- **Minimum** : 5-15 minutes
- **Typique** : 1-2 heures
- **Maximum** : 24-48 heures (rare)

### Vérifier la propagation

**Pour le domaine principal** :
```bash
dig solid-eat.com
# ou
nslookup solid-eat.com
```

**Pour le sous-domaine** :
```bash
dig api.solid-eat.com
# ou
nslookup api.solid-eat.com
```

**En ligne** :
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🔒 SSL/HTTPS

### Automatique avec les plateformes

**Vercel** :
- ✅ Certificat SSL automatique (Let's Encrypt)
- ✅ Activation automatique après configuration DNS
- ✅ Renouvellement automatique

**Railway** :
- ✅ Certificat SSL automatique
- ✅ Activation automatique après configuration DNS
- ✅ Renouvellement automatique

**Aucune action manuelle nécessaire !** ✅

---

## ✅ CHECKLIST DE CONFIGURATION

### Chez OVH
- [ ] Accéder à la zone DNS de `solid-eat.com`
- [ ] Configurer le domaine principal (`@` ou vide) → Frontend
- [ ] Ajouter le sous-domaine `api` → Backend
- [ ] Vérifier les enregistrements DNS

### Sur les plateformes
- [ ] Configurer `solid-eat.com` sur Vercel/Netlify
- [ ] Configurer `api.solid-eat.com` sur Railway/Render
- [ ] Récupérer les valeurs DNS à configurer

### Vérifications
- [ ] Propagation DNS vérifiée (1-2 heures)
- [ ] SSL activé automatiquement
- [ ] Frontend accessible : `https://solid-eat.com`
- [ ] Backend accessible : `https://api.solid-eat.com`

---

## 📋 RÉCAPITULATIF

### Structure finale

```
solid-eat.com (domaine principal)
├── Frontend (Vercel/Netlify)
│   └── https://solid-eat.com
│
└── api.solid-eat.com (sous-domaine)
    └── Backend (Railway/Render)
        └── https://api.solid-eat.com
```

### Enregistrements DNS OVH

1. **Domaine principal** (`solid-eat.com`) :
   - Type : A ou CNAME
   - Cible : Vercel/Netlify

2. **Sous-domaine API** (`api.solid-eat.com`) :
   - Type : **CNAME**
   - Sous-domaine : `api`
   - Cible : Railway/Render

---

## ⚠️ NOTES IMPORTANTES

1. **Sous-domaine** : `api` est le préfixe, pas `api.solid-eat.com`
2. **CNAME** : Utiliser CNAME pour le sous-domaine (plus flexible)
3. **Propagation** : Attendre 1-2 heures après configuration
4. **SSL** : Activation automatique, pas besoin de configuration manuelle
5. **TTL** : 3600 secondes (1 heure) est une bonne valeur

---

## 🆘 DÉPANNAGE

### Le sous-domaine ne fonctionne pas

1. **Vérifier la propagation DNS** :
   ```bash
   dig api.solid-eat.com
   ```

2. **Vérifier la configuration OVH** :
   - Le sous-domaine doit être `api` (sans point)
   - Le type doit être `CNAME`
   - La cible doit être correcte

3. **Vérifier sur Railway/Render** :
   - Le domaine personnalisé doit être configuré
   - Les certificats SSL doivent être en cours de génération

### Le domaine principal ne fonctionne pas

1. **Vérifier si CNAME est autorisé** :
   - Certains registrars n'autorisent pas CNAME sur `@`
   - Utiliser un enregistrement A avec l'IP à la place

2. **Vérifier la configuration Vercel/Netlify** :
   - Le domaine doit être ajouté dans le dashboard
   - Suivre les instructions DNS fournies

---

## 📚 RESSOURCES

- **OVH Manager** : https://www.ovh.com/manager/web/
- **Documentation OVH DNS** : https://docs.ovh.com/fr/domaines/editer-ma-zone-dns/
- **Vérification DNS** : https://dnschecker.org
- **Guide domaine** : `docs/dev/CONFIGURATION_DOMAINE_SOLID_EAT.md`

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026  
**Domaine** : `solid-eat.com` ✅  
**Hébergeur** : OVH
