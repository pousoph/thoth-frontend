/**
 * THOTH — Auth Service (único, sin mock)
 * Base URL leída desde variable de entorno VITE_API_URL
 */

import axios from 'axios';
import useAuthStore from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Adjuntar token JWT en cada request autenticado ────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── 401 → limpiar sesión y redirigir (solo para rutas protegidas) ─────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url ?? '';
    const isAuthRoute = url.includes('/auth/');
    if (err.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().clearAuth();
      window.location.href = import.meta.env.BASE_URL + 'login';
    }
    return Promise.reject(err);
  }
);

const STATUS_MSG = {
  403: 'No tienes permisos para realizar esta acción.',
  408: 'La solicitud tardó demasiado. Intenta de nuevo.',
  429: 'Demasiadas solicitudes. Espera un momento.',
  500: 'Error interno del servidor. Intenta más tarde.',
  502: 'El servidor no está disponible. Intenta más tarde.',
  503: 'Servicio en mantenimiento. Intenta más tarde.',
};

const getError = (err, fallback = 'Ocurrió un error inesperado') => {
  const status = err?.response?.status;
  const msg    = err?.response?.data?.message ?? err?.response?.data?.error;

  if (msg && [400, 404, 409, 422].includes(status)) return msg;
  if (status && STATUS_MSG[status]) return STATUS_MSG[status];
  if (err?.code === 'ECONNABORTED') return 'La conexión tardó demasiado. Verifica tu internet.';
  if (err?.code === 'ERR_NETWORK')  return 'No se pudo conectar al servidor. Verifica tu internet.';

  return fallback;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/login
// Body: { username, password }
// 200: { token, role, level }
// 403: { error: "account not activated", id }
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (username, password) => {
  try {
    const { data } = await api.post('/auth/login', { username, password });
    const { token, role, level } = data;
    const codeforcesHandle = data['codeforces-handle'] ?? data['codeforces_handle'] ?? null;
    const levelMap = {
      basica: 'Basica', intermedia: 'Intermedia',
      avanzada: 'Avanzada', aprendiz: 'Aprendiz', elite: 'Elite',
    };
    const normalizedLevel = levelMap[level?.toLowerCase()] ?? level ?? null;
    // Extraer id del usuario: del body de login o del payload del JWT
    let userId = data.id ?? data.user_id ?? data['user-id'] ?? null;
    if (userId == null && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id ?? payload.user_id ?? payload.sub ?? null;
      } catch { /* token inválido, ignorar */ }
    }
    if (userId != null) userId = Number(userId);
    useAuthStore.getState().setAuth({ id: userId, username, role, level: normalizedLevel, codeforcesHandle }, token);
    return { success: true };
  } catch (err) {
    const status = err?.response?.status;
    const data   = err?.response?.data;

    if (status === 403 && data?.error === 'account not activated') {
      if (data?.id != null) useAuthStore.getState().setPendingUserId(Number(data.id));
      return {
        success: false,
        code:    'ACCOUNT_NOT_ACTIVATED',
        message: 'Tu cuenta no está activada. Te reenviamos el código a tu correo.',
      };
    }

    return { success: false, message: getError(err, 'Usuario o contraseña incorrectos') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/register/contestant
// Body exacto (keys con guiones, fecha DD-MM-YYYY):
// { name, "last-name", username, password, email, "birth-date", size, "codeforces-handle", gender }
// 201: { message: "User registered successfully", id }
// ─────────────────────────────────────────────────────────────────────────────
export const registerContestant = async (payload) => {
  try {
    const { data } = await api.post('/auth/register/contestant', payload);
    if (data?.id != null) useAuthStore.getState().setPendingUserId(Number(data.id));
    return { success: true };
  } catch (err) {
    const backendMsg = (err?.response?.data?.error ?? err?.response?.data?.message ?? '').toLowerCase();
    if (backendMsg.includes('codeforces'))
      return { success: false, message: 'El handle de Codeforces no es válido o no existe. Verifica que sea correcto.' };
    return { success: false, message: getError(err, 'Error al registrar competidor') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/register/coach
// mismo body que contestant
// ─────────────────────────────────────────────────────────────────────────────
export const registerCoach = async (payload) => {
  try {
    const { data } = await api.post('/auth/register/coach', payload);
    if (data?.id != null) useAuthStore.getState().setPendingUserId(Number(data.id));
    return { success: true };
  } catch (err) {
    const backendMsg = (err?.response?.data?.error ?? err?.response?.data?.message ?? '').toLowerCase();
    if (backendMsg.includes('codeforces'))
      return { success: false, message: 'El handle de Codeforces no es válido o no existe. Verifica que sea correcto.' };
    return { success: false, message: getError(err, 'Error al registrar coach') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/activate
// Body: { code: "482917", id: 1 }   ← id viene del store, no lo escribe el usuario
// 200: { message: "Account activated successfully" }
// ─────────────────────────────────────────────────────────────────────────────
export const activateAccount = async (code) => {
  const id = useAuthStore.getState().getPendingUserId();

  if (!id)
    return { success: false, message: 'No se encontró tu sesión. Por favor regístrate de nuevo.' };

  try {
    await api.post('/auth/activate', { code, id: Number(id) });
    useAuthStore.getState().clearPendingUserId();
    return { success: true };
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400) return { success: false, message: 'Código incorrecto. Intenta de nuevo.' };
    if (status === 410) return { success: false, message: 'El código expiró. Intenta iniciar sesión para recibir uno nuevo.' };
    return { success: false, message: getError(err) };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/forgot-password
// Body: { email }
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  try {
    await api.post('/auth/forgot-password', { email });
    return { success: true };
  } catch (err) {
    return { success: false, message: getError(err) };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/reset-password
// Body: { email, code, "new-password" }
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (email, code, newPassword) => {
  try {
    await api.post('/auth/reset-password', {
      email,
      code,
      'new-password': newPassword,
    });
    return { success: true };
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400) return { success: false, message: 'Código incorrecto. Intenta de nuevo.' };
    if (status === 410) return { success: false, message: 'El código expiró. Solicita uno nuevo.' };
    return { success: false, message: getError(err) };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async () => {
  try { await api.post('/auth/logout'); } catch { /* ignorar */ }
  finally { useAuthStore.getState().clearAuth(); }
};

export default api;