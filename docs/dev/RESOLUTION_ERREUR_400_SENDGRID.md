# 🔧 RÉSOLUTION - ERREUR 400 AVEC SENDGRID

**Date** : 25 janvier 2026  
**Problème** : Erreurs 400 sur `/api/auth/register` et `/api/auth/resend-verification-email`  
**Cause probable** : Problème avec SendGrid (email expéditeur non vérifié, clé invalide, etc.)

---

## 🚨 PROBLÈME IDENTIFIÉ

Les logs Railway montrent des erreurs **400 (Bad Request)** sur :
- `POST /api/auth/register` - Plusieurs erreurs 400
- `POST /api/auth/resend-verification-email` - Erreur 400

**Cause probable** : SendGrid rejette l'envoi d'email pour une des raisons suivantes :
1. **Email expéditeur non vérifié** dans SendGrid
2. **Clé API invalide** ou sans les bonnes permissions
3. **Format d'email invalide** dans `EMAIL_FROM`
4. **Quota SendGrid dépassé**

---

## 🔍 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1 : Vérifier les logs de déploiement (Deploy Logs)

Les logs HTTP ne montrent que le statut 400, mais les **Deploy Logs** contiennent les détails SendGrid.

1. **Dans Railway** → **Deployments** → **Deploy Logs**
2. **Chercher** les messages suivants :

**Si vous voyez** :
```
[EmailService] Erreur lors de l'envoi de l'email de vérification: ...
[EmailService] Détails SendGrid: ...
```
→ **Copier** ces détails, ils indiquent la cause exacte

**Erreurs SendGrid courantes** :
- `The from email does not match a verified Sender Identity` → Email expéditeur non vérifié
- `Invalid API key` → Clé API invalide
- `Forbidden` → Permissions insuffisantes
- `Quota exceeded` → Limite de quota atteinte

### Étape 2 : Vérifier l'email expéditeur dans SendGrid

**C'est probablement la cause principale** :

1. **Aller sur** : https://app.sendgrid.com/
2. **Aller dans** : **Settings** → **Sender Authentication**
3. **Vérifier** :
   - ✅ **Single Sender Verification** : Un email est vérifié (statut "Verified")
   - ✅ **OU Domain Authentication** : Un domaine est vérifié

4. **Vérifier** que l'email vérifié correspond à `EMAIL_FROM` dans Railway :
   - Dans Railway → Settings → Variables
   - Vérifier la valeur de `EMAIL_FROM`
   - Exemple : Si SendGrid a `noreply@solideat.fr` vérifié, Railway doit avoir `EMAIL_FROM=noreply@solideat.fr`

**⚠️ IMPORTANT** : L'email dans `EMAIL_FROM` doit **exactement** correspondre à un email vérifié dans SendGrid.

### Étape 3 : Vérifier la clé API SendGrid

1. **Dans SendGrid** → **Settings** → **API Keys**
2. **Vérifier** :
   - ✅ La clé API existe
   - ✅ Les permissions incluent **"Mail Send"** ou **"Full Access"**
   - ✅ La clé n'a pas été révoquée

3. **Dans Railway** → **Settings** → **Variables**
4. **Vérifier** :
   - ✅ `SENDGRID_API_KEY` existe
   - ✅ La valeur correspond exactement à la clé dans SendGrid (commence par `SG.`)
   - ✅ Pas d'espaces avant/après la valeur

### Étape 4 : Vérifier le quota SendGrid

1. **Dans SendGrid** → **Settings** → **Account Details**
2. **Vérifier** :
   - ✅ Le quota n'est pas dépassé
   - Plan gratuit : 100 emails/jour
   - Si dépassé, attendre le lendemain ou passer à un plan payant

---

## ✅ SOLUTIONS

### Solution 1 : Vérifier l'email expéditeur (PRIORITÉ HAUTE)

**Si l'email expéditeur n'est pas vérifié** :

1. **Dans SendGrid** → **Settings** → **Sender Authentication** → **Single Sender Verification**
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
5. **Vérifier l'email** : SendGrid enverra un email de vérification
6. **Cliquer sur le lien** dans l'email reçu pour vérifier

