/**
 * Cart API – Thaveesha
 * Frontend service for cart endpoints. Uses auth api instance (token sent automatically).
 * Backend: routes/Thaveesha/cartRoutes.js, controllers/Thaveesha/cartController.js
 */
import api from '../Tudakshana/authService';

export const cartAPI = {
  /**
   * Get current user's cart (items with product details).
   * @returns {Promise<{ items: Array }>}
   */
  getCart: async () => {
    const response = await api.get('/cart');
    const items = response.data?.items ?? [];
    const totalItems = response.data?.totalItems ?? items.reduce((s, i) => s + (i.quantity || 1), 0);
    return { items, totalItems };
  },

  /**
   * Add product to cart (or increase quantity if already in cart).
   * @param {string} productId - MongoDB ObjectId of product (from Lakna Product model)
   * @param {number} [quantity=1]
   * @returns {Promise<{ success: boolean, items: Array }>}
   */
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  /**
   * Update cart item quantity.
   * @param {string} itemId - Cart line item _id
   * @param {number} quantity
   * @returns {Promise<{ success: boolean, items: Array }>}
   */
  updateItem: async (itemId, quantity) => {
    const response = await api.put('/cart', { itemId, quantity });
    return response.data;
  },

  /**
   * Remove item from cart.
   * @param {string} itemId - Cart line item _id
   * @returns {Promise<{ success: boolean, items: Array }>}
   */
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/item/${itemId}`);
    return response.data;
  },
};

export default cartAPI;
