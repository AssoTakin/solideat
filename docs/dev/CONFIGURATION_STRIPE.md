# CONFIGURATION STRIPE - SOLID'EAT

**Date** : 23 janvier 2026  
**Environnement** : Test (Mode Test Stripe)

---

## ✅ INFORMATIONS REÇUES

### 1. Clés API Stripe (Mode Test)

**Clé Publique (Publishable Key)** :
```
pk_test_VOTRE_CLE_PUBLIQUE_ICI
```

**Clé Secrète (Secret Key)** :
```
sk_test_VOTRE_CLE_SECRETE_ICI
```

### 2. Produits Créés

**Premium Hebdomadaire** :
- Prix : 2,50 € / semaine
- Product ID : `prod_TqRPlZozHRNuGJ`
- ⚠️ **Price ID manquant** : À récupérer dans Stripe Dashboard (voir instructions ci-dessous)

**Premium Mensuel** :
- Prix : 9,00 € / mois
- Product ID : `prod_TqRPRRQq6hB6H9`
- ⚠️ **Price ID manquant** : À récupérer dans Stripe Dashboard (voir instructions ci-dessous)

**Premium Annuel** :
- Prix : 90,00 € / an
- Product ID : `prod_TqRPRRQq6hB6H9`
- ⚠️ **Price ID manquant** : À récupérer dans Stripe Dashboard (voir instructions ci-dessous)

**Note importante** : Les Product IDs sont différents des Price IDs. Pour créer une subscription, nous avons besoin des **Price IDs** (commencent par `price_...`).

### 3. Webhook

**URL actuelle** : `https://takainside.org/?wc-api=wc_stripe`
- ⚠️ Cette URL est pour WooCommerce, pas pour notre application
- **Action requise** : Créer un nouveau webhook endpoint pour notre application

---

## ⚠️ ACTIONS REQUISES

### 1. Récupérer les Price IDs ⚠️ IMPORTANT

Les **Product IDs** (`prod_...`) sont différents des **Price IDs** (`price_...`). Pour créer des subscriptions, nous avons besoin des **Price IDs**.

**Étapes détaillées** :
1. Aller sur https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/products
2. Pour chaque produit, cliquer dessus pour ouvrir les détails
3. Dans la section **"Pricing"**, vous verrez le **Price ID** (commence par `price_...`)
4. **Si le Price ID n'apparaît pas** :
   - Vérifiez que le produit a bien un prix configuré
   - Si nécessaire, créez un nouveau prix pour le produit
   - Le Price ID sera généré automatiquement

**Price IDs à récupérer** :
- **Hebdomadaire** (2,50€/semaine) : `price_...`
- **Mensuel** (9€/mois) : `price_...`
- **Annuel** (90€/an) : `price_...`

**Astuce** : Vous pouvez aussi voir tous les Price IDs dans la section "Prices" du dashboard Stripe.

### 2. Configurer le Webhook pour notre Application ⚠️ IMPORTANT

**Note** : Le webhook actuel (`https://takainside.org/?wc-api=wc_stripe`) est pour WooCommerce, pas pour notre application. Il faut créer un **nouveau webhook endpoint**.

**URL du webhook** : `https://votre-domaine.com/webhooks/stripe`

**Étapes détaillées** :
1. Aller sur https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks
2. Cliquer sur **"+ Add endpoint"** (en haut à droite)
3. **Endpoint URL** : 
   - **Production** : `https://api.solideat.fr/webhooks/stripe` (à adapter selon votre domaine)
   - **Développement local** : Utiliser ngrok ou un service similaire
     - Installer ngrok : `npm install -g ngrok` ou télécharger depuis https://ngrok.com
     - Démarrer ngrok : `ngrok http 3000` (si votre backend tourne sur le port 3000)
     - Utiliser l'URL HTTPS fournie : `https://xxxxx.ngrok.io/webhooks/stripe`
4. **Description** : "SolidEat - Webhook pour abonnements"
5. **Sélectionner les événements** (cliquer sur "Select events") :
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Cliquer sur **"Add endpoint"**
7. **Récupérer le Webhook Secret** :
   - Après création, cliquer sur le webhook dans la liste
   - Dans la section "Signing secret", cliquer sur "Reveal"
   - Copier le secret (commence par `whsec_...`)
   - ⚠️ **Important** : Ce secret ne sera affiché qu'une seule fois, notez-le bien !

### 3. Configuration des Variables d'Environnement

Une fois les Price IDs et le Webhook Secret récupérés, configurer dans `.env` :

```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
STRIPE_WEBHOOK_SECRET=whsec_...  # ⚠️ À récupérer après création du nouveau webhook
STRIPE_PRICE_ID_WEEKLY=price_...  # ⚠️ À récupérer dans Stripe Dashboard (Product: prod_TqRPlZozHRNuGJ)
STRIPE_PRICE_ID_MONTHLY=price_...  # ⚠️ À récupérer dans Stripe Dashboard (Product: prod_TqRPRRQq6hB6H9)
STRIPE_PRICE_ID_YEARLY=price_...  # ⚠️ À récupérer dans Stripe Dashboard (Product: prod_TqRPRRQq6hB6H9)
```

**⚠️ IMPORTANT** : 
- Ne jamais commiter ce fichier `.env` dans Git
- Utiliser `.env.example` comme template
- Les vraies clés doivent rester secrètes

---

## 🧪 CARTES DE TEST STRIPE

Pour tester les paiements :

**Succès** :
- Numéro : `4242 4242 4242 4242`
- Date : Toute date future
- CVV : N'importe quel code à 3 chiffres

**Refus** :
- Numéro : `4000 0000 0000 0002`

**3D Secure** :
- Numéro : `4000 0027 6000 3184`

---

## 📋 CHECKLIST DE CONFIGURATION

### ✅ Déjà fait
- [x] Clés API reçues (Secret Key + Publishable Key)
- [x] Produits créés dans Stripe Dashboard
- [x] Product IDs identifiés

### ⚠️ À faire maintenant
- [ ] **Price IDs récupérés** (voir section 1 ci-dessus)
- [ ] **Nouveau webhook créé pour notre application** (voir section 2 ci-dessus)
- [ ] **Webhook Secret récupéré** (généré lors de la création du webhook)
- [ ] Variables d'environnement configurées dans `.env` (backend)
- [ ] Variable `STRIPE_PUBLISHABLE_KEY` configurée dans `.env` (frontend, préfixée par `VITE_`)

### 🧪 Tests à effectuer
- [ ] Test de création d'abonnement avec carte de test
- [ ] Test de webhook (utiliser Stripe CLI ou dashboard)
- [ ] Test d'annulation d'abonnement
- [ ] Test de renouvellement automatique

---

## 🔗 LIENS UTILES

- **Produits** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/products
- **Webhooks** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks
- **Clés API** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/apikeys
- **Logs d'événements** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/events

---

## ⚠️ NOTES IMPORTANTES

1. **Ne jamais commiter les clés API** dans le code source
2. **Utiliser des variables d'environnement** pour toutes les clés
3. **Tester en mode test** avant de passer en production
4. **Le webhook doit être accessible publiquement** (HTTPS requis en production)
5. **Pour le développement local**, utiliser ngrok ou un service similaire pour exposer le webhook

---

## 🚀 PROCHAINES ÉTAPES

1. **Récupérer les Price IDs** dans Stripe Dashboard
2. **Créer le webhook endpoint** pour notre application
3. **Configurer les variables d'environnement** dans `.env`
4. **Tester la création d'abonnement** avec une carte de test
5. **Vérifier les webhooks** dans les logs Stripe

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
