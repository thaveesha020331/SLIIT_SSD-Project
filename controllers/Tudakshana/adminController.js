import User from '../../models/Tudakshana/User.js';
import Order from '../../models/Thaveesha/Order.js';

const buildCustomerQuery = ({ search, isActive, joinedRange, hasOrders }) => {
  const query = { role: 'customer' };

  if (isActive === 'true' || isActive === 'false') {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (joinedRange === '30d') {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 30);
    query.createdAt = { $gte: daysAgo };
  }

  if (hasOrders === 'true') {
    query._id = { $in: [] };
  }

  return query;
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    if (role) {
      query.role = role;
    }

    if (isActive === 'true' || isActive === 'false') {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, address, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling user status',
      error: error.message,
    });
  }
};

// @desc    Get customers list with order insights
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getCustomers = async (req, res) => {
  try {
    const {
      search,
      isActive,
      joinedRange,
      hasOrders,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const query = buildCustomerQuery({ search, isActive, joinedRange, hasOrders });

    if (hasOrders === 'true' || hasOrders === 'false') {
      const orderUserIds = await Order.distinct('user');
      query._id = hasOrders === 'true' ? { $in: orderUserIds } : { $nin: orderUserIds };
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const sortMap = {
      createdAt: { createdAt: sortOrder === 'asc' ? 1 : -1 },
      name: { name: sortOrder === 'asc' ? 1 : -1 },
      email: { email: sortOrder === 'asc' ? 1 : -1 },
    };

    const customers = await User.find(query)
      .select('-password')
      .sort(sortMap[sortBy] || sortMap.createdAt)
      .skip(skip)
      .limit(parsedLimit);

    const total = await User.countDocuments(query);
    const customerIds = customers.map((customer) => customer._id);

    const orderSummaries = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpend: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const orderSummaryMap = new Map(orderSummaries.map((row) => [String(row._id), row]));

    const enrichedCustomers = customers.map((customer) => {
      const summary = orderSummaryMap.get(String(customer._id));
      return {
        ...customer.toObject(),
        totalOrders: summary?.totalOrders || 0,
        totalSpend: Number(summary?.totalSpend || 0),
        lastOrderDate: summary?.lastOrderDate || null,
      };
    });

    if (sortBy === 'totalOrders' || sortBy === 'totalSpend' || sortBy === 'lastOrderDate') {
      const direction = sortOrder === 'asc' ? 1 : -1;
      enrichedCustomers.sort((a, b) => {
        const aVal = a[sortBy] ?? 0;
        const bVal = b[sortBy] ?? 0;

        if (sortBy === 'lastOrderDate') {
          const aTime = aVal ? new Date(aVal).getTime() : 0;
          const bTime = bVal ? new Date(bVal).getTime() : 0;
          return (aTime - bTime) * direction;
        }

        return (aVal - bVal) * direction;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customers: enrichedCustomers,
        pagination: {
          total,
          page: parsedPage,
          pages: Math.ceil(total / parsedLimit),
          limit: parsedLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message,
    });
  }
};

// @desc    Get customers analytics for admin panel
// @route   GET /api/admin/customers/stats
// @access  Private/Admin
export const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeCustomers = await User.countDocuments({ role: 'customer', isActive: true });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers30Days = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: thirtyDaysAgo },
    });

    const repeatCustomersAgg = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
        },
      },
      {
        $match: {
          totalOrders: { $gt: 1 },
        },
      },
      { $count: 'count' },
    ]);

    const customersWithOrdersAgg = await Order.aggregate([
      { $group: { _id: '$user' } },
      { $count: 'count' },
    ]);

    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalSpend: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalSpend' },
          totalOrders: { $sum: '$totalOrders' },
        },
      },
    ]);

    const repeatCustomers = repeatCustomersAgg[0]?.count || 0;
    const customersWithOrders = customersWithOrdersAgg[0]?.count || 0;
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalOrders = revenueAgg[0]?.totalOrders || 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          activeCustomers,
          newCustomers30Days,
          customersWithOrders,
          repeatCustomers,
          repeatRate: totalCustomers ? Number(((repeatCustomers / totalCustomers) * 100).toFixed(2)) : 0,
          averageOrderValue: totalOrders ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message,
    });
  }
};

