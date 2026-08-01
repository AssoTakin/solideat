import axios from 'axios';
import api from './api';

export interface AddressSuggestion {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  postcode?: string;
}

export const addressService = {
  /**
   * Recherche des adresses en temps réel.
   * Priorité au backend (Google Maps Places API) pour uniformiser les résultats et protéger les clés.
   * Fallback client-side sur API Adresse Nationale et Nominatim en cas d'échec.
   */
  async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const trimmedQuery = query.trim();

    // 1. Essayer le backend Solideat d'abord
    try {
      const response = await api.get('/meals/address-suggestions', {
        params: { q: trimmedQuery },
        timeout: 8000,
      });
      if (response.data?.success && response.data?.data?.length > 0) {
        return response.data.data;
      }
    } catch (error) {
      console.warn('Erreur API Solideat address, fallback client...', error);
    }

    // 2. Fallback API Adresse Nationale Française
    try {
      const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
        params: {
          q: trimmedQuery,
          limit: 5,
        },
        timeout: 3000,
      });

      if (response.data?.features?.length > 0) {
        return response.data.features.map((feature: any) => {
          const coordinates = feature.geometry.coordinates;
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
      console.warn(
        "Erreur avec l'API Adresse Gouv, tentative avec OpenStreetMap Nominatim...",
        error
      );
    }

    // 3. Fallback Nominatim
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: trimmedQuery,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          'accept-language': 'fr',
        },
        timeout: 3000,
      });

      if (response.data && response.data.length > 0) {
        return response.data.map((item: any) => ({
          label: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          city: item.address?.city || item.address?.town || item.address?.village,
          postcode: item.address?.postcode,
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse via Nominatim", error);
    }

    return [];
  },
};
