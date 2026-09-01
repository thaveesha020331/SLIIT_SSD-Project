/**
 * Cart & Order API – Thaveesha
 * Jest integration tests: positive, negative, and edge cases.
 * Run: npm run test:thaveesha  (Node) or  npm run test:thaveesha:jest  (Jest)
 */
process.env.NODE_ENV = 'test';

import request from 'supertest';
import connectDB from '../../config/db.js';
import app from '../../Server.js';
import User from '../../models/Tudakshana/User.js';
import Product from '../../models/Lakna/Product.js';
import Cart from '../../models/Thaveesha/Cart.js';
import Order from '../../models/Thaveesha/Order.js';

const API_AUTH = '/api/auth';
const API_CART = '/api/cart';
const API_ORDERS = '/api/orders';

let authToken = null;
let testUserId = null;
let testProductId = null;
const testEmailPrefix = 'cartorder_test_';
const testEmail = () => `${testEmailPrefix}${Date.now()}@example.com`;

function auth() {
  const token = `Bearer ${authToken}`;
  return {
    get: (path) => request(app).get(path).set('Authorization', token),
    post: (path) => request(app).post(path).set('Authorization', token),
    put: (path) => request(app).put(path).set('Authorization', token),
    patch: (path) => request(app).patch(path).set('Authorization', token),
    delete: (path) => request(app).delete(path).set('Authorization', token),
  };
}

