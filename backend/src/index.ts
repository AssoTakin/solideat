import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupMealExpirationJob, setupSaveThemJob, setupReviewReminderJob } from './jobs/meal.jobs';
import { setupBonusExpirationJob } from './jobs/bonus.jobs';
import { setupSubscriptionRenewalJob } from './jobs/subscription.jobs';
import { setupSanctionCheckJob } from './jobs/sanction.jobs';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
// etc.

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Démarrage du serveur (seulement si pas en mode test et si le script est exécuté directement)
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const server = app.listen(PORT, () => {
    // Démarrer les jobs cron
    setupMealExpirationJob();
    setupSaveThemJob();
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
