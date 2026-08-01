import { Request, Response, NextFunction } from 'express';
import { loginRateLimitCache } from '../services/cache.service';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 30 * 60; // 30 minutes

/**
 * Rate limiter simple basé sur Redis : identifie par email ou par IP fallback.
 * Bloque après 5 tentatives échouées pendant 30 minutes.
 * L'identifiant de clé est sensible à la casse (email normalisé en minuscules).
 */
export const loginRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString();
  const key = email ? `email:${email}` : `ip:${ip}`;

  try {
    const attempts = await loginRateLimitCache.getCount(key);

    if (attempts >= MAX_ATTEMPTS) {
      const ttl = await loginRateLimitCache.remainingTtl(key);
      const minutes = Math.max(1, Math.ceil(ttl / 60));
      res.status(429).json({
        error:
          'Trop de tentatives de connexion. Veuillez réessayer dans ' + minutes + ' minute(s).',
        retryAfterSeconds: ttl,
      });
      return;
    }

    next();
  } catch (error) {
    // En cas d'indisponibilité Redis, on laisse passer (fail open)
    next();
  }
};

/**
 * Incrémente le compteur d'échec de connexion.
 * À appeler lors d'un mot de passe incorrect.
 */
export const recordFailedLogin = async (email: string): Promise<number> => {
  const key = `email:${email.toLowerCase().trim()}`;
  return loginRateLimitCache.increment(key, WINDOW_SECONDS);
};

/**
 * Réinitialise le compteur d'échecs de connexion.
 * À appeler lors d'une connexion réussie.
 */
export const resetLoginAttempts = async (email: string): Promise<void> => {
  const key = `email:${email.toLowerCase().trim()}`;
  await loginRateLimitCache.delete(key);
};
