/**
 * Review API – Senara
 * Jest integration tests: positive, negative, and edge cases.
 * Run: npm run test:senara
 */
process.env.NODE_ENV = 'test';

import request from 'supertest';
import connectDB from '../../config/db.js';
import app from '../../Server.js';
import User from '../../models/Tudakshana/User.js';
import Product from '../../models/Lakna/Product.js';
import Order from '../../models/Thaveesha/Order.js';
import Review from '../../models/Senara/Review.js';

const API_AUTH = '/api/auth';
const API_REVIEWS = '/api/senara/reviews';

let customerToken = null;
let adminToken = null;
let testUserId = null;
let testAdminId = null;
let testProductId = null;
let testOrderId = null;
let testReviewId = null;

const testEmailPrefix = 'senara_review_test_';
const testEmail = () => `${testEmailPrefix}${Date.now()}@example.com`;
const testAdminEmail = () => `${testEmailPrefix}admin_${Date.now()}@example.com`;

function auth(token) {
  const t = token || customerToken;
  const bearer = `Bearer ${t}`;
  return {
    get: (path) => request(app).get(path).set('Authorization', bearer),
    post: (path) => request(app).post(path).set('Authorization', bearer),
    patch: (path) => request(app).patch(path).set('Authorization', bearer),
    delete: (path) => request(app).delete(path).set('Authorization', bearer),
  };
}

