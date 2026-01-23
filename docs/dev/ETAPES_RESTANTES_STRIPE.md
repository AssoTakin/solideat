# 📋 ÉTAPES RESTANTES - CONFIGURATION STRIPE CLI

**Date** : 23 janvier 2026  
**Statut** : ✅ Stripe CLI installé | 🔄 Connexion en cours | ⏳ Étapes restantes

---

## ✅ ÉTAPE 1 : INSTALLATION STRIPE CLI

**Statut** : ✅ TERMINÉ  
Stripe CLI version 1.34.0 est installé.

---

## 🔄 ÉTAPE 2 : CONNEXION À STRIPE

**Statut** : 🔄 EN COURS

### Actions à faire maintenant :

1. **Dans le terminal où `stripe login` est en cours** :
   - Vous devriez voir un code de jumelage (ex: `fondly-regal-idol-extol`)
   - Appuyez sur **Entrée** pour ouvrir le navigateur
   - Ou visitez l'URL affichée dans le terminal

2. **Dans votre navigateur** :
   - Connectez-vous à votre compte Stripe
   - Autorisez Stripe CLI à accéder à votre compte
   - Vous verrez : `Done! The Stripe CLI is configured for your account.`

3. **Vérifier la connexion** :
   ```bash
   stripe config --list
   ```
   
   Si vous voyez votre configuration, la connexion est réussie ✅

---

## ⏳ ÉTAPE 3 : VÉRIFIER LE BACKEND

**Statut** : ✅ Backend déjà démarré

Le backend tourne sur `http://localhost:3000` ✅

---

## ⏳ ÉTAPE 4 : DÉMARRER STRIPE CLI LISTEN

**Une fois la connexion Stripe terminée**, dans un **nouveau terminal** :

```bash
cd "/Users/samdokpo/Documents/Projets New/Dev/Solid'Eat 2026"
stripe listen --forward-to localhost:3000/webhooks/stripe
```

**Résultat attendu** :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**⚠️ IMPORTANT** :
- **Copiez le webhook signing secret** (commence par `whsec_...`)
- **Ne fermez pas ce terminal** (laissez Stripe CLI tourner en arrière-plan)
- Ou appuyez sur **Ctrl+C** après avoir copié le secret

---

## ⏳ ÉTAPE 5 : METTRE À JOUR LE FICHIER .env

1. **Ouvrir** `backend/.env`

2. **Trouver la ligne** :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER
   ```

3. **Remplacer** par le secret copié à l'étape 4 :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Sauvegarder** le fichier

---

## ⏳ ÉTAPE 6 : REDÉMARRER LE BACKEND

**Dans le terminal du backend** :

1. Appuyer sur **Ctrl+C** pour arrêter le backend
2. Redémarrer :
   ```bash
   npm run dev
   ```

Le backend va maintenant utiliser le nouveau webhook secret.

---

## ⏳ ÉTAPE 7 : TESTER LA CONFIGURATION

**Dans un nouveau terminal** :

```bash
stripe trigger customer.subscription.created
```

**Résultat attendu** :
- Dans le terminal Stripe CLI : Événement forwardé ✅
- Dans les logs du backend : Webhook reçu et traité ✅
- Réponse 200 OK ✅

---

## 🚀 SCRIPT AUTOMATIQUE

Une fois la connexion Stripe terminée, vous pouvez utiliser le script automatique :

```bash
./scripts/finaliser-stripe-etapes-restantes.sh
```

Ce script va :
1. ✅ Vérifier la connexion Stripe
2. ✅ Vérifier que le backend tourne
3. ✅ Démarrer Stripe CLI et capturer le webhook secret
4. ✅ Mettre à jour automatiquement `backend/.env`

---

## 📝 RÉSUMÉ DES COMMANDES

```bash
# 1. Vérifier la connexion Stripe (après avoir terminé l'authentification)
stripe config --list

# 2. Démarrer Stripe CLI listen (dans un nouveau terminal)
stripe listen --forward-to localhost:3000/webhooks/stripe

# 3. Mettre à jour .env avec le webhook secret
# (Éditer manuellement backend/.env)

# 4. Redémarrer le backend
# (Dans le terminal du backend: Ctrl+C puis npm run dev)

# 5. Tester
stripe trigger customer.subscription.created
```

---

## ✅ CONFIGURATION FINALE ATTENDUE

Le fichier `backend/.env` doit contenir :

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # À remplacer
STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz
STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3
STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry
```

---

## 🎯 PROCHAINES ACTIONS

1. **Terminer l'authentification Stripe** dans le navigateur
2. **Exécuter le script automatique** : `./scripts/finaliser-stripe-etapes-restantes.sh`
3. **Ou suivre les étapes manuelles** ci-dessus

Une fois terminé, Stripe sera complètement configuré pour le développement local ! 🎉
