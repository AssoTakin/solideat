/**
 * Utilitaire de floutage des coordonnées GPS (~500m).
 *
 * À l'équateur, 1 degré de latitude ≈ 111 km et 1 degré de longitude ≈ 111 km.
 * Pour flouter d'environ 500 mètres, on applique un offset aléatoire dans
 * l'intervalle [-0.0045°, +0.0045°] (~500 m). L'offset est déterministe pour
 * un repas donné (basé sur son id) afin que le floutage soit stable entre les
 * requêtes sans stockage supplémentaire.
 */
export function blurCoordinates(
  latitude: number,
  longitude: number,
  seed: string
): { latitude: number; longitude: number } {
  const { x, y } = seededRandomPair(seed);
  // ±0.0045° ≈ ±500 m
  const offsetDegrees = 0.0045;
  const latOffset = (x * 2 - 1) * offsetDegrees;
  const lngOffset = (y * 2 - 1) * offsetDegrees;
  return {
    latitude: roundCoordinate(latitude + latOffset),
    longitude: roundCoordinate(longitude + lngOffset),
  };
}

/**
 * Génère une paire de nombres pseudo-aléatoires déterministe entre 0 et 1
 * à partir d'une chaîne de caractères.
 */
function seededRandomPair(seed: string): { x: number; y: number } {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const x = (h1 >>> 0) / 4294967296;
  const y = (h2 >>> 0) / 4294967296;
  return { x, y };
}

function roundCoordinate(value: number): number {
  // 6 décimales suffisent (~10 cm), on garde 5 pour le floutage (~1 m)
  return Math.round(value * 100000) / 100000;
}
