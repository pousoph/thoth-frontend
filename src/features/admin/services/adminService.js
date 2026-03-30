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
const pick = (obj, ...keys) => {
  for (const k of keys) { if (obj[k] !== undefined) return obj[k]; }
  return undefined;
};

const normalizeCoachRequest = (c) => ({
  id:                pick(c, 'id', 'user-id', 'user_id', 'userId') ?? null,
  name:              c.name ?? '',
  last_name:         pick(c, 'last_name', 'last-name', 'lastName') ?? '',
  email:             c.email ?? '',
  username:          pick(c, 'username', 'user-name', 'userName') ?? '',
  codeforces_handle: pick(c, 'codeforces_handle', 'codeforces-handle', 'codeforcesHandle') ?? '',
});

export const fetchPendingCoaches = async () => {
  try {
    const { data } = await apiClient.get('/auth/admin/queue/coach');
    const list = Array.isArray(data) ? data.map(normalizeCoachRequest) : [];
    return { success: true, data: list };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar los coaches pendientes') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE COACH — POST /auth/admin/coach/activate
// ─────────────────────────────────────────────────────────────────────────────
export const activateCoach = async (coachId) => {
  try {
    const { data } = await apiClient.post('/auth/admin/coach/activate', { 'user-id': coachId });
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
    const { data } = await apiClient.post('/auth/admin/coach/reject', { 'user-id': coachId });
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

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE CONTEST — PUT /contests/:id
// Body (campos opcionales): { name, type }
// ─────────────────────────────────────────────────────────────────────────────
export const updateContest = async (contestId, { name, type } = {}) => {
  try {
    const body = {};
    if (name !== undefined) body.name = name;
    if (type !== undefined) body.type = type;
    const { data } = await apiClient.put(`/contests/${contestId}`, body);
    return { success: true, message: data.message ?? 'Competencia actualizada' };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al actualizar la competencia') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE CONTEST RESULTS — PUT /contests/:id/results
// Body: { results: [{ "team-id", balloons, position }] }
// ─────────────────────────────────────────────────────────────────────────────
export const updateContestResults = async (contestId, results) => {
  try {
    const body = {
      results: results.map((r) => ({
        'team-id':  r.team_id ?? r.teamId ?? r['team-id'],
        balloons:   r.balloons,
        position:   r.position,
      })),
    };
    const { data } = await apiClient.put(`/contests/${contestId}/results`, body);
    return { success: true, message: data.message ?? 'Resultados actualizados' };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al actualizar resultados') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTESTANTS — GET /contestants
// ─────────────────────────────────────────────────────────────────────────────
const normalizeContestant = (c) => ({
  id:                c.id,
  name:              c.name ?? '',
  last_name:         pick(c, 'last_name', 'last-name', 'lastName') ?? '',
  username:          pick(c, 'username', 'user-name', 'userName') ?? '',
  codeforces_handle: pick(c, 'codeforces_handle', 'codeforces-handle', 'codeforcesHandle') ?? '',
  level:             c.level ?? '',
});

export const fetchContestants = async ({ q = '' } = {}) => {
  try {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    const { data } = await apiClient.get(`/contestants${qs}`);
    const list = Array.isArray(data) ? data.map(normalizeContestant) : [];
    return { success: true, data: list };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar competidores') };
  }
};
