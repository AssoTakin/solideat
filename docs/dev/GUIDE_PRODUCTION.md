# 🚀 GUIDE : PRÉPARATION POUR LA PRODUCTION

**Date** : 25 janvier 2026  
**Objectif** : S'assurer que l'application fonctionne correctement en production avec les vrais appels API

---

## 📋 MODE MOCK vs PRODUCTION

### Configuration actuelle

Le mode mock est automatiquement activé en développement et désactivé en production :

```typescript
// frontend/src/data/mockData.ts
export const USE_MOCK_DATA = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA === 'true';
```

**Comportement** :
- ✅ **En développement** (`npm run dev`) : Mode mock activé automatiquement
- ✅ **En production** (`npm run build`) : Mode mock désactivé, appels API réels utilisés
- ⚙️ **Forcer le mode mock** : Définir `VITE_USE_MOCK_DATA=true` dans `.env`

---

## ✅ VÉRIFICATIONS AVANT DÉPLOIEMENT

### 1. Variables d'environnement

**Frontend (Vercel)** :
- [ ] `VITE_API_URL` : URL du backend (ex: `https://api.solid-eat.com`)
- [ ] `VITE_GOOGLE_MAPS_API_KEY` : Clé API Google Maps
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` : Clé publique Stripe
- [ ] `VITE_USE_MOCK_DATA` : **Ne pas définir** ou définir à `false` (par défaut désactivé en production)

**Backend (Railway)** :
- [ ] `DATABASE_URL` : URL de connexion PostgreSQL (Supabase)
- [ ] `JWT_SECRET` : Secret pour signer les tokens JWT
- [ ] `GOOGLE_MAPS_API_KEY` : Clé API Google Maps
- [ ] `SENDGRID_API_KEY` : Clé API SendGrid
- [ ] `TWILIO_ACCOUNT_SID` : SID Twilio
- [ ] `TWILIO_AUTH_TOKEN` : Token Twilio
- [ ] `STRIPE_SECRET_KEY` : Clé secrète Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` : Secret webhook Stripe
- [ ] `FRONTEND_URL` : URL du frontend (ex: `https://solid-eat.com`)
- [ ] `PORT` : Port du serveur (généralement `3000`)

---

## 🔧 SERVICES CORRIGÉS POUR LA PRODUCTION

Les services suivants ont été corrigés pour utiliser les données mock en développement et les appels API en production :

### Services avec support mock/production

1. **`dashboardService`** ✅
   - Mode mock : `dashboardServiceMock.getDashboardStats()`
   - Production : `api.get('/users/me/dashboard')`

2. **`environmentalService`** ✅
   - Mode mock : Retourne des données mockées
   - Production : `api.get('/users/me/environmental-impact')`

3. **`bonusDonorService`** ✅
   - Mode mock : Retourne des données mockées
   - Production : `api.get('/bonus-donors')`

4. **`BonusDonorList` (composant)** ✅
   - Mode mock : Utilise `mockUsers[0]`
   - Production : `api.get('/users/me')`

---

## 🛡️ INTERCEPTEUR API

L'intercepteur API a été configuré pour gérer différemment les erreurs en mode mock et en production :

### En mode mock
- Les erreurs 401 sont loggées comme warnings (normal avec tokens mock)
- Pas de redirection automatique vers `/login`

### En production
- Les erreurs 401 déclenchent une redirection vers `/login`
- Le token est supprimé du localStorage
- Logs de diagnostic sauvegardés (si activés)

---

## 📝 CHECKLIST DE DÉPLOIEMENT

### Avant le push

- [ ] **Vérifier que `USE_MOCK_DATA` n'est pas forcé en production**
  ```bash
  # Dans .env.production ou Vercel
  # Ne pas définir VITE_USE_MOCK_DATA ou le définir à false
  ```

- [ ] **Tester le build de production localement**
  ```bash
  cd frontend
  npm run build
  npm run preview
  # Vérifier que les appels API se font bien vers le backend
  ```

- [ ] **Vérifier les variables d'environnement**
  - Frontend : Vérifier dans Vercel que toutes les variables `VITE_*` sont définies
  - Backend : Vérifier dans Railway que toutes les variables sont définies

- [ ] **Tester l'authentification**
  - S'inscrire avec un vrai compte
  - Se connecter
  - Vérifier que le token JWT est bien reçu et stocké
  - Vérifier que les appels API fonctionnent avec le token

- [ ] **Tester les fonctionnalités principales**
  - Dashboard : Vérifier que les statistiques se chargent
  - Repas : Vérifier la liste et les détails
  - Réservations : Vérifier la création et la gestion
  - Notifications : Vérifier l'affichage

### Après le déploiement

- [ ] **Vérifier les logs**
  - Frontend : Console navigateur (F12)
  - Backend : Logs Railway

- [ ] **Tester sur différents navigateurs**
  - Chrome
  - Firefox
  - Safari
  - Mobile (si applicable)

- [ ] **Vérifier les performances**
  - Temps de chargement
  - Temps de réponse API

---

## 🔍 DIAGNOSTIC EN PRODUCTION

### Si les appels API ne fonctionnent pas

1. **Vérifier `VITE_API_URL`**
   ```javascript
   // Dans la console du navigateur
   console.log(import.meta.env.VITE_API_URL);
   // Doit afficher l'URL du backend (ex: https://api.solid-eat.com)
   ```

2. **Vérifier les erreurs CORS**
   - Ouvrir la console (F12)
   - Regarder les erreurs réseau
   - Vérifier que `FRONTEND_URL` dans Railway correspond à l'URL du frontend

3. **Vérifier les tokens JWT**
   - Vérifier que le token est bien stocké après connexion
   - Vérifier que le token est envoyé dans les headers (onglet Network)

4. **Utiliser la page de diagnostic**
   - Aller sur `/diagnostic`
   - Vérifier les variables d'environnement
   - Tester la connexion API

---

## 📚 RESSOURCES

- **Variables d'environnement** : Voir `docs/dev/GUIDE_CORRECTION_VARIABLES.md`
- **Déploiement** : Voir `docs/dev/GUIDE_DEPLOIEMENT_PRODUCTION.md`
- **Configuration Stripe** : Voir `docs/dev/CONFIGURATION_STRIPE_FINALE.md`

---

## ⚠️ NOTES IMPORTANTES

1. **Ne jamais commiter les tokens ou clés API** dans le code
2. **Toujours utiliser les variables d'environnement** pour les configurations sensibles
3. **Tester en production** après chaque déploiement
4. **Surveiller les logs** pour détecter les erreurs rapidement

---

**Document créé par** : DEV  
**Date** : 25 janvier 2026