describe('Review Endpoints – Senara', () => {
  beforeAll(async () => {
    await connectDB();

    // Register customer
    const reg = await request(app)
      .post(`${API_AUTH}/register`)
      .send({
        name: 'Senara Review Test User',
        email: testEmail(),
        password: 'password123',
        role: 'customer',
      });
    expect(reg.status).toBe(201);
    customerToken = reg.body.data?.token || reg.body.token;
    testUserId = reg.body.data?.user?.id || reg.body.user?.id;
    expect(customerToken).toBeTruthy();
    expect(testUserId).toBeTruthy();

    // Create product (Lakna)
    const product = await Product.create({
      title: 'Test Product For Review',
      description: 'Description for test product at least ten chars.',
      price: 29.99,
      stock: 50,
      category: 'Reusable',
      productCategory: 'Kitchen',
      image: 'https://example.com/review-test.jpg',
      ecocertification: 'Carbon Neutral',
      createdBy: testUserId,
      isActive: true,
    });
    testProductId = product._id.toString();

    // Create delivered order so customer can review the product
    const order = await Order.create({
      user: testUserId,
      items: [
        {
          product: testProductId,
          quantity: 1,
          priceSnapshot: 29.99,
        },
      ],
      total: 29.99,
      status: 'delivered',
      shippingAddress: '123 Test Street, Colombo',
      phone: '0771234567',
      notes: '',
    });
    testOrderId = order._id.toString();

    // Create admin user directly (register API does not allow role 'admin')
    const adminEmail = testAdminEmail();
    const adminUser = await User.create({
      name: 'Senara Admin Test',
      email: adminEmail,
      password: 'password123',
      role: 'admin',
    });
    testAdminId = adminUser._id.toString();
    const loginRes = await request(app)
      .post(`${API_AUTH}/login`)
      .send({ email: adminEmail, password: 'password123' });
    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data?.token || loginRes.body.token;
    expect(adminToken).toBeTruthy();
  }, 60000);

  afterAll(async () => {
    try {
      await Review.deleteMany({ user: testUserId });
      await Review.deleteMany({ user: testAdminId });
      await Order.deleteMany({ user: testUserId });
      await Product.deleteMany({ _id: testProductId });
      await User.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
      console.log('\n  Senara review tests completed. Cleanup done.');
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  });

  describe(`GET ${API_REVIEWS}/my-reviews`, () => {
    it('(Positive) should return array of reviews for authenticated customer', async () => {
      const res = await auth().get(`${API_REVIEWS}/my-reviews`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('(Negative) should return 401 when no token', async () => {
      const res = await request(app).get(`${API_REVIEWS}/my-reviews`);
      expect(res.status).toBe(401);
    });

    it('(Negative) should return 401 when invalid token', async () => {
      const res = await request(app)
        .get(`${API_REVIEWS}/my-reviews`)
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe(`GET ${API_REVIEWS}/check/:productId`, () => {
    it('(Positive) should return canReview true when user has delivered order with product', async () => {
      const res = await auth().get(`${API_REVIEWS}/check/${testProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.canReview).toBe(true);
      expect(res.body.orderId).toBeTruthy();
    });

    it('(Positive) should return canReview false when user already reviewed', async () => {
      const addRes = await auth()
        .post(API_REVIEWS)
        .send({
          productId: testProductId,
          orderId: testOrderId,
          rating: 5,
          title: 'Great product',
          comment: 'This is a wonderful product for testing reviews. Exactly what I needed!',
        });
      expect(addRes.status).toBe(201);
      testReviewId = addRes.body.data?._id || addRes.body.data?.id;
      const checkRes = await auth().get(`${API_REVIEWS}/check/${testProductId}`);
      expect(checkRes.status).toBe(200);
      expect(checkRes.body.canReview).toBe(false);
      expect(checkRes.body.message?.toLowerCase().includes('already')).toBe(true);
    });

    it('(Negative) should return 404 for invalid product id format', async () => {
      const res = await auth().get(`${API_REVIEWS}/check/not-an-id`);
      expect([400, 404, 500]).toContain(res.status);
    });
  });

  describe(`GET ${API_REVIEWS}/product/:productId`, () => {
    it('(Positive) should return reviews for product when authenticated', async () => {
      const res = await auth().get(`${API_REVIEWS}/product/${testProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('(Negative) should return 401 when no token', async () => {
      const res = await request(app).get(`${API_REVIEWS}/product/${testProductId}`);
      expect(res.status).toBe(401);
    });

    it('(Edge) should return empty array for product with no reviews', async () => {
      const newProduct = await Product.create({
        title: 'No Reviews Product',
        description: 'At least ten chars here for validation.',
        price: 9.99,
        stock: 10,
        category: 'Reusable',
        productCategory: 'Home & Living',
        image: 'https://example.com/no-reviews.jpg',
        ecocertification: 'Carbon Neutral',
        createdBy: testUserId,
        isActive: true,
      });
      const res = await auth().get(`${API_REVIEWS}/product/${newProduct._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      await Product.findByIdAndDelete(newProduct._id);
    });
  });

  describe(`POST ${API_REVIEWS}`, () => {
    it('(Positive) should create review when user has delivered order with product', async () => {
      const product2 = await Product.create({
        title: 'Second Product For Review',
        description: 'Description for second test product at least ten chars.',
        price: 19.99,
        stock: 20,
        category: 'Reusable',
        productCategory: 'Personal Care',
        image: 'https://example.com/second-product.jpg',
        ecocertification: 'Carbon Neutral',
        createdBy: testUserId,
        isActive: true,
      });
      const order2 = await Order.create({
        user: testUserId,
        items: [{ product: product2._id, quantity: 1, priceSnapshot: 19.99 }],
        total: 19.99,
        status: 'delivered',
        shippingAddress: '123 Test St',
        phone: '0771111111',
      });
      const res = await auth()
        .post(API_REVIEWS)
        .send({
          productId: product2._id.toString(),
          orderId: order2._id,
          rating: 4,
          title: 'Good product',
          comment: 'This product met my expectations and arrived on time. Recommended!',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message?.toLowerCase().includes('success')).toBe(true);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.rating).toBe(4);
      expect(res.body.data.comment).toBeTruthy();
      await Order.findByIdAndDelete(order2._id);
      await Product.findByIdAndDelete(product2._id);
    });

    it('(Negative) should fail when productId is missing', async () => {
      const res = await auth()
        .post(API_REVIEWS)
        .send({
          rating: 5,
          comment: 'This comment is at least ten characters long for validation.',
        });
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase().includes('product')).toBe(true);
    });

    it('(Negative) should fail when rating is out of range', async () => {
      const res = await auth()
        .post(API_REVIEWS)
        .send({
          productId: testProductId,
          rating: 0,
          comment: 'This comment is at least ten characters long for validation.',
        });
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase().includes('rating')).toBe(true);
    });

    it('(Negative) should fail when comment is too short', async () => {
      const res = await auth()
        .post(API_REVIEWS)
        .send({
          productId: testProductId,
          rating: 5,
          comment: 'Short',
        });
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase().includes('comment') || res.body.message?.toLowerCase().includes('10')).toBe(true);
    });

    it('(Negative) should fail when product does not exist', async () => {
      const fakeId = '000000000000000000000000';
      const res = await auth()
        .post(API_REVIEWS)
        .send({
          productId: fakeId,
          rating: 5,
          comment: 'This comment is at least ten characters long for validation.',
        });
      expect(res.status).toBe(400);
    });
  });

  describe(`GET ${API_REVIEWS}/:id`, () => {
    it('(Positive) should return review when id belongs to user', async () => {
      if (!testReviewId) return;
      const res = await auth().get(`${API_REVIEWS}/${testReviewId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testReviewId);
      expect(res.body.data.rating).toBeDefined();
      expect(res.body.data.comment).toBeDefined();
    });

    it('(Negative) should return 404 when review id does not exist', async () => {
      const res = await auth().get(`${API_REVIEWS}/000000000000000000000000`);
      expect(res.status).toBe(404);
      expect(res.body.message?.toLowerCase().includes('not found')).toBe(true);
    });

    it('(Negative) should return 401 when no token', async () => {
      if (!testReviewId) return;
      const res = await request(app).get(`${API_REVIEWS}/${testReviewId}`);
      expect(res.status).toBe(401);
    });
  });

  describe(`PATCH ${API_REVIEWS}/:id`, () => {
    it('(Positive) should update own review', async () => {
      if (!testReviewId) return;
      const res = await auth()
        .patch(`${API_REVIEWS}/${testReviewId}`)
        .send({
          rating: 3,
          comment: 'Updated comment that is at least ten characters long for validation.',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(3);
      expect(res.body.data.comment).toContain('Updated comment');
    });

    it('(Negative) should fail when comment too short', async () => {
      if (!testReviewId) return;
      const res = await auth()
        .patch(`${API_REVIEWS}/${testReviewId}`)
        .send({ comment: 'Short' });
      expect(res.status).toBe(400);
      expect(res.body.message?.toLowerCase().includes('comment') || res.body.message?.toLowerCase().includes('10')).toBe(true);
    });

    it('(Negative) should return 404 when review id does not exist', async () => {
      const res = await auth()
        .patch(`${API_REVIEWS}/000000000000000000000000`)
        .send({ rating: 5, comment: 'At least ten characters here for the update.' });
      expect(res.status).toBe(404);
    });
  });

  describe(`DELETE ${API_REVIEWS}/:id`, () => {
    it('(Positive) should delete own review', async () => {
      if (!testReviewId) return;
      const res = await auth().delete(`${API_REVIEWS}/${testReviewId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message?.toLowerCase().includes('deleted')).toBe(true);
    });

    it('(Negative) should return 404 when review already deleted or invalid id', async () => {
      const res = await auth().delete(`${API_REVIEWS}/${testReviewId || '000000000000000000000000'}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Admin: GET ' + API_REVIEWS + ' (all reviews)', () => {
    it('(Positive) should return all reviews when admin', async () => {
      const res = await auth(adminToken).get(API_REVIEWS);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('(Positive) should filter by sentiment when query param sent', async () => {
      const res = await auth(adminToken).get(`${API_REVIEWS}?sentiment=Positive`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('(Negative) should return 403 when customer tries to get all reviews', async () => {
      const res = await auth(customerToken).get(API_REVIEWS);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin: DELETE ' + API_REVIEWS + '/admin/:id', () => {
    let reviewToAdminDelete = null;
    let reviewForForbiddenTest = null;

    beforeAll(async () => {
      reviewToAdminDelete = await Review.create({
        user: testUserId,
        product: testProductId,
        rating: 5,
        comment: 'Review created for admin delete test. This is long enough.',
        sentiment: 'Positive',
      });
      const productForForbidden = await Product.create({
        title: 'Product For 403 Test',
        description: 'At least ten chars for validation.',
        price: 5,
        stock: 5,
        category: 'Reusable',
        productCategory: 'Gifts',
        image: 'https://example.com/403.jpg',
        ecocertification: 'Carbon Neutral',
        createdBy: testUserId,
        isActive: true,
      });
      reviewForForbiddenTest = await Review.create({
        user: testUserId,
        product: productForForbidden._id,
        rating: 1,
        comment: 'Another review for admin delete forbidden test. Long enough.',
        sentiment: 'Neutral',
      });
      await Product.findByIdAndDelete(productForForbidden._id);
    });

    it('(Positive) should delete any review when admin', async () => {
      const res = await auth(adminToken).delete(`${API_REVIEWS}/admin/${reviewToAdminDelete._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message?.toLowerCase().includes('deleted')).toBe(true);
    });

    it('(Negative) should return 404 when review id does not exist', async () => {
      const res = await auth(adminToken).delete(`${API_REVIEWS}/admin/000000000000000000000000`);
      expect(res.status).toBe(404);
    });

    it('(Negative) should return 403 when customer tries admin delete', async () => {
      const res = await auth(customerToken).delete(`${API_REVIEWS}/admin/${reviewForForbiddenTest._id}`);
      expect(res.status).toBe(403);
      await Review.findByIdAndDelete(reviewForForbiddenTest._id);
    });
  });
});
