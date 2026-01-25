# 🗺️ GUIDE : INTÉGRATION GOOGLE MAPS

**Date** : 25 janvier 2026  
**Objectif** : Expliquer l'intégration Google Maps pour la validation d'adresse et la récupération des coordonnées GPS

---

## 📋 SITUATION ACTUELLE

### Étape 2 du formulaire de création de repas

Actuellement, l'étape 2 affiche :
- Un champ texte pour saisir l'adresse manuellement
- Un message : "L'adresse sera validée par Google Maps pour garantir la précision"
- Un placeholder : "Carte Google Maps à intégrer"
- Des coordonnées par défaut (Paris : 48.8566, 2.3522) en mode caché

### Ce qui fonctionne actuellement

✅ **Backend** : Le service `geolocationService` peut géocoder une adresse via Google Maps API  
✅ **Validation** : Le backend valide et géocode l'adresse lors de la création du repas  
✅ **Distance** : La distance est calculée côté backend avec la formule Haversine

### Ce qui manque

❌ **Frontend** : Pas d'intégration Google Maps dans le formulaire  
❌ **Sélection visuelle** : L'utilisateur ne peut pas sélectionner l'adresse sur une carte  
❌ **Coordonnées automatiques** : Les coordonnées GPS ne sont pas récupérées automatiquement

---

## 🔧 IMPLICATIONS EN LOCAL (DÉVELOPPEMENT)

### Actuellement en local

1. **Saisie manuelle de l'adresse** : L'utilisateur tape l'adresse dans un champ texte
2. **Coordonnées par défaut** : Si Google Maps n'est pas configuré, les coordonnées par défaut (Paris) sont utilisées
3. **Validation backend** : Si `GOOGLE_MAPS_API_KEY` est configuré dans le backend, l'adresse est géocodée lors de la création

### Ce qui se passe actuellement

**Sans clé API Google Maps** :
- L'utilisateur saisit une adresse
- Le backend utilise des coordonnées par défaut (Paris)
- La distance calculée sera incorrecte si l'utilisateur n'est pas à Paris

**Avec clé API Google Maps** :
- L'utilisateur saisit une adresse
- Le backend géocode l'adresse via Google Maps API
- Les coordonnées GPS correctes sont récupérées
- La distance est calculée correctement

---

## 🚀 IMPLICATIONS EN PRODUCTION

### Ce qui doit être fait

1. **Intégrer Google Maps dans le formulaire** (étape 2)
   - Ajouter une carte interactive
   - Permettre la sélection d'adresse sur la carte
   - Récupérer automatiquement les coordonnées GPS
   - Valider l'adresse en temps réel

2. **Variables d'environnement nécessaires**

   **Frontend (Vercel)** :
   - `VITE_GOOGLE_MAPS_API_KEY` : Clé API Google Maps (déjà configurée ✅)

   **Backend (Railway)** :
   - `GOOGLE_MAPS_API_KEY` : Clé API Google Maps (déjà configurée ✅)

3. **Activer les APIs Google Maps nécessaires**
   - ✅ Maps JavaScript API (pour la carte)
   - ✅ Geocoding API (pour convertir adresse → coordonnées)
   - ✅ Places API (optionnel, pour l'autocomplétion d'adresses)

---

## 📝 FONCTIONNALITÉS À IMPLÉMENTER

### 1. Intégration Google Maps dans CreateMeal (étape 2)

**Fonctionnalités à ajouter** :
- [ ] Carte Google Maps interactive
- [ ] Champ de recherche d'adresse avec autocomplétion
- [ ] Marqueur sur la carte pour l'adresse sélectionnée
- [ ] Récupération automatique des coordonnées GPS (latitude/longitude)
- [ ] Validation de l'adresse en temps réel
- [ ] Affichage de l'adresse formatée par Google Maps

**Bibliothèque recommandée** : `@react-google-maps/api`

### 2. Amélioration de l'affichage des métriques

**Problèmes identifiés** :
- ✅ **Parts restantes** : Corrigé pour afficher 0 si le repas est réservé
- ⚠️ **Date et heure** : Vérifier que les données sont bien passées depuis le formulaire
- ⚠️ **Distance** : Dépend de la localisation de l'utilisateur (doit être fournie au backend)

### 3. Calcul de la distance

**Comment ça fonctionne** :
- La distance est calculée côté backend avec la formule Haversine
- Nécessite les coordonnées GPS de l'utilisateur (`userLat`, `userLng`)
- Si les coordonnées utilisateur ne sont pas fournies, la distance n'est pas calculée

**À améliorer** :
- Récupérer la localisation de l'utilisateur côté frontend (géolocalisation navigateur)
- Envoyer les coordonnées lors des appels API pour calculer la distance

---

## 🔗 CONNEXION ENTRE DISTANCE ET PARTS RESTANTES

### Distance
- **Calculée** : Côté backend avec la formule Haversine
- **Dépend de** : Coordonnées GPS de l'utilisateur + coordonnées GPS du repas
- **Affichée** : Dans MealDetails, MealList, Home
- **Utilisée pour** : Filtrer les repas par distance maximale

### Parts restantes
- **Calculée** : `portions - nombre_de_réservations`
- **Actuellement** : Affiche `meal.portions` (corrigé pour afficher 0 si réservé)
- **À améliorer** : Si un repas peut avoir plusieurs réservations (futur), calculer `portions - réservations.length`

**Ils ne sont pas connectés** : Ce sont deux métriques indépendantes.

---

## 🛠️ PLAN D'IMPLÉMENTATION

### Phase 1 : Préparation (FAIT ✅)
- [x] Variables d'environnement configurées
- [x] Service backend de géocodage créé
- [x] Calcul de distance implémenté

### Phase 2 : Intégration frontend (À FAIRE)
- [ ] Installer `@react-google-maps/api`
- [ ] Créer un composant `AddressPicker` avec carte Google Maps
- [ ] Intégrer dans l'étape 2 du formulaire CreateMeal
- [ ] Récupérer automatiquement les coordonnées GPS
- [ ] Valider l'adresse en temps réel

### Phase 3 : Améliorations (À FAIRE)
- [ ] Récupérer la localisation de l'utilisateur (géolocalisation)
- [ ] Envoyer les coordonnées utilisateur aux appels API
- [ ] Afficher la distance dans toutes les listes de repas
- [ ] Améliorer le calcul des parts restantes si multi-réservations

---

## 📚 RESSOURCES

- **Documentation Google Maps** : https://developers.google.com/maps/documentation
- **React Google Maps** : https://react-google-maps-api-docs.netlify.app/
- **Geocoding API** : https://developers.google.com/maps/documentation/geocoding

---

## ⚠️ NOTES IMPORTANTES

1. **Coût Google Maps** : 
   - Geocoding API : 5$ pour 1000 requêtes
   - Maps JavaScript API : 7$ pour 1000 chargements
   - Places API : 17$ pour 1000 requêtes (si utilisé)

2. **Quotas gratuits** :
   - 200$ de crédit gratuit par mois
   - Suffisant pour ~28 000 requêtes de géocodage/mois

3. **En développement local** :
   - Utiliser la clé API configurée dans Railway
   - Ou utiliser des coordonnées par défaut si pas de clé

4. **En production** :
   - S'assurer que les clés API sont bien configurées
   - Surveiller les quotas et coûts
   - Implémenter le cache pour réduire les appels API

---

**Document créé par** : DEV  
**Date** : 25 janvier 2026
