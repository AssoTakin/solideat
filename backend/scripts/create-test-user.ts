import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Création de l\'utilisateur de test...');

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash('Formule1', 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'test@gmail.com',
        passwordHash,
        phone: '+33612345678',
        phoneVerified: true,
        emailVerified: true,
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        addressStreet: '123 Rue de la Paix',
        addressZipCode: '75001',
        addressCity: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        cguAcceptedAt: new Date(),
        sanitaryCharterAcceptedAt: new Date(),
      },
    });

    console.log('✅ Utilisateur créé avec succès !');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email vérifié: ${user.emailVerified}`);
    console.log(`   Téléphone vérifié: ${user.phoneVerified}`);
    console.log('\n🔑 Identifiants de connexion :');
    console.log('   Email: test@gmail.com');
    console.log('   Mot de passe: Formule1');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  L\'utilisateur existe déjà. Mise à jour...');
      const passwordHash = await bcrypt.hash('Formule1', 12);
      const user = await prisma.user.update({
        where: { email: 'test@gmail.com' },
        data: {
          passwordHash,
          phoneVerified: true,
          emailVerified: true,
        },
      });
      console.log('✅ Utilisateur mis à jour avec succès !');
      console.log(`   Email: ${user.email}`);
      console.log(`   Mot de passe réinitialisé`);
    } else {
      console.error('❌ Erreur:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
