import { blurCoordinates } from '../location-blur';

describe('location-blur', () => {
  it('should blur coordinates by roughly 500m', () => {
    const lat = 48.8566;
    const lng = 2.3522;
    const result = blurCoordinates(lat, lng, 'meal-123');

    const latDiff = Math.abs(result.latitude - lat);
    const lngDiff = Math.abs(result.longitude - lng);

    // 0.0045° ≈ 500m
    expect(latDiff).toBeLessThanOrEqual(0.005);
    expect(lngDiff).toBeLessThanOrEqual(0.005);
    expect(latDiff).toBeGreaterThan(0);
    expect(lngDiff).toBeGreaterThan(0);
  });

  it('should be deterministic for the same seed', () => {
    const result1 = blurCoordinates(48.8566, 2.3522, 'meal-abc');
    const result2 = blurCoordinates(48.8566, 2.3522, 'meal-abc');

    expect(result1.latitude).toBe(result2.latitude);
    expect(result1.longitude).toBe(result2.longitude);
  });

  it('should produce different offsets for different seeds', () => {
    const result1 = blurCoordinates(48.8566, 2.3522, 'meal-abc');
    const result2 = blurCoordinates(48.8566, 2.3522, 'meal-def');

    expect(result1.latitude).not.toBe(result2.latitude);
    expect(result1.longitude).not.toBe(result2.longitude);
  });
});
