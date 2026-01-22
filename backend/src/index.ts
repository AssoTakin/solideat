import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupMealExpirationJob, setupSaveThemJob, setupReviewReminderJob } from './jobs/meal.jobs';
import { setupBonusExpirationJob } from './jobs/bonus.jobs';
import { setupSubscriptionRenewalJob } from './jobs/subscription.jobs';

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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
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
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Démarrer les jobs cron (seulement si pas en mode test)
  if (process.env.NODE_ENV !== 'test') {
    setupMealExpirationJob();
    setupSaveThemJob();
    setupReviewReminderJob();
    setupBonusExpirationJob();
    setupSubscriptionRenewalJob();
    console.log('✅ Tous les jobs cron sont configurés');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
