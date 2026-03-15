/**
 * THOTH — Coach Service
 * Conecta con los endpoints documentados en USER_STORIES_GUIDE.md
 * Base URL (vía apiClient): https://splendid-jessika-unbosque-29a9d48d.koyeb.app/api/v1
 */

import apiClient, { getApiError } from '@/services/apiClient';

// ── Normaliza campos de competidor (el backend Go varía el casing por endpoint) ──
const normalizeContestant = (c) => ({
  id:                c.id,
  name:              c.name                   ?? '',
  last_name:         c.last_name              ?? c['last-name']        ?? c.lastName   ?? c.lastname  ?? '',
  username:          c.username               ?? c.user_name           ?? c.userName   ?? '',
  codeforces_handle: c.codeforces_handle      ?? c['codeforces-handle'] ?? c.codeforcesHandle ?? '',
  level:             c.level                  ?? '',
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /dashboard  —  HU-10 (Coach)
// Respuesta: { role, dashboard: { teams[], league_comparison } }
// ─────────────────────────────────────────────────────────────────────────────
export const fetchCoachDashboard = async () => {
  try {
    const { data } = await apiClient.get('/dashboard');
    return { success: true, data: data.dashboard };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar el dashboard') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /contestants  —  HU-06
// Parámetros opcionales: q, level, gender, is_available
// Acepta query vacía a diferencia de available-contestants
// ─────────────────────────────────────────────────────────────────────────────
export const fetchContestants = async ({ q = '', level = '', gender = '' } = {}) => {
  try {
    const params = new URLSearchParams();
    if (q)      params.set('q',      q);
    if (level)  params.set('level',  level);
    if (gender) params.set('gender', gender);
    const qs = params.toString();
    const { data } = await apiClient.get(`/contestants${qs ? '?' + qs : ''}`);
    const list = Array.isArray(data) ? data : [];
    return { success: true, data: list.map(normalizeContestant) };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar competidores') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /teams/available-contestants?q=  —  HU-05
// REQUIERE q con al menos 1 carácter — retorna 400 con query vacía
// Usar solo en el modal de crear equipo cuando el usuario escribe
// ─────────────────────────────────────────────────────────────────────────────
export const searchAvailableContestants = async (query) => {
  if (!query?.trim()) return { success: true, data: [] };
  try {
    const { data } = await apiClient.get(
      `/teams/available-contestants?q=${encodeURIComponent(query.trim())}`
    );
    const list = Array.isArray(data) ? data : [];
    return { success: true, data: list.map(normalizeContestant) };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al buscar competidores') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /teams  —  HU-05
// Body: { name, "contestant-ids": number[] }
// ─────────────────────────────────────────────────────────────────────────────
export const createTeam = async (name, contestantIds) => {
  try {
    const { data } = await apiClient.post('/teams', {
      name,
      'contestant-ids': contestantIds,
    });
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al crear el equipo') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /tasks/team/:teamId  —  HU-08
// Respuesta: [{ id, coach_id, team_id, created_at, limit_date, title,
//               description, completions: [{ contestant_id, is_completed, completed_at? }] }]
// ─────────────────────────────────────────────────────────────────────────────
export const fetchTeamTasks = async (teamId) => {
  try {
    const { data } = await apiClient.get(`/tasks/team/${teamId}`);
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, data: [], message: getApiError(err, 'Error al cargar tareas del equipo') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /tasks  —  HU-08
// Body: { team_id, title, description, limit_date }  — limit_date: "DD-MM-YYYY"
// Respuesta: { id, coach_id, team_id, created_at, limit_date, title, description }
// ─────────────────────────────────────────────────────────────────────────────
export const createTask = async ({ teamId, title, description, limitDate }) => {
  try {
    const { data } = await apiClient.post('/tasks', {
      team_id:    teamId,
      title,
      description,
      limit_date: limitDate,
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al crear la tarea') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /tasks/:id  —  HU-08
// Body: { title, description, limit_date }
// ─────────────────────────────────────────────────────────────────────────────
export const updateTask = async (taskId, { title, description, limitDate }) => {
  try {
    const { data } = await apiClient.put(`/tasks/${taskId}`, {
      title,
      description,
      limit_date: limitDate,
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al actualizar la tarea') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /tasks/:id  —  HU-08
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTask = async (taskId) => {
  try {
    await apiClient.delete(`/tasks/${taskId}`);
    return { success: true };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al eliminar la tarea') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /tasks/:id/undo-completion  —  HU-09
// Body: { contestant_id }
// ─────────────────────────────────────────────────────────────────────────────
export const undoTaskCompletion = async (taskId, contestantId) => {
  try {
    const { data } = await apiClient.post(`/tasks/${taskId}/undo-completion`, {
      contestant_id: contestantId,
    });
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al deshacer completado') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /contestants/level  —  HU-06
// Body: { contestant_id, new_level, justification }
// new_level: "basica" | "intermedia" | "avanzada"
// ─────────────────────────────────────────────────────────────────────────────
export const changeContestantLevel = async (contestantId, newLevel, justification) => {
  try {
    const { data } = await apiClient.put('/contestants/level', {
      contestant_id: contestantId,
      new_level:     newLevel,
      justification,
    });
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cambiar el nivel') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /contestants/level-changes  —  HU-06
// Respuesta: { data[], page, page_size, total }
// ─────────────────────────────────────────────────────────────────────────────
export const fetchLevelChanges = async (page = 1, pageSize = 10) => {
  try {
    const { data } = await apiClient.get(
      `/contestants/level-changes?page=${page}&page_size=${pageSize}`
    );
    return {
      success: true,
      data:    data.data  ?? [],
      page:    data.page  ?? page,
      total:   data.total ?? 0,
    };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar historial de niveles') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /league  —  HU-07-1 (público, no requiere auth)
// Respuesta: { columns[], rows[] }
// ─────────────────────────────────────────────────────────────────────────────
export const fetchLeague = async () => {
  try {
    const { data } = await apiClient.get('/league');
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar la liga') };
  }
};