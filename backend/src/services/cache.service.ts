/**
 * Service utilitaire pour stocker/récupérer des codes de vérification
 * et des compteurs de rate-limiting dans Redis, avec fallback in-memory
 * quand Redis n'est pas disponible (tests ou incident).
 */
import redis from '../config/redis';

const memoryFallback = new Map<string, { value: string; expiresAt: number }>();

export class CacheService {
  private keyPrefix: string;

  constructor(prefix: string) {
    this.keyPrefix = prefix;
  }

  private buildKey(...parts: string[]): string {
    return [this.keyPrefix, ...parts].join(':');
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const fullKey = this.buildKey(key);
    try {
      await redis.setex(fullKey, ttlSeconds, value);
      memoryFallback.delete(fullKey);
    } catch (error) {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      memoryFallback.set(fullKey, { value, expiresAt });
    }
  }

  async get(key: string): Promise<string | null> {
    const fullKey = this.buildKey(key);
    try {
      const value = await redis.get(fullKey);
      if (value !== null) {
        return value;
      }
    } catch {
      // Redis indisponible, on lit le fallback
    }
    const entry = memoryFallback.get(fullKey);
    if (!entry || entry.expiresAt < Date.now()) {
      if (entry) memoryFallback.delete(fullKey);
      return null;
    }
    return entry.value;
  }

  async delete(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    memoryFallback.delete(fullKey);
    try {
      await redis.del(fullKey);
    } catch {
      // ignore
    }
  }

  /**
   * Incrémente un compteur et positionne une expiration si c'est la première valeur.
   * Retourne le nouveau compteur.
   */
  async increment(key: string, ttlSeconds: number): Promise<number> {
    const fullKey = this.buildKey(key);
    try {
      const count = await redis.incr(fullKey);
      if (count === 1) {
        await redis.expire(fullKey, ttlSeconds);
      }
      return count;
    } catch {
      const entry = memoryFallback.get(fullKey);
      if (!entry || entry.expiresAt < Date.now()) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        memoryFallback.set(fullKey, { value: '1', expiresAt });
        return 1;
      }
      const newCount = (parseInt(entry.value, 10) || 0) + 1;
      entry.value = String(newCount);
      return newCount;
    }
  }

  async getCount(key: string): Promise<number> {
    const value = await this.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  async remainingTtl(key: string): Promise<number> {
    const fullKey = this.buildKey(key);
    try {
      return await redis.ttl(fullKey);
    } catch {
      const entry = memoryFallback.get(fullKey);
      if (!entry) return -2;
      const ttl = Math.ceil((entry.expiresAt - Date.now()) / 1000);
      return ttl > 0 ? ttl : -2;
    }
  }
}

export const phoneVerificationCache = new CacheService('phone_verification');
export const loginRateLimitCache = new CacheService('login_rate_limit');
