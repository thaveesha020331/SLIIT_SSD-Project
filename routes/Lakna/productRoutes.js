import express from 'express';
import multer from 'multer';
import fs from 'fs';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getByCategory,
  getByCertification,
  addReview,
} from '../../controllers/Lakna/productController.js';
import { protect, restrictTo } from '../../utils/Tudakshana/authMiddleware.js';

// Multer: store product images under uploads/products (max 5MB, image MIME types only)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/products/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

const router = express.Router();

/**
 * Product CRUD — OWASP A01 Broken Access Control
 *
 * Before: POST/PUT/DELETE /api/products were public (auth middleware commented out).
 * `protect` requires a valid JWT; unauthenticated calls return 401.
 * `restrictTo('admin')` rejects authenticated non-admin users with 403.
 *
 * ZAP check: unauthenticated Requester POST/PUT/DELETE should now return 401, not 2xx.
 */

// Create product — admin only
router.post('/', protect, restrictTo('admin'), upload.single('image'), createProduct);

// Catalogue reads stay public
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Update product — admin only
router.put('/:id', protect, restrictTo('admin'), upload.single('image'), updateProduct);

// Delete product — admin only
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

/**
 * Category Routes
 */

// Get products by category
router.get('/category/:category', getByCategory);

/**
 * Certification Routes
 */

// Get products by certification
router.get('/certification/:certification', getByCertification);

/**
 * Review Routes
 */

// Add review to product — authenticated customers only
router.post('/:id/reviews', protect, restrictTo('customer'), addReview);

// Multer/file upload error handler for product routes
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err?.message?.includes('Invalid file type')) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  next(err);
});

export default router;
