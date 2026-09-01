import React from 'react';
import { Navigate } from 'react-router-dom';
import { authHelpers } from '../../services/Tudakshana/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  try {
    const isAuthenticated = authHelpers.isAuthenticated();
    const userRole = authHelpers.getUserRole();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // If roles are specified and user doesn't have the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // Redirect based on user's actual role
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'seller') {
        return <Navigate to="/seller/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }

    return children;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
