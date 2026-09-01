/**
 * Admin Order API – Thaveesha
 * Jest integration tests for /api/admin/orders endpoints.
 * Run: npm run test:thaveesha
 */
process.env.NODE_ENV = 'test';

import request from 'supertest';
import connectDB from '../../config/db.js';
import app from '../../Server.js';
import User from '../../models/Tudakshana/User.js';
import Product from '../../models/Lakna/Product.js';
import Order from '../../models/Thaveesha/Order.js';

const API_AUTH = '/api/auth';
const API_ADMIN_ORDERS = '/api/admin/orders';

let adminToken = null;
let customerToken = null;
let adminUserId = null;
let customerUserId = null;
let productId = null;
let pendingOrderId = null;
let deliveredOrderId = null;
let cancelledByUserOrderId = null;

const testEmailPrefix = 'adminorder_test_';
const testEmail = (suffix = '') =>
  `${testEmailPrefix}${suffix}${Date.now()}@example.com`;

function authAdmin() {
  const token = `Bearer ${adminToken}`;
  return {
    get: (path) => request(app).get(path).set('Authorization', token),
    post: (path) => request(app).post(path).set('Authorization', token),
    patch: (path) => request(app).patch(path).set('Authorization', token),
    delete: (path) => request(app).delete(path).set('Authorization', token),
  };
}

function authCustomer() {
  const token = `Bearer ${customerToken}`;
  return {
    get: (path) => request(app).get(path).set('Authorization', token),
    post: (path) => request(app).post(path).set('Authorization', token),
    patch: (path) => request(app).patch(path).set('Authorization', token),
    delete: (path) => request(app).delete(path).set('Authorization', token),
  };
}

