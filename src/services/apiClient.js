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
      window.location.href = import.meta.env.BASE_URL + 'login';
    }
    return Promise.reject(err);
  }
);

/**
 * Extrae el mensaje de error de una respuesta axios.
 * Solo muestra el mensaje del backend para errores de lógica de negocio (400, 404, 409, 422).
 * Para errores de infraestructura o red devuelve mensajes amigables en español.
 */
const STATUS_MSG = {
  403: 'No tienes permisos para realizar esta acción.',
  408: 'La solicitud tardó demasiado. Intenta de nuevo.',
  429: 'Demasiadas solicitudes. Espera un momento.',
  500: 'Error interno del servidor. Intenta más tarde.',
  502: 'El servidor no está disponible. Intenta más tarde.',
  503: 'Servicio en mantenimiento. Intenta más tarde.',
};

export const getApiError = (err, fallback = 'Ocurrió un error inesperado') => {
  const status = err?.response?.status;
  const msg    = err?.response?.data?.message ?? err?.response?.data?.error;

  if (msg && [400, 404, 409, 422].includes(status)) return msg;
  if (status && STATUS_MSG[status]) return STATUS_MSG[status];
  if (err?.code === 'ECONNABORTED') return 'La conexión tardó demasiado. Verifica tu internet.';
  if (err?.code === 'ERR_NETWORK')  return 'No se pudo conectar al servidor. Verifica tu internet.';

  return fallback;
};

export default apiClient;