import api from '../Tudakshana/authService';

const API_URL = '/payments';

const paymentAPI = {
  // Create Stripe checkout session
  createStripeCheckoutSession: async (orderId) => {
    try {
      const response = await api.post(
        `${API_URL}/stripe/create-checkout-session`,
        { orderId }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Process cash on delivery
  processCashOnDelivery: async (orderId) => {
    try {
      const response = await api.post(`${API_URL}/process-cod`, { orderId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment status by payment ID
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`${API_URL}/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment by order ID
  getPaymentByOrderId: async (orderId) => {
    try {
      const response = await api.get(`${API_URL}/order/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refund payment
  refundPayment: async (paymentId) => {
    try {
      const response = await api.post(`${API_URL}/${paymentId}/refund`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default paymentAPI;
