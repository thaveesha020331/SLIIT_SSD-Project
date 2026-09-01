import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Product Image Upload Service
 * Handles image uploads for product listings
 */

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

/**
 * Ensure upload directory exists
 */
function ensureUploadDirExists() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Upload product image
 * @param {Object} file - Express file object from multer
 * @returns {string} URL path to uploaded image
 */
export const uploadProductImage = async (file) => {
  try {
    ensureUploadDirExists();

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.path || file.filename) {
      const filename = file.filename || path.basename(file.path);
      return `/uploads/products/${filename}`;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = path.extname(file.originalname);
    const filename = `product-${timestamp}-${randomString}${fileExtension}`;

    const filePath = path.join(UPLOAD_DIR, filename);

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    // Return relative path for URL
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete product image
 * @param {string} imagePath - Path to image file
 * @returns {boolean} Success status
 */
export const deleteProductImage = (imagePath) => {
  try {
    if (!imagePath) return false;

    // Extract filename from path
    const filename = path.basename(imagePath);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
};

/**
 * Validate image file
 * @param {Object} file - Express file object
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size exceeds 5MB limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get image file info
 * @param {string} imagePath - Path to image
 * @returns {Object} File information
 */
export const getImageInfo = (imagePath) => {
  try {
    if (!imagePath) return null;

    const filename = path.basename(imagePath);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);

    return {
      filename,
      size: stats.size,
      createdAt: stats.birthtime,
      path: imagePath,
    };
  } catch (error) {
    console.error('Get image info error:', error);
    return null;
  }
};
