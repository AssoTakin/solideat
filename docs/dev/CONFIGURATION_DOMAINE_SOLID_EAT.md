# 🌐 CONFIGURATION DU DOMAINE SOLID-EAT.COM

**Date** : 23 janvier 2026  
**Domaine** : `solid-eat.com`  
**Statut** : ✅ Domaine acheté

---

## 📋 STRUCTURE RECOMMANDÉE

### URLs de production

- **Frontend** : `https://solid-eat.com`
- **Backend API** : `https://api.solid-eat.com`

**Alternative** (si vous préférez) :
- **Frontend** : `https://www.solid-eat.com`
- **Backend API** : `https://api.solid-eat.com`

---

## 🔧 ÉTAPE 1 : CONFIGURATION DNS

### 1.1 Accéder à votre registrar

Connectez-vous à votre registrar (Namecheap, OVH, Gandi, etc.) et accédez à la gestion DNS du domaine `solid-eat.com`.

### 1.2 Configuration pour le Frontend

**Option A : Vercel (Recommandé)**

1. **Dans Vercel** :
   - Settings → Domains → Add Domain
   - Entrer : `solid-eat.com`
   - Vercel vous donnera des instructions DNS

2. **Dans votre registrar**, ajouter les enregistrements DNS :
   ```
   Type: A
   Name: @ (ou solid-eat.com)
   Value: [IP fournie par Vercel]
   TTL: Auto (ou 3600)
   ```

   **OU** (si Vercel fournit un CNAME) :
   ```
   Type: CNAME
   Name: @ (ou solid-eat.com)
   Value: [URL fournie par Vercel, ex: cname.vercel-dns.com]
   TTL: Auto (ou 3600)
   ```

**Option B : Netlify**

1. **Dans Netlify** :
   - Site settings → Domain management → Add custom domain
   - Entrer : `solid-eat.com`
   - Suivre les instructions DNS

2. **Dans votre registrar**, ajouter :
   ```
   Type: A
   Name: @
   Value: [IP fournie par Netlify]
   ```

### 1.3 Configuration pour le Backend (API)

**Option A : Railway (Recommandé)**

1. **Dans Railway** :
   - Settings → Domains → Add Custom Domain
   - Entrer : `api.solid-eat.com`
   - Railway vous donnera un CNAME à configurer

2. **Dans votre registrar**, ajouter :
   ```
   Type: CNAME
   Name: api
   Value: [URL fournie par Railway, ex: xxxxx.railway.app]
   TTL: Auto (ou 3600)
   ```

**Option B : Render**

1. **Dans Render** :
   - Settings → Custom Domains → Add Domain
   - Entrer : `api.solid-eat.com`
   - Suivre les instructions DNS

2. **Dans votre registrar**, ajouter :
   ```
   Type: CNAME
   Name: api
   Value: [URL fournie par Render]
   ```

### 1.4 Configuration complète DNS

**Exemple de configuration complète** (à adapter selon votre registrar) :

```
Type    Name    Value                          TTL
----------------------------------------------------------
A       @       [IP Vercel]                   3600
CNAME   api     [URL Railway]                  3600
```

**Note** : Les valeurs exactes vous seront fournies par Vercel et Railway lors de la configuration.

---

## ⏱️ PROPAGATION DNS

### Temps de propagation

- **Minimum** : 5-15 minutes
- **Typique** : 1-2 heures
- **Maximum** : 24-48 heures (rare)

### Vérifier la propagation

**Pour le frontend** :
```bash
dig solid-eat.com
# ou
nslookup solid-eat.com
```

**Pour le backend** :
```bash
dig api.solid-eat.com
# ou
nslookup api.solid-eat.com
```

**En ligne** :
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🔒 ÉTAPE 2 : CONFIGURATION SSL/HTTPS

### Automatique avec les plateformes