7. **Dans Railway** → **Settings** → **Variables**
8. **Vérifier/modifier** `EMAIL_FROM` pour qu'il corresponde exactement à l'email vérifié :
   ```
   EMAIL_FROM=noreply@solideat.fr
   ```
   (Remplacer par l'email que vous avez vérifié dans SendGrid)

9. **Railway redéploie automatiquement** (attendre 1-2 minutes)

### Solution 2 : Vérifier la clé API

**Si la clé API est invalide** :

1. **Dans SendGrid** → **Settings** → **API Keys**
2. **Créer une nouvelle clé API** :
   - **API Key Name** : `Solid'Eat Production`
   - **API Key Permissions** : **Full Access** (ou au minimum **Mail Send**)
3. **Copier** la clé API (commence par `SG.`)

4. **Dans Railway** → **Settings** → **Variables**
5. **Modifier** `SENDGRID_API_KEY` :
   - Cliquer sur l'icône de modification
   - Remplacer la valeur par la nouvelle clé API
   - Sauvegarder

6. **Railway redéploie automatiquement** (attendre 1-2 minutes)

### Solution 3 : Vérifier le format de l'email

**Si l'email a un format invalide** :

1. **Dans Railway** → **Settings** → **Variables**
2. **Vérifier** `EMAIL_FROM` :
   - ✅ Format valide : `noreply@solideat.fr`
   - ❌ Format invalide : `noreply@solideat.fr <SOLID'EAT>` (ne pas inclure le nom)
   - ❌ Format invalide : `SOLID'EAT <noreply@solideat.fr>` (ne pas inclure le nom)

3. **Corriger** si nécessaire :
   ```
   EMAIL_FROM=noreply@solideat.fr
   ```
   (Uniquement l'adresse email, sans nom)

---

## 🔧 AMÉLIORATION DU CODE (Optionnel)

Pour mieux diagnostiquer les erreurs SendGrid, on pourrait améliorer les logs. Mais d'abord, vérifiez les **Deploy Logs** pour voir l'erreur exacte.

---

## 📋 CHECKLIST DE RÉSOLUTION

- [ ] Vérifier les **Deploy Logs** Railway pour voir l'erreur SendGrid exacte
- [ ] Vérifier qu'un email expéditeur est vérifié dans SendGrid
- [ ] Vérifier que `EMAIL_FROM` dans Railway correspond exactement à l'email vérifié
- [ ] Vérifier que la clé API SendGrid est valide et a les bonnes permissions
- [ ] Vérifier que le quota SendGrid n'est pas dépassé
- [ ] Tester le renvoi d'email après corrections
- [ ] Vérifier que les emails arrivent (y compris dans les spams)

---

## 🆘 DÉPANNAGE RAPIDE

### Erreur : "The from email does not match a verified Sender Identity"

**Solution** :
1. Vérifier un email expéditeur dans SendGrid → Settings → Sender Authentication
2. Vérifier que `EMAIL_FROM` dans Railway correspond exactement à cet email
3. Attendre le redéploiement Railway (1-2 minutes)
4. Tester à nouveau

### Erreur : "Invalid API key"

**Solution** :
1. Vérifier que la clé API dans Railway correspond à celle dans SendGrid
2. Vérifier que la clé n'a pas été révoquée dans SendGrid
3. Si nécessaire, créer une nouvelle clé API et la mettre à jour dans Railway

### Erreur : "Forbidden"

**Solution** :
1. Vérifier que la clé API a les permissions "Mail Send" ou "Full Access"
2. Si nécessaire, créer une nouvelle clé API avec les bonnes permissions

### Erreur : "Quota exceeded"

**Solution** :
1. Vérifier le quota dans SendGrid → Settings → Account Details
2. Plan gratuit : 100 emails/jour
3. Attendre le lendemain ou passer à un plan payant

---

## 🎯 ACTION IMMÉDIATE

**La cause la plus probable est l'email expéditeur non vérifié** :

1. **Aller dans SendGrid** → **Settings** → **Sender Authentication**
2. **Vérifier** qu'un email est vérifié (statut "Verified")
3. **Vérifier** dans Railway que `EMAIL_FROM` correspond exactement à cet email
4. **Si l'email n'est pas vérifié**, suivre la Solution 1 ci-dessus
5. **Attendre** le redéploiement Railway (1-2 minutes)
6. **Tester** le renvoi d'email

---

**Document créé par** : DEV  
**Date** : 25 janvier 2026
