# 🔍 DIAGNOSTIC - PROBLÈME D'ENVOI D'EMAIL

**Date** : 25 janvier 2026  
**Problème** : Confirmation d'envoi mais aucun email reçu + Erreur lors du renvoi

---

## 🚨 PROBLÈMES IDENTIFIÉS

### 1. Lors de l'inscription
- ✅ L'utilisateur reçoit une confirmation d'envoi
- ❌ Mais aucun email n'arrive dans la boîte
- **Cause** : L'erreur est capturée silencieusement, l'utilisateur ne sait pas que l'envoi a échoué

### 2. Lors du renvoi d'email
- ❌ Une erreur s'affiche immédiatement
- **Cause probable** : `SENDGRID_API_KEY` non configurée dans Railway

---

## 🔍 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1 : Vérifier les logs Railway

1. **Aller sur** : https://railway.app/
2. **Sélectionner** votre projet backend
3. **Aller dans** : **Deployments** → **Logs**
4. **Chercher** les messages suivants :

**Si vous voyez** :
```
[EmailService] SENDGRID_API_KEY non configurée ou invalide
```
→ **Problème** : La clé API SendGrid n'est pas configurée

**Si vous voyez** :
```
[EmailService] Envoi d'email de vérification à ...
[EmailService] Erreur lors de l'envoi de l'email de vérification: ...
```
→ **Problème** : La clé API est configurée mais il y a une erreur SendGrid (clé invalide, quota dépassé, email non vérifié, etc.)

**Si vous voyez** :
```
[EmailService] Email de vérification envoyé avec succès à ...
```
→ **Problème** : L'email est envoyé mais n'arrive pas (vérifier les spams, email expéditeur non vérifié dans SendGrid)

### Étape 2 : Vérifier la configuration SendGrid dans Railway

1. **Dans Railway** → **Settings** → **Variables**
2. **Chercher** la variable `SENDGRID_API_KEY`
3. **Vérifier** :
   - ✅ La variable existe
   - ✅ La valeur commence par `SG.` (ex: `SG.xxxxxxxx...`)
   - ✅ La valeur n'est pas `SG...` (valeur par défaut)
   - ✅ La valeur fait au moins 50 caractères

**Si la variable n'existe pas ou est incorrecte** :
→ Suivre le guide : `/docs/dev/GUIDE_CONFIGURATION_SENDGRID.md`

### Étape 3 : Vérifier la configuration dans SendGrid

1. **Aller sur** : https://app.sendgrid.com/
2. **Vérifier** :
   - ✅ Un email expéditeur est vérifié (Settings → Sender Authentication)
   - ✅ La clé API existe et a les permissions "Mail Send" ou "Full Access"
   - ✅ Le quota n'est pas dépassé (Settings → Account Details)

---

## ✅ SOLUTIONS

### Solution 1 : Configurer SENDGRID_API_KEY dans Railway

**Si la variable n'existe pas** :

1. **Créer une clé API SendGrid** (voir `/docs/dev/GUIDE_CONFIGURATION_SENDGRID.md`)
2. **Dans Railway** → **Settings** → **Variables** → **New Variable**
3. **Remplir** :
   - **Name** : `SENDGRID_API_KEY`
   - **Value** : La clé API (commence par `SG.`)
4. **Sauvegarder**
5. **Railway redéploie automatiquement** (attendre 1-2 minutes)

### Solution 2 : Vérifier l'email expéditeur dans SendGrid

**Si l'email n'arrive pas même après configuration** :

1. **Dans SendGrid** → **Settings** → **Sender Authentication**
2. **Vérifier** qu'un email expéditeur est vérifié :
   - **Single Sender Verification** : Un email est vérifié
   - **OU Domain Authentication** : Un domaine est vérifié
3. **Vérifier** que l'email correspond à `EMAIL_FROM` dans Railway :
   - Dans Railway → Settings → Variables
   - Vérifier que `EMAIL_FROM` correspond à l'email vérifié dans SendGrid
   - Exemple : Si SendGrid a `noreply@solideat.fr`, Railway doit avoir `EMAIL_FROM=noreply@solideat.fr`

### Solution 3 : Vérifier les spams et le quota

1. **Vérifier le dossier spam** de votre boîte email
2. **Vérifier le quota SendGrid** :
   - Plan gratuit : 100 emails/jour
   - Si le quota est dépassé, les emails ne seront pas envoyés

---

## 🔧 AMÉLIORATION DU CODE (Optionnel)

Le code actuel capture l'erreur silencieusement lors de l'inscription. Pour améliorer l'expérience utilisateur, on pourrait :

1. **Alerter l'utilisateur** si l'email n'a pas pu être envoyé lors de l'inscription
2. **Afficher un message** suggérant de renvoyer l'email manuellement

**Note** : Cette amélioration nécessiterait une modification du code backend et frontend.

---

## 📋 CHECKLIST DE DIAGNOSTIC

- [ ] Vérifier les logs Railway pour les erreurs SendGrid
- [ ] Vérifier que `SENDGRID_API_KEY` existe dans Railway
- [ ] Vérifier que la valeur de `SENDGRID_API_KEY` est correcte (commence par `SG.`)
- [ ] Vérifier que `EMAIL_FROM` correspond à un email vérifié dans SendGrid
- [ ] Vérifier qu'un email expéditeur est vérifié dans SendGrid
- [ ] Vérifier le quota SendGrid (100 emails/jour pour le plan gratuit)
- [ ] Vérifier le dossier spam de la boîte email
- [ ] Tester le renvoi d'email après configuration

---

## 🆘 DÉPANNAGE RAPIDE

### Erreur : "SENDGRID_API_KEY non configurée"

**Solution** :
1. Créer une clé API dans SendGrid
2. L'ajouter dans Railway → Settings → Variables
3. Attendre le redéploiement (1-2 minutes)
4. Tester à nouveau

### Erreur : "Impossible d'envoyer l'email de vérification"

**Causes possibles** :
1. **Clé API invalide** : Vérifier que la clé est correcte dans Railway
2. **Email expéditeur non vérifié** : Vérifier dans SendGrid → Sender Authentication
3. **Quota dépassé** : Vérifier le quota dans SendGrid → Account Details
4. **Permissions insuffisantes** : La clé API doit avoir "Mail Send" ou "Full Access"

**Solution** :
1. Vérifier les logs Railway pour voir l'erreur exacte
2. Vérifier la configuration SendGrid
3. Vérifier le quota SendGrid
4. Si nécessaire, créer une nouvelle clé API avec les bonnes permissions

### Email envoyé mais non reçu

**Causes possibles** :
1. **Dans les spams** : Vérifier le dossier spam
2. **Email expéditeur non vérifié** : Vérifier dans SendGrid
3. **Filtres email** : Vérifier les filtres de votre boîte email

**Solution** :
1. Vérifier le dossier spam
2. Ajouter `noreply@solideat.fr` à vos contacts
3. Vérifier dans SendGrid → Activity que l'email a bien été envoyé

---

## 📝 PROCHAINES ÉTAPES

1. **Vérifier les logs Railway** pour identifier l'erreur exacte
2. **Configurer SendGrid** si ce n'est pas déjà fait (voir `/docs/dev/GUIDE_CONFIGURATION_SENDGRID.md`)
3. **Tester** le renvoi d'email après configuration
4. **Vérifier** que les emails arrivent (y compris dans les spams)

---

**Document créé par** : DEV  
**Date** : 25 janvier 2026
