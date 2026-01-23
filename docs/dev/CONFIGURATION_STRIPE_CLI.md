# CONFIGURATION STRIPE CLI - SOLID'EAT

**Date** : 23 janvier 2026  
**Méthode** : Stripe CLI (recommandé pour le développement)  
**Statut** : ✅ Configuration complète

---

## ✅ AVANTAGES DE STRIPE CLI

- ✅ Pas besoin de ngrok
- ✅ URL stable (pas de changement)
- ✅ Intégration native avec Stripe
- ✅ Facile à utiliser
- ✅ Webhook secret automatique

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

---

## 📋 ÉTAPE 2 : SE CONNECTER À STRIPE

```bash
stripe login
```

Cela ouvrira votre navigateur pour vous authentifier avec votre compte Stripe.

**Résultat attendu** :
```
Done! The Stripe CLI is configured for your account.
```

---

## 📋 ÉTAPE 3 : DÉMARRER LE BACKEND

Dans un terminal :

```bash
cd backend
npm run dev
```

Le serveur doit tourner sur `http://localhost:3000`

---

## 📋 ÉTAPE 4 : DÉMARRER STRIPE CLI LISTEN

Dans un **nouveau terminal** :

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

**Résultat attendu** :
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**⚠️ IMPORTANT** : Copier le **webhook signing secret** (commence par `whsec_...`)

Ce secret est unique et sera utilisé pour valider les webhooks.

---

## 📋 ÉTAPE 5 : CONFIGURER LE WEBHOOK SECRET

Ajouter dans `backend/.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Remplacez `whsec_xxxxx` par le secret affiché par Stripe CLI.

**Redémarrer le backend** pour prendre en compte la nouvelle configuration.

---

## 📋 ÉTAPE 6 : TESTER LE WEBHOOK

### Test 1 : Tester depuis Stripe CLI

Dans le terminal où Stripe CLI tourne, vous verrez les événements en temps réel.

### Test 2 : Déclencher un événement de test

Dans un **nouveau terminal** :

```bash
stripe trigger customer.subscription.created
```

Vous devriez voir :
- L'événement dans le terminal Stripe CLI
- Les logs dans le backend
- La réponse 200 OK

### Test 3 : Tester depuis Stripe Dashboard

1. Aller sur : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/events
2. Cliquer sur un événement
3. Cliquer sur "Resend" (si disponible)
4. Vérifier que l'événement est reçu par votre backend

---

## 🔄 WORKFLOW QUOTIDIEN

### Au démarrage de la journée

1. **Démarrer le backend** :
   ```bash
   cd backend
   npm run dev
   ```

2. **Démarrer Stripe CLI** (dans un autre terminal) :
   ```bash
   stripe listen --forward-to localhost:3000/webhooks/stripe
   ```

3. **Copier le webhook secret** affiché

4. **Vérifier que le secret est dans `.env`** :
   ```bash
   cat backend/.env | grep STRIPE_WEBHOOK_SECRET
   ```

### Tester un événement

```bash
# Créer une subscription de test
stripe trigger customer.subscription.created

# Tester un paiement réussi
stripe trigger invoice.payment_succeeded

# Tester un paiement échoué
stripe trigger invoice.payment_failed
```

---

## 📝 CONFIGURATION FINALE

**Fichier `backend/.env`** :
```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Secret fourni par Stripe CLI
STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz
STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3
STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry
```

**Fichier `frontend/.env`** (si nécessaire) :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 COMMANDES STRIPE CLI UTILES

### Écouter les webhooks
```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

### Déclencher des événements de test
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

### Voir les logs en temps réel
```bash
stripe logs tail
```

### Voir les événements récents
```bash
stripe events list
```

### Voir les détails d'un événement
```bash
stripe events retrieve evt_xxxxx
```

---

## ⚠️ NOTES IMPORTANTES

1. **Webhook Secret** : Le secret fourni par Stripe CLI est différent de celui d'un webhook créé dans le Dashboard. Utilisez celui fourni par Stripe CLI.

2. **Mode Test uniquement** : Stripe CLI fonctionne uniquement avec le mode test. Pour la production, vous devrez créer un webhook dans le Dashboard.

3. **Port** : Assurez-vous que le port 3000 correspond au port de votre backend.

4. **Backend actif** : Le backend doit être démarré avant de lancer `stripe listen`.

---

## 🔄 PASSAGE EN PRODUCTION

Quand vous aurez un domaine, vous devrez :

1. **Créer un webhook dans Stripe Dashboard** :
   - URL : `https://api.solideat.fr/webhooks/stripe`
   - Sélectionner les mêmes événements

2. **Récupérer le Webhook Secret** depuis le Dashboard

3. **Mettre à jour `.env`** avec le nouveau secret

4. **Utiliser les clés API de production** :
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_live_...`

---

## ✅ CHECKLIST

- [ ] Stripe CLI installé
- [ ] Connecté à Stripe (`stripe login`)
- [ ] Backend démarré sur http://localhost:3000
- [ ] Stripe CLI démarré (`stripe listen`)
- [ ] Webhook Secret copié
- [ ] Webhook Secret configuré dans `backend/.env`
- [ ] Backend redémarré
- [ ] Test d'événement déclenché (`stripe trigger`)
- [ ] Événement reçu par le backend (vérifier les logs)

---

## 🚀 PROCHAINES ÉTAPES

1. **Tester la création d'un abonnement** :
   - Démarrer le frontend
   - Se connecter
   - Aller sur la page d'abonnements
   - Souscrire avec la carte de test : `4242 4242 4242 4242`

2. **Vérifier les webhooks** :
   - Les événements devraient apparaître dans le terminal Stripe CLI
   - Vérifier les logs du backend

3. **Tester les différents scénarios** :
   - Création d'abonnement
   - Annulation d'abonnement
   - Renouvellement automatique
   - Échec de paiement

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
