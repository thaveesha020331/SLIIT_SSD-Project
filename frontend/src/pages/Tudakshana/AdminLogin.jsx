import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { EcoMartLogo } from '../../components/EcoMartLogo';
import { authAPI, authHelpers } from '../../services/Tudakshana/authService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = authHelpers.isAuthenticated();
    const userRole = authHelpers.getUserRole();
    
    if (isLoggedIn) {
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'seller') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Call backend API for admin login
      const response = await authAPI.login(
        {
          email: formData.email,
          password: formData.password,
        },
        'admin' // Enforce admin role
      );

      console.log('Login response:', response); // Debug log

      if (response.success) {
        const token = response?.data?.token || response?.token;
        const user = response?.data?.user || response?.user;

        console.log('Token:', token); // Debug log
        console.log('User:', user); // Debug log

        if (!token || !user) {
          setError('Login response is invalid. Please try again.');
          setLoading(false);
          return;
        }

        if (user.role !== 'admin') {
          setError('This account does not have admin access.');
          setLoading(false);
          return;
        }

        // Save auth data
        authHelpers.saveAuth(token, user);
        setSuccess('Admin login successful! Redirecting...');

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true });
        }, 500);
      } else {
        setError(response.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Admin login error:', err);
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <EcoMartLogo size={56} />
          </div>
          <span className="admin-badge">Admin Portal</span>
          <h1>Admin Access</h1>
          <p>Secure login for administrators only</p>
        </div>

        <div className="security-notice">
          <div className="security-notice-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="security-notice-text">
            This is a restricted area. Unauthorized access attempts will be logged and reported.
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="admin@ecomart.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your admin password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/forgot-password'); }} className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn-admin-login" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {loading ? 'Verifying...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="login-type-switch">
          Not an admin? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login as User</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
