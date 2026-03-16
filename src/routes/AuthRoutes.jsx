import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * ProtectedRoute — redirige a /login si el usuario NO está autenticado.
 */
export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * GuestRoute — redirige según rol si el usuario YA está autenticado.
 */
export const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.getRole());

  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'coach') return <Navigate to="/coach/dashboard" replace />;
    return <Navigate to="/contestant/dashboard" replace />;
  }

  return children;
};

/**
 * AdminRoute — acceso exclusivo para rol "admin".
 */
export const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role            = useAuthStore((s) => s.getRole());
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin')  return <Navigate to="/contestant/dashboard" replace />;
  return children;
};

/**
 * CoachRoute — acceso exclusivo para rol "coach".
 */
export const CoachRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role            = useAuthStore((s) => s.getRole());
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'coach')  return <Navigate to="/contestant/dashboard" replace />;
  return children;
};
