import axios from 'axios';

// Base API URL - Update this based on your environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials, role = null) => {
    const response = await api.post('/auth/login', {
      ...credentials,
      role, // Pass role to validate user type
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// The JWT lives only in an HttpOnly cookie. JavaScript stores non-sensitive
// display data for the current tab, never the token itself.
export const authHelpers = {
  saveAuth: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  getAuth: () => {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { user };
  },

  clearAuth: () => {
    sessionStorage.removeItem('user');
    void api.post('/auth/logout').catch(() => {});
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('user');
  },

  getUser: () => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },

  getUserRole: () => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user?.role || null;
    } catch (error) {
      return null;
    }
  },

  // Check if user has specific role
  hasRole: (role) => {
    const userRole = authHelpers.getUserRole();
    return userRole === role;
  },
};

export default api;
