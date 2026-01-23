# 🔧 RÉSOLUTION : ERREUR DE CONNEXION STRIPE

**Date** : 23 janvier 2026  
**Problème** : Erreur "exceeded max attempt" lors de `stripe login`

---

## 🔍 DIAGNOSTIC

L'erreur "exceeded max attempt" signifie que :
- Le code de jumelage a expiré
- Trop de tentatives ont été effectuées
- La session d'authentification a été interrompue

---

## ✅ SOLUTION : RÉESSAYER LA CONNEXION

### Étape 1 : Vérifier que Stripe CLI est installé

```bash
stripe --version
```

**Résultat attendu** : `stripe version 1.34.0` (ou similaire)

Si Stripe CLI n'est pas installé, suivez les instructions dans `docs/dev/ETAPES_RESTANTES_STRIPE.md`

---

### Étape 2 : Réessayer la connexion

```bash
stripe login
```

**Ce qui va se passer** :
1. Stripe CLI va afficher un nouveau code de jumelage
2. Votre navigateur va s'ouvrir automatiquement
3. Ou vous devrez visiter l'URL affichée dans le terminal

**⚠️ IMPORTANT** :
- **Ne fermez pas le terminal** pendant l'authentification
- **Terminez l'authentification dans le navigateur** avant de revenir au terminal
- Si le navigateur ne s'ouvre pas, copiez l'URL affichée et visitez-la manuellement

---

### Étape 3 : Vérifier la connexion

Une fois l'authentification terminée dans le navigateur, vérifiez dans le terminal :

```bash
stripe config --list
```

**Résultat attendu** :
```
test_mode_api_key: sk_test_...
test_mode_api_key_expires_at: ...
```

Si vous voyez ces informations, la connexion est réussie ✅

---

## 🔄 SI L'ERREUR PERSISTE

### Option A : Nettoyer la configuration Stripe

```bash
# Supprimer la configuration existante
rm -rf ~/.config/stripe

# Réessayer la connexion
stripe login
```

### Option B : Utiliser un code de jumelage manuel

Si le navigateur ne s'ouvre pas automatiquement :

1. **Copier le code de jumelage** affiché dans le terminal (ex: `fondly-regal-idol-extol`)
2. **Visiter manuellement** : https://dashboard.stripe.com/stripecli/confirm_auth
3. **Entrer le code de jumelage** dans le formulaire
4. **Autoriser** Stripe CLI

### Option C : Vérifier la connexion internet

Assurez-vous que :
- Votre connexion internet fonctionne
- Aucun pare-feu ne bloque Stripe CLI
- Vous pouvez accéder à https://dashboard.stripe.com

---

## 📋 APRÈS LA CONNEXION RÉUSSIE

Une fois connecté, suivez les étapes dans `docs/dev/ETAPES_RESTANTES_STRIPE.md` :

1. ✅ Vérifier que le backend tourne
2. ✅ Démarrer Stripe CLI listen
3. ✅ Obtenir le webhook secret
4. ✅ Mettre à jour `backend/.env`
5. ✅ Tester la configuration

---

## 🚀 COMMANDES RAPIDES

```bash
# 1. Vérifier Stripe CLI
stripe --version

# 2. Se connecter
stripe login

# 3. Vérifier la connexion
stripe config --list

# 4. Démarrer Stripe CLI listen (après connexion)
stripe listen --forward-to localhost:3000/webhooks/stripe
```

---

## 📝 NOTES

- Le code de jumelage expire après quelques minutes
- Si vous fermez le terminal pendant l'authentification, réessayez
- La connexion Stripe CLI est persistante (une fois connecté, vous n'avez pas besoin de vous reconnecter)

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
