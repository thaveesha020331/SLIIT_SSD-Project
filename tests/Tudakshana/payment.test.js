/**
 * Payment API – Tudakshana (mounted at /api/payments)
 * Run: npm run test:tudakshana
 */
process.env.NODE_ENV = 'test';

import { jest, describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import connectDB from '../../config/db.js';
import app from '../../Server.js';
import User from '../../models/Tudakshana/User.js';
import Product from '../../models/Lakna/Product.js';
import Order from '../../models/Thaveesha/Order.js';
import Payment from '../../models/Tudakshana/Payment.js';

const API_AUTH = '/api/auth';
const API_PAY = '/api/payments';

let authToken = null;
let testUserId = null;
let testProductId = null;

const testEmailPrefix = 'tudakshana_payment_test_';
const testEmail = () => `${testEmailPrefix}${Date.now()}@example.com`;

function auth() {
  const token = `Bearer ${authToken}`;
  return {
    get: (path) => request(app).get(path).set('Authorization', token),
    post: (path) => request(app).post(path).set('Authorization', token),
  };
}

async function createTestOrder(total = 29.99) {
  return Order.create({
    user: testUserId,
    items: [
      {
        product: testProductId,
        quantity: 1,
        priceSnapshot: total,
      },
    ],
    total,
    status: 'pending',
    shippingAddress: '99 Payment Test Lane, Colombo',
    phone: '0779998888',
    notes: '',
  });
}

const validCardBody = (orderId) => ({
  orderId,
  cardNumber: '4111111111111111',
  expiryMonth: 12,
  expiryYear: 2035,
  cvv: '123',
  cardholderName: 'Test Cardholder',
});

describe('Payment Endpoints – Tudakshana (/api/payments)', () => {
  beforeAll(async () => {
    await connectDB();
    const reg = await request(app)
      .post(`${API_AUTH}/register`)
      .send({
        name: 'Payment Test User',
        email: testEmail(),
        password: 'password123',
        role: 'customer',
      });
    expect(reg.status).toBe(201);
    authToken = reg.body.data?.token || reg.body.token;
    testUserId = reg.body.data?.user?.id || reg.body.user?.id;
    expect(authToken).toBeTruthy();

    const product = await Product.create({
      title: 'Payment Test Product',
      description: 'Description for payment test at least ten chars.',
      price: 29.99,
      stock: 50,
      category: 'Reusable',
      productCategory: 'Kitchen',
      image: 'https://example.com/pay-test.jpg',
      ecocertification: 'Carbon Neutral',
      createdBy: testUserId,
      isActive: true,
    });
    testProductId = product._id.toString();
  }, 60000);

  afterAll(async () => {
    try {
      await Payment.deleteMany({ user: testUserId });
      await Order.deleteMany({ user: testUserId });
      await Product.deleteMany({ _id: testProductId });
      await User.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
      console.log('\n  Tudakshana payment tests completed. Cleanup done.');
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  });

  describe(`POST ${API_PAY}/process-cod`, () => {
    it('(Positive) should confirm COD and link payment to order', async () => {
      const order = await createTestOrder(40);
      const res = await auth().post(`${API_PAY}/process-cod`).send({ orderId: order._id.toString() });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payment?.status).toBe('completed');
      expect(res.body.payment?.paymentMethod).toBe('cash_on_delivery');
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    });

    it('(Negative) should return 401 without token', async () => {
      const res = await request(app).post(`${API_PAY}/process-cod`).send({ orderId: '000000000000000000000000' });
      expect(res.status).toBe(401);
    });

    it('(Negative) should return 404 when order does not exist', async () => {
      const res = await auth()
        .post(`${API_PAY}/process-cod`)
        .send({ orderId: '507f1f77bcf86cd799439011' });
      expect(res.status).toBe(404);
      expect(res.body.message?.toLowerCase()).toContain('order');
    });

    it('(Negative) should return 400 when payment already completed for order', async () => {
      const order = await createTestOrder(22);
      const first = await auth().post(`${API_PAY}/process-cod`).send({ orderId: order._id.toString() });
      expect(first.status).toBe(200);
      const second = await auth().post(`${API_PAY}/process-cod`).send({ orderId: order._id.toString() });
      expect(second.status).toBe(400);
      expect(second.body.message?.toLowerCase()).toContain('already');
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    });
  });

  describe(`POST ${API_PAY}/process-card`, () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('(Positive) should process card when gateway simulation succeeds', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const order = await createTestOrder(55);
      const res = await auth()
        .post(`${API_PAY}/process-card`)
        .send(validCardBody(order._id.toString()));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payment?.status).toBe('completed');
      expect(res.body.payment?.last4Digits).toBe('1111');
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    });

    it('(Negative) should return 400 when simulation fails', async () => {
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.95)
        .mockReturnValue(0);
      const order = await createTestOrder(33);
      const res = await auth()
        .post(`${API_PAY}/process-card`)
        .send(validCardBody(order._id.toString()));
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase()).toContain('payment failed');
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    });

    it('(Negative) should return 400 when card fields are missing', async () => {
      const order = await createTestOrder(10);
      const res = await auth()
        .post(`${API_PAY}/process-card`)
        .send({ orderId: order._id.toString(), cardNumber: '4111111111111111' });
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase()).toContain('required');
      await Order.findByIdAndDelete(order._id);
    });

    it('(Negative) should return 404 when order is not found', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const res = await auth()
        .post(`${API_PAY}/process-card`)
        .send(validCardBody('507f1f77bcf86cd799439011'));
      expect(res.status).toBe(404);
    });
  });

  describe(`GET ${API_PAY}/order/:orderId`, () => {
    it('(Positive) should return payment for order after COD', async () => {
      const order = await createTestOrder(18);
      await auth().post(`${API_PAY}/process-cod`).send({ orderId: order._id.toString() });
      const res = await auth().get(`${API_PAY}/order/${order._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payment?._id).toBeTruthy();
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    });

    it('(Edge) should return 404 when order exists but has no payment', async () => {
      const order = await createTestOrder(12);
      const res = await auth().get(`${API_PAY}/order/${order._id}`);
      expect(res.status).toBe(404);
      expect(res.body.message?.toLowerCase()).toContain('no payment');
      await Order.findByIdAndDelete(order._id);
    });
  });

  describe(`GET ${API_PAY}/:paymentId`, () => {
    it('(Positive) should return payment by id for owner', async () => {
      const order = await createTestOrder(25);
      const cod = await auth().post(`${API_PAY}/process-cod`).send({ orderId: order._id.toString() });
      const paymentId = cod.body.payment._id;
      const res = await auth().get(`${API_PAY}/${paymentId}`);
      expect(res.status).toBe(200);
      expect(res.body.payment?._id).toBe(paymentId);
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    });

    it('(Negative) should return 404 for unknown payment id', async () => {
      const res = await auth().get(`${API_PAY}/507f1f77bcf86cd799439099`);
      expect(res.status).toBe(404);
    });
  });

  describe(`POST ${API_PAY}/:paymentId/refund`, () => {
    it('(Positive) should refund a completed payment', async () => {
      const order = await createTestOrder(44);
      const cod = await auth().post(`${API_PAY}/process-cod`).send({ orderId: order._id.toString() });
      const paymentId = cod.body.payment._id;
      const res = await auth().post(`${API_PAY}/${paymentId}/refund`).send({});
      expect(res.status).toBe(200);
      expect(res.body.payment?.status).toBe('cancelled');
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    });

    it('(Negative) should return 400 when payment is not completed', async () => {
      const order = await createTestOrder(15);
      const pending = await Payment.create({
        order: order._id,
        user: testUserId,
        amount: order.total,
        paymentMethod: 'card',
        status: 'pending',
      });
      const res = await auth().post(`${API_PAY}/${pending._id}/refund`).send({});
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase()).toContain('completed');
      await Payment.findByIdAndDelete(pending._id);
      await Order.findByIdAndDelete(order._id);
    });

    it('(Negative) should return 404 for invalid payment id', async () => {
      const res = await auth().post(`${API_PAY}/507f1f77bcf86cd799439088/refund`).send({});
      expect(res.status).toBe(404);
    });
  });
});
