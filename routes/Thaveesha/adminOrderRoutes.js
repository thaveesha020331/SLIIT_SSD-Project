import express from 'express';
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
} from '../../controllers/Thaveesha/adminOrderController.js';
import { protect } from '../../utils/Tudakshana/authMiddleware.js';

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access only' });
};

router.use(protect, adminOnly);

router.get('/', getAllOrders);
router.get('/:id', getOrderByIdAdmin);
router.patch('/:id/status', updateOrderStatus);

export default router;
