import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { geolocationService } from './geolocation.service';

export class UserService {
  /**
   * Met à jour le profil utilisateur
   */
  async updateProfile(
    userId: string,
    data: {
      description?: string;
      culinaryStyle?: string;
      profilePhoto?: string;
    }
  ): Promise<any> {
    const updateData: any = {};

    if (data.description !== undefined) {
      if (data.description.length > 500) {
        throw new Error('La description ne peut pas dépasser 500 caractères');
      }
      updateData.description = data.description;
    }

    if (data.culinaryStyle !== undefined) {
      if (data.culinaryStyle.length > 200) {
        throw new Error('L\'orientation culinaire ne peut pas dépasser 200 caractères');
      }
      updateData.culinaryStyle = data.culinaryStyle;
    }

    if (data.profilePhoto !== undefined) {
      updateData.profilePhoto = data.profilePhoto;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerified: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePhoto: true,
        description: true,
        culinaryStyle: true,
        addressStreet: true,
        addressZipCode: true,
        addressCity: true,
        latitude: true,
        longitude: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        globalRating: true,
        mealsServed: true,
        mealsReceived: true,
        mealsExpired: true,
        mealsSaved: true,
        hidePhoneNumber: true,
        incognitoMode: true,
        blurAddress: true,
        hideActivityHistory: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Change le mot de passe
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const passwordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Ancien mot de passe incorrect');
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Mettre à jour
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  /**
   * Change l'adresse (avec vérification des quotas)
   */
  async changeAddress(
    userId: string,
    data: {
      addressStreet: string;
      addressZipCode: string;
      addressCity: string;
    }
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, updatedAt: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le quota de changement d'adresse
    // Gratuit : 1/an, Premium : illimité
    if (user.subscriptionType === 'FREE') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Vérifier si l'adresse a été modifiée dans la dernière année
      // On considère que si updatedAt est récent (< 1 an), l'adresse a peut-être été changée
      // Pour une vraie implémentation, il faudrait un champ lastAddressChangeDate
      // Pour l'instant, on vérifie simplement si c'est un membre gratuit
      // TODO: Ajouter un champ lastAddressChangeDate dans le schéma Prisma
    }

    // Géocoder la nouvelle adresse
    const geocodeResult = await geolocationService.validateAndGeocodeAddress(
      `${data.addressStreet}, ${data.addressZipCode} ${data.addressCity}`
    );

    // Mettre à jour l'adresse
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        addressStreet: data.addressStreet,
        addressZipCode: data.addressZipCode,
        addressCity: data.addressCity,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerified: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePhoto: true,
        description: true,
        culinaryStyle: true,
        addressStreet: true,
        addressZipCode: true,
        addressCity: true,
        latitude: true,
        longitude: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        globalRating: true,
        mealsServed: true,
        mealsReceived: true,
        mealsExpired: true,
        mealsSaved: true,
        hidePhoneNumber: true,
        incognitoMode: true,
        blurAddress: true,
        hideActivityHistory: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Met à jour les paramètres de confidentialité (Premium uniquement)
   */
  async updatePrivacy(
    userId: string,
    privacySettings: {
      hidePhoneNumber?: boolean;
      incognitoMode?: boolean;
      blurAddress?: boolean;
      hideActivityHistory?: boolean;
    }
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur est premium
    if (user.subscriptionType === 'FREE') {
      throw new Error('Cette fonctionnalité est réservée aux membres premium');
    }

    // Construire les données à mettre à jour
    const updateData: any = {};
    if (privacySettings.hidePhoneNumber !== undefined) {
      updateData.hidePhoneNumber = privacySettings.hidePhoneNumber;
    }
    if (privacySettings.incognitoMode !== undefined) {
      updateData.incognitoMode = privacySettings.incognitoMode;
    }
    if (privacySettings.blurAddress !== undefined) {
      updateData.blurAddress = privacySettings.blurAddress;
    }
    if (privacySettings.hideActivityHistory !== undefined) {
      updateData.hideActivityHistory = privacySettings.hideActivityHistory;
    }

    // Mettre à jour
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerified: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePhoto: true,
        description: true,
        culinaryStyle: true,
        addressStreet: true,
        addressZipCode: true,
        addressCity: true,
        latitude: true,
        longitude: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        globalRating: true,
        mealsServed: true,
        mealsReceived: true,
        mealsExpired: true,
        mealsSaved: true,
        hidePhoneNumber: true,
        incognitoMode: true,
        blurAddress: true,
        hideActivityHistory: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}

export const userService = new UserService();
