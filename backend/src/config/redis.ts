import Redis from 'ioredis';

/**
 * Client Redis partagé.
 * Accepte REDIS_URL (format redis://host:port) ou les variables Upstash :
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (ioredis gère aussi le schéma rediss://).
 * En développement, fallback sur redis://localhost:6379.
 */
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false,
});

// Logs utiles pour le debug local/prod ; ne cassent pas les tests car le client est lazy.
redis.on('error', (err) => {
  // Éviter le bruit dans les tests unitaires mockés
  if (process.env.NODE_ENV === 'test') return;
  console.error('[Redis] connection error:', err.message);
});

redis.on('connect', () => {
  if (process.env.NODE_ENV === 'test') return;
  console.log('[Redis] connected');
});

export default redis;
