import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../shared/LoadingScreen';

const ALLOWED_STAFF_ADMIN_ROLES = ['staff', 'admin'];

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile, role, loading, isAuthenticated, isAnonymous, logout } = useAuth();
  const location = useLocation();

  // 1. Wait while Firebase authentication and profile are loading
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. Anonymous students or unauthenticated users cannot access staff/admin protected routes
  if (!isAuthenticated || !user || isAnonymous || role === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verify account active status
  const currentStatus = (profile?.status || user?.status || '').toString().toLowerCase().trim();
  if (currentStatus === 'pending') {
    logout().catch(() => {});
    return <Navigate to="/login" state={{ error: 'Your staff account is pending administrator approval.' }} replace />;
  }
  if (currentStatus !== 'active') {
    logout().catch(() => {});
    return <Navigate to="/login" state={{ error: 'Your account is inactive. Please contact the administrator.' }} replace />;
  }

  // 4. Verify valid staff or admin role
  const currentRole = (role || profile?.role || user?.role || '').toString().toLowerCase().trim();
  if (!currentRole || !ALLOWED_STAFF_ADMIN_ROLES.includes(currentRole)) {
    logout().catch(() => {});
    return <Navigate to="/login" state={{ error: 'Access denied. Only Staff and Admin accounts can access this section.' }} replace />;
  }

  // 5. Enforce role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    console.warn(`[ProtectedRoute] Access denied for role '${currentRole}' to route requiring [${allowedRoles.join(', ')}]. Redirecting to authorized dashboard.`);
    if (currentRole === 'staff') {
      return <Navigate to="/staff" replace />;
    } else if (currentRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// Student routes are public, no authentication guard required
export const StudentRoute = ({ children }) => children;

export const StaffRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['staff']}>{children}</ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
