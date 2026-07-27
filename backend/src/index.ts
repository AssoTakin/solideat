import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';
import { setupMealExpirationJob, setupAntiGaspiJob, setupReviewReminderJob } from './jobs/meal.jobs';
import { setupBonusExpirationJob } from './jobs/bonus.jobs';
import { setupSubscriptionRenewalJob } from './jobs/subscription.jobs';
import { setupSanctionCheckJob } from './jobs/sanction.jobs';

// Charger les variables d'environnement
dotenv.config();

// Générer les clés VAPID locales si elles n'existent pas
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("🔑 Génération des clés VAPID locales pour le développement...");
  const keys = webpush.generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = keys.publicKey;
  process.env.VAPID_PRIVATE_KEY = keys.privateKey;

  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf-8');
      envContent = envContent
        .split('\n')
        .filter((line) => !line.startsWith('VAPID_PUBLIC_KEY=') && !line.startsWith('VAPID_PRIVATE_KEY='))
        .join('\n');
      envContent += `\nVAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\n`;
      fs.writeFileSync(envPath, envContent, 'utf-8');
      console.log("✅ Clés VAPID enregistrées dans .env");
    }
  } catch (error: any) {
    console.warn("⚠️ Échec de l'écriture des clés VAPID dans .env :", error.message);
  }
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Configuration CORS dynamique (supporte les variantes www/non-www et mobiles)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173'];

const originsWithVariants = [...allowedOrigins];
allowedOrigins.forEach((origin) => {
  if (origin.startsWith('https://') && !origin.includes('www.')) {
    originsWithVariants.push(origin.replace('https://', 'https://www.'));
  } else if (origin.startsWith('https://www.')) {
    originsWithVariants.push(origin.replace('https://www.', 'https://'));
  } else if (origin.startsWith('http://') && !origin.includes('www.')) {
    originsWithVariants.push(origin.replace('http://', 'http://www.'));
  } else if (origin.startsWith('http://www.')) {
    originsWithVariants.push(origin.replace('http://www.', 'http://'));
  }
});

// Ajouter les schémas mobiles Capacitor pour éviter des soucis CORS sur iOS/Android
originsWithVariants.push('capacitor://localhost');
originsWithVariants.push('http://localhost'); // Android local webview origin

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origine (ex: outils de test API, requêtes serveurs)
    if (!origin) return callback(null, true);
    
    if (originsWithVariants.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Non autorisé par CORS: ${origin}`));
    }
  },
  credentials: true,
}));
// IMPORTANT: Les webhooks Stripe doivent être configurés AVANT express.json()
// car ils nécessitent le body brut pour la vérification de signature
import stripeRoutes from './routes/stripe.routes';
import adminRoutes from './routes/admin.routes';
app.use('/webhooks', express.raw({ type: 'application/json' }), stripeRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/admin', adminRoutes);

// Route de base
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Solid\'Eat API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      webhooks: '/webhooks/stripe',
    },
  });
});

// Health check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import mealRoutes from './routes/meal.routes';
import reservationRoutes from './routes/reservation.routes';
import messageRoutes from './routes/message.routes';
import reviewRoutes from './routes/review.routes';
import notificationRoutes from './routes/notification.routes';
import subscriptionRoutes from './routes/subscription.routes';
import bonusDonorRoutes from './routes/bonus-donor.routes';
import badgeRoutes from './routes/badge.routes';
import pushRoutes from './routes/push.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/bonus-donors', bonusDonorRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/push', pushRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error in Express handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Something went wrong',
  });
});

// Démarrage du serveur (seulement si pas en mode test et si le script est exécuté directement)
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const server = app.listen(PORT, () => {
    // Démarrer les jobs cron
    setupMealExpirationJob();
    setupAntiGaspiJob();
    setupReviewReminderJob();
    setupBonusExpirationJob();
    setupSubscriptionRenewalJob();
    setupSanctionCheckJob();
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
} else if (process.env.NODE_ENV === 'test') {
  // En mode test, ne pas démarrer les jobs cron
  // Les mocks s'en chargeront
}


export default app;
