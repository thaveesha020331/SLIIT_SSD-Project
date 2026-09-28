import multer from 'multer';
import { jest } from '@jest/globals';
import router from '../../routes/Lakna/productRoutes.js';

const hasRoute = (method, routePath) =>
  router.stack.some((layer) => layer.route?.path === routePath && layer.route.methods?.[method]);

const getRouteHandlers = (method, routePath) => {
  const layer = router.stack.find(
    (candidate) => candidate.route?.path === routePath && candidate.route.methods?.[method],
  );
  return layer?.route?.stack.map((handlerLayer) => handlerLayer.handle) || [];
};

describe('Lakna Product Routes', () => {
  test('should register all core CRUD routes', () => {
    expect(hasRoute('post', '/')).toBe(true);
    expect(hasRoute('get', '/')).toBe(true);
    expect(hasRoute('get', '/:id')).toBe(true);
    expect(hasRoute('put', '/:id')).toBe(true);
    expect(hasRoute('delete', '/:id')).toBe(true);
  });

  test('should register category, certification and review routes', () => {
    expect(hasRoute('get', '/category/:category')).toBe(true);
    expect(hasRoute('get', '/certification/:certification')).toBe(true);
    expect(hasRoute('post', '/:id/reviews')).toBe(true);
  });

  test.each([
    ['post', '/'],
    ['put', '/:id'],
    ['delete', '/:id'],
    ['post', '/:id/reviews'],
  ])('should return 401 for unauthenticated %s %s', async (method, routePath) => {
    const handlers = getRouteHandlers(method, routePath);
    const req = { method: method.toUpperCase(), headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    await handlers[0](req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test.each([
    ['post', '/'],
    ['put', '/:id'],
    ['delete', '/:id'],
  ])('should protect %s %s with authentication and admin authorization', (method, routePath) => {
    const handlers = getRouteHandlers(method, routePath);

    expect(handlers[0].name).toBe('protect');
    expect(handlers.length).toBeGreaterThanOrEqual(3);

    const req = { user: { role: 'customer' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    handlers[1](req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test.each([
    ['post', '/'],
    ['put', '/:id'],
    ['delete', '/:id'],
  ])('should allow an admin through authorization for %s %s', (method, routePath) => {
    const handlers = getRouteHandlers(method, routePath);
    const next = jest.fn();

    handlers[1]({ user: { role: 'admin' } }, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should reject non-customers from the legacy product review endpoint', () => {
    const handlers = getRouteHandlers('post', '/:id/reviews');
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    handlers[1]({ user: { role: 'admin' } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('should allow a customer through legacy product review authorization', () => {
    const handlers = getRouteHandlers('post', '/:id/reviews');
    const next = jest.fn();

    handlers[1]({ user: { role: 'customer' } }, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should handle multer errors with 400 response', () => {
    const errorHandlerLayer = router.stack.find((layer) => layer.route == null && layer.handle.length === 4);
    expect(errorHandlerLayer).toBeTruthy();

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    const multerError = new multer.MulterError('LIMIT_FILE_SIZE');
    errorHandlerLayer.handle(multerError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('should handle invalid file type errors with 400 response', () => {
    const errorHandlerLayer = router.stack.find((layer) => layer.route == null && layer.handle.length === 4);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    errorHandlerLayer.handle(new Error('Invalid file type. Only JPEG is allowed.'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('should pass non-multer errors to next middleware', () => {
    const errorHandlerLayer = router.stack.find((layer) => layer.route == null && layer.handle.length === 4);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    errorHandlerLayer.handle(new Error('Unexpected error'), req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(400);
  });
});
