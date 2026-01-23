# GUIDE DE FINALISATION STRIPE - SOLID'EAT

**Date** : 23 janvier 2026  
**Statut** : Configuration en cours

---

## ✅ CE QUI EST DÉJÀ FAIT

1. ✅ Clés API Stripe reçues (Mode Test)
2. ✅ Produits créés dans Stripe Dashboard
3. ✅ Code d'intégration Stripe complété
4. ✅ Tests unitaires passent

---

## ⚠️ CE QUI MANQUE (2 ÉTAPES CRITIQUES)

### Étape 1 : Récupérer les Price IDs

**Pourquoi c'est important** : Les Product IDs (`prod_...`) sont différents des Price IDs (`price_...`). Pour créer des subscriptions, nous avons besoin des **Price IDs**.

**Comment faire** :
1. Ouvrir https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/products
2. Pour chaque produit (Hebdomadaire, Mensuel, Annuel) :
   - Cliquer sur le produit
   - Dans la section "Pricing", trouver le **Price ID** (commence par `price_...`)
   - Si aucun Price ID n'apparaît, le produit n'a peut-être pas de prix configuré

**Alternative** : Aller directement dans "Prices" du dashboard pour voir tous les Price IDs.

**Résultat attendu** :
- `STRIPE_PRICE_ID_WEEKLY=price_xxxxx`
- `STRIPE_PRICE_ID_MONTHLY=price_xxxxx`
- `STRIPE_PRICE_ID_YEARLY=price_xxxxx`

---

### Étape 2 : Créer un nouveau Webhook pour notre Application

**Pourquoi c'est important** : Le webhook actuel (`https://takainside.org/?wc-api=wc_stripe`) est pour WooCommerce, pas pour notre application. Il faut créer un nouveau endpoint.

**Comment faire** :

#### Option A : Développement local avec ngrok

1. **Installer ngrok** :
   ```bash
   # macOS
   brew install ngrok
   # ou télécharger depuis https://ngrok.com
   ```

2. **Démarrer ngrok** :
   ```bash
   ngrok http 3000
   # Remplacez 3000 par le port de votre backend
   ```

3. **Copier l'URL HTTPS** fournie par ngrok (ex: `https://abc123.ngrok.io`)

4. **Créer le webhook dans Stripe** :
   - Aller sur https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks
   - Cliquer sur "+ Add endpoint"
   - URL : `https://abc123.ngrok.io/webhooks/stripe` (remplacer par votre URL ngrok)
   - Description : "SolidEat - Webhook Test"
   - Sélectionner les événements :
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Cliquer sur "Add endpoint"
   - **Récupérer le Webhook Secret** (cliquer sur "Reveal" dans "Signing secret")

#### Option B : Production (quand le serveur sera déployé)

1. **Créer le webhook** avec l'URL de production :
   - URL : `https://api.solideat.fr/webhooks/stripe` (à adapter)
   - Même configuration que l'option A

**Résultat attendu** :
- `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

---

## 🔧 CONFIGURATION FINALE

Une fois les Price IDs et le Webhook Secret récupérés, mettre à jour le fichier `.env` dans le backend :

```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # À remplacer par le secret du nouveau webhook
STRIPE_PRICE_ID_WEEKLY=price_xxxxx  # À remplacer par le Price ID hebdomadaire
STRIPE_PRICE_ID_MONTHLY=price_xxxxx  # À remplacer par le Price ID mensuel
STRIPE_PRICE_ID_YEARLY=price_xxxxx  # À remplacer par le Price ID annuel
```

**Pour le frontend** (si nécessaire) :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 TESTER LA CONFIGURATION

### Test 1 : Vérifier la connexion Stripe

```bash
cd backend
npm run dev
# Vérifier qu'il n'y a pas d'erreur au démarrage
```

### Test 2 : Tester la création d'un abonnement

1. Démarrer le backend et le frontend
2. Se connecter à l'application
3. Aller sur la page d'abonnements
4. Essayer de souscrire avec la carte de test : `4242 4242 4242 4242`
5. Vérifier que l'abonnement est créé dans Stripe Dashboard

### Test 3 : Tester les webhooks

**Avec Stripe CLI** (recommandé pour le développement) :
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:3000/webhooks/stripe
```

**Ou utiliser ngrok** et vérifier les événements dans Stripe Dashboard > Webhooks > [Votre webhook] > Events

---

## 📊 RÉSUMÉ

**Ce qui est prêt** :
- ✅ Code d'intégration Stripe
- ✅ Clés API
- ✅ Produits créés

**Ce qui manque** :
- ⚠️ Price IDs (2 minutes à récupérer)
- ⚠️ Nouveau webhook endpoint (5 minutes à créer)

**Temps estimé pour finaliser** : 10-15 minutes

---

## ❓ QUESTIONS FRÉQUENTES

**Q : Pourquoi ai-je besoin des Price IDs si j'ai déjà les Product IDs ?**  
R : Stripe utilise les Price IDs pour créer des subscriptions. Un Product peut avoir plusieurs Prices (ex: mensuel et annuel), donc on a besoin du Price ID spécifique.

**Q : Puis-je utiliser le webhook WooCommerce existant ?**  
R : Non, car il pointe vers une URL WooCommerce qui ne gère pas nos événements. Il faut créer un nouveau webhook pour notre application.

**Q : Comment tester les webhooks en local ?**  
R : Utiliser ngrok pour exposer votre serveur local, ou utiliser Stripe CLI avec `stripe listen`.

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
