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
 * GuestRoute — redirige a /dashboard si el usuario YA está autenticado.
 */
export const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * CoachRoute — acceso exclusivo para rol "coach".
 * No autenticado → /login
 * Autenticado pero no es coach → /contestant/dashboard
 */
export const CoachRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role            = useAuthStore((s) => s.getRole());
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'coach')  return <Navigate to="/contestant/dashboard" replace />;
  return children;
};
