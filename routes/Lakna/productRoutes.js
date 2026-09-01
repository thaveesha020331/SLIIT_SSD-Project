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

// Middleware for file upload
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
 * Middleware for authentication (assuming it exists)
 * You can replace with your actual auth middleware
 */
// const auth = require('../../middleware/auth');
// const adminAuth = require('../../middleware/adminAuth');

/**
 * Product CRUD Routes
 */

// Create a new product (Admin only)
// router.post('/', adminAuth, upload.single('image'), createProduct);
router.post('/', upload.single('image'), createProduct);

// Get all products (Public)
router.get('/', getAllProducts);

// Get product by ID (Public)
router.get('/:id', getProductById);

// Update product (Admin only)
// router.put('/:id', adminAuth, upload.single('image'), updateProduct);
router.put('/:id', upload.single('image'), updateProduct);

// Delete product (Admin only)
// router.delete('/:id', adminAuth, deleteProduct);
router.delete('/:id', deleteProduct);

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

// Add review to product (Authenticated users)
// router.post('/:id/reviews', auth, addReview);
router.post('/:id/reviews', addReview);

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