describe('Cart & Order Endpoints – Thaveesha', () => {
  beforeAll(async () => {
    await connectDB();
    const reg = await request(app)
      .post(`${API_AUTH}/register`)
      .send({
        name: 'Cart Order Test User',
        email: testEmail(),
        password: 'password123',
        role: 'customer',
      });
    expect(reg.status).toBe(201);
    authToken = reg.body.data?.token || reg.body.token;
    testUserId = reg.body.data?.user?.id || reg.body.user?.id;
    expect(authToken).toBeTruthy();
    const product = await Product.create({
      title: 'Test Product Cart Order',
      description: 'Description for test product at least ten chars.',
      price: 19.99,
      stock: 100,
      category: 'Reusable',
      productCategory: 'Kitchen',
      image: 'https://example.com/test.jpg',
      ecocertification: 'Carbon Neutral',
      createdBy: testUserId,
      isActive: true,
    });
    testProductId = product._id.toString();
  });

  afterAll(async () => {
    try {
      await Order.deleteMany({ user: testUserId });
      await Cart.deleteMany({ user: testUserId });
      await Product.deleteMany({ _id: testProductId });
      await User.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
      console.log('\n  Thaveesha cart/order tests completed. Cleanup done.');
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  });

  describe(`GET ${API_CART}`, () => {
    it('(Positive) should return cart with items array when authenticated', async () => {
      const res = await auth().get(API_CART);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('(Negative) should return 401 when no token', async () => {
      const res = await request(app).get(API_CART);
      expect(res.status).toBe(401);
    });

    it('(Negative) should return 401 when invalid token', async () => {
      const res = await request(app)
        .get(API_CART)
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe(`POST ${API_CART}/add`, () => {
    it('(Positive) should add product to cart and return items', async () => {
      const res = await auth()
        .post(`${API_CART}/add`)
        .send({ productId: testProductId, quantity: 2 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.items)).toBe(true);
      const added = res.body.items.find((i) => i.product?._id === testProductId || i.product?.toString() === testProductId);
      expect(added).toBeTruthy();
    });

    it('(Negative) should fail when productId is missing', async () => {
      const res = await auth()
        .post(`${API_CART}/add`)
        .send({ quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase().includes('product')).toBe(true);
    });

    it('(Negative) should fail when productId is invalid (not 24-char ObjectId)', async () => {
      const res = await auth()
        .post(`${API_CART}/add`)
        .send({ productId: '1', quantity: 1 });
      expect(res.status).toBe(400);
    });

    it('(Negative) should fail when product does not exist', async () => {
      const fakeId = '000000000000000000000000';
      const res = await auth()
        .post(`${API_CART}/add`)
        .send({ productId: fakeId, quantity: 1 });
      expect(res.status).toBe(404);
    });
  });

  describe(`PUT ${API_CART}`, () => {
    let cartItemId = null;

    it('(Positive) should update cart item quantity', async () => {
      const getRes = await auth().get(API_CART);
      expect(getRes.status).toBe(200);
      const item = getRes.body.items?.find((i) => i.product?._id === testProductId || i.product?.toString() === testProductId);
      expect(item).toBeTruthy();
      cartItemId = item._id;
      const res = await auth()
        .put(API_CART)
        .send({ itemId: cartItemId, quantity: 3 });
      expect(res.status).toBe(200);
      const updated = res.body.items?.find((i) => i._id === cartItemId);
      expect(updated).toBeTruthy();
      expect(updated.quantity).toBe(3);
    });

    it('(Negative) should fail when itemId or quantity missing', async () => {
      const res = await auth()
        .put(API_CART)
        .send({ itemId: cartItemId });
      expect(res.status).toBe(400);
    });

    it('(Negative) should fail when itemId does not exist in cart', async () => {
      const res = await auth()
        .put(API_CART)
        .send({ itemId: '000000000000000000000000', quantity: 1 });
      expect(res.status).toBe(404);
    });
  });

  describe(`DELETE ${API_CART}/item/:itemId`, () => {
    it('(Positive) should remove item from cart', async () => {
      const getRes = await auth().get(API_CART);
      const item = getRes.body.items?.find((i) => i.product?._id === testProductId || i.product?.toString() === testProductId);
      if (!item) return;
      const res = await auth().delete(`${API_CART}/item/${item._id}`);
      expect(res.status).toBe(200);
    });

    it('(Negative) should return 404 for non-existent item id', async () => {
      const res = await auth().delete(`${API_CART}/item/000000000000000000000000`);
      expect(res.status).toBe(404);
    });
  });

  describe(`POST ${API_ORDERS}`, () => {
    it('(Positive) should create order with items, address, phone', async () => {
      await auth().post(`${API_CART}/add`).send({ productId: testProductId, quantity: 1 });
      const res = await auth()
        .post(API_ORDERS)
        .send({
          items: [{ productId: testProductId, quantity: 1 }],
          shippingAddress: '123 Test Street, Colombo',
          phone: '0771234567',
          notes: 'Test order',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toBeTruthy();
      expect(res.body.order.status).toBe('pending');
      expect(res.body.order.total != null).toBe(true);
      expect(Array.isArray(res.body.order.items)).toBe(true);
    });

    it('(Negative) should fail when items array is empty', async () => {
      const res = await auth()
        .post(API_ORDERS)
        .send({
          items: [],
          shippingAddress: '123 Test St',
          phone: '0771234567',
        });
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase().includes('item')).toBe(true);
    });

    it('(Negative) should fail when items is missing', async () => {
      const res = await auth()
        .post(API_ORDERS)
        .send({
          shippingAddress: '123 Test St',
          phone: '0771234567',
        });
      expect(res.status).toBe(400);
    });

    it('(Negative) should fail when shipping address is missing', async () => {
      const res = await auth()
        .post(API_ORDERS)
        .send({
          items: [{ productId: testProductId, quantity: 1 }],
          phone: '0771234567',
        });
      expect(res.status).toBe(400);
      expect(
        res.body.message?.toLowerCase().includes('address') || res.body.message?.toLowerCase().includes('shipping')
      ).toBe(true);
    });

    it('(Negative) should fail when phone is missing', async () => {
      const res = await auth()
        .post(API_ORDERS)
        .send({
          items: [{ productId: testProductId, quantity: 1 }],
          shippingAddress: '123 Test St',
        });
      expect(res.status).toBe(400);
    });

    it('(Negative) should fail when product in items does not exist', async () => {
      const res = await auth()
        .post(API_ORDERS)
        .send({
          items: [{ productId: '000000000000000000000000', quantity: 1 }],
          shippingAddress: '123 Test St',
          phone: '0771234567',
        });
      expect(res.status).toBe(400);
    });
  });

  describe(`GET ${API_ORDERS}/my-orders`, () => {
    it('(Positive) should return array of orders for authenticated user', async () => {
      const res = await auth().get(`${API_ORDERS}/my-orders`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('(Negative) should return 401 when no token', async () => {
      const res = await request(app).get(`${API_ORDERS}/my-orders`);
      expect(res.status).toBe(401);
    });
  });

  describe(`GET ${API_ORDERS}/:id`, () => {
    let orderId = null;

    beforeAll(async () => {
      const list = await auth().get(`${API_ORDERS}/my-orders`);
      if (list.body?.length > 0) orderId = list.body[0]._id;
    });

    it('(Positive) should return order when id belongs to user', async () => {
      if (!orderId) return;
      const res = await auth().get(`${API_ORDERS}/${orderId}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(orderId);
    });

    it('(Negative) should return 404 when order id does not exist', async () => {
      const res = await auth().get(`${API_ORDERS}/000000000000000000000000`);
      expect(res.status).toBe(404);
      expect(res.body.message?.toLowerCase().includes('not found')).toBe(true);
    });

    it('(Negative) should return 401 when no token', async () => {
      if (!orderId) return;
      const res = await request(app).get(`${API_ORDERS}/${orderId}`);
      expect(res.status).toBe(401);
    });
  });

  describe(`PATCH ${API_ORDERS}/:id/cancel`, () => {
    let pendingOrderId = null;

    beforeAll(async () => {
      const list = await auth().get(`${API_ORDERS}/my-orders`);
      const pending = list.body?.find((o) => o.status === 'pending' || o.status === 'processing');
      if (pending) pendingOrderId = pending._id;
    });

    it('(Positive) should cancel pending order and return updated order', async () => {
      if (!pendingOrderId) return;
      const res = await auth().patch(`${API_ORDERS}/${pendingOrderId}/cancel`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order?.status).toBe('cancelled');
    });

    it('(Negative) should return 404 when order id does not exist', async () => {
      const res = await auth().patch(`${API_ORDERS}/000000000000000000000000/cancel`);
      expect(res.status).toBe(404);
    });

    it('(Edge) should return 400 when order is already delivered/cancelled', async () => {
      const list = await auth().get(`${API_ORDERS}/my-orders`);
      const cancelled = list.body?.find((o) => o.status === 'cancelled');
      if (!cancelled) return;
      const res = await auth().patch(`${API_ORDERS}/${cancelled._id}/cancel`);
      expect(res.status).toBe(400);
      expect(
        res.body.message?.toLowerCase().includes('cannot be cancelled') || res.body.message?.toLowerCase().includes('cancelled')
      ).toBe(true);
    });
  });
});
