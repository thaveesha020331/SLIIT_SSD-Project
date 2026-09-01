import api from '../Tudakshana/authService';

const BASE = '/senara/reviews';

export const reviewService = {
  getAllReviews: () => api.get(BASE),

  getMyReviews: () => api.get(`${BASE}/my-reviews`),

  getProductReviews: (productId) => api.get(`${BASE}/product/${productId}`),

  checkCanReview: (productId, orderId) => {
    const params = orderId ? { orderId } : {};
    return api.get(`${BASE}/check/${productId}`, { params });
  },

  addReview: (data) => api.post(BASE, data),

  updateReview: (id, data) => api.patch(`${BASE}/${id}`, data),

  deleteReview: (id) => api.delete(`${BASE}/${id}`),

  adminDeleteReview: (id) => api.delete(`${BASE}/admin/${id}`),

  getReviewById: (id) => api.get(`${BASE}/${id}`),
};

export default reviewService;