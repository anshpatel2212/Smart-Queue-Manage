import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../shared/LoadingScreen';

const ALLOWED_ROLES = ['student', 'staff', 'admin'];

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile, role, loading, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // 1. Wait while Firebase authentication and Firestore profile are loading
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. If not authenticated, redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verify account active status
  if (user.status !== 'active') {
    logout().catch(() => {});
    return <Navigate to="/login" state={{ error: 'Your account is inactive. Please contact the administrator.' }} replace />;
  }

  // 4. Verify valid role configuration
  const currentRole = role || profile?.role || user.role;
  if (!currentRole || !ALLOWED_ROLES.includes(currentRole)) {
    logout().catch(() => {});
    return <Navigate to="/login" state={{ error: 'Your account role is not configured. Please contact the administrator.' }} replace />;
  }

  // 5. Enforce role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    // Cross-role redirect to user's assigned dashboard
    if (currentRole === 'student') {
      return <Navigate to="/student" replace />;
    } else if (currentRole === 'staff') {
      return <Navigate to="/staff" replace />;
    } else if (currentRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export const StudentRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['student']}>{children}</ProtectedRoute>
);

export const StaffRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['staff']}>{children}</ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
