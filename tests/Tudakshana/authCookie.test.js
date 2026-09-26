import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

const testUser = {
  _id: '507f1f77bcf86cd799439011',
  id: '507f1f77bcf86cd799439011',
  name: 'Cookie Security Test',
  email: 'cookie@example.com',
  role: 'customer',
  phone: '',
  address: '',
  themePreference: 'light',
  profileImage: '',
  paymentCard: {},
  isActive: true,
};

const User = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

jest.unstable_mockModule('../../models/Tudakshana/User.js', () => ({ default: User }));

const { register, logout } = await import('../../controllers/Tudakshana/authController.js');
const { protect } = await import('../../utils/Tudakshana/authMiddleware.js');

const createResponse = () => ({
  cookie: jest.fn(),
  clearCookie: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('HttpOnly authentication cookie', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(testUser);
    User.findById.mockResolvedValue(testUser);
    jest.clearAllMocks();
  });

  test('issues a 15-minute HttpOnly SameSite cookie', async () => {
    const req = {
      body: {
        name: testUser.name,
        email: testUser.email,
        password: 'password123',
        role: 'customer',
      },
    };
    const res = createResponse();

    await register(req, res);

    const [cookieName, token, options] = res.cookie.mock.calls[0];
    expect(cookieName).toBe('auth_token');
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/api',
    });

    const decoded = jwt.decode(token);
    expect(decoded.exp - decoded.iat).toBe(15 * 60);
  });

  test('does not expose the JWT in production response bodies', async () => {
    process.env.NODE_ENV = 'production';
    const req = {
      body: {
        name: testUser.name,
        email: testUser.email,
        password: 'password123',
        role: 'customer',
      },
    };
    const res = createResponse();

    await register(req, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.data.token).toBeUndefined();
    expect(res.cookie.mock.calls[0][2].secure).toBe(true);
  });

  test('authenticates protected requests through the cookie', async () => {
    const token = jwt.sign(
      { id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '15m' },
    );
    const req = {
      method: 'GET',
      headers: { cookie: `auth_token=${token}` },
    };
    const res = createResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.id).toBe(testUser._id);
  });

  test('logout clears the HttpOnly cookie', () => {
    const res = createResponse();

    logout({}, res);

    expect(res.clearCookie).toHaveBeenCalledWith('auth_token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax',
      path: '/api',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
