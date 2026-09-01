import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  getCustomers,
  getCustomerStats,
  getCustomerSummary,
  getDashboardAnalytics,
} from '../../controllers/Tudakshana/adminController.js';
import { protect, isAdmin } from '../../utils/Tudakshana/authMiddleware.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

// Statistics
router.get('/stats', getUserStats);
router.get('/analytics', getDashboardAnalytics);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Customer management
router.get('/customers/stats', getCustomerStats);
router.get('/customers', getCustomers);
router.get('/customers/:id/summary', getCustomerSummary);

export default router;
