import axios from 'axios';

export interface AddressSuggestion {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  postcode?: string;
}

export const addressService = {
  /**
   * Recherche des adresses en temps réel via des APIs publiques gratuites (sans clé d'API)
   */
  async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const trimmedQuery = query.trim();

    try {
      // 1. Essayer d'abord l'API Adresse Nationale Française (Data Gouv) - ultra précise en France
      const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
        params: {
          q: trimmedQuery,
          limit: 5,
        },
        timeout: 3000,
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        return response.data.features.map((feature: any) => {
          const coordinates = feature.geometry.coordinates; // [longitude, latitude]
          return {
            label: feature.properties.label,
            latitude: coordinates[1],
            longitude: coordinates[0],
            city: feature.properties.city,
            postcode: feature.properties.postcode,
          };
        });
      }
    } catch (error) {
      console.warn('Erreur avec l\'API Adresse Gouv, tentative avec OpenStreetMap Nominatim...', error);
    }

    try {
      // 2. Fallback universel international : OpenStreetMap Nominatim API
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: trimmedQuery,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          'accept-language': 'fr',
        },
        headers: {
          'User-Agent': 'SolidEat-App-v1.0.0', // Obligatoire pour la politique d'usage de Nominatim
        },
        timeout: 3000,
      });

      if (response.data && response.data.length > 0) {
        return response.data.map((item: any) => {
          return {
            label: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city: item.address?.city || item.address?.town || item.address?.village,
            postcode: item.address?.postcode,
          };
        });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse via Nominatim', error);
    }

    return [];
  },
};
