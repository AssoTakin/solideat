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
 * Vérifie le JWT token et attache l'utilisateur à la requête.
 * Bloque l'accès aux fonctionnalités protégées si email ou téléphone
 * n'est pas vérifié (exclusion : routes liées à l'authentification).
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: "Token d'authentification manquant" });
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

    if (!user.emailVerified) {
      res.status(403).json({
        error: 'EMAIL_NOT_VERIFIED',
        message:
          "Votre email n'est pas encore vérifié. Veuillez cliquer sur le lien reçu par email pour activer votre compte.",
        data: { user: { id: user.id, email: user.email } },
      });
      return;
    }

    if (!user.phoneVerified) {
      res.status(403).json({
        error: 'PHONE_NOT_VERIFIED',
        message:
          "Votre numéro de téléphone n'est pas encore vérifié. Veuillez saisir le code reçu par SMS pour activer votre compte.",
        data: { user: { id: user.id, email: user.email } },
      });
      return;
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
