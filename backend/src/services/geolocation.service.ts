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
    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_MAPS_API_KEY non configurée. Le géocodage ne fonctionnera pas.');
    }
  }

  /**
   * Géocode une adresse via Google Maps Geocoding API
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!this.apiKey || this.apiKey === 'your-google-maps-api-key-here') {
      // Mode développement : retourner des coordonnées par défaut (Paris)
      console.warn('⚠️  Mode développement : utilisation de coordonnées par défaut');
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
        throw new Error(`Géocodage échoué: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      throw new Error('Impossible de géocoder l\'adresse');
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
}

export const geolocationService = new GeolocationService();
