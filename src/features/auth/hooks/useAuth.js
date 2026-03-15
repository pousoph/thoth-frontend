import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { logout as logoutService } from '@/features/auth/services/authService';

/**
 * useAuth — expone estado de autenticación y acciones globales.
 */
const useAuth = () => {
  const navigate        = useNavigate();
  const user            = useAuthStore((s) => s.user);
  const token           = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearAuth       = useAuthStore((s) => s.clearAuth);

  const logout = useCallback(async () => {
    await logoutService();
    clearAuth();
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  return { user, token, isAuthenticated, role: user?.role ?? null, logout };
};

export default useAuth;
