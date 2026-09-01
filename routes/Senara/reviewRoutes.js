import express from 'express';
import { protect, restrictTo } from '../../utils/Tudakshana/authMiddleware.js';
import {
  getAllReviews,
  getMyReviews,
  getProductReviews,
  checkCanReview,
  addReview,
  updateReview,
  deleteReview,
  getReviewById,
  adminDeleteReview
} from '../../controllers/Senara/ReviewController.js';

const router = express.Router();


router.use(protect);


router.get('/', restrictTo('admin'), getAllReviews);


// Admin: delete any review
router.delete('/admin/:id', restrictTo('admin'), adminDeleteReview);

// customer,admin can add/view their reviews
router.get('/my-reviews', restrictTo('customer','admin'), getMyReviews);
router.get('/check/:productId', restrictTo('customer','admin'), checkCanReview);
router.get('/product/:productId', getProductReviews);
router.post('/', restrictTo('customer'), addReview);
router.get('/:id', restrictTo('customer','admin'), getReviewById);
router.patch('/:id', restrictTo('customer'), updateReview);
router.delete('/:id', restrictTo('customer','admin'), deleteReview);

export default router;