/**
 * Admin Order Service - Thaveesha
 * API calls for admin order management.
 * Uses the same auth api instance so token is sent automatically.
 */
import api from '../Tudakshana/authService';

export const adminOrderAPI = {
  /**
   * Get all orders with optional filters
   * @param {{ status?: string, page?: number, limit?: number }} params
   * @returns {Promise<{ success: boolean, total: number, pages: number, orders: Array }>}
   */
  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  /**
   * Get single order by ID
   * @param {string} orderId
   * @returns {Promise<{ success: boolean, order: Object }>}
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order status
   * Validation: Cannot change a delivered order to cancelled
   * @param {string} orderId
   * @param {string} status - 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
   * @returns {Promise<{ success: boolean, order: Object }>}
   */
  updateStatus: async (orderId, status) => {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default adminOrderAPI;