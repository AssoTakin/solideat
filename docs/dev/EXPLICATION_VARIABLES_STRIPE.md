# 🔑 EXPLICATION DES VARIABLES STRIPE

**Date** : 23 janvier 2026  
**Contexte** : Erreur Railway - STRIPE_WEBHOOK_SECRET manquant

---

## 📋 LES 3 VARIABLES STRIPE DIFFÉRENTES

### 1. `STRIPE_SECRET_KEY` (Clé API Secrète)
- **Type** : Clé API Stripe
- **Format** : `sk_live_...` (production) ou `sk_test_...` (développement)
- **Où l'obtenir** : Stripe Dashboard → Developers → API keys → Secret key
- **Usage** : Permet à votre backend d'effectuer des opérations Stripe (créer des abonnements, etc.)

### 2. `STRIPE_WEBHOOK_SECRET` (Secret du Webhook) ⚠️ MANQUANT
- **Type** : Secret de signature du webhook
- **Format** : `whsec_...`
- **Où l'obtenir** : Stripe Dashboard → Developers → Webhooks → [Votre webhook] → Signing secret
- **Usage** : Permet de vérifier que les webhooks reçus proviennent bien de Stripe
- **⚠️ IMPORTANT** : Cette variable est **OBLIGATOIRE** et différente de `STRIPE_SECRET_KEY`

### 3. `JWT_SECRET` (Secret JWT)
- **Type** : Clé pour signer les tokens JWT
- **Format** : Chaîne hexadécimale (64 caractères)
- **Où l'obtenir** : Généré avec `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Usage** : Pour l'authentification de votre application (pas lié à Stripe)

---

## 🔍 POURQUOI L'ERREUR ?

Le code vérifie au démarrage que `STRIPE_WEBHOOK_SECRET` est défini :

```typescript
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeWebhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET n\'est pas définie dans les variables d\'environnement');
}
```

**Solution** : Il faut ajouter cette variable dans Railway.

---

## 🚀 COMMENT OBTENIR `STRIPE_WEBHOOK_SECRET` ?

### Option 1 : Pour la PRODUCTION (Recommandé)

1. **Aller sur** : https://dashboard.stripe.com/
2. **Basculer en mode LIVE** (bouton en haut à droite)
3. **Aller sur** : Developers → Webhooks
4. **Créer un nouveau webhook** (si pas encore fait) :
   - Cliquer sur "+ Add endpoint"
   - **Endpoint URL** : `https://api.solid-eat.com/webhooks/stripe`
   - **Description** : "SolidEat - Webhook Production"
   - **Sélectionner les événements** :
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`
   - Cliquer sur "Add endpoint"
5. **Récupérer le secret** :
   - Cliquer sur le webhook créé
   - Dans la section "Signing secret", cliquer sur "Reveal"
   - **Copier le secret** (commence par `whsec_...`)
   - ⚠️ **Important** : Ce secret n'est affiché qu'une seule fois, notez-le bien !

### Option 2 : Pour le DÉVELOPPEMENT (Temporaire)

Si vous n'avez pas encore configuré le domaine `api.solid-eat.com`, vous pouvez :

1. **Utiliser Stripe CLI** (comme en développement local) :
   ```bash
   stripe listen --forward-to https://votre-url-railway.railway.app/webhooks/stripe
   ```
   Cela affichera un secret temporaire (commence par `whsec_...`)

2. **OU créer un webhook de test** dans Stripe Dashboard (mode TEST) :
   - Endpoint URL : `https://votre-url-railway.railway.app/webhooks/stripe`
   - Récupérer le secret

**⚠️ Note** : Pour la production finale, il faudra créer le webhook avec l'URL `https://api.solid-eat.com/webhooks/stripe`

---

## ✅ SOLUTION IMMÉDIATE

### Étape 1 : Obtenir le secret

**Si vous avez déjà configuré le domaine `api.solid-eat.com`** :
- Créer le webhook production dans Stripe Dashboard (mode LIVE)
- Récupérer le secret

**Si le domaine n'est pas encore configuré** :
- Utiliser l'URL Railway temporaire : `https://votre-projet.railway.app/webhooks/stripe`
- Créer un webhook de test dans Stripe Dashboard (mode TEST)
- Récupérer le secret
- **Plus tard** : Créer un nouveau webhook avec `https://api.solid-eat.com/webhooks/stripe` et mettre à jour le secret

### Étape 2 : Ajouter dans Railway

1. **Railway Dashboard** → Votre projet → **Settings** → **Variables**
2. **Cliquer sur** : "New Variable"
3. **Nom** : `STRIPE_WEBHOOK_SECRET`
4. **Valeur** : `whsec_...` (le secret récupéré)
5. **Cliquer sur** : "Add"
6. **Railway redéploie automatiquement**

---

## 📝 RÉCAPITULATIF DES VARIABLES STRIPE POUR RAILWAY

```env
# Clé API Stripe (pour effectuer des opérations)
STRIPE_SECRET_KEY=sk_live_...

# Secret du webhook (pour vérifier les webhooks reçus)
STRIPE_WEBHOOK_SECRET=whsec_...

# Clé publique (pour le frontend - dans Vercel)
# STRIPE_PUBLISHABLE_KEY=pk_live_... (dans Vercel, pas Railway)

# Price IDs (identifiants des produits)
STRIPE_PRICE_ID_WEEKLY=price_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
```

---

## 🆘 DÉPANNAGE

### "Je n'ai pas encore le domaine api.solid-eat.com configuré"

**Solution temporaire** :
1. Utiliser l'URL Railway : `https://votre-projet.railway.app/webhooks/stripe`
2. Créer un webhook dans Stripe Dashboard avec cette URL
3. Récupérer le secret
4. Ajouter dans Railway
5. **Plus tard** : Quand le domaine sera configuré, créer un nouveau webhook avec `https://api.solid-eat.com/webhooks/stripe`

### "Le webhook ne fonctionne pas"

1. **Vérifier l'URL** : Doit être exactement `https://api.solid-eat.com/webhooks/stripe`
2. **Vérifier le secret** : Doit correspondre au secret du webhook dans Stripe Dashboard
3. **Vérifier les logs Railway** : Pour voir les erreurs de webhook
4. **Tester avec Stripe CLI** : `stripe trigger customer.subscription.created`

---

**Document créé par** : DEV  
**Date** : 23 janvier 2026
