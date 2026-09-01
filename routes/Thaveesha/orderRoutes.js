import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../../controllers/Thaveesha/orderController.js';
import { protect } from '../../utils/Tudakshana/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

export default router;
