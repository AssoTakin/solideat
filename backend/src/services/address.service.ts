import axios from 'axios';

export interface AddressSuggestion {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  postcode?: string;
}

class AddressService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Autocomplétion d'adresses via Google Maps Places API.
   * Fallback sur api-adresse.data.gouv.fr et Nominatim si pas de clé.
   */
  async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const trimmedQuery = query.trim();

    // 1. Essayer Google Maps Places API si configuré
    if (this.apiKey) {
      try {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/place/autocomplete/json',
          {
            params: {
              input: trimmedQuery,
              key: this.apiKey,
              components: 'country:fr',
              language: 'fr',
              types: 'address',
            },
            timeout: 5000,
          }
        );

        const predictions = response.data?.predictions || [];
        if (predictions.length > 0) {
          // Place Details pour récupérer les coordonnées de chaque prédiction
          const suggestions = await Promise.all(
            predictions.slice(0, 5).map(async (prediction: any) => {
              try {
                const details = await this.getPlaceDetails(prediction.place_id);
                return {
                  label: prediction.description,
                  latitude: details.latitude,
                  longitude: details.longitude,
                  city: details.city,
                  postcode: details.postcode,
                };
              } catch {
                return null;
              }
            })
          );
          return suggestions.filter((s): s is AddressSuggestion => s !== null);
        }
      } catch (error) {
        console.warn('Erreur Google Places, fallback sur API ouverte...', error);
      }
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
      console.warn('Erreur API Adresse Gouv, fallback Nominatim...', error);
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

      if (response.data?.length > 0) {
        return response.data.map((item: any) => ({
          label: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          city: item.address?.city || item.address?.town || item.address?.village,
          postcode: item.address?.postcode,
        }));
      }
    } catch (error) {
      console.error('Erreur Nominatim', error);
    }

    return [];
  }

  private async getPlaceDetails(placeId: string): Promise<{
    latitude: number;
    longitude: number;
    city?: string;
    postcode?: string;
  }> {
    if (!this.apiKey) {
      throw new Error('No API key');
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: this.apiKey,
        fields: 'geometry,address_component',
      },
      timeout: 5000,
    });

    const result = response.data?.result;
    const location = result?.geometry?.location;
    const components = result?.address_components || [];

    const city = components.find((c: any) => c.types.includes('locality'))?.long_name;
    const postcode = components.find((c: any) => c.types.includes('postal_code'))?.long_name;

    return {
      latitude: location?.lat,
      longitude: location?.lng,
      city,
      postcode,
    };
  }
}

export const addressService = new AddressService();
