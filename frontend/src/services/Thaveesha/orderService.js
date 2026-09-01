/**
 * Order API – Thaveesha
 * Frontend service for order endpoints. Uses auth api instance (token sent automatically).
 * Backend: routes/Thaveesha/orderRoutes.js, controllers/Thaveesha/orderController.js
 */
import api from '../Tudakshana/authService';

export const orderAPI = {
  /**
   * Create order from cart/items. Backend clears cart and decrements product stock.
   * @param {Object} payload
   * @param {Array<{ productId: string, quantity: number }>} payload.items
   * @param {string} payload.shippingAddress
   * @param {string} payload.phone
   * @param {string} [payload.notes]
   * @returns {Promise<{ success: boolean, order: Object }>}
   */
  createOrder: async (payload) => {
    const response = await api.post('/orders', payload);
    return response.data;
  },

  /**
   * Get current user's orders (list).
   * @returns {Promise<Array>}
   */
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    const data = response.data;
    return Array.isArray(data) ? data : data?.orders ?? [];
  },

  /**
   * Get single order by id (must belong to current user).
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel order (pending/processing only). Backend restores product stock.
   * @param {string} orderId
   * @returns {Promise<{ success: boolean, order: Object }>}
   */
  cancelOrder: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export default orderAPI;
