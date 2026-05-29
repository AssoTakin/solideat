import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSMTP() {
  const host = process.env.SMTP_HOST || 'smtp.resend.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const user = process.env.SMTP_USER || 'resend';
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const to = process.argv[2] || process.env.EMAIL_TO;

  console.log('--- TEST DE CONFIGURATION SMTP ---');
  console.log(`SMTP Host: ${host}`);
  console.log(`SMTP Port: ${port}`);
  console.log(`SMTP User: ${user}`);
  console.log(`SMTP Pass: ${pass ? '••••••••' + pass.slice(-4) : 'NON DÉFINI'}`);
  console.log(`Email From: ${from}`);
  console.log(`Email To: ${to || 'NON DÉFINI (passer en argument du script : npm run test-smtp <email>)'}`);

  if (!pass) {
    console.error('❌ Erreur: SMTP_PASS n\'est pas défini dans le fichier .env');
    return;
  }

  if (!to) {
    console.error('❌ Erreur: Veuillez spécifier un destinataire (ex: npm run test-smtp destinataire@example.com)');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    debug: true, // Activer les logs de debug de nodemailer
    logger: true, // Logger les transactions SMTP
  });

  try {
    console.log('\nConnexion au serveur SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie !');

    console.log('\nEnvoi du mail de test...');
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Test de configuration SMTP Solid'Eat",
      text: "Ceci est un e-mail de test pour valider la configuration SMTP Resend.",
      html: "<h1>Test SMTP Réussi !</h1><p>Si vous lisez ceci, l'envoi de mail via Resend fonctionne parfaitement.</p>",
    });

    console.log('✅ E-mail envoyé avec succès !');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error: any) {
    console.error('\n❌ Échec de l\'envoi ou de la vérification SMTP :');
    console.error(error);
  }
}

testSMTP();
