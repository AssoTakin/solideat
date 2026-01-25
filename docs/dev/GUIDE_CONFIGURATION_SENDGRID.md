# 🔧 GUIDE - CONFIGURATION SENDGRID POUR L'ENVOI D'EMAILS

**Date** : 25 janvier 2026  
**Objectif** : Configurer SendGrid pour permettre l'envoi d'emails de vérification

---

## 🎯 PROBLÈME IDENTIFIÉ

L'application affiche un message de succès lors du renvoi d'email de vérification, mais aucun email n'arrive dans la boîte de réception. Cela indique que la variable d'environnement `SENDGRID_API_KEY` n'est probablement pas configurée dans Railway.

---

## 📋 ÉTAPES DE CONFIGURATION

### Étape 1 : Créer un compte SendGrid

1. **Aller sur** : https://sendgrid.com/
2. **Créer un compte** (gratuit jusqu'à 100 emails/jour)
3. **Vérifier votre email** pour activer le compte

### Étape 2 : Créer une clé API SendGrid

1. **Se connecter** au dashboard SendGrid : https://app.sendgrid.com/
2. **Aller dans** : **Settings** (menu de gauche) → **API Keys**
3. **Cliquer sur** : **Create API Key** (bouton en haut à droite)
4. **Remplir le formulaire** :
   - **API Key Name** : `Solid'Eat Production` (ou un nom de votre choix)
   - **API Key Permissions** : Sélectionner **Full Access** (ou au minimum **Mail Send**)
5. **Cliquer sur** : **Create & View**
6. **⚠️ IMPORTANT** : Copier la clé API immédiatement (elle commence par `SG.` et ne sera affichée qu'une seule fois)
   - Exemple : `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Étape 3 : Configurer l'email expéditeur

SendGrid nécessite de vérifier un email expéditeur avant d'envoyer des emails.

#### Option A : Email unique (pour tests)

1. **Aller dans** : **Settings** → **Sender Authentication** → **Single Sender Verification**
2. **Cliquer sur** : **Create a Sender**
3. **Remplir le formulaire** :
   - **From Email Address** : `noreply@solideat.fr` (ou votre email)
   - **From Name** : `SOLID'EAT`
   - **Reply To** : (optionnel)
   - **Company Address** : (requis)
   - **City** : (requis)
   - **State** : (requis)
   - **Country** : (requis)
   - **Zip Code** : (requis)
4. **Cliquer sur** : **Create**
5. **Vérifier l'email** : SendGrid enverra un email de vérification à l'adresse indiquée
6. **Cliquer sur le lien** dans l'email reçu pour vérifier

#### Option B : Domaine vérifié (recommandé pour production)

1. **Aller dans** : **Settings** → **Sender Authentication** → **Domain Authentication**
2. **Cliquer sur** : **Authenticate Your Domain**
3. **Sélectionner** votre fournisseur DNS (ex: Cloudflare, Namecheap, etc.)
4. **Suivre les instructions** pour ajouter les enregistrements DNS (SPF, DKIM, CNAME)
5. **Vérifier le domaine** une fois les enregistrements DNS propagés

### Étape 4 : Ajouter SENDGRID_API_KEY dans Railway

1. **Aller sur** : https://railway.app/
2. **Se connecter** avec votre compte
3. **Sélectionner** votre projet Solid'Eat (backend)
4. **Cliquer sur** : **Settings** (dans le menu de gauche)
5. **Cliquer sur** : **Variables** (dans le sous-menu)
6. **Cliquer sur** : **New Variable** (bouton en haut à droite)
7. **Remplir** :
   - **Name** : `SENDGRID_API_KEY`
   - **Value** : La clé API copiée à l'étape 2 (commence par `SG.`)
8. **Cliquer sur** : **Add**
9. **Railway redéploie automatiquement** (attendre 1-2 minutes)

### Étape 5 : Vérifier EMAIL_FROM dans Railway

1. **Dans Railway** (même page Settings → Variables)
2. **Vérifier** que la variable `EMAIL_FROM` existe :
   - Si elle n'existe pas, **cliquer sur** : **New Variable**
   - **Name** : `EMAIL_FROM`
   - **Value** : `noreply@solideat.fr` (doit correspondre à l'email vérifié dans SendGrid)
3. **Si elle existe**, vérifier que la valeur correspond à l'email vérifié dans SendGrid

---

## ✅ VÉRIFICATIONS

### Vérification 1 : Variables d'environnement Railway

Dans Railway → Settings → Variables, vérifier que les variables suivantes existent :

- [ ] `SENDGRID_API_KEY` = `SG.xxxxxxxx...` (clé API SendGrid)
- [ ] `EMAIL_FROM` = `noreply@solideat.fr` (email vérifié dans SendGrid)
- [ ] `FRONTEND_URL` = `https://solid-eat.com` (ou votre URL frontend)

### Vérification 2 : Logs Railway

1. **Aller dans** Railway → **Deployments** → **Logs**
2. **Chercher** les messages suivants après le redéploiement :
   - ✅ `[EmailService] Envoi d'email de vérification à ...` (succès)
   - ❌ `[EmailService] SENDGRID_API_KEY non configurée ou invalide` (erreur)

### Vérification 3 : Test d'envoi d'email

1. **Ouvrir** l'application frontend
2. **Aller sur** la page de vérification d'email
3. **Cliquer sur** "Renvoyer l'email"
4. **Vérifier** :
   - ✅ Le message de succès s'affiche
   - ✅ L'email arrive dans la boîte de réception (vérifier aussi les spams)
   - ✅ Les logs Railway montrent `[EmailService] Email de vérification envoyé avec succès`

---

## 🆘 DÉPANNAGE

### Erreur : "SENDGRID_API_KEY non configurée ou invalide"

**Cause** : La variable n'est pas configurée dans Railway ou la valeur est incorrecte.

**Solution** :
1. Vérifier que `SENDGRID_API_KEY` existe dans Railway → Settings → Variables
2. Vérifier que la valeur commence par `SG.` et fait au moins 50 caractères
3. Vérifier que Railway a redéployé après l'ajout de la variable
4. Vérifier les logs Railway pour confirmer

### Erreur : "Service d'envoi d'email non configuré"

**Cause** : La clé API SendGrid n'est pas valide ou n'a pas les bonnes permissions.

**Solution** :
1. Vérifier que la clé API a les permissions "Mail Send" ou "Full Access"
2. Vérifier que la clé API n'a pas été révoquée dans SendGrid
3. Créer une nouvelle clé API si nécessaire

### Erreur : "Email non reçu"

**Causes possibles** :
1. **Email non vérifié dans SendGrid** :
   - Vérifier que l'email expéditeur (`EMAIL_FROM`) est vérifié dans SendGrid
   - Aller dans SendGrid → Settings → Sender Authentication
   - Vérifier que l'email est marqué comme "Verified"

2. **Email dans les spams** :
   - Vérifier le dossier spam/courrier indésirable
   - Ajouter `noreply@solideat.fr` à vos contacts

3. **Erreur SendGrid** :
   - Vérifier les logs Railway pour voir les détails de l'erreur SendGrid
   - Aller dans SendGrid → Activity pour voir les tentatives d'envoi
   - Vérifier les raisons de rejet si l'email n'a pas été envoyé

4. **Limite de quota atteinte** :
   - Vérifier dans SendGrid → Settings → Account Details
   - Le plan gratuit permet 100 emails/jour
   - Vérifier que vous n'avez pas dépassé la limite

### Erreur SendGrid dans les logs

Si vous voyez une erreur SendGrid dans les logs Railway, vérifier :

1. **Aller dans** SendGrid → **Activity**
2. **Chercher** les tentatives d'envoi récentes
3. **Cliquer sur** une tentative pour voir les détails de l'erreur
4. **Erreurs communes** :
   - **"Invalid email address"** : L'adresse email destinataire est invalide
   - **"Sender email not verified"** : L'email expéditeur n'est pas vérifié
   - **"API key invalid"** : La clé API n'est pas valide
   - **"Quota exceeded"** : Limite de quota atteinte

---

## 📝 RÉSUMÉ DES VARIABLES

### Railway (Backend)

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@solideat.fr
FRONTEND_URL=https://solid-eat.com
```

**⚠️ IMPORTANT** :
- `SENDGRID_API_KEY` doit commencer par `SG.`
- `EMAIL_FROM` doit correspondre à un email vérifié dans SendGrid
- `FRONTEND_URL` doit être l'URL complète du frontend (avec `https://`)

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

1. ✅ **Créer un compte SendGrid**
2. ✅ **Créer une clé API SendGrid**
3. ✅ **Vérifier un email expéditeur** (Single Sender ou Domain)
4. ✅ **Ajouter SENDGRID_API_KEY dans Railway**
5. ✅ **Vérifier EMAIL_FROM dans Railway**
6. ✅ **Vérifier les logs Railway** après redéploiement
7. ✅ **Tester l'envoi d'email** depuis l'application

---

**Document créé par** : DEV  
**Date** : 25 janvier 2026
