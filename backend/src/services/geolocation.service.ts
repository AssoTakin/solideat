import axios from 'axios';

export interface GeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
}

export class GeolocationService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Géocode une adresse via Google Maps Geocoding API
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!this.apiKey || this.apiKey === 'your-google-maps-api-key-here') {
      // Mode développement : retourner des coordonnées par défaut (Paris)
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
          region: 'fr', // France
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

        // Messages d'erreur plus explicites
        if (response.data.status === 'ZERO_RESULTS') {
          throw new Error('Adresse introuvable. Vérifiez que l\'adresse est correcte.');
        } else if (response.data.status === 'OVER_QUERY_LIMIT') {
          throw new Error('Quota Google Maps dépassé. Veuillez réessayer plus tard.');
        } else if (response.data.status === 'REQUEST_DENIED') {
          throw new Error('Clé API Google Maps invalide ou restrictions activées.');
        } else {
          throw new Error(`Géocodage échoué: ${response.data.status}${response.data.error_message ? ` - ${response.data.error_message}` : ''}`);
        }
      }
    } catch (error: any) {
      });

      // Si erreur réseau ou autre, donner un message plus clair
      if (error.response) {
        // Erreur de l'API Google (déjà gérée ci-dessus, mais au cas où)
        throw new Error(`Erreur Google Maps API: ${error.response.data?.error_message || error.message}`);
      } else if (error.request) {
        // Pas de réponse (réseau)
        throw new Error('Impossible de contacter le service de géocodage. Vérifiez votre connexion.');
      } else {
        // Autre erreur (déjà gérée ci-dessus normalement)
        throw new Error(`Impossible de géocoder l'adresse: ${error.message}`);
      }
    }
  }

  /**
   * Valide et géocode une adresse
   */
  async validateAndGeocodeAddress(address: string): Promise<GeocodeResult> {
    if (!address || address.trim().length === 0) {
      throw new Error('L\'adresse est requise');
    }

    return this.geocodeAddress(address);
  }

  /**
   * Calcule la distance entre deux points GPS (formule Haversine)
   * @param lat1 Latitude du premier point
   * @param lng1 Longitude du premier point
   * @param lat2 Latitude du deuxième point
   * @param lng2 Longitude du deuxième point
   * @returns Distance en kilomètres (arrondie à 1 décimale)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Rayon de la Terre en kilomètres
    const R = 6371;

    // Conversion des degrés en radians
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    // Formule Haversine
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Arrondir à 1 décimale
    return Math.round(distance * 10) / 10;
  }

  /**
   * Convertit des degrés en radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Filtre les repas par rayon de recherche
   * @param meals Liste des repas avec coordonnées GPS
   * @param centerLat Latitude du centre (utilisateur)
   * @param centerLng Longitude du centre (utilisateur)
   * @param radiusKm Rayon en kilomètres
   * @returns Liste des repas dans le rayon
   */
  filterByRadius<T extends { pickupLatitude: number; pickupLongitude: number }>(
    meals: T[],
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): T[] {
    return meals.filter((meal) => {
      const distance = this.calculateDistance(
        centerLat,
        centerLng,
        meal.pickupLatitude,
        meal.pickupLongitude
      );
      return distance <= radiusKm;
    });
  }
}

export const geolocationService = new GeolocationService();
