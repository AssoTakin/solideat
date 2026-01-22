import { GeolocationService } from '../geolocation.service';

describe('GeolocationService', () => {
  let geolocationService: GeolocationService;

  beforeEach(() => {
    geolocationService = new GeolocationService();
  });

  describe('calculateDistance', () => {
    it('devrait calculer la distance entre deux points GPS (Paris - Lyon)', () => {
      // Paris
      const lat1 = 48.8566;
      const lng1 = 2.3522;
      // Lyon
      const lat2 = 45.764043;
      const lng2 = 4.835659;

      const distance = geolocationService.calculateDistance(lat1, lng1, lat2, lng2);

      // Distance réelle Paris-Lyon : ~392 km
      // On accepte une marge d'erreur de 5%
      expect(distance).toBeGreaterThan(370);
      expect(distance).toBeLessThan(410);
    });

    it('devrait calculer la distance entre deux points proches (même ville)', () => {
      // Deux points à Paris
      const lat1 = 48.8566;
      const lng1 = 2.3522;
      const lat2 = 48.8606;
      const lng2 = 2.3622;

      const distance = geolocationService.calculateDistance(lat1, lng1, lat2, lng2);

      // Distance attendue : environ 0.8 km
      expect(distance).toBeGreaterThan(0.5);
      expect(distance).toBeLessThan(1.5);
    });

    it('devrait retourner 0 pour deux points identiques', () => {
      const lat = 48.8566;
      const lng = 2.3522;

      const distance = geolocationService.calculateDistance(lat, lng, lat, lng);

      expect(distance).toBe(0);
    });

    it('devrait arrondir à 1 décimale', () => {
      const lat1 = 48.8566;
      const lng1 = 2.3522;
      const lat2 = 48.8606;
      const lng2 = 2.3622;

      const distance = geolocationService.calculateDistance(lat1, lng1, lat2, lng2);

      // Vérifier que le résultat a au plus 1 décimale
      const decimalPlaces = (distance.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  describe('filterByRadius', () => {
    it('devrait filtrer les repas dans le rayon spécifié', () => {
      // Point central : Paris
      const centerLat = 48.8566;
      const centerLng = 2.3522;

      // Repas proche (dans le rayon)
      const meal1 = {
        id: '1',
        pickupLatitude: 48.8606,
        pickupLongitude: 2.3622,
        name: 'Repas proche',
      };

      // Repas loin (hors du rayon)
      const meal2 = {
        id: '2',
        pickupLatitude: 45.764043,
        pickupLongitude: 4.835659,
        name: 'Repas loin',
      };

      const meals = [meal1, meal2];
      const radiusKm = 5; // 5 km

      const filtered = geolocationService.filterByRadius(meals, centerLat, centerLng, radiusKm);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('devrait retourner tous les repas si le rayon est grand', () => {
      const centerLat = 48.8566;
      const centerLng = 2.3522;

      const meals = [
        {
          id: '1',
          pickupLatitude: 48.8606,
          pickupLongitude: 2.3622,
          name: 'Repas 1',
        },
        {
          id: '2',
          pickupLatitude: 48.8506,
          pickupLongitude: 2.3422,
          name: 'Repas 2',
        },
      ];

      const radiusKm = 100; // 100 km

      const filtered = geolocationService.filterByRadius(meals, centerLat, centerLng, radiusKm);

      expect(filtered).toHaveLength(2);
    });

    it('devrait retourner un tableau vide si aucun repas dans le rayon', () => {
      const centerLat = 48.8566;
      const centerLng = 2.3522;

      const meals = [
        {
          id: '1',
          pickupLatitude: 45.764043,
          pickupLongitude: 4.835659,
          name: 'Repas loin',
        },
      ];

      const radiusKm = 1; // 1 km

      const filtered = geolocationService.filterByRadius(meals, centerLat, centerLng, radiusKm);

      expect(filtered).toHaveLength(0);
    });
  });
});
