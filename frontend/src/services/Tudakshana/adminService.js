import api from './authService';

// Admin API calls
export const adminAPI = {
  // Get user statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get dashboard analytics
  getDashboardAnalytics: async (period = 'weekly') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  // Get all users
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // Get customers with analytics fields
  getCustomers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/customers?${params}`);
    return response.data;
  },

  // Get customer summary statistics
  getCustomerStats: async () => {
    const response = await api.get('/admin/customers/stats');
    return response.data;
  },

  // Get customer detail summary
  getCustomerSummary: async (id) => {
    const response = await api.get(`/admin/customers/${id}/summary`);
    return response.data;
  },
};

export default adminAPI;
