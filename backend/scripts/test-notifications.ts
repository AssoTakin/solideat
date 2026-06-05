import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/config/database';
import { notificationService } from '../src/services/notification.service';
import { NotificationType } from '@prisma/client';

async function testNotification() {
  console.log("🚀 Lancement du test des notifications...");

  try {
    // 1. Récupérer le premier utilisateur de la base de données
    let user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (!user) {
      console.warn("⚠️ Aucun utilisateur trouvé. Création d'un utilisateur de test temporaire...");
      // Créer un utilisateur temporaire pour le test
      user = await prisma.user.create({
        data: {
          email: 'test-notifications@solideat.fr',
          passwordHash: 'dummyhash',
          firstName: 'Jean',
          lastName: 'Dupont',
          username: 'jeandupont_test',
          addressStreet: '1 Rue de la Paix',
          addressZipCode: '75001',
          addressCity: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      });
      console.log(`👤 Utilisateur de test créé : ${user.firstName} (${user.email}) | ID: ${user.id}`);
    } else {
      console.log(`👤 Utilisateur existant ciblé : ${user.firstName} (${user.email}) | ID: ${user.id}`);
    }

    // 2. Envoyer une notification de test
    console.log("📨 Envoi de la notification (in-app + e-mail + push)...");
    await notificationService.sendNotification(
      user.id,
      NotificationType.SYSTEM_MESSAGE,
      "Test de notification SOLID'EAT",
      "Félicitations ! Votre système de notifications a été mis à jour et fonctionne maintenant de manière optimale avec des templates d'e-mail propres.",
      "/help",
      true
    );

    console.log("✅ Appel à sendNotification terminé.");

    // 3. Vérifier en base si elle a été créée
    const createdNotification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        title: "Test de notification SOLID'EAT",
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (createdNotification) {
      console.log(`🎉 Notification enregistrée en base avec succès ! ID: ${createdNotification.id}`);
      console.log(`📝 Contenu : "${createdNotification.message}"`);
    } else {
      console.error("❌ La notification n'a pas été trouvée en base de données.");
    }

    // Supprimer l'utilisateur temporaire si c'était celui-là
    if (user.email === 'test-notifications@solideat.fr') {
      console.log("🧹 Nettoyage de l'utilisateur de test temporaire...");
      await prisma.user.delete({ where: { id: user.id } });
      console.log("✅ Utilisateur temporaire supprimé.");
    }

  } catch (error: any) {
    console.error("❌ Une erreur s'est produite lors du test :", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotification();
