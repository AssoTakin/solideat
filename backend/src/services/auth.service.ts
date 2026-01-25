import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterDto } from '../validators/auth.validator';
import { geolocationService } from './geolocation.service';
import { emailService } from './email.service';
import { smsService } from './sms.service';
import prisma from '../config/database';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  token: string;
}

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterDto): Promise<{ user: any; emailToken: string; phoneCode: string }> {
    // Vérifier que l'email n'existe pas déjà
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUserByEmail) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Vérifier que le pseudo n'existe pas déjà
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUserByUsername) {
      throw new Error('Ce pseudo est déjà utilisé');
    }

    // Vérifier que le téléphone n'existe pas déjà
    if (data.phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (existingUserByPhone) {
        throw new Error('Ce numéro de téléphone est déjà utilisé');
      }
    }

    // Géocoder l'adresse
    const geocodeResult = await geolocationService.validateAndGeocodeAddress(
      `${data.addressStreet}, ${data.addressZipCode} ${data.addressCity}`
    );

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Générer les tokens de vérification
    const emailToken = jwt.sign(
      { email: data.email, type: 'email-verification' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    const phoneCode = smsService.generateVerificationCode();

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        phone: data.phone,
        phoneVerified: false,
        emailVerified: false,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        addressStreet: data.addressStreet,
        addressZipCode: data.addressZipCode,
        addressCity: data.addressCity,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        description: data.description,
        culinaryStyle: data.culinaryStyle,
        cguAcceptedAt: new Date(),
        sanitaryCharterAcceptedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    // Envoyer les emails et SMS (en arrière-plan, ne pas bloquer)
    emailService.sendVerificationEmail(data.email, emailToken).catch((error) => {
      console.error('[AuthService] Erreur lors de l\'envoi de l\'email de vérification lors de l\'inscription:', error);
    });
    if (data.phone) {
      smsService.sendVerificationSMS(data.phone, phoneCode).catch(() => {
        // Erreur silencieuse
      });
    }

    // Stocker le code téléphone dans Redis (pour l'instant, on le retourne)
    // TODO: Implémenter Redis pour stocker le code avec expiration

    return {
      user,
      emailToken,
      phoneCode, // En développement, on retourne le code. En production, ne pas le retourner.
    };
  }

  /**
   * Vérification de l'email
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      console.log('[AuthService] Début de la vérification d\'email avec token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;

      if (decoded.type !== 'email-verification') {
        console.error('[AuthService] Type de token invalide:', decoded.type);
        throw new Error('Token invalide');
      }

      console.log('[AuthService] Token décodé pour email:', decoded.email);

      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        console.error('[AuthService] Utilisateur non trouvé pour email:', decoded.email);
        throw new Error('Utilisateur non trouvé');
      }

      console.log('[AuthService] Utilisateur trouvé:', {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      });

      if (user.emailVerified) {
        console.log('[AuthService] Email déjà vérifié');
        return true; // Déjà vérifié
      }

      console.log('[AuthService] Mise à jour du statut emailVerified à true');
      const updatedUser = await prisma.user.update({
        where: { email: decoded.email },
        data: { emailVerified: true },
      });

      console.log('[AuthService] Email vérifié avec succès:', {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
      });

      return true;
    } catch (error: any) {
      console.error('[AuthService] Erreur lors de la vérification d\'email:', error);
      throw new Error('Token de vérification invalide ou expiré');
    }
  }

  /**
   * Vérification du téléphone
   */
  async verifyPhone(userId: string, _code: string): Promise<boolean> {
    // TODO: Récupérer le code depuis Redis et vérifier
    // Pour l'instant, on accepte n'importe quel code en développement
    // En production, il faudra stocker le code dans Redis avec expiration

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.phoneVerified) {
      return true; // Déjà vérifié
    }

    // TODO: Vérifier le code avec Redis
    // Pour l'instant, on accepte le code
    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true },
    });

    return true;
  }

  /**
   * Connexion
   */
  async login(email: string, password: string): Promise<AuthResult> {
    console.log('[AuthService] Tentative de connexion pour email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error('[AuthService] Utilisateur non trouvé pour email:', email);
      throw new Error('Email ou mot de passe incorrect');
    }

    console.log('[AuthService] Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    });

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      console.error('[AuthService] Mot de passe incorrect pour email:', email);
      throw new Error('Email ou mot de passe incorrect');
    }

    // Pour le MVP, permettre la connexion avec seulement l'email vérifié
    // La vérification du téléphone peut être faite plus tard
    if (!user.emailVerified) {
      console.warn('[AuthService] Email non vérifié:', {
        email: user.email,
        emailVerified: user.emailVerified,
      });
      throw new Error('Votre email n\'est pas encore vérifié. Veuillez cliquer sur le lien reçu par email pour vérifier votre compte.');
    }

    // Avertir si le téléphone n'est pas vérifié, mais permettre la connexion
    if (!user.phoneVerified) {
      console.warn('[AuthService] Téléphone non vérifié (connexion autorisée):', {
        email: user.email,
        phoneVerified: user.phoneVerified,
      });
      // On permet la connexion mais on pourrait ajouter un flag pour demander la vérification plus tard
    }

    console.log('[AuthService] Connexion réussie pour email:', email);

    // Générer le JWT
    const token = this.generateJWT(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      token,
    };
  }

  /**
   * Génère un JWT token
   */
  generateJWT(user: { id: string; email: string; subscriptionType: string }): string {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = {
      userId: user.id,
      email: user.email,
      subscriptionType: user.subscriptionType,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
    return jwt.sign(payload, secret, options);
  }

  /**
   * Vérifie un JWT token
   */
  verifyJWT(token: string): { userId: string; email: string; subscriptionType: string } {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        subscriptionType: decoded.subscriptionType,
      };
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Mot de passe oublié - Génère un token de réinitialisation
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return;
    }

    // Générer un token de réinitialisation valide 1 heure
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1h' }
    );

    // Envoyer l'email avec le lien de réinitialisation
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;

      if (decoded.type !== 'password-reset') {
        throw new Error('Token invalide');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Hasher le nouveau mot de passe
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash },
      });

      return true;
    } catch (error) {
      throw new Error('Token de réinitialisation invalide ou expiré');
    }
  }
}

export const authService = new AuthService();
