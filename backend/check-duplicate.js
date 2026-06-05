const { PrismaClient } = require('@prisma/client');

const url = 'postgresql://postgres.nqoojfbceauiagypmofr:Elektromani%40%231@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
});

async function main() {
  try {
    console.log('Recherche de doublons dans la base Supabase...');
    const email = 'romain.piana@gmail.com';
    const username = 'Knr';
    const phone = '+33610745417';

    const userByEmail = await prisma.user.findUnique({ where: { email } });
    const userByUsername = await prisma.user.findUnique({ where: { username } });
    const userByPhone = await prisma.user.findUnique({ where: { phone } });

    console.log('Doublon Email :', userByEmail ? `Trouvé (ID: ${userByEmail.id})` : 'Aucun');
    console.log('Doublon Pseudo :', userByUsername ? `Trouvé (ID: ${userByUsername.id})` : 'Aucun');
    console.log('Doublon Téléphone :', userByPhone ? `Trouvé (ID: ${userByPhone.id})` : 'Aucun');
  } catch (error) {
    console.error('Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
