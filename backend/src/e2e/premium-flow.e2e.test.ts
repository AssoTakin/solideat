import request from 'supertest';
import app from '../../index';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';

const sk_test = process.env.STRIPE_SECRET_KEY;
const describeIfStripe = sk_test && sk_test.startsWith('sk_test_') ? describe : describe.skip;

// Mock the entire stripe.service module for HTTP E2E tests
jest.mock('../../services/stripe.service', () => {
  const actualModule = jest.requireActual('../../services/stripe.service');
  return {
    ...actualModule,
    stripeService: {
      ...actualModule.stripeService,
      isConnectedAccountReady: jest.fn().mockResolvedValue(true),
      createConnectedAccount: jest.fn().mockResolvedValue({ id: 'acct_test_e2e' }),
      createAccountLink: jest.fn().mockResolvedValue({ url: 'https://connect.stripe.com/test-onboarding' }),
      getOrCreateCustomer: jest.fn().mockImplementation(async (userId, email) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any });
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) return customers.data[0].id;
        const customer = await stripe.customers.create({ email, metadata: { userId } });
        return customer.id;
      }),
      createMealPaymentIntent: jest.fn().mockImplementation(async (buyerCustomerId, cookConnectedAccountId, reservationId) => {
        // Create a real Stripe PI without destination to avoid capability issues
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any });
        const pi = await stripe.paymentIntents.create({
          amount: 500,
          currency: 'eur',
          customer: buyerCustomerId,
          metadata: { reservationId, type: 'meal_payment' },
          automatic_payment_methods: { enabled: true },
        });
        return {
          id: pi.id,
          client_secret: pi.client_secret,
          amount: 500,
          application_fee_amount: 100,
          transfer_data: { destination: cookConnectedAccountId },
        } as any;
      }),
    },
  };
});


