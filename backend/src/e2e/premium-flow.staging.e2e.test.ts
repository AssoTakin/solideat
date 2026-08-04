import request from 'supertest';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';

const STAGING_URL = 'https://solideat-staging-staging.up.railway.app';
const sk_test = process.env.STRIPE_SECRET_KEY;
const webhook_secret = process.env.STRIPE_WEBHOOK_SECRET;
const describeIfStripe = sk_test && sk_test.startsWith('sk_test_') && webhook_secret ? describe : describe.skip;

describeIfStripe('Premium meal flow E2E on STAGING', () => {
  let cookToken: string;
  let eaterToken: string;
  let cookId: string;
  let eaterId: string;
  let mealId: string;
  let reservationId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('TestE2E2026!', 10);
    const timestamp = Date.now();
    const cookEmail = `e2e-cook-staging-${timestamp}@solid-eat.com`;
    const eaterEmail = `e2e-eater-staging-${timestamp}@solid-eat.com`;

    await prisma.user.deleteMany({
      where: { email: { in: [cookEmail, eaterEmail] } },
    });

    const cook = await prisma.user.create({
      data: {
        email: cookEmail,
        passwordHash,
        firstName: 'Test',
        lastName: 'Cook',
        username: `e2ecook${timestamp % 100000}`,
        phone: `+336${String(timestamp % 100000000).padStart(8, '0')}`,
        addressStreet: '10 Rue de Rivoli',
        addressCity: 'Paris',
        addressZipCode: '75001',
        latitude: 48.8566,
        longitude: 2.3522,
        emailVerified: true,
        phoneVerified: true,
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    cookId = cook.id;

    const eater = await prisma.user.create({
      data: {
        email: eaterEmail,
        passwordHash,
        firstName: 'Test',
        lastName: 'Eater',
        username: `e2eeater${timestamp % 100000}`,
        phone: `+336${String((timestamp + 1) % 100000000).padStart(8, '0')}`,
        addressStreet: '15 Rue de Rivoli',
        addressCity: 'Paris',
        addressZipCode: '75001',
        latitude: 48.8566,
        longitude: 2.3522,
        emailVerified: true,
        phoneVerified: true,
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    eaterId = eater.id;

    const cookLogin = await request(STAGING_URL)
      .post('/api/auth/login')
      .send({ email: cookEmail, password: 'TestE2E2026!' });
    expect(cookLogin.status).toBe(200);
    cookToken = cookLogin.body.data.token;

    const eaterLogin = await request(STAGING_URL)
      .post('/api/auth/login')
      .send({ email: eaterEmail, password: 'TestE2E2026!' });
    expect(eaterLogin.status).toBe(200);
    eaterToken = eaterLogin.body.data.token;
  }, 30000);

  afterAll(async () => {
    if (reservationId) {
      await prisma.transaction.deleteMany({ where: { reservationId } });
      await prisma.reservation.deleteMany({ where: { id: reservationId } });
    }
    if (mealId) await prisma.meal.deleteMany({ where: { id: mealId } });
    if (cookId || eaterId) {
      await prisma.notification.deleteMany({
        where: { userId: { in: [cookId, eaterId].filter(Boolean) as string[] } },
      });
    }
    if (cookId) await prisma.user.deleteMany({ where: { id: cookId } });
    if (eaterId) await prisma.user.deleteMany({ where: { id: eaterId } });
    await prisma.$disconnect();
  }, 30000);

  it('should create premium meal, reserve, pay and pickup end-to-end', async () => {
    const stripe = new Stripe(sk_test!, { apiVersion: '2026-02-25.clover' as any });

    // Create real Connect account for cook
    const account = await stripe.accounts.create({
      type: 'standard',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: { name: 'Solideat Test Cook' },
    });

    await prisma.user.update({
      where: { id: cookId },
      data: { stripeConnectedAccountId: account.id },
    });

    const now = new Date();
    const future = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const pickupStart = new Date(future.getTime() + 12 * 60 * 60 * 1000);
    const pickupEnd = new Date(future.getTime() + 13 * 60 * 60 * 1000);

    const meal = await request(STAGING_URL)
      .post('/api/meals')
      .set('Authorization', `Bearer ${cookToken}`)
      .send({
        name: 'E2E Premium Meal Staging',
        photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        cuisine: 'Française',
        description: 'Test premium meal',
        preparationDate: now.toISOString(),
        serviceDate: future.toISOString(),
        pickupTimeStart: pickupStart.toISOString(),
        pickupTimeEnd: pickupEnd.toISOString(),
        pickupAddress: '12 Rue de Rivoli, 75001 Paris',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        ingredients: [{ name: 'Poulet' }, { name: 'Riz' }, { name: 'Carottes' }],
        portions: 1,
        price: 5,
      });
    expect(meal.status).toBe(201);
    mealId = meal.body.data.id;

    // Reserve
    const reserve = await request(STAGING_URL)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${eaterToken}`)
      .send({ mealId });
    expect(reserve.status).toBe(201);
    reservationId = reserve.body.data.id;

    // Initiate payment
    const pay = await request(STAGING_URL)
      .post(`/api/reservations/${reservationId}/pay`)
      .set('Authorization', `Bearer ${eaterToken}`)
      .send({});
    expect(pay.status).toBe(200);
    expect(pay.body.data.clientSecret).toMatch(/^pi_/);
    const realPaymentIntentId = pay.body.data.paymentIntentId;

    // Confirm with Stripe test card
    const pi = await stripe.paymentIntents.confirm(realPaymentIntentId, {
      payment_method: 'pm_card_visa',
      return_url: 'http://localhost:5173/reservations',
    });
    expect(pi.status).toBe('succeeded');

    // Manually send signed webhook to staging (Stripe delivery to staging is unreliable)
    const eventPayload = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2026-02-25.clover',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 1,
      request: { id: null, idempotency_key: null },
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: realPaymentIntentId,
          object: 'payment_intent',
          amount: 500,
          currency: 'eur',
          status: 'succeeded',
          metadata: { reservationId, type: 'meal_payment' },
        },
      },
    };

    const payloadString = JSON.stringify(eventPayload);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: webhook_secret!,
    });

    const webhookRes = await request(STAGING_URL)
      .post('/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payloadString);
    expect(webhookRes.status).toBe(200);

    // Verify reservation is PAID
    const paidRes = await prisma.reservation.findUnique({ where: { id: reservationId } });
    expect(paidRes?.paymentStatus).toBe('PAID');

    // Pickup
    const pickup = await request(STAGING_URL)
      .put(`/api/reservations/${reservationId}/pickup`)
      .set('Authorization', `Bearer ${cookToken}`);
    expect(pickup.status).toBe(200);

    // Wait for async payout status update
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify final status
    const finalRes = await prisma.reservation.findUnique({ where: { id: reservationId } });
    expect(finalRes?.paymentStatus).toBe('PAYOUT_DONE');
  }, 120000);
});
