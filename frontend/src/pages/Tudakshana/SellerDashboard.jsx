import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../../services/Tudakshana/authService';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data
    const userData = authHelpers.getUser();
    if (!userData || userData.role !== 'seller') {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    authHelpers.clearAuth();
    navigate('/');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Sign Out
        </button>
      </div>

      <div className="welcome-section">
        <h2>Welcome, {user.name}!</h2>
        <p>Manage your products and orders from here.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📦</div>
          <h3>Products</h3>
          <p className="card-count">0</p>
          <button className="card-button" onClick={() => navigate('/products')}>
            Manage Products
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🛍️</div>
          <h3>Orders</h3>
          <p className="card-count">0</p>
          <button className="card-button" onClick={() => navigate('/my-orders')}>
            View Orders
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">⭐</div>
          <h3>Reviews</h3>
          <p className="card-count">0</p>
          <button className="card-button" onClick={() => navigate('/my-reviews')}>
            View Reviews
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Profile</h3>
          <p className="card-subtitle">Manage your account</p>
          <button className="card-button" onClick={() => navigate('/profile')}>
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