// @desc    Get customer detail with recent orders
// @route   GET /api/admin/customers/:id/summary
// @access  Private/Admin
export const getCustomerSummary = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const orderStatsAgg = await Order.aggregate([
      { $match: { user: customer._id } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpend: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const recentOrders = await Order.find({ user: customer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('status total createdAt paymentStatus shippingAddress');

    const summary = orderStatsAgg[0] || {
      totalOrders: 0,
      totalSpend: 0,
      lastOrderDate: null,
    };

    res.status(200).json({
      success: true,
      data: {
        customer,
        summary: {
          totalOrders: summary.totalOrders,
          totalSpend: Number(summary.totalSpend || 0),
          lastOrderDate: summary.lastOrderDate,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Get customer summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer summary',
      error: error.message,
    });
  }
};

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const getAnalyticsBuckets = (period) => {
  const now = new Date();
  const buckets = [];
  let startDate;

  if (period === 'yearly') {
    const currentYear = now.getUTCFullYear();
    for (let offset = 4; offset >= 0; offset -= 1) {
      const year = currentYear - offset;
      buckets.push({
        key: String(year),
        label: String(year),
      });
    }
    startDate = new Date(Date.UTC(currentYear - 4, 0, 1, 0, 0, 0, 0));
    return { startDate, buckets };
  }

  if (period === 'monthly') {
    const dateRef = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(Date.UTC(dateRef.getUTCFullYear(), dateRef.getUTCMonth() - offset, 1));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
      buckets.push({ key, label });
    }
    startDate = new Date(Date.UTC(dateRef.getUTCFullYear(), dateRef.getUTCMonth() - 5, 1, 0, 0, 0, 0));
    return { startDate, buckets };
  }

  // weekly by default: last 7 days
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(todayUtc);
    date.setUTCDate(todayUtc.getUTCDate() - offset);
    buckets.push({
      key: formatDateKey(date),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    });
  }
  startDate = new Date(todayUtc);
  startDate.setUTCDate(todayUtc.getUTCDate() - 6);
  return { startDate, buckets };
};

// @desc    Get dashboard analytics time series
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res) => {
  try {
    const requestedPeriod = String(req.query.period || 'weekly').toLowerCase();
    const period = ['weekly', 'monthly', 'yearly'].includes(requestedPeriod)
      ? requestedPeriod
      : 'weekly';

    const { startDate, buckets } = getAnalyticsBuckets(period);

    const dateFormat =
      period === 'yearly' ? '%Y' : period === 'monthly' ? '%Y-%m' : '%Y-%m-%d';

    const ordersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]);

    const usersAgg = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
    ]);

    const orderMap = new Map(ordersAgg.map((item) => [item._id, item]));
    const userMap = new Map(usersAgg.map((item) => [item._id, item]));

    const series = buckets.map((bucket) => {
      const orderItem = orderMap.get(bucket.key);
      const userItem = userMap.get(bucket.key);
      return {
        key: bucket.key,
        label: bucket.label,
        orders: orderItem?.orders || 0,
        revenue: Number(orderItem?.revenue || 0),
        newUsers: userItem?.newUsers || 0,
      };
    });

    const summary = series.reduce(
      (acc, point) => ({
        totalOrders: acc.totalOrders + point.orders,
        totalRevenue: acc.totalRevenue + point.revenue,
        totalNewUsers: acc.totalNewUsers + point.newUsers,
      }),
      { totalOrders: 0, totalRevenue: 0, totalNewUsers: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        period,
        series,
        summary: {
          totalOrders: summary.totalOrders,
          totalRevenue: Number(summary.totalRevenue.toFixed(2)),
          totalNewUsers: summary.totalNewUsers,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const adminCount = await User.countDocuments({ role: 'admin' });
    const sellerCount = await User.countDocuments({ role: 'seller' });
    const customerCount = await User.countDocuments({ role: 'customer' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          byRole: {
            
            admin: adminCount,
            seller: sellerCount,
            customer: customerCount,
          },
        },
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message,
    });
  }
};
