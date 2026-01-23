# 🔗 WEBHOOK STRIPE SANS DOMAINE DÉDIÉ

**Date** : 23 janvier 2026  
**Question** : Peut-on configurer le webhook Stripe en production sans domaine dédié ?

---

## ✅ RÉPONSE : OUI, avec des options

Stripe nécessite une **URL HTTPS publique et stable** pour les webhooks en production. Vous avez plusieurs options :

---

## 🎯 OPTION 1 : Utiliser l'URL de la plateforme (Recommandé pour commencer)

### Railway

Railway fournit automatiquement une URL HTTPS :
- Format : `https://votre-projet.railway.app`
- **Avantages** :
  - ✅ HTTPS inclus (gratuit)
  - ✅ URL stable
  - ✅ Pas besoin de configuration DNS
  - ✅ Fonctionne immédiatement

**Exemple** :
```
https://solideat-backend.railway.app/webhooks/stripe
```

### Render

Render fournit également une URL HTTPS :
- Format : `https://votre-projet.onrender.com`
- **Avantages** : Similaires à Railway

**Exemple** :
```
https://solideat-backend.onrender.com/webhooks/stripe
```

### Google Cloud Run

Google Cloud Run fournit une URL HTTPS :
- Format : `https://votre-projet-xxxxx-xx.a.run.app`
- **Avantages** : Similaires

**Exemple** :
```
https://solideat-backend-xxxxx-xx.a.run.app/webhooks/stripe
```

---

## 🔄 OPTION 2 : Changer l'URL plus tard (Recommandé)

### Stratégie

1. **Phase 1** : Utiliser l'URL de la plateforme
   - Créer le webhook avec l'URL Railway/Render
   - Tester que tout fonctionne
   - Mettre en production avec cette URL

2. **Phase 2** : Migrer vers le domaine dédié (quand disponible)
   - Configurer le domaine personnalisé
   - Mettre à jour le webhook Stripe avec la nouvelle URL
   - Vérifier que les webhooks continuent de fonctionner

### Avantages

- ✅ Vous pouvez démarrer la production immédiatement
- ✅ Pas besoin d'attendre l'achat du domaine
- ✅ Migration simple plus tard
- ✅ Pas d'interruption de service

---

## ⚠️ OPTION 3 : Services temporaires (Non recommandé pour production)

### ngrok (Développement uniquement)

**⚠️ Ne pas utiliser en production** :
- URL change à chaque redémarrage (gratuit)
- Pas stable pour la production
- Risque de perte de webhooks

### Autres tunnels

Même problème : URLs instables, pas adaptées à la production.

---

## 📋 PROCÉDURE RECOMMANDÉE

### Étape 1 : Déployer le backend

1. Déployer sur Railway/Render
2. Noter l'URL HTTPS fournie (ex: `https://solideat-backend.railway.app`)

### Étape 2 : Créer le webhook Stripe (mode Live)

1. Aller sur : https://dashboard.stripe.com/webhooks (mode Live)
2. Cliquer sur "+ Add endpoint"
3. **URL** : `https://solideat-backend.railway.app/webhooks/stripe`
   - (Utiliser l'URL de votre plateforme)
4. **Description** : "SolidEat - Webhook Production (Railway)"
5. **Événements** :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Cliquer sur "Add endpoint"
7. **Récupérer le Webhook Secret**

### Étape 3 : Configurer le backend

1. Ajouter le webhook secret dans les variables d'environnement
2. Redémarrer le backend
3. Tester avec un webhook de test depuis Stripe Dashboard

### Étape 4 : Migrer vers le domaine dédié (plus tard)

Quand vous aurez le domaine `solideat.fr` :

1. **Configurer le domaine personnalisé** sur Railway/Render :
   - Railway : Settings → Domains → Add Custom Domain
   - Render : Settings → Custom Domains → Add Domain
   - Configurer les DNS selon les instructions

2. **Mettre à jour le webhook Stripe** :
   - Aller sur le webhook existant
   - Cliquer sur "Edit"
   - Changer l'URL : `https://api.solideat.fr/webhooks/stripe`
   - Sauvegarder

3. **Vérifier** :
   - Tester avec un webhook de test
   - Vérifier les logs du backend

---

## ✅ AVANTAGES DE L'URL PLATEFORME

- ✅ **Immédiat** : Pas besoin d'attendre le domaine
- ✅ **HTTPS inclus** : Certificat SSL automatique
- ✅ **Stable** : URL ne change pas (contrairement à ngrok)
- ✅ **Gratuit** : Inclus dans l'hébergement
- ✅ **Migration facile** : Changer l'URL plus tard est simple

---

## ⚠️ CONSIDÉRATIONS

### URL de la plateforme

**Avantages** :
- Fonctionne immédiatement
- HTTPS inclus
- Stable

**Inconvénients** :
- URL moins professionnelle
- Moins mémorable
- Peut changer si vous changez de plateforme

### Domaine dédié

**Avantages** :
- URL professionnelle
- Mémorable
- Contrôle total

**Inconvénients** :
- Nécessite achat et configuration
- Coût supplémentaire (~10-15€/an)

---

## 🎯 RECOMMANDATION FINALE

**Pour démarrer la production** :
1. ✅ Utiliser l'URL de la plateforme (Railway/Render)
2. ✅ Créer le webhook Stripe avec cette URL
3. ✅ Mettre en production

**Plus tard** :
1. Acheter le domaine `solideat.fr`
2. Configurer le domaine personnalisé
3. Mettre à jour l'URL du webhook Stripe

**Résultat** : Vous pouvez démarrer la production immédiatement sans attendre le domaine ! 🚀

---

## 📝 EXEMPLE CONCRET

### Scénario : Railway

1. **Déploiement** :
   ```
   Backend déployé sur : https://solideat-backend.railway.app
   ```

2. **Webhook Stripe** :
   ```
   URL : https://solideat-backend.railway.app/webhooks/stripe
   ```

3. **Plus tard (avec domaine)** :
   ```
   Domaine configuré : api.solideat.fr → Railway
   Webhook mis à jour : https://api.solideat.fr/webhooks/stripe
   ```

**Aucune interruption de service** lors de la migration ! ✅

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