describeIfStripe('Premium meal flow E2E', () => {
  let cookToken: string;
  let eaterToken: string;
  let cookId: string;
  let eaterId: string;
  let mealId: string;
  let reservationId: string;
  let realPaymentIntentId: string;

  beforeAll(async () => {
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: ['e2e-cook@test.com', 'e2e-eater@test.com'] } },
      select: { id: true },
    });
    const userIds = existingUsers.map((u) => u.id);

    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.transaction.deleteMany({ where: { OR: [{ buyerId: { in: userIds } }, { cookId: { in: userIds } }] } });
    await prisma.reservation.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { meal: { cookId: { in: userIds } } }] } });
    await prisma.meal.deleteMany({ where: { cookId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });

    const passwordHash = await bcrypt.hash('TestE2E2026!', 10);

    const cook = await prisma.user.create({
      data: {
        email: 'e2e-cook@test.com',
        passwordHash,
        firstName: 'Test',
        lastName: 'Cook',
        username: 'e2ecooktest',
        phone: '+33600000003',
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
        email: 'e2e-eater@test.com',
        passwordHash,
        firstName: 'Test',
        lastName: 'Eater',
        username: 'e2eeatertest',
        phone: '+33600000004',
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

    const cookLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'e2e-cook@test.com', password: 'TestE2E2026!' });
    expect(cookLogin.status).toBe(200);
    cookToken = cookLogin.body.data.token;

    const eaterLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'e2e-eater@test.com', password: 'TestE2E2026!' });
    expect(eaterLogin.status).toBe(200);
    eaterToken = eaterLogin.body.data.token;
  }, 30000);

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.notification.deleteMany({ where: { userId: { in: [cookId, eaterId] } } });
    await prisma.transaction.deleteMany({ where: { OR: [{ buyerId: { in: [cookId, eaterId] } }, { cookId: { in: [cookId, eaterId] } }] } });
    await prisma.reservation.deleteMany({
      where: { OR: [{ userId: { in: [cookId, eaterId] } }, { meal: { cookId: { in: [cookId, eaterId] } } }] },
    });
    await prisma.meal.deleteMany({ where: { cookId: { in: [cookId, eaterId] } } });
    await prisma.notification.deleteMany({ where: { userId: { in: [cookId, eaterId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [cookId, eaterId] } } });
    await prisma.$disconnect();
  }, 30000);

  it('should create a Stripe Connect account for the cook', async () => {
    const res = await request(app)
      .post('/api/users/me/connect-account')
      .set('Authorization', `Bearer ${cookToken}`)
      .send({})
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: cookId } });
    expect(user?.stripeConnectedAccountId).toBeTruthy();
  });

  it('should create a premium meal priced at 5€', async () => {
    const now = new Date();
    const future = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const pickupStart = new Date(future.getTime() + 12 * 60 * 60 * 1000);
    const pickupEnd = new Date(future.getTime() + 13 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${cookToken}`)
      .send({
        name: 'E2E Premium Meal',
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

    expect(res.status).toBe(201);
    expect(res.body.data.price).toBe(5);
    mealId = res.body.data.id;
  });

  it('should reserve the premium meal', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${eaterToken}`)
      .send({ mealId });

    expect(res.status).toBe(201);
    expect(res.body.data.mealId).toBe(mealId);
    reservationId = res.body.data.id;
  });

  it('should initiate Stripe payment for the reservation', async () => {
    const res = await request(app)
      .post(`/api/reservations/${reservationId}/pay`)
      .set('Authorization', `Bearer ${eaterToken}`)
      .send({})
      .timeout(30000);

    console.log("Pay response:", res.status, res.body);
    expect(res.status).toBe(200);
    expect(res.body.data.clientSecret).toMatch(/^pi_/);
    expect(res.body.data.paymentIntentId).toMatch(/^pi_/);
    realPaymentIntentId = res.body.data.paymentIntentId;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    expect(reservation?.stripePaymentIntentId).toBe(realPaymentIntentId);
  });

  it('should confirm payment with Stripe test card and update reservation to PAID', async () => {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/payment_intents/${realPaymentIntentId}/confirm`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${sk_test}` },
        body: new URLSearchParams({
          payment_method: 'pm_card_visa',
          return_url: 'http://localhost:5173/reservations',
        }),
      }
    );
    expect(stripeRes.status).toBe(200);
    const pi: any = await stripeRes.json();
    expect(pi.status).toBe('succeeded');
    expect(pi.amount).toBe(500);

    const chargeId = pi.charges.data[0].id;

    const webhookPayload = {
      id: 'evt_test_e2e_premium',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: realPaymentIntentId,
          object: 'payment_intent',
          status: 'succeeded',
          amount: 500,
          amount_received: 500,
          application_fee_amount: 100,
          currency: 'eur',
          metadata: { reservationId, type: 'meal_payment' },
          charges: { data: [{ id: chargeId, object: 'charge' }] },
        },
      },
    };

    const stripeSdk = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any });
    const payloadString = JSON.stringify(webhookPayload);
    const header = stripeSdk.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });

    const whRes = await request(app)
      .post('/webhooks/stripe')
      .set('Stripe-Signature', header)
      .set('Content-Type', 'application/json')
      .send(payloadString);
    console.log("Webhook response:", whRes.status, whRes.body);

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    expect(reservation?.paymentStatus).toBe('PAID');

    const transaction = await prisma.transaction.findFirst({
      where: { reservationId },
    });
    expect(transaction).toBeTruthy();
    expect(transaction?.amount).toBe(5);
    expect(transaction?.platformFee).toBe(1);
    expect(transaction?.netAmount).toBe(4);
    expect(transaction?.status).toBe('PAID');
  });

  it('should mark meal as picked up and set reservation to PAYOUT_DONE', async () => {
    const res = await request(app)
      .put(`/api/reservations/${reservationId}/pickup`)
      .set('Authorization', `Bearer ${cookToken}`);

    expect(res.status).toBe(200);

    // Wait for async payoutAfterPickup to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    expect(reservation?.paymentStatus).toBe('PAYOUT_DONE');
    expect(reservation?.pickedUpAt).toBeTruthy();
    expect(reservation?.payoutAmount).toBe(400);

    const transaction = await prisma.transaction.findFirst({
      where: { reservationId },
    });
    expect(transaction?.status).toBe('PAYOUT_DONE');
  });
});