describe('Admin Order Endpoints – Thaveesha', () => {
  beforeAll(async () => {
    await connectDB();

    // Create admin user directly (register API does not allow role "admin")
    const adminEmail = testEmail('admin_');
    const adminUser = await User.create({
      name: 'Admin Order Test Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin',
    });
    adminUserId = adminUser._id.toString();

    const adminLogin = await request(app)
      .post(`${API_AUTH}/login`)
      .send({ email: adminEmail, password: 'password123' });
    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.data?.token || adminLogin.body.token;
    expect(adminToken).toBeTruthy();

    // Create customer via register
    const customerReg = await request(app)
      .post(`${API_AUTH}/register`)
      .send({
        name: 'Admin Order Test Customer',
        email: testEmail('customer_'),
        password: 'password123',
        role: 'customer',
      });
    expect(customerReg.status).toBe(201);
    customerToken = customerReg.body.data?.token || customerReg.body.token;
    customerUserId =
      customerReg.body.data?.user?.id || customerReg.body.user?.id;
    expect(customerToken).toBeTruthy();
    expect(customerUserId).toBeTruthy();

    // Create product (Lakna)
    const product = await Product.create({
      title: 'Admin Order Test Product',
      description: 'Description for admin order test product at least ten chars.',
      price: 49.99,
      stock: 20,
      category: 'Reusable',
      productCategory: 'Kitchen',
      image: 'https://example.com/admin-order.jpg',
      ecocertification: 'Carbon Neutral',
      createdBy: adminUserId,
      isActive: true,
    });
    productId = product._id.toString();

    // Seed three orders for the customer with different statuses
    const items = [
      { product: productId, quantity: 1, priceSnapshot: 49.99 },
    ];

    const pendingOrder = await Order.create({
      user: customerUserId,
      items,
      total: 49.99,
      status: 'pending',
      shippingAddress: '123 Admin Pending St',
      phone: '0771111111',
      notes: 'Pending order',
    });
    pendingOrderId = pendingOrder._id.toString();

    const deliveredOrder = await Order.create({
      user: customerUserId,
      items,
      total: 49.99,
      status: 'delivered',
      shippingAddress: '456 Admin Delivered St',
      phone: '0772222222',
      notes: 'Delivered order',
    });
    deliveredOrderId = deliveredOrder._id.toString();

    const cancelledOrder = await Order.create({
      user: customerUserId,
      items,
      total: 49.99,
      status: 'cancelled',
      shippingAddress: '789 Admin Cancelled St',
      phone: '0773333333',
      notes: 'Cancelled by user order',
    });
    cancelledByUserOrderId = cancelledOrder._id.toString();
    // Mark as cancelled by user directly on collection (field is not in schema)
    await Order.collection.updateOne(
      { _id: cancelledOrder._id },
      { $set: { cancelledBy: 'user' } }
    );
  });

  afterAll(async () => {
    try {
      await Order.deleteMany({ user: customerUserId });
      await Product.deleteMany({ _id: productId });
      await User.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Admin order tests cleanup error:', e);
    }
  });

  describe(`GET ${API_ADMIN_ORDERS}`, () => {
    it('(Positive) should return paginated list of orders for admin', async () => {
      const res = await authAdmin().get(API_ADMIN_ORDERS);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThanOrEqual(3);
    });

    it('(Positive) should filter by status=pending', async () => {
      const res = await authAdmin().get(`${API_ADMIN_ORDERS}?status=pending`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThanOrEqual(1);
      res.body.orders.forEach((o) => {
        expect(o.status).toBe('pending');
      });
    });

    it('(Negative) should return 403 when customer tries to access admin orders', async () => {
      const res = await authCustomer().get(API_ADMIN_ORDERS);
      expect(res.status).toBe(403);
    });
  });

  describe(`GET ${API_ADMIN_ORDERS}/:id`, () => {
    it('(Positive) should return single order by id for admin', async () => {
      const res = await authAdmin().get(
        `${API_ADMIN_ORDERS}/${pendingOrderId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order._id).toBe(pendingOrderId);
      expect(res.body.order.user._id || res.body.order.user).toBe(
        customerUserId
      );
    });

    it('(Negative) should return 404 when order not found', async () => {
      const res = await authAdmin().get(
        `${API_ADMIN_ORDERS}/000000000000000000000000`
      );
      expect(res.status).toBe(404);
    });
  });

  describe(`PATCH ${API_ADMIN_ORDERS}/:id/status`, () => {
    it('(Positive) should update pending order status to processing, shipped, delivered', async () => {
      // Set to processing
      let res = await authAdmin()
        .patch(`${API_ADMIN_ORDERS}/${pendingOrderId}/status`)
        .send({ status: 'processing' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.status).toBe('processing');

      // Set to shipped
      res = await authAdmin()
        .patch(`${API_ADMIN_ORDERS}/${pendingOrderId}/status`)
        .send({ status: 'shipped' });
      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('shipped');

      // Set to delivered
      res = await authAdmin()
        .patch(`${API_ADMIN_ORDERS}/${pendingOrderId}/status`)
        .send({ status: 'delivered' });
      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('delivered');
    });

    it('(Negative) should not allow cancelling a delivered order', async () => {
      const res = await authAdmin()
        .patch(`${API_ADMIN_ORDERS}/${deliveredOrderId}/status`)
        .send({ status: 'cancelled' });
      expect(res.status).toBe(400);
      expect(
        res.body.message?.toLowerCase().includes('cannot cancel a delivered')
      ).toBe(true);
    });

    it('(Negative) should not allow changing an order cancelled by the user', async () => {
      const res = await authAdmin()
        .patch(`${API_ADMIN_ORDERS}/${cancelledByUserOrderId}/status`)
        .send({ status: 'processing' });
      expect(res.status).toBe(400);
      expect(
        res.body.message
          ?.toLowerCase()
          .includes('cannot change an order that was cancelled by the customer')
      ).toBe(true);
    });

    it('(Negative) should return 404 when updating non-existent order', async () => {
      const res = await authAdmin()
        .patch(`${API_ADMIN_ORDERS}/000000000000000000000000/status`)
        .send({ status: 'processing' });
      expect(res.status).toBe(404);
    });

    it('(Negative) should return 400 for invalid status value', async () => {
      const res = await authAdmin()
        .patch(`${API_ADMIN_ORDERS}/${pendingOrderId}/status`)
        .send({ status: 'unknown-status' });
      expect(res.status).toBe(400);
      expect(
        res.body.message?.toLowerCase().includes('invalid status')
      ).toBe(true);
    });

    it('(Negative) should return 403 when customer tries to update order status', async () => {
      const res = await authCustomer()
        .patch(`${API_ADMIN_ORDERS}/${pendingOrderId}/status`)
        .send({ status: 'processing' });
      expect(res.status).toBe(403);
    });
  });
});

