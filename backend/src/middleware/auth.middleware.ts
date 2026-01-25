import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionType: string;
  };
}

/**
 * Middleware d'authentification
 * Vérifie le JWT token et attache l'utilisateur à la requête
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token d\'authentification manquant' });
      return;
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    const decoded = authService.verifyJWT(token);

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionType: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    // Pour le MVP, permettre l'accès avec seulement l'email vérifié
    // La vérification du téléphone peut être faite plus tard
    if (!user.emailVerified) {
      res.status(403).json({ error: 'Email non vérifié. Veuillez vérifier votre email pour accéder à votre compte.' });
      return;
    }

    // Avertir si le téléphone n'est pas vérifié, mais permettre l'accès
    if (!user.phoneVerified) {
      console.warn('[AuthMiddleware] Téléphone non vérifié pour utilisateur:', user.id);
      // On permet l'accès mais on pourrait ajouter un flag pour demander la vérification plus tard
    }

    req.user = {
      id: user.id,
      email: user.email,
      subscriptionType: user.subscriptionType,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
