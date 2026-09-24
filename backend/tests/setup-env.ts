// Variables d'environnement minimum pour les tests d'intégration
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret_for_jest_only';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_jest';
process.env.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_for_jest';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://solid-eat.com';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/solideat_test';
process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
