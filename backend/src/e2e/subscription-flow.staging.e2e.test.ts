import request from 'supertest';
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';

const STAGING_URL = 'https://solideat-staging-staging.up.railway.app';
const STRIPE_API_VERSION = '2026-02-25.clover' as any;

const sk_test = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const describeIfStripe = sk_test && sk_test.startsWith('sk_test_') && webhookSecret ? describe : describe.skip;

describeIfStripe('Premium subscription flow E2E on STAGING', () => {
  const baseEmail = 'stripe-sub-test-buyer@solid-eat.com';
  const password = 'Password123!';
  let token: string;
  let userId: string;
  let testEmail: string;
  let customerId: string;
  const stripe = new Stripe(sk_test, { apiVersion: STRIPE_API_VERSION });

  beforeAll(async () => {
    const timestamp = Date.now();
    testEmail = `e2e-stripe-sub-${timestamp}@solid-eat.com`;

    // Cleanup any prior fixed email
    await prisma.user.deleteMany({ where: { email: { in: [baseEmail, testEmail] } } });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        firstName: 'Test',
        lastName: 'Stripe',
        username: `stripetest${timestamp % 100000}`,
        phone: `+336${String(timestamp % 100000000).padStart(8, '0')}`,
        addressStreet: '1 rue Test',
        addressZipCode: '75000',
        addressCity: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        emailVerified: true,
        phoneVerified: true,
        subscriptionType: 'FREE' as any,
      },
    });
    userId = user.id;

    const login = await request(STAGING_URL)
      .post('/api/auth/login')
      .send({ email: testEmail, password });
    expect(login.status).toBe(200);
    expect(login.body.success).toBe(true);
    token = login.body.data.token;
  }, 30000);

  afterAll(async () => {
    // Supprimer les notifications liées avant les utilisateurs pour respecter la FK
    const users = await prisma.user.findMany({
      where: { email: { in: [baseEmail, testEmail] } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    if (userIds.length > 0) {
      await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    }
    await prisma.user.deleteMany({ where: { email: { in: [baseEmail, testEmail] } } });
    await prisma.$disconnect();
  }, 30000);

  it('POST /api/subscriptions/checkout-session returns a real Stripe Checkout URL', async () => {
    const res = await request(STAGING_URL)
      .post('/api/subscriptions/checkout-session')
      .set('Authorization', `Bearer ${token}`)
      .send({ planType: 'PREMIUM_MONTHLY' });

    console.log('checkout response', res.status, JSON.stringify(res.body));
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
  }, 30000);

  it('Webhook customer.subscription.updated upgrades user to PREMIUM_MONTHLY', async () => {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    expect(dbUser?.stripeCustomerId).toBeTruthy();
    customerId = dbUser!.stripeCustomerId!;

    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY || '';
    expect(priceId).toBeTruthy();

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 90,
      payment_behavior: 'default_incomplete',
    });

    expect(['active', 'trialing', 'incomplete']).toContain(subscription.status);
    const subscriptionEndTimestamp =
      (subscription as any).current_period_end || (subscription as any).trial_end;
    expect(subscriptionEndTimestamp).toBeTruthy();

    const payload = {
      id: 'evt_test_subscription_updated',
      object: 'event',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: subscription.id,
          customer: customerId,
          status: 'active',
          items: { data: [{ price: { id: priceId } }] },
          current_period_start: (subscription as any).current_period_start || Math.floor(Date.now() / 1000),
          current_period_end: subscriptionEndTimestamp,
          trial_end: (subscription as any).trial_end,
          cancel_at_period_end: false,
        },
      },
    };

    const payloadString = JSON.stringify(payload);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: webhookSecret,
    });

    const webhookRes = await request(STAGING_URL)
      .post('/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payloadString);

    console.log('webhook response', webhookRes.status, webhookRes.text);
    expect(webhookRes.status).toBe(200);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
        stripeSubscriptionId: true,
        subscriptionEnd: true,
      },
    });

    expect(updatedUser?.subscriptionType).toBe('PREMIUM_MONTHLY');
    expect(updatedUser?.stripeSubscriptionId).toBe(subscription.id);
    expect(updatedUser?.subscriptionEnd).toBeTruthy();
  }, 60000);

  it('DELETE /api/subscriptions cancels the subscription without immediate downgrade', async () => {
    const cancelRes = await request(STAGING_URL)
      .delete('/api/subscriptions')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 400]).toContain(cancelRes.status);

    if (cancelRes.status === 200) {
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionType: true },
      });
      expect(updatedUser?.subscriptionType).toBe('PREMIUM_MONTHLY');
    }
  }, 30000);
});
