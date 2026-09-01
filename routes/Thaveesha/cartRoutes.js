import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../../controllers/Thaveesha/cartController.js';
import { protect } from '../../utils/Tudakshana/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/', updateCartItem);
router.delete('/item/:itemId', removeCartItem);

export default router;
