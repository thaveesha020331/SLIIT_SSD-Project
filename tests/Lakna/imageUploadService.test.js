import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';
import {
  uploadProductImage,
  deleteProductImage,
  validateImageFile,
  getImageInfo,
} from '../../services/Lakna/imageUploadService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads/products');

describe('Lakna Image Upload Service', () => {
  afterEach(() => {
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files
        .filter((file) => file.startsWith('test-upload-') || file.startsWith('product-'))
        .forEach((file) => fs.unlinkSync(path.join(uploadDir, file)));
    }
  });

  describe('validateImageFile', () => {
    test('should reject when file is missing', () => {
      const result = validateImageFile(null);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('No file');
    });

    test('should reject invalid mimetype', () => {
      const result = validateImageFile({ mimetype: 'application/pdf', size: 1000 });
      expect(result.isValid).toBe(false);
      expect(result.errors.join(' ')).toContain('Invalid file type');
    });

    test('should reject oversized files', () => {
      const result = validateImageFile({ mimetype: 'image/jpeg', size: 6 * 1024 * 1024 });
      expect(result.isValid).toBe(false);
      expect(result.errors.join(' ')).toContain('5MB');
    });

    test('should accept valid image file', () => {
      const result = validateImageFile({ mimetype: 'image/png', size: 1024 });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('uploadProductImage', () => {
    test('should return existing uploaded file path when filename is present', async () => {
      const url = await uploadProductImage({ filename: 'test-upload-existing.png' });
      expect(url).toBe('/uploads/products/test-upload-existing.png');
    });

    test('should write buffer to disk and return uploaded path', async () => {
      const url = await uploadProductImage({
        originalname: 'test-upload-file.jpg',
        buffer: Buffer.from('image-content'),
      });

      expect(url.startsWith('/uploads/products/product-')).toBe(true);

      const filename = path.basename(url);
      const filePath = path.join(uploadDir, filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('should throw when file is not provided', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(uploadProductImage(null)).rejects.toThrow('No file provided');
      errorSpy.mockRestore();
    });
  });

  describe('deleteProductImage and getImageInfo', () => {
    test('should return false for missing image path', () => {
      expect(deleteProductImage('')).toBe(false);
    });

    test('should delete existing image and return true', () => {
      fs.mkdirSync(uploadDir, { recursive: true });
      const filename = 'test-upload-delete.webp';
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, Buffer.from('content'));

      const removed = deleteProductImage(`/uploads/products/${filename}`);
      expect(removed).toBe(true);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    test('should return null from getImageInfo for non-existing file', () => {
      const info = getImageInfo('/uploads/products/not-found.png');
      expect(info).toBeNull();
    });

    test('should return file metadata for existing image', () => {
      fs.mkdirSync(uploadDir, { recursive: true });
      const filename = 'test-upload-info.gif';
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, Buffer.from('gif-content'));

      const info = getImageInfo(`/uploads/products/${filename}`);
      expect(info).toBeTruthy();
      expect(info.filename).toBe(filename);
      expect(info.size).toBeGreaterThan(0);
      expect(info.path).toBe(`/uploads/products/${filename}`);
    });
  });
});