**Vercel** :
- ✅ Certificat SSL automatique (Let's Encrypt)
- ✅ Activation automatique après configuration DNS
- ✅ Renouvellement automatique

**Railway** :
- ✅ Certificat SSL automatique
- ✅ Activation automatique après configuration DNS
- ✅ Renouvellement automatique

**Render** :
- ✅ Certificat SSL automatique
- ✅ Activation automatique

**Aucune action manuelle nécessaire !** ✅

---

## 🚀 ÉTAPE 3 : CONFIGURATION DES VARIABLES D'ENVIRONNEMENT

### 3.1 Backend

**Variables à mettre à jour** :

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.solid-eat.com
FRONTEND_URL=https://solid-eat.com
```

**Où configurer** :
- Railway : Settings → Variables
- Render : Environment → Environment Variables

### 3.2 Frontend

**Variables à mettre à jour** :

```env
VITE_API_URL=https://api.solid-eat.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=<key>
```

**Où configurer** :
- Vercel : Settings → Environment Variables
- Netlify : Site settings → Build & deploy → Environment variables

---

## 🔗 ÉTAPE 4 : CONFIGURATION WEBHOOK STRIPE

### 4.1 Créer le webhook en mode Live

**Une fois le backend déployé sur `api.solid-eat.com`** :

1. **Aller sur** : https://dashboard.stripe.com/webhooks (mode Live)

2. **Cliquer sur** : "+ Add endpoint"

3. **Configuration** :
   - **URL** : `https://api.solid-eat.com/webhooks/stripe`
   - **Description** : "SolidEat - Webhook Production"
   - **Événements à écouter** :
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`

4. **Cliquer sur** : "Add endpoint"

5. **Récupérer le Webhook Secret** :
   - Cliquer sur l'endpoint créé
   - Section "Signing secret"
   - Cliquer sur "Reveal"
   - **Copier le secret** (commence par `whsec_...`)

### 4.2 Configurer le secret dans le backend

**Ajouter dans les variables d'environnement** :

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Redémarrer le backend** pour prendre en compte le nouveau secret.

---

## ✅ ÉTAPE 5 : VÉRIFICATIONS

### 5.1 Vérifier le frontend

```bash
curl -I https://solid-eat.com
```

**Résultat attendu** : `200 OK`

**Dans le navigateur** :
- Ouvrir : https://solid-eat.com
- Vérifier que la page charge
- Vérifier le cadenas HTTPS dans la barre d'adresse

### 5.2 Vérifier le backend

```bash
curl https://api.solid-eat.com/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

**Test de la route de base** :
```bash
curl https://api.solid-eat.com/
```

**Résultat attendu** :
```json
{
  "message": "Solid'Eat API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "api": "/api",
    "webhooks": "/webhooks/stripe"
  }
}
```

### 5.3 Vérifier le webhook Stripe

1. **Dans Stripe Dashboard** :
   - Aller sur le webhook créé
   - Section "Recent events"
   - Tester avec "Send test webhook"

2. **Vérifier les logs du backend** :
   - L'événement doit être reçu
   - Pas d'erreur de signature

---

## 📋 CHECKLIST DE CONFIGURATION

### DNS
- [ ] Enregistrement A ou CNAME pour `solid-eat.com` (frontend)
- [ ] Enregistrement CNAME pour `api.solid-eat.com` (backend)
- [ ] Propagation DNS vérifiée (1-2 heures)

### Plateformes
- [ ] Domaine configuré sur Vercel/Netlify
- [ ] Domaine configuré sur Railway/Render
- [ ] Certificats SSL activés automatiquement

### Variables d'environnement
- [ ] `API_URL=https://api.solid-eat.com` (backend)
- [ ] `FRONTEND_URL=https://solid-eat.com` (backend)
- [ ] `VITE_API_URL=https://api.solid-eat.com` (frontend)

### Stripe
- [ ] Webhook créé : `https://api.solid-eat.com/webhooks/stripe`
- [ ] Webhook secret récupéré
- [ ] Webhook secret configuré dans les variables d'environnement
- [ ] Test du webhook réussi

### Vérifications
- [ ] Frontend accessible : https://solid-eat.com
- [ ] Backend accessible : https://api.solid-eat.com
- [ ] Health check fonctionne
- [ ] HTTPS actif (cadenas vert)

---

## 🎯 PROCHAINES ÉTAPES

Une fois le domaine configuré :

1. **Déployer le backend** sur Railway/Render
2. **Déployer le frontend** sur Vercel/Netlify
3. **Créer le webhook Stripe** avec l'URL définitive
4. **Tester** toutes les fonctionnalités
5. **Mettre en production** ! 🚀

---

## 📚 RESSOURCES

- **Vérification DNS** : https://dnschecker.org
- **Test SSL** : https://www.ssllabs.com/ssltest/
- **Stripe Dashboard** : https://dashboard.stripe.com/webhooks
- **Documentation Vercel** : https://vercel.com/docs/concepts/projects/domains
- **Documentation Railway** : https://docs.railway.app/develop/config#custom-domains

---

## ⚠️ NOTES IMPORTANTES

1. **Propagation DNS** : Attendre 1-2 heures après configuration
2. **SSL** : Activation automatique, pas besoin de configuration manuelle
3. **Webhook Stripe** : Créer uniquement après déploiement du backend
4. **Variables d'environnement** : Mettre à jour AVANT le déploiement
5. **Tests** : Vérifier que tout fonctionne avant de mettre en production

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026  
**Domaine** : `solid-eat.com` ✅
