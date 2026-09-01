import multer from 'multer';
import { jest } from '@jest/globals';
import router from '../../routes/Lakna/productRoutes.js';

const hasRoute = (method, routePath) =>
  router.stack.some((layer) => layer.route?.path === routePath && layer.route.methods?.[method]);

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
