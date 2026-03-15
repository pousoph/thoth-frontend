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

// ── 401 → limpiar sesión y redirigir ─────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const getError = (err, fallback = 'Ocurrió un error inesperado') =>
  err?.response?.data?.message ??
  err?.response?.data?.error ??
  err?.message ??
  fallback;

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/login
// Body: { username, password }
// 200: { token, role, level }
// 403: { error: "account not activated", id }
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (username, password) => {
  try {
    const { data } = await api.post('/auth/login', { username, password });
    // level llega en minúsculas del backend (basica, intermedia, avanzada)
    // Lo normalizamos para el sistema de temas CSS
    const { token, role, level } = data;
    // El backend también retorna el handle de CF — puede venir como
    // "codeforces-handle" o "codeforces_handle" según la versión del backend
    const codeforcesHandle = data['codeforces-handle'] ?? data['codeforces_handle'] ?? null;
    const levelMap = {
      basica: 'Basica', intermedia: 'Intermedia',
      avanzada: 'Avanzada', aprendiz: 'Aprendiz', elite: 'Elite',
    };
    const normalizedLevel = levelMap[level?.toLowerCase()] ?? level ?? null;
    useAuthStore.getState().setAuth({ username, role, level: normalizedLevel, codeforcesHandle }, token);
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
    if (err?.response?.data?.error === 'codeforces handle not found')
      return { success: false, message: 'El handle de Codeforces no existe. Verifica que sea correcto.' };
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
    if (err?.response?.data?.error === 'codeforces handle not found')
      return { success: false, message: 'El handle de Codeforces no existe. Verifica que sea correcto.' };
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
// POST /auth/logout
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async () => {
  try { await api.post('/auth/logout'); } catch { /* ignorar */ }
  finally { useAuthStore.getState().clearAuth(); }
};

export default api;