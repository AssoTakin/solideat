# CONFIGURATION STRIPE FINALE - SOLID'EAT

**Date** : 23 janvier 2026  
**Environnement** : Test (Mode Test Stripe)  
**Statut** : ✅ Configuration complète

---

## ✅ CONFIGURATION COMPLÈTE

### 1. Clés API Stripe (Mode Test)

```env
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
```

### 2. Price IDs (✅ Récupérés)

```env
STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz
STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3
STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry
```

**Détails des produits** :
- **Premium Hebdomadaire** : 2,50 € / semaine (Product: `prod_TqRPlZozHRNuGJ`, Price: `price_1SskWJEKzPeYzUocyJFFovsz`)
- **Premium Mensuel** : 9,00 € / mois (Product: `prod_TqRPRRQq6hB6H9`, Price: `price_1SskX7EKzPeYzUoc6e7K1qV3`)
- **Premium Annuel** : 90,00 € / an (Product: `prod_TqRSRVkxvXtY3z`, Price: `price_1SskZOEKzPeYzUocbtrhA6Ry`)

### 3. Webhook avec ngrok

**Configuration requise** : Utiliser ngrok pour exposer le serveur local et créer le webhook Stripe.

---

## 🔧 CONFIGURATION DU WEBHOOK AVEC NGROK

### Étape 1 : Installer ngrok

**macOS** :
```bash
brew install ngrok
```

**Ou télécharger** : https://ngrok.com/download

### Étape 2 : Démarrer le backend

```bash
cd backend
npm run dev
# Le serveur doit tourner sur http://localhost:3000
```

### Étape 3 : Démarrer ngrok

Dans un **nouveau terminal** :
```bash
ngrok http 3000
```

**Résultat attendu** :
```
Forwarding  https://xxxxx.ngrok.io -> http://localhost:3000
```

**⚠️ IMPORTANT** : Copier l'URL HTTPS (ex: `https://abc123.ngrok.io`)

### Étape 4 : Créer le webhook dans Stripe

1. Aller sur : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks
2. Cliquer sur **"+ Add endpoint"**
3. **Endpoint URL** : `https://xxxxx.ngrok.io/webhooks/stripe` (remplacer par votre URL ngrok)
4. **Description** : "SolidEat - Webhook Test (ngrok)"
5. **Sélectionner les événements** :
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Cliquer sur **"Add endpoint"**
7. **Récupérer le Webhook Secret** :
   - Cliquer sur le webhook créé dans la liste
   - Dans la section "Signing secret", cliquer sur **"Reveal"**
   - Copier le secret (commence par `whsec_...`)
   - ⚠️ **Important** : Ce secret ne sera affiché qu'une seule fois !

### Étape 5 : Configurer le Webhook Secret dans .env

Ajouter dans le fichier `.env` du backend :
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Remplacer par le secret récupéré
```

---

## 📝 FICHIER .ENV COMPLET

**Backend** (`backend/.env`) :
```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # À remplacer par le secret du webhook
STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz
STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3
STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry
```

**Frontend** (`frontend/.env`) :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
```

---

## 🧪 TESTER LA CONFIGURATION

### Test 1 : Vérifier que le backend démarre sans erreur

```bash
cd backend
npm run dev
```

Vérifier qu'il n'y a pas d'erreur liée à Stripe.

### Test 2 : Tester le webhook

1. **Démarrer ngrok** (si pas déjà fait) :
   ```bash
   ngrok http 3000
   ```

2. **Vérifier que le webhook est accessible** :
   - Dans Stripe Dashboard > Webhooks > [Votre webhook]
   - Cliquer sur "Send test webhook"
   - Sélectionner un événement (ex: `customer.subscription.created`)
   - Vérifier que le webhook est reçu (statut 200)

3. **Vérifier les logs du backend** :
   - Les événements webhook devraient apparaître dans les logs

### Test 3 : Tester la création d'un abonnement

1. Démarrer le frontend :
   ```bash
   cd frontend
   npm run dev
   ```

2. Se connecter à l'application

3. Aller sur la page d'abonnements

4. Essayer de souscrire avec la carte de test :
   - Numéro : `4242 4242 4242 4242`
   - Date : Toute date future (ex: 12/25)
   - CVV : N'importe quel code à 3 chiffres (ex: 123)

5. Vérifier :
   - Que l'abonnement est créé dans Stripe Dashboard
   - Que l'utilisateur est mis à jour dans la base de données
   - Que les webhooks sont reçus

---

## ⚠️ NOTES IMPORTANTES SUR NGROK

### Limitations de ngrok (gratuit)

1. **URL change à chaque redémarrage** : L'URL ngrok change si vous redémarrez ngrok. Il faudra mettre à jour le webhook dans Stripe Dashboard.

2. **Session limitée** : La version gratuite a des limitations de temps.

3. **Pour la production** : Quand vous aurez un domaine, créez un nouveau webhook avec l'URL de production.

### Solution : ngrok avec domaine fixe (optionnel)

Si vous avez un compte ngrok payant, vous pouvez utiliser un domaine fixe :
```bash
ngrok http 3000 --domain=votre-domaine.ngrok.io
```

---

## 🔄 WORKFLOW DE DÉVELOPPEMENT AVEC NGROK

1. **Démarrer le backend** :
   ```bash
   cd backend
   npm run dev
   ```

2. **Démarrer ngrok** (dans un autre terminal) :
   ```bash
   ngrok http 3000
   ```

3. **Copier l'URL HTTPS** fournie par ngrok

4. **Mettre à jour le webhook dans Stripe** (si l'URL a changé) :
   - Aller dans Stripe Dashboard > Webhooks
   - Modifier l'URL du webhook existant
   - Ou créer un nouveau webhook si nécessaire

5. **Tester** : Les webhooks Stripe seront maintenant reçus par votre serveur local

---

## 📋 CHECKLIST FINALE

- [x] Clés API configurées
- [x] Price IDs récupérés et configurés
- [ ] ngrok installé
- [ ] ngrok démarré et URL copiée
- [ ] Webhook créé dans Stripe Dashboard avec l'URL ngrok
- [ ] Webhook Secret récupéré et configuré dans `.env`
- [ ] Backend redémarré avec la nouvelle configuration
- [ ] Test de webhook effectué (Send test webhook dans Stripe)
- [ ] Test de création d'abonnement effectué

---

## 🔗 LIENS UTILES

- **Stripe Dashboard - Produits** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/products
- **Stripe Dashboard - Webhooks** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks
- **Stripe Dashboard - Événements** : https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/events
- **ngrok** : https://ngrok.com

---

## 🚀 PROCHAINES ÉTAPES

1. **Installer et configurer ngrok** (voir section ci-dessus)
2. **Créer le webhook dans Stripe** avec l'URL ngrok
3. **Configurer le Webhook Secret** dans `.env`
4. **Tester la configuration complète**
5. **Quand vous aurez un domaine** : Créer un nouveau webhook avec l'URL de production

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
