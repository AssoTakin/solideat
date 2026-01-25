# 🗺️ RÉSOLUTION : ERREUR GÉOCODAGE - Inscription bloquée

**Date** : 24 janvier 2026  
**Problème** : Erreur 400 lors de l'inscription avec message "Impossible de géocoder l'adresse"  
**Erreur** : `POST https://api.solid-eat.com/api/auth/register 400 (Bad Request)`

---

## 🔍 PROBLÈME IDENTIFIÉ

### Symptôme

Lors de l'inscription, la console du navigateur affiche :
- Erreur 400 (Bad Request)
- Message d'erreur dans l'UI : "Impossible de géocoder l'adresse"

### Cause racine

Le backend tente de géocoder l'adresse de l'utilisateur via l'API Google Maps Geocoding lors de l'inscription. Si cette étape échoue, l'inscription est bloquée.

**Causes possibles** :
1. `GOOGLE_MAPS_API_KEY` non définie dans Railway
2. Clé Google Maps invalide ou expirée
3. Restrictions de la clé API qui bloquent les requêtes depuis Railway
4. Quota Google Maps dépassé
5. Adresse invalide ou non géocodable
6. Problème réseau entre Railway et Google Maps API

---

## ✅ SOLUTION 1 : Vérifier `GOOGLE_MAPS_API_KEY` dans Railway

### Étape 1 : Vérifier la variable

1. **Railway Dashboard** → Votre projet Solid'Eat
2. **Settings** → **Variables**
3. **Chercher** `GOOGLE_MAPS_API_KEY`
4. **Vérifier** :
   - ✅ **Définie** : La clé est présente
   - ❌ **Manquante** : Passer à l'étape 2

### Étape 2 : Ajouter la variable (si manquante)

1. **Cliquer** sur **New Variable** (bouton en haut à droite)
2. **Remplir** :
   - **Name** : `GOOGLE_MAPS_API_KEY`
   - **Value** : `AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4`
3. **Sauvegarder**
4. **Attendre le redéploiement** Railway (1-2 minutes)

---

## ✅ SOLUTION 2 : Vérifier les restrictions de la clé Google Maps

### Problème

Les clés Google Maps API peuvent avoir des restrictions qui bloquent les requêtes depuis Railway.

### Solution

1. **Google Cloud Console** → https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. **Trouver** la clé `AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4`
4. **Vérifier les restrictions** :

   **Application restrictions** :
   - Si "IP addresses" : Ajouter les IPs de Railway (ou désactiver temporairement pour tester)
   - Si "HTTP referrers" : Ne s'applique pas aux requêtes serveur
   - **Recommandé** : "None" pour les requêtes serveur (backend)

   **API restrictions** :
   - Vérifier que "Geocoding API" est activée
   - Vérifier que "Maps JavaScript API" est activée (si utilisée côté frontend)

5. **Sauvegarder** les modifications

---

## ✅ SOLUTION 3 : Vérifier le quota Google Maps

### Problème

Le quota gratuit de Google Maps peut être dépassé.

### Solution

1. **Google Cloud Console** → **APIs & Services** → **Dashboard**
2. **Vérifier** l'utilisation de "Geocoding API"
3. **Si quota dépassé** :
   - Attendre le reset mensuel
   - Ou activer la facturation pour augmenter le quota

---

## ✅ SOLUTION 4 : Améliorer la gestion d'erreur (code)

### Problème actuel

Le code actuel (`geolocation.service.ts`) lance une erreur générique qui ne donne pas de détails sur la cause.

### Solution proposée

Modifier le service pour :
1. Logger les erreurs détaillées
2. Retourner des messages d'erreur plus explicites
3. Optionnel : Fallback sur coordonnées par défaut si le géocodage échoue (mode dégradé)

**Code amélioré** (à implémenter) :

