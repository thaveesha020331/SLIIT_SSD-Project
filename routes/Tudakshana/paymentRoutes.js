import express from 'express';
import {
  createStripeCheckoutSession,
  stripeWebhook,
  processCashOnDelivery,
  getPaymentStatus,
  getPaymentByOrderId,
  refundPayment,
} from '../../controllers/Tudakshana/paymentController.js';
import { protect } from '../../utils/Tudakshana/authMiddleware.js';

const router = express.Router();

router.post('/stripe/webhook', stripeWebhook);

router.use(protect);

router.post('/stripe/create-checkout-session', createStripeCheckoutSession);
router.post('/process-cod', processCashOnDelivery);

router.get('/order/:orderId', getPaymentByOrderId);
router.get('/:paymentId', getPaymentStatus);

router.post('/:paymentId/refund', refundPayment);

export default router;
