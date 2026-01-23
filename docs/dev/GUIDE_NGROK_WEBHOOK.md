# GUIDE : CONFIGURER LE WEBHOOK STRIPE AVEC NGROK

**Date** : 23 janvier 2026  
**Objectif** : Exposer le serveur local pour recevoir les webhooks Stripe

---

## 📋 ÉTAPE 1 : INSTALLER NGROK

### Option A : Avec Homebrew (macOS)

```bash
brew install ngrok
```

### Option B : Téléchargement manuel

1. Aller sur https://ngrok.com/download
2. Télécharger pour macOS
3. Extraire l'archive
4. Déplacer `ngrok` dans `/usr/local/bin/` :
   ```bash
   sudo mv ngrok /usr/local/bin/
   ```

### Option C : Avec npm (si vous préférez)

```bash
npm install -g ngrok
```

### Vérifier l'installation

```bash
ngrok version
```

---

## 📋 ÉTAPE 2 : DÉMARRER LE BACKEND

Dans un terminal :

```bash
cd backend
npm run dev
```

Le serveur doit tourner sur `http://localhost:3000`

**Vérifier** : Ouvrir http://localhost:3000/health dans un navigateur

---

## 📋 ÉTAPE 3 : DÉMARRER NGROK

Dans un **nouveau terminal** :

```bash
ngrok http 3000
```

**Résultat attendu** :
```
ngrok                                                                          

Session Status                online
Account                       (Plan: Free)
Version                       3.x.x
Region                        Europe (eu)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxxx.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**⚠️ IMPORTANT** : Copier l'URL HTTPS (ex: `https://xxxxx.ngrok-free.app`)

**Note** : L'URL ngrok change à chaque redémarrage. Si vous redémarrez ngrok, vous devrez mettre à jour le webhook dans Stripe.

---

## 📋 ÉTAPE 4 : CRÉER LE WEBHOOK DANS STRIPE

1. **Ouvrir Stripe Dashboard** :
   https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks

2. **Cliquer sur "+ Add endpoint"**

3. **Remplir le formulaire** :
   - **Endpoint URL** : `https://xxxxx.ngrok-free.app/webhooks/stripe`
     - Remplacez `xxxxx.ngrok-free.app` par votre URL ngrok
   - **Description** : "SolidEat - Webhook Test (ngrok)"

4. **Sélectionner les événements** :
   Cliquer sur "Select events" et cocher :
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Cliquer sur "Add endpoint"**

6. **Récupérer le Webhook Secret** :
   - Cliquer sur le webhook créé dans la liste
   - Dans la section "Signing secret", cliquer sur **"Reveal"**
   - **Copier le secret** (commence par `whsec_...`)
   - ⚠️ **Important** : Ce secret ne sera affiché qu'une seule fois !

---

## 📋 ÉTAPE 5 : CONFIGURER LE WEBHOOK SECRET

Ajouter dans `backend/.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Remplacez `whsec_xxxxx` par le secret récupéré à l'étape précédente.

**Redémarrer le backend** pour prendre en compte la nouvelle configuration.

---

## 📋 ÉTAPE 6 : TESTER LE WEBHOOK

### Test 1 : Tester depuis Stripe Dashboard

1. Aller dans Stripe Dashboard > Webhooks > [Votre webhook]
2. Cliquer sur **"Send test webhook"**
3. Sélectionner un événement (ex: `customer.subscription.created`)
4. Cliquer sur **"Send test webhook"**
5. Vérifier que le statut est **200 OK**

### Test 2 : Vérifier les logs

Dans les logs du backend, vous devriez voir :
```
Événement webhook reçu: customer.subscription.created
```

### Test 3 : Vérifier l'interface ngrok

Ouvrir http://127.0.0.1:4040 dans un navigateur pour voir :
- Les requêtes reçues
- Les réponses envoyées
- Les détails des webhooks

---

## 🔄 WORKFLOW QUOTIDIEN

### Au démarrage de la journée

1. **Démarrer le backend** :
   ```bash
   cd backend
   npm run dev
   ```

2. **Démarrer ngrok** (dans un autre terminal) :
   ```bash
   ngrok http 3000
   ```

3. **Vérifier l'URL ngrok** :
   - Si l'URL a changé, mettre à jour le webhook dans Stripe Dashboard

4. **Tester** : Envoyer un test webhook depuis Stripe Dashboard

### Si l'URL ngrok change

1. Copier la nouvelle URL ngrok
2. Aller dans Stripe Dashboard > Webhooks
3. Cliquer sur votre webhook
4. Cliquer sur "Edit"
5. Mettre à jour l'URL
6. Sauvegarder

---

## ⚠️ LIMITATIONS DE NGROK (VERSION GRATUITE)

1. **URL change à chaque redémarrage** : Vous devrez mettre à jour le webhook dans Stripe
2. **Session limitée** : La version gratuite a des limitations de temps
3. **Trafic limité** : Limitation du nombre de requêtes par minute

### Solution : ngrok avec domaine fixe (optionnel)

Si vous avez un compte ngrok payant, vous pouvez utiliser un domaine fixe :
```bash
ngrok http 3000 --domain=votre-domaine.ngrok.io
```

---

## 🚀 ALTERNATIVE : STRIPE CLI (POUR LE DÉVELOPPEMENT)

Si vous préférez ne pas utiliser ngrok, vous pouvez utiliser Stripe CLI :

### Installation

```bash
brew install stripe/stripe-cli/stripe
```

### Configuration

```bash
stripe login
```

### Écouter les webhooks localement

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

Stripe CLI vous donnera un webhook secret à utiliser dans `.env`.

**Avantage** : Pas besoin de mettre à jour l'URL du webhook, Stripe CLI gère tout automatiquement.

---

## 📝 RÉSUMÉ DE LA CONFIGURATION

**Fichier `backend/.env`** :
```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # À remplacer par le secret du webhook
STRIPE_PRICE_ID_WEEKLY=price_1SskWJEKzPeYzUocyJFFovsz
STRIPE_PRICE_ID_MONTHLY=price_1SskX7EKzPeYzUoc6e7K1qV3
STRIPE_PRICE_ID_YEARLY=price_1SskZOEKzPeYzUocbtrhA6Ry
```

---

## ✅ CHECKLIST

- [ ] ngrok installé
- [ ] Backend démarré sur http://localhost:3000
- [ ] ngrok démarré et URL copiée
- [ ] Webhook créé dans Stripe Dashboard avec l'URL ngrok
- [ ] Webhook Secret récupéré
- [ ] Webhook Secret configuré dans `backend/.env`
- [ ] Backend redémarré
- [ ] Test webhook envoyé depuis Stripe Dashboard
- [ ] Statut 200 OK reçu

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