```typescript
async geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!this.apiKey || this.apiKey === 'your-google-maps-api-key-here') {
    // Mode développement : retourner des coordonnées par défaut (Paris)
    console.warn('[Geolocation] Mode développement : coordonnées par défaut');
    return {
      address,
      latitude: 48.8566,
      longitude: 2.3522,
    };
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: this.apiKey,
        region: 'fr',
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      return {
        address: result.formatted_address,
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      // Logger le statut exact pour le débogage
      console.error(`[Geolocation] Échec géocodage: ${response.data.status}`, {
        address,
        status: response.data.status,
        error_message: response.data.error_message,
      });
      
      // Messages d'erreur plus explicites
      if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Adresse introuvable. Vérifiez que l\'adresse est correcte.');
      } else if (response.data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('Quota Google Maps dépassé. Veuillez réessayer plus tard.');
      } else if (response.data.status === 'REQUEST_DENIED') {
        throw new Error('Clé API Google Maps invalide ou restrictions activées.');
      } else {
        throw new Error(`Géocodage échoué: ${response.data.status}`);
      }
    }
  } catch (error: any) {
    // Logger l'erreur complète
    console.error('[Geolocation] Erreur lors du géocodage:', {
      address,
      error: error.message,
      response: error.response?.data,
    });
    
    // Si erreur réseau ou autre, donner un message plus clair
    if (error.response) {
      // Erreur de l'API Google
      throw new Error(`Erreur Google Maps API: ${error.response.data?.error_message || error.message}`);
    } else if (error.request) {
      // Pas de réponse (réseau)
      throw new Error('Impossible de contacter le service de géocodage. Vérifiez votre connexion.');
    } else {
      // Autre erreur
      throw new Error(`Impossible de géocoder l'adresse: ${error.message}`);
    }
  }
}
```

---

## 🧪 TESTS ET VALIDATION

### Test 1 : Vérifier la clé dans Railway

```bash
# Via Railway Dashboard → Settings → Variables
# Vérifier que GOOGLE_MAPS_API_KEY est définie
```

### Test 2 : Tester l'API Google Maps directement

```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=123+Rue+Test,+75001+Paris&key=AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4&region=fr"
```

**Résultat attendu** :
```json
{
  "status": "OK",
  "results": [...]
}
```

**Si erreur** :
- `REQUEST_DENIED` → Clé invalide ou restrictions
- `OVER_QUERY_LIMIT` → Quota dépassé
- `ZERO_RESULTS` → Adresse introuvable

### Test 3 : Vérifier les logs Railway

1. **Railway Dashboard** → **Deployments** → **Logs**
2. **Tenter une inscription**
3. **Chercher** les erreurs liées au géocodage
4. **Vérifier** les messages d'erreur détaillés

---

## 🆘 DÉPANNAGE

### Erreur : "REQUEST_DENIED"

**Cause** : Clé API invalide ou restrictions activées

**Solutions** :
1. Vérifier que la clé est correcte dans Railway
2. Vérifier les restrictions dans Google Cloud Console
3. Désactiver temporairement les restrictions IP pour tester

### Erreur : "OVER_QUERY_LIMIT"

**Cause** : Quota Google Maps dépassé

**Solutions** :
1. Attendre le reset mensuel
2. Activer la facturation pour augmenter le quota
3. Optimiser les appels (cache, etc.)

### Erreur : "ZERO_RESULTS"

**Cause** : Adresse non trouvée par Google Maps

**Solutions** :
1. Vérifier le format de l'adresse
2. Essayer avec une adresse plus complète
3. Vérifier que l'adresse existe réellement

### Erreur réseau (timeout, ECONNREFUSED)

**Cause** : Problème de connexion entre Railway et Google Maps

**Solutions** :
1. Vérifier les logs Railway pour les erreurs réseau
2. Vérifier que Railway peut accéder à Internet
3. Réessayer après quelques minutes

---

## 📋 CHECKLIST RAPIDE

- [ ] Vérifier que `GOOGLE_MAPS_API_KEY` est définie dans Railway
- [ ] Vérifier que la clé est correcte : `AIzaSyAVJ7gOpsWT3-b6AJZ6dh3T9t1uetKhPR4`
- [ ] Vérifier les restrictions de la clé dans Google Cloud Console
- [ ] Vérifier que "Geocoding API" est activée
- [ ] Vérifier le quota Google Maps (non dépassé)
- [ ] Tester l'API directement avec curl
- [ ] Vérifier les logs Railway pour les erreurs détaillées
- [ ] Re-tester l'inscription

---

## 🎯 RÉSUMÉ

**Problème** : L'inscription échoue avec "Impossible de géocoder l'adresse" car le géocodage Google Maps échoue

**Causes principales** :
1. `GOOGLE_MAPS_API_KEY` manquante dans Railway
2. Restrictions de la clé qui bloquent Railway
3. Quota Google Maps dépassé
4. Adresse invalide

**Solution immédiate** : Vérifier et configurer `GOOGLE_MAPS_API_KEY` dans Railway

**Solution long terme** : Améliorer la gestion d'erreur pour donner plus de détails

---

**Document créé par** : DEV  
**Date** : 24 janvier 2026  
**Cas d'usage** : Solid'Eat 2026 - Erreur géocodage lors de l'inscription
