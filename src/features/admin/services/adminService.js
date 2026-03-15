import apiClient, { getApiError } from '@/services/apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD — GET /dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const fetchDashboard = async () => {
  try {
    const { data } = await apiClient.get('/dashboard');
    return { success: true, data: data.dashboard };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar el dashboard de administrador') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COACH QUEUE — GET /auth/admin/queue/coach
// ─────────────────────────────────────────────────────────────────────────────
export const fetchPendingCoaches = async () => {
  try {
    const { data } = await apiClient.get('/auth/admin/queue/coach');
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar los coaches pendientes') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE COACH — POST /auth/admin/coach/activate
// ─────────────────────────────────────────────────────────────────────────────
export const activateCoach = async (coachId) => {
  try {
    const { data } = await apiClient.post('/auth/admin/coach/activate', { coach_id: coachId });
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al activar el coach') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REJECT COACH — POST /auth/admin/coach/reject
// ─────────────────────────────────────────────────────────────────────────────
export const rejectCoach = async (coachId) => {
  try {
    const { data } = await apiClient.post('/auth/admin/coach/reject', { coach_id: coachId });
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al rechazar el coach') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREAR COMPETENCIA SCRAPING  — POST /contests/create
// { name, type, url }
// ─────────────────────────────────────────────────────────────────────────────
export const createContestScraping = async (payload) => {
  try {
    const { data } = await apiClient.post('/contests/create', payload);
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al crear competencia por URL') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREAR COMPETENCIA MANUAL  — POST /contests/create/manual
// { name, type, results: [{ "team-name", "problems-solved" }] }
// ─────────────────────────────────────────────────────────────────────────────
export const createContestManual = async (payload) => {
  try {
    const { data } = await apiClient.post('/contests/create/manual', payload);
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al crear competencia manualmente') };
  }
};
