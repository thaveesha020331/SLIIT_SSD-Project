import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/Tudakshana/adminService';
import { authAPI, authHelpers } from '../../services/Tudakshana/authService';
import AdminProducts from '../Lakna/AdminProducts';
import AdminReviewsPage from '../Senara/AdminReviewsPage';
import AdminOrders from '../Thaveesha/AdminOrders';
import './AdminDashboard.css';
import { EcoMartLogo } from '../../components/EcoMartLogo';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerPagination, setCustomerPagination] = useState(null);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerFilters, setCustomerFilters] = useState({
    search: '',
    isActive: '',
    joinedRange: '',
    hasOrders: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSummaryLoading, setCustomerSummaryLoading] = useState(false);
  const [customerSummary, setCustomerSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [analyticsPeriod, setAnalyticsPeriod] = useState('weekly');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    period: 'weekly',
    series: [],
    summary: {
      totalOrders: 0,
      totalRevenue: 0,
      totalNewUsers: 0,
    },
  });

  useEffect(() => {
    // Check if user is admin
    const userRole = authHelpers.getUserRole();
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    fetchStats();
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'customers') {
      fetchCustomerStats();
      fetchCustomers();
    }
    if (activeTab === 'profile') {
      fetchProfile();
    }
    if (activeTab === 'dashboard') {
      fetchDashboardAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, customerFilters, activeTab, analyticsPeriod, navigate]);

  const fetchDashboardAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const token = localStorage.getItem('token');

      if (token === 'admin-token-hardcoded') {
        const mockSeries = [
          { key: '1', label: 'Mon', orders: 1, revenue: 3250, newUsers: 1 },
          { key: '2', label: 'Tue', orders: 0, revenue: 0, newUsers: 0 },
          { key: '3', label: 'Wed', orders: 2, revenue: 6120, newUsers: 1 },
          { key: '4', label: 'Thu', orders: 1, revenue: 2100, newUsers: 0 },
          { key: '5', label: 'Fri', orders: 2, revenue: 8040, newUsers: 2 },
          { key: '6', label: 'Sat', orders: 0, revenue: 0, newUsers: 0 },
          { key: '7', label: 'Sun', orders: 0, revenue: 0, newUsers: 0 },
        ];
        const summary = mockSeries.reduce(
          (acc, point) => ({
            totalOrders: acc.totalOrders + point.orders,
            totalRevenue: acc.totalRevenue + point.revenue,
            totalNewUsers: acc.totalNewUsers + point.newUsers,
          }),
          { totalOrders: 0, totalRevenue: 0, totalNewUsers: 0 }
        );

        setAnalyticsData({
          period: analyticsPeriod,
          series: mockSeries,
          summary,
        });
        return;
      }

      const response = await adminAPI.getDashboardAnalytics(analyticsPeriod);
      setAnalyticsData(response?.data || {
        period: analyticsPeriod,
        series: [],
        summary: { totalOrders: 0, totalRevenue: 0, totalNewUsers: 0 },
      });
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
      setError(err.response?.data?.message || 'Error fetching analytics data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (token === 'admin-token-hardcoded') {
      const fallbackProfile = {
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        isActive: true,
      };
      setProfile(fallbackProfile);
      setProfileForm({
        name: fallbackProfile.name,
        phone: '',
      });
      return;
    }

    try {
      setProfileLoading(true);
      const response = await authAPI.getProfile();
      const fetchedProfile = response?.data?.user;

      if (!fetchedProfile) {
        throw new Error('Invalid profile response from server');
      }

      setProfile(fetchedProfile);
      setProfileForm({
        name: fetchedProfile.name || '',
        phone: fetchedProfile.phone || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Check if using hardcoded admin credentials
      const token = localStorage.getItem('token');
      if (token === 'admin-token-hardcoded') {
        // Set mock stats for hardcoded admin
        setStats({
          total: 0,
          active: 0,
          byRole: {
            admin: 1,
            seller: 0,
            customer: 0
          }
        });
        return;
      }
      
      const response = await adminAPI.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default stats on error
      setStats({
        total: 0,
        active: 0,
        byRole: {
          admin: 1,
          seller: 0,
          customer: 0
        }
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Check if using hardcoded admin credentials
      const token = localStorage.getItem('token');
      if (token === 'admin-token-hardcoded') {
        // Set empty users list for hardcoded admin
        setUsers([]);
        setPagination({ total: 0, page: 1, pages: 0, limit: 10 });
        setError('');
        setLoading(false);
        return;
      }
      
      console.log('Fetching users with filters:', filters);
      const response = await adminAPI.getAllUsers(filters);
      console.log('Users response:', response);

      if (response && response.data && response.data.users) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
        setError('');
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token === 'admin-token-hardcoded') {
        setCustomerStats({
          totalCustomers: 0,
          activeCustomers: 0,
          newCustomers30Days: 0,
          customersWithOrders: 0,
          repeatCustomers: 0,
          repeatRate: 0,
          averageOrderValue: 0,
        });
        return;
      }

      const response = await adminAPI.getCustomerStats();
      setCustomerStats(response?.data?.stats || null);
    } catch (err) {
      console.error('Error fetching customer stats:', err);
      setError(err.response?.data?.message || 'Error fetching customer statistics');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const token = localStorage.getItem('token');

      if (token === 'admin-token-hardcoded') {
        setCustomers([]);
        setCustomerPagination({ total: 0, page: 1, pages: 0, limit: 10 });
        setCustomersLoading(false);
        return;
      }

      const response = await adminAPI.getCustomers(customerFilters);
      setCustomers(response?.data?.customers || []);
      setCustomerPagination(response?.data?.pagination || null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Error fetching customers');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCustomersLoading(false);
    }
  };

  const openCustomerSummary = async (customerId) => {
    try {
      setCustomerSummaryLoading(true);
      setSelectedCustomer(customerId);
      setCustomerSummary(null);

      const token = localStorage.getItem('token');
      if (token === 'admin-token-hardcoded') {
        setCustomerSummary({
          customer: {
            name: 'Demo Customer',
            email: 'customer@test.com',
            phone: 'Not available',
            isActive: true,
          },
          summary: {
            totalOrders: 0,
            totalSpend: 0,
            lastOrderDate: null,
          },
          recentOrders: [],
        });
        return;
      }

      const response = await adminAPI.getCustomerSummary(customerId);
      setCustomerSummary(response?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading customer summary');
      setTimeout(() => setError(''), 3000);
      setSelectedCustomer(null);
    } finally {
      setCustomerSummaryLoading(false);
    }
  };

  const closeCustomerSummary = () => {
    setSelectedCustomer(null);
    setCustomerSummary(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const downloadCustomersAsCSV = async () => {
    try {
      setCustomersLoading(true);
      const token = localStorage.getItem('token');
      if (token === 'admin-token-hardcoded') {
        setError('CSV export requires a backend-connected admin account.');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const response = await adminAPI.getCustomers({
        ...customerFilters,
        page: 1,
        limit: 10000,
      });

      const rows = response?.data?.customers || [];
      if (!rows.length) {
        setError('No customer data to export');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const headers = [
        'Name',
        'Email',
        'Phone',
        'Status',
        'Joined Date',
        'Total Orders',
        'Total Spend',
        'Last Order Date',
      ];

      const csvRows = rows.map((customer) => [
        customer.name || '',
        customer.email || '',
        customer.phone || '',
        customer.isActive ? 'Active' : 'Inactive',
        customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '',
        customer.totalOrders || 0,
        Number(customer.totalSpend || 0).toFixed(2),
        customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'No orders',
      ]);

      const csvContent = [
        headers.join(','),
        ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `customers_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess('Customers list downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error exporting customers:', err);
      setError('Error exporting customers list');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCustomersLoading(false);
    }
  };

  const downloadAnalyticsReport = () => {
    const series = analyticsData?.series || [];
    if (!series.length) {
      setError('No analytics data available to export');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const headers = ['Label', 'Orders', 'Revenue', 'New Users'];
    const rows = series.map((point) => [
      point.label,
      point.orders,
      Number(point.revenue || 0).toFixed(2),
      point.newUsers,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_analytics_${analyticsPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess('Analytics report downloaded successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const renderOrdersRevenueChart = () => {
    const series = analyticsData?.series || [];
    if (!series.length) {
      return (
        <div className="chart-placeholder">
          <p>No data available for selected period.</p>
        </div>
      );
    }

    const maxOrders = Math.max(...series.map((point) => point.orders), 1);
    const maxRevenue = Math.max(...series.map((point) => Number(point.revenue || 0)), 1);

    return (
      <div className="chart-bars-wrap">
        <div className="chart-legend">
          <span><i className="legend-dot legend-orders" /> Orders</span>
          <span><i className="legend-dot legend-revenue" /> Revenue</span>
        </div>
        <div className="chart-bars">
          {series.map((point) => {
            const ordersHeight = Math.max((point.orders / maxOrders) * 100, 2);
            const revenueHeight = Math.max((Number(point.revenue || 0) / maxRevenue) * 100, 2);
            return (
              <div className="chart-group" key={point.key}>
                <div className="chart-bar-pair">
                  <div
                    className="chart-bar chart-bar-orders"
                    style={{ height: `${ordersHeight}%` }}
                    title={`${point.label} | Orders: ${point.orders}`}
                  />
                  <div
                    className="chart-bar chart-bar-revenue"
                    style={{ height: `${revenueHeight}%` }}
                    title={`${point.label} | Revenue: ${formatCurrency(point.revenue)}`}
                  />
                </div>
                <span className="chart-label">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNewUsersChart = () => {
    const series = analyticsData?.series || [];
    if (!series.length) {
      return (
        <div className="chart-placeholder">
          <p>No data available for selected period.</p>
        </div>
      );
    }

    const maxUsers = Math.max(...series.map((point) => point.newUsers), 1);

    return (
      <div className="chart-bars-wrap">
        <div className="chart-legend">
          <span><i className="legend-dot legend-users" /> New Users</span>
        </div>
        <div className="chart-bars single-series">
          {series.map((point) => {
            const height = Math.max((point.newUsers / maxUsers) * 100, 2);
            return (
              <div className="chart-group" key={point.key}>
                <div className="chart-bar-pair">
                  <div
                    className="chart-bar chart-bar-users"
                    style={{ height: `${height}%` }}
                    title={`${point.label} | New Users: ${point.newUsers}`}
                  />
                </div>
                <span className="chart-label">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleToggleStatus = async (userId) => {
    // Check if using hardcoded admin credentials
    const token = localStorage.getItem('token');
    if (token === 'admin-token-hardcoded') {
      setError('This feature requires a real backend connection. Please use a database-connected admin account.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const response = await adminAPI.toggleUserStatus(userId);
      setSuccess(response.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error toggling user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Check if using hardcoded admin credentials
    const token = localStorage.getItem('token');
    if (token === 'admin-token-hardcoded') {
      setError('This feature requires a real backend connection. Please use a database-connected admin account.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await adminAPI.deleteUser(userId);
      setSuccess(response.message);
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    authHelpers.clearAuth();
    navigate('/');
  };

  const handleProfileInputChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profileForm.name.trim()) {
      setError('Name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const token = localStorage.getItem('token');
    if (token === 'admin-token-hardcoded') {
      setProfile((prev) => ({
        ...prev,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      }));
      setSuccess('Profile updated locally for demo admin account.');
      setIsProfileEditing(false);
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    try {
      setProfileSaving(true);
      const response = await authAPI.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      const updatedProfile = response?.data?.user;
      setProfile(updatedProfile);
      setProfileForm({
        name: updatedProfile?.name || '',
        phone: updatedProfile?.phone || '',
      });
      setIsProfileEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('All password fields are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const token = localStorage.getItem('token');
    if (token === 'admin-token-hardcoded') {
      setSuccess('Password change is disabled for demo admin account.');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    try {
      setProfileSaving(true);
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'seller':
        return 'badge-seller';
      case 'customer':
        return 'badge-customer';
      default:
        return 'badge-default';
    }
  };

  const downloadUsersAsCSV = async () => {
    try {
      setLoading(true);
      // Fetch all users without pagination
      const response = await adminAPI.getAllUsers({
        role: filters.role,
        isActive: filters.isActive,
        search: filters.search,
        limit: 10000, // Large limit to get all users
      });

      if (!response.data || !response.data.users) {
        setError('No users data to download');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const usersData = response.data.users;

      // Prepare CSV headers
      const headers = ['Name', 'Email', 'Role', 'Status', 'Phone', 'Created Date'];

      // Prepare CSV rows
      const rows = usersData.map((user) => [
        user.name || '',
        user.email || '',
        user.role || '',
        user.isActive ? 'Active' : 'Inactive',
        user.phone || '',
        new Date(user.createdAt).toLocaleDateString(),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess('Users list downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error downloading users:', err);
      setError('Error downloading users. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardView();
      case 'users':
        return renderUsersView();
      case 'orders':
        return <AdminOrders/>;
      case 'customers':
        return renderCustomersView();
      case 'add-product':
        return <AdminProducts mode="add" />;
      case 'products':
        return <AdminProducts mode="list" />;
      case 'reviews':
        return <AdminReviewsPage/>;
      case 'profile':
        return renderProfileView();
      default:
        return renderDashboardView();
    }
  };

  const renderProfileView = () => {
    if (profileLoading) {
      return <div className="loader">Loading profile...</div>;
    }

    return (
      <>
        <div className="users-header">
          <h2>Admin Profile</h2>
          <p>Manage your account details and security settings</p>
        </div>

        <div className="admin-profile-card">
          <div className="admin-profile-header">
            <div className="admin-profile-avatar">
              {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="admin-profile-meta">
              <h3>{profile?.name || 'Administrator'}</h3>
              <p>{profile?.email || 'No email available'}</p>
              <span className="badge badge-admin">{(profile?.role || 'admin').toUpperCase()}</span>
            </div>
          </div>

          {!isProfileEditing ? (
            <div className="admin-profile-details">
              <div className="admin-detail-row">
                <label>Name</label>
                <span>{profile?.name || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Email</label>
                <span>{profile?.email || 'N/A'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Phone</label>
                <span>{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="admin-detail-row">
                <label>Status</label>
                <span className={`status-badge ${profile?.isActive ? 'active' : 'inactive'}`}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="profile-action-row">
                <button
                  className="btn-download"
                  type="button"
                  onClick={() => setIsProfileEditing(true)}
                >
                  Edit Profile
                </button>
                <button
                  className="btn-icon-secondary"
                  type="button"
                  onClick={() => setShowPasswordForm((prev) => !prev)}
                >
                  {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>
            </div>
          ) : (
            <form className="admin-profile-form" onSubmit={handleProfileSave}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="profile-action-row">
                <button className="btn-download" type="submit" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className="btn-icon-secondary"
                  type="button"
                  onClick={() => {
                    setIsProfileEditing(false);
                    setProfileForm({
                      name: profile?.name || '',
                      phone: profile?.phone || '',
                    });
                  }}
                  disabled={profileSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {showPasswordForm && (
            <form className="admin-password-form" onSubmit={handlePasswordSave}>
              <h4>Change Password</h4>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    minLength="6"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    minLength="6"
                    required
                  />
                </div>
              </div>
              <div className="profile-action-row">
                <button className="btn-download" type="submit" disabled={profileSaving}>
                  {profileSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </>
    );
  };

  const renderDashboardView = () => (
    <>
      <div className="dashboard-welcome">
        <h2>Admin Dashboard</h2>
        <p>Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-orders">
            <div className="stat-icon">🛍️</div>
            <div className="stat-info">
              <p className="stat-label">Total Orders</p>
              <h3 className="stat-value">{analyticsData?.summary?.totalOrders ?? 0}</h3>
            </div>
          </div>
          <div className="stat-card stat-revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">{formatCurrency(analyticsData?.summary?.totalRevenue ?? 0)}</h3>
            </div>
          </div>
          <div className="stat-card stat-products">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <p className="stat-label">Total Products</p>
              <h3 className="stat-value">5</h3>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <p className="stat-label">Pending Orders</p>
              <h3 className="stat-value">0</h3>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>Analytics Dashboard</h3>
          <div className="analytics-controls">
            <button className="btn-icon">📅</button>
            <select
              className="period-select"
              value={analyticsPeriod}
              onChange={(e) => setAnalyticsPeriod(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="btn-download" onClick={downloadAnalyticsReport}>📥 Download Report</button>
          </div>
        </div>
        <div className="analytics-grid">
          <div className="chart-card">
            <h4>Orders & Revenue</h4>
            {analyticsLoading ? <div className="chart-placeholder"><p>Loading analytics...</p></div> : renderOrdersRevenueChart()}
          </div>
          <div className="chart-card">
            <h4>New Users</h4>
            {analyticsLoading ? <div className="chart-placeholder"><p>Loading analytics...</p></div> : renderNewUsersChart()}
          </div>
        </div>
      </div>
    </>
  );

  const renderUsersView = () => (
    <>
      <div className="users-header">
        <h2>Users Management</h2>
        <p>Manage all users, roles, and permissions</p>
      </div>

      {/* User Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <p className="stat-label">Total Users</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Active Users</p>
              <h3 className="stat-value">{stats.active}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍💼</div>
            <div className="stat-info">
              <p className="stat-label">Admins</p>
              <h3 className="stat-value">{stats.byRole.admin}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-info">
              <p className="stat-label">Sellers</p>
              <h3 className="stat-value">{stats.byRole.seller}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <p className="stat-label">Customers</p>
              <h3 className="stat-value">{stats.byRole.customer}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>

        <select
          className="filter-select"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="customer">Customer</option>
        </select>

        <select
          className="filter-select"
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button 
          onClick={downloadUsersAsCSV}
          disabled={loading || users.length === 0}
          className="btn-download"
          title="Download user list as CSV"
        >
          ⬇️ Download
        </button>
      </div>

      {/* Users Table */}
      {loading && !users.length ? (
        <div className="loader">Loading users...</div>
      ) : users.length > 0 ? (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className="btn-action btn-toggle"
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="btn-action btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No users found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page === pagination.pages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </>
  );

  const renderCustomersView = () => (
    <>
      <div className="users-header">
        <h2>Customers Management</h2>
        <p>Track customer growth, behavior, and account health</p>
      </div>

      {customerStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🧑‍🤝‍🧑</div>
            <div className="stat-info">
              <p className="stat-label">Total Customers</p>
              <h3 className="stat-value">{customerStats.totalCustomers}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Active Customers</p>
              <h3 className="stat-value">{customerStats.activeCustomers}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🆕</div>
            <div className="stat-info">
              <p className="stat-label">New (30 Days)</p>
              <h3 className="stat-value">{customerStats.newCustomers30Days}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔁</div>
            <div className="stat-info">
              <p className="stat-label">Repeat Rate</p>
              <h3 className="stat-value">{customerStats.repeatRate}%</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-info">
              <p className="stat-label">Avg Order Value</p>
              <h3 className="stat-value">{formatCurrency(customerStats.averageOrderValue)}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search customer name, email, phone..."
            value={customerFilters.search}
            onChange={(e) => setCustomerFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>

        <select
          className="filter-select"
          value={customerFilters.isActive}
          onChange={(e) => setCustomerFilters((prev) => ({ ...prev, isActive: e.target.value, page: 1 }))}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select
          className="filter-select"
          value={customerFilters.joinedRange}
          onChange={(e) => setCustomerFilters((prev) => ({ ...prev, joinedRange: e.target.value, page: 1 }))}
        >
          <option value="">Any Join Date</option>
          <option value="30d">Joined Last 30 Days</option>
        </select>

        <select
          className="filter-select"
          value={customerFilters.hasOrders}
          onChange={(e) => setCustomerFilters((prev) => ({ ...prev, hasOrders: e.target.value, page: 1 }))}
        >
          <option value="">All Customers</option>
          <option value="true">Has Orders</option>
          <option value="false">No Orders</option>
        </select>

        <select
          className="filter-select"
          value={customerFilters.sortBy}
          onChange={(e) => setCustomerFilters((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }))}
        >
          <option value="createdAt">Sort: Joined Date</option>
          <option value="name">Sort: Name</option>
          <option value="totalOrders">Sort: Total Orders</option>
          <option value="totalSpend">Sort: Total Spend</option>
          <option value="lastOrderDate">Sort: Last Order Date</option>
        </select>

        <select
          className="filter-select"
          value={customerFilters.sortOrder}
          onChange={(e) => setCustomerFilters((prev) => ({ ...prev, sortOrder: e.target.value, page: 1 }))}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <button
          onClick={downloadCustomersAsCSV}
          disabled={customersLoading || customers.length === 0}
          className="btn-download"
        >
          ⬇️ Export CSV
        </button>
      </div>

      {customersLoading && !customers.length ? (
        <div className="loader">Loading customers...</div>
      ) : customers.length > 0 ? (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Total Orders</th>
                <th>Total Spend</th>
                <th>Last Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{customer.totalOrders || 0}</td>
                  <td>{formatCurrency(customer.totalSpend)}</td>
                  <td>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'No orders'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openCustomerSummary(customer._id)}
                        className="btn-action btn-view"
                        title="View summary"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(customer._id)}
                        className="btn-action btn-toggle"
                        title={customer.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {customer.isActive ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🧑‍🤝‍🧑</div>
          <h3>No customers found</h3>
          <p>Try adjusting filters to find matching customers.</p>
        </div>
      )}

      {customerPagination && customerPagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCustomerFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={customerPagination.page === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {customerPagination.page} of {customerPagination.pages}
          </span>
          <button
            onClick={() => setCustomerFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={customerPagination.page === customerPagination.pages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {selectedCustomer && (
        <div className="customer-modal-overlay" onClick={closeCustomerSummary}>
          <div className="customer-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <h3>Customer Summary</h3>
              <button className="btn-action btn-delete" onClick={closeCustomerSummary} title="Close">
                ✕
              </button>
            </div>

            {customerSummaryLoading ? (
              <div className="loader">Loading summary...</div>
            ) : customerSummary ? (
              <div className="customer-summary-content">
                <div className="admin-detail-row">
                  <label>Name</label>
                  <span>{customerSummary.customer?.name || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Email</label>
                  <span>{customerSummary.customer?.email || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Phone</label>
                  <span>{customerSummary.customer?.phone || 'N/A'}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Total Orders</label>
                  <span>{customerSummary.summary?.totalOrders || 0}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Total Spend</label>
                  <span>{formatCurrency(customerSummary.summary?.totalSpend)}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Last Order</label>
                  <span>
                    {customerSummary.summary?.lastOrderDate
                      ? new Date(customerSummary.summary.lastOrderDate).toLocaleString()
                      : 'No orders yet'}
                  </span>
                </div>

                <div className="customer-orders-list">
                  <h4>Recent Orders</h4>
                  {customerSummary.recentOrders?.length ? (
                    customerSummary.recentOrders.map((order) => (
                      <div key={order._id} className="customer-order-row">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="order-status">{order.status}</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-orders-text">No recent orders available.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="no-orders-text">Unable to load customer summary.</p>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">
              <EcoMartLogo size={34} />
            </span>
            <span className="brand-name">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h4 className="nav-section-title">MAIN MENU</h4>
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Users List</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">Order Management</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">Customers</span>
            </button>
          </div>

          <div className="nav-section">
            <h4 className="nav-section-title">PRODUCT</h4>
            <button
              className={`nav-item ${activeTab === 'add-product' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-product')}
            >
              <span className="nav-icon">➕</span>
              <span className="nav-text">Add Products</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Product List</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <span className="nav-icon">⭐</span>
              <span className="nav-text">Reviews</span>
            </button>
          </div>

          <div className="nav-section">
            <h4 className="nav-section-title">ADMIN</h4>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">Profile</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="main-header">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search data, users, or reports"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Sign Out
          </button>
        </header>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success">
            ✓ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            ✕ {error}
          </div>
        )}

        <div className="content-area">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
