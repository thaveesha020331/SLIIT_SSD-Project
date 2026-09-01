import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, authHelpers } from '../../services/Tudakshana/authService';
import MapAddressPicker from '../../components/Thaveesha/MapAddressPicker';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    themePreference: 'light',
    preferredPaymentMethod: 'cash_on_delivery',
    billingName: '',
    billingAddress: '',
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const formatAddress = (addressObj) => {
    if (!addressObj || typeof addressObj !== 'object') return '';
    return [addressObj.street, addressObj.city, addressObj.state, addressObj.zipCode, addressObj.country]
      .filter(Boolean)
      .join(', ');
  };

  const buildAddressObject = (rawAddress) => {
    const text = String(rawAddress || '').trim();
    if (!text) return undefined;
    const parts = text.split(',').map((part) => part.trim()).filter(Boolean);
    return {
      street: parts[0] || text,
      city: parts[1] || '',
      state: parts[2] || '',
      zipCode: parts[3] || '',
      country: parts[4] || '',
    };
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      const paymentCard = response.data.user.paymentCard || {};
      setFormData({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone || '',
        address: formatAddress(response.data.user.address),
        themePreference: response.data.user.themePreference || 'light',
        preferredPaymentMethod: paymentCard.preferredPaymentMethod || 'cash_on_delivery',
        billingName: paymentCard.billingName || '',
        billingAddress: paymentCard.billingAddress || '',
      });
      localStorage.setItem('userTheme', response.data.user.themePreference || 'light');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        themePreference: formData.themePreference,
      };
      const addressObj = buildAddressObject(formData.address);
      if (addressObj) payload.address = addressObj;

      payload.paymentCard = {
        preferredPaymentMethod: formData.preferredPaymentMethod,
        billingName: formData.billingName.trim(),
        billingAddress: formData.billingAddress.trim(),
      };

      const response = await authAPI.updateProfile(payload);
      setUser(response.data.user);
      const cachedUser = authHelpers.getUser() || {};
      localStorage.setItem('user', JSON.stringify({ ...cachedUser, ...response.data.user }));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      localStorage.setItem('userTheme', response.data.user.themePreference || 'light');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleRemoveSavedCard = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile({
        paymentCard: { clear: true },
      });
      setUser(response.data.user);
      setFormData((prev) => ({
        ...prev,
        preferredPaymentMethod: 'cash_on_delivery',
        billingName: '',
        billingAddress: '',
      }));
      setSuccess('Saved card details removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove saved card');
    }
  };

  const handleLogout = () => {
    authHelpers.clearAuth();
    navigate('/');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge-admin';
      case 'seller':
        return 'role-badge-seller';
      case 'customer':
        return 'role-badge-customer';
      default:
        return 'role-badge-default';
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={handleLogout} className="btn-logout">
          Sign Out
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info-section">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-basic-info">
              <h2>{user?.name}</h2>
              <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                {user?.role?.toUpperCase()}
              </span>
              <p className="profile-status">
                Status: <span className={user?.isActive ? 'status-active' : 'status-inactive'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p className="profile-joined">
                Member since: {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="profile-details">
              <div className="detail-row">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="detail-row">
                <label>Phone:</label>
                <span>{user?.phone || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <label>Address:</label>
                <span>{formatAddress(user?.address) || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <label>Theme:</label>
                <span>{(user?.themePreference || 'light').toUpperCase()}</span>
              </div>
              <div className="detail-row">
                <label>Preferred Payment:</label>
                <span>{(user?.paymentCard?.preferredPaymentMethod || 'cash_on_delivery') === 'card' ? 'Card (Stripe)' : 'Cash on Delivery'}</span>
              </div>
              <div className="detail-row">
                <label>Billing Name:</label>
                <span>{user?.paymentCard?.billingName || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <label>Billing Address:</label>
                <span>{user?.paymentCard?.billingAddress || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <label>Stripe Card:</label>
                <span>
                  {user?.paymentCard?.cardNumberLast4
                    ? `${(user.paymentCard.cardBrand || 'Card').toUpperCase()} •••• ${user.paymentCard.cardNumberLast4} (${String(user.paymentCard.expiryMonth || '').padStart(2, '0')}/${String(user.paymentCard.expiryYear || '').slice(-2)})`
                    : 'Not provided'}
                </span>
              </div>
              <div className="profile-actions">
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="btn-primary"
                >
                  Edit Profile
                </button>
                {user?.paymentCard?.cardNumberLast4 && (
                  <button
                    onClick={handleRemoveSavedCard}
                    className="btn-danger"
                    type="button"
                  >
                    Remove Saved Card
                  </button>
                )}
                <button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)} 
                  className="btn-secondary"
                >
                  {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, city, state, zip, country"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: '8px' }}
                  onClick={() => setShowMapPicker(true)}
                >
                  Pick from map
                </button>
              </div>
              <div className="form-group">
                <label>Home UI Theme:</label>
                <select
                  name="themePreference"
                  value={formData.themePreference}
                  onChange={handleInputChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="green">Green</option>
                </select>
              </div>
              <div className="card-details-section">
                <h3>Payment Preferences</h3>
                {user?.paymentCard?.cardNumberLast4 && (
                  <p className="card-note">
                    Stripe card on file: {(user.paymentCard.cardBrand || 'Card').toUpperCase()} •••• {user.paymentCard.cardNumberLast4}
                  </p>
                )}
                <div className="form-group">
                  <label>Preferred Payment Method:</label>
                  <select
                    name="preferredPaymentMethod"
                    value={formData.preferredPaymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="card">Card (Stripe Checkout)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Billing Name:</label>
                  <input
                    type="text"
                    name="billingName"
                    value={formData.billingName}
                    onChange={handleInputChange}
                    placeholder="Name for receipts/invoices"
                  />
                </div>
                <div className="form-group">
                  <label>Billing Address:</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    placeholder="Billing address"
                  />
                </div>
                <p className="card-note">Card entry is handled securely on Stripe Checkout. No raw card data is stored in your profile.</p>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      phone: user.phone || '',
                      address: formatAddress(user.address),
                      themePreference: user.themePreference || 'light',
                      preferredPaymentMethod: user.paymentCard?.preferredPaymentMethod || 'cash_on_delivery',
                      billingName: user.paymentCard?.billingName || '',
                      billingAddress: user.paymentCard?.billingAddress || '',
                    });
                  }} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {showMapPicker && (
            <MapAddressPicker
              onSelect={({ address }) => {
                setFormData((prev) => ({ ...prev, address }));
                setShowMapPicker(false);
              }}
              onClose={() => setShowMapPicker(false)}
            />
          )}

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="password-change-form">
              <h3>Change Password</h3>
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
