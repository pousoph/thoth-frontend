/**
 * THOTH — API Client
 * Instancia axios centralizada con token JWT y manejo de 401.
 * Base URL: VITE_API_URL  →  https://splendid-jessika-unbosque-29a9d48d.koyeb.app/api/v1
 */

import axios from 'axios';
import useAuthStore from '@/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Adjuntar token en cada request ────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── 401 → limpiar sesión ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/**
 * Extrae el mensaje de error de una respuesta axios.
 */
export const getApiError = (err, fallback = 'Ocurrió un error inesperado') =>
  err?.response?.data?.message ??
  err?.response?.data?.error ??
  err?.message ??
  fallback;

export default apiClient;