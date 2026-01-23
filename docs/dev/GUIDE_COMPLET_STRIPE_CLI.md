# GUIDE COMPLET : CONFIGURATION STRIPE CLI - SOLID'EAT

**Date** : 23 janvier 2026  
**Méthode** : Stripe CLI (développement local)  
**Statut** : ✅ Prêt à configurer

---

## 🎯 IMPORTANT : AVEC STRIPE CLI, PAS BESOIN DE WEBHOOK DASHBOARD !

**Avec Stripe CLI, vous n'avez PAS besoin de créer un webhook dans le Dashboard Stripe !**

Stripe CLI forward automatiquement tous les événements vers votre serveur local. C'est l'avantage principal.

**Le webhook Dashboard est uniquement nécessaire pour la production** (quand vous aurez un domaine).

---

## 📋 ÉTAPE 1 : INSTALLER STRIPE CLI

### macOS (avec Homebrew)

```bash
brew install stripe/stripe-cli/stripe
```

### Vérifier l'installation

```bash
stripe --version
```

**Résultat attendu** : `stripe version X.X.X`

---

## 📋 ÉTAPE 2 : SE CONNECTER À STRIPE

```bash
stripe login
```

**Ce qui va se passer** :
1. Stripe CLI va ouvrir votre navigateur
2. Vous devrez vous connecter à votre compte Stripe
3. Autoriser Stripe CLI à accéder à votre compte
4. Vous verrez : `Done! The Stripe CLI is configured for your account.`

---

## 📋 ÉTAPE 3 : CONFIGURER LE BACKEND

### Vérifier que le fichier `.env` existe

```bash
cd backend
ls -la .env
```

Si le fichier n'existe pas, copier depuis `.env.example` :

```bash
cp .env.example .env
```

### Mettre à jour le fichier `.env`

Ouvrir `backend/.env` et ajouter/modifier :

```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER  # Sera remplacé par le secret de Stripe CLI
STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz
STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3
STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry
```

**Note** : Le `STRIPE_WEBHOOK_SECRET` sera remplacé par le secret fourni par Stripe CLI à l'étape suivante.

---

## 📋 ÉTAPE 4 : DÉMARRER LE BACKEND

Dans un terminal :

```bash
cd backend
npm run dev
```

**Vérifier** : Le serveur doit tourner sur `http://localhost:3000`

Ouvrir http://localhost:3000/health dans un navigateur pour vérifier.

---

## 📋 ÉTAPE 5 : DÉMARRER STRIPE CLI

Dans un **nouveau terminal** :

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

**Résultat attendu** :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**⚠️ IMPORTANT** : 
1. **Copier le webhook signing secret** (commence par `whsec_...`)
2. **Mettre à jour `backend/.env`** avec ce secret :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **Redémarrer le backend** pour prendre en compte le nouveau secret

---

## 📋 ÉTAPE 6 : TESTER LA CONFIGURATION

### Test 1 : Déclencher un événement de test

Dans un **nouveau terminal** :

```bash
stripe trigger customer.subscription.created
```

**Résultat attendu** :
- Dans le terminal Stripe CLI : Vous verrez l'événement forwardé
- Dans les logs du backend : Vous devriez voir le traitement de l'événement
- Statut 200 OK dans Stripe CLI

### Test 2 : Vérifier les logs

Dans le terminal du backend, vous devriez voir :
```
Événement webhook reçu: customer.subscription.created
```

---

## 🔄 WORKFLOW QUOTIDIEN

### Au démarrage

1. **Terminal 1 - Backend** :
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Stripe CLI** :
   ```bash
   stripe listen --forward-to localhost:3000/webhooks/stripe
   ```
   - Copier le webhook secret si c'est la première fois
   - Vérifier qu'il est dans `.env`

3. **Terminal 3 - Frontend** (optionnel) :
   ```bash
   cd frontend
   npm run dev
   ```

### Tester des événements

```bash
# Subscription créée
stripe trigger customer.subscription.created

# Subscription mise à jour
stripe trigger customer.subscription.updated

# Subscription supprimée
stripe trigger customer.subscription.deleted

# Paiement réussi
stripe trigger invoice.payment_succeeded

# Paiement échoué
stripe trigger invoice.payment_failed
```

---

## 📝 CONFIGURATION FINALE

### Backend (`backend/.env`)

```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Secret fourni par Stripe CLI
STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz
STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3
STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry
```

### Frontend (`frontend/.env`)

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
```

---

## 🚀 POUR LA PRODUCTION (Plus tard)

Quand vous aurez un domaine, vous devrez créer un webhook dans le Dashboard :

**URL du Dashboard Stripe** :
https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks

**Configuration du webhook** :
- **URL** : `https://api.solideat.fr/webhooks/stripe` (à adapter selon votre domaine)
- **Événements** :
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

**Mais pour le développement, Stripe CLI suffit !**

---

## ✅ CHECKLIST DE CONFIGURATION

- [ ] Stripe CLI installé (`brew install stripe/stripe-cli/stripe`)
- [ ] Connecté à Stripe (`stripe login`)
- [ ] Backend configuré avec les clés API dans `.env`
- [ ] Backend démarré sur http://localhost:3000
- [ ] Stripe CLI démarré (`stripe listen`)
- [ ] Webhook Secret copié depuis Stripe CLI
- [ ] Webhook Secret ajouté dans `backend/.env`
- [ ] Backend redémarré avec le nouveau secret
- [ ] Test d'événement déclenché (`stripe trigger`)
- [ ] Événement reçu par le backend (vérifier les logs)

---

## 🧪 TESTER UN ABONNEMENT COMPLET

1. **Démarrer le frontend** :
   ```bash
   cd frontend
   npm run dev
   ```

2. **Se connecter à l'application** :
   - Aller sur http://localhost:5173
   - Se connecter ou créer un compte

3. **Aller sur la page d'abonnements** :
   - Naviguer vers `/subscriptions/plans`

4. **Souscrire avec une carte de test** :
   - Carte : `4242 4242 4242 4242`
   - Date : Toute date future (ex: 12/25)
   - CVV : N'importe quel code à 3 chiffres (ex: 123)

5. **Vérifier** :
   - L'abonnement est créé dans Stripe Dashboard
   - L'utilisateur est mis à jour dans la base de données
   - Les webhooks sont reçus (vérifier le terminal Stripe CLI)

---

## 📚 COMMANDES STRIPE CLI UTILES

```bash
# Écouter les webhooks
stripe listen --forward-to localhost:3000/webhooks/stripe

# Déclencher des événements de test
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# Voir les logs en temps réel
stripe logs tail

# Voir les événements récents
stripe events list

# Voir les détails d'un événement
stripe events retrieve evt_xxxxx

# Voir la configuration
stripe config --list
```

---

## ⚠️ NOTES IMPORTANTES

1. **Stripe CLI = Développement uniquement** : Fonctionne uniquement en mode test
2. **Pas de webhook Dashboard nécessaire** : Stripe CLI gère tout automatiquement
3. **Webhook Secret unique** : Chaque session Stripe CLI a son propre secret
4. **Backend doit tourner** : Le backend doit être démarré avant `stripe listen`
5. **Port 3000** : Vérifier que le port correspond à votre configuration

---

## 🔗 LIENS UTILES

- **Stripe Dashboard - Produits** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/products
- **Stripe Dashboard - Événements** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/events
- **Stripe Dashboard - Webhooks** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks (pour la production uniquement)
- **Documentation Stripe CLI** : https://stripe.com/docs/stripe-cli

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
