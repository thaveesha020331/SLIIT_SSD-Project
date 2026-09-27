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
  tokenVersion: 0,
};

const User = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

jest.unstable_mockModule('../../models/Tudakshana/User.js', () => ({ default: User }));

const { register, logout, changePassword } = await import('../../controllers/Tudakshana/authController.js');
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
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(testUser),
    });
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
      { id: testUser._id, email: testUser.email, role: testUser.role, tokenVersion: 0 },
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

  test('rejects a JWT issued before the password changed', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ...testUser, tokenVersion: 1 }),
    });
    const oldToken = jwt.sign(
      { id: testUser._id, email: testUser.email, role: testUser.role, tokenVersion: 0 },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '15m' },
    );
    const req = {
      method: 'GET',
      headers: { cookie: `auth_token=${oldToken}` },
    };
    const res = createResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('increments the token version and clears the cookie after a password change', async () => {
    const user = {
      ...testUser,
      password: 'old-password-hash',
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(undefined),
    };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });
    const req = {
      user: { id: testUser._id },
      body: {
        currentPassword: 'password123',
        newPassword: 'new-password-123',
      },
    };
    const res = createResponse();

    await changePassword(req, res);

    expect(user.tokenVersion).toBe(1);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(res.clearCookie).toHaveBeenCalledWith('auth_token', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
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
