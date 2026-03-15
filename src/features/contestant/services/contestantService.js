/**
 * THOTH — Contestant Service
 * Conecta con la API real del backend.
 *
 * Base URL (vía apiClient): https://splendid-jessika-unbosque-29a9d48d.koyeb.app/api/v1
 *
 * Endpoints usados en este módulo:
 *   GET  /dashboard          → HU-11: Dashboard del competidor
 *   GET  /tasks/me           → HU-08: Tareas asignadas al competidor
 *   POST /tasks/:id/complete → HU-09: Marcar tarea como completada
 *   GET  /teams/me           → HU-12: Equipo actual del competidor
 *   GET  /league             → HU-07-1: Tabla de liga (público)
 */

import apiClient, { getApiError } from '@/services/apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD  —  GET /dashboard
//
// Respuesta (200):
// {
//   role: "contestant",
//   dashboard: {
//     team_name, current_level, team_league_rank, team_league_points,
//     contest_performance: [{ contest_id, contest_name, balloons, position, score }],
//     task_stats: { total, completed, pending, completion_rate },
//     level_history: [{ old_level, new_level, reasons, changed_at }]
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────
export const fetchDashboard = async () => {
  try {
    const { data } = await apiClient.get('/dashboard');
    return { success: true, data: data.dashboard };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar el dashboard') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TAREAS  —  GET /tasks/me
//
// Respuesta (200): Array de tareas con completions
// [{
//   id, coach_id, team_id, created_at, limit_date, title, description,
//   completions: [{ contestant_id, is_completed, completed_at? }]
// }]
//
// El estado "completado" se determina buscando el contestant_id del usuario
// actual en el array completions con is_completed === true.
// ─────────────────────────────────────────────────────────────────────────────
export const fetchMyTasks = async () => {
  try {
    const { data } = await apiClient.get('/tasks/me');
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar las tareas') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETAR TAREA  —  POST /tasks/:id/complete
// Sin body. El backend identifica al competidor por el JWT.
//
// Respuesta (200): { message: "Task completed successfully" }
// ─────────────────────────────────────────────────────────────────────────────
export const completeTask = async (taskId) => {
  try {
    const { data } = await apiClient.post(`/tasks/${taskId}/complete`);
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al completar la tarea') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EQUIPO ACTUAL  —  GET /teams/me
//
// Respuesta (200):
// {
//   team_name, is_active,
//   coach: { name, last_name, codeforces_handle },
//   teammates: [{ name, last_name, level, codeforces_handle }]
// }
// Respuesta (404): { error: "team not found" }  → se retorna data: null
// ─────────────────────────────────────────────────────────────────────────────
export const fetchMyTeam = async () => {
  try {
    const { data } = await apiClient.get('/teams/me');
    return { success: true, data };
  } catch (err) {
    if (err.response?.status === 404) {
      return { success: true, data: null };
    }
    return { success: false, message: getApiError(err, 'Error al cargar el equipo') };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LIGA PÚBLICA  —  GET /league  (no requiere auth)
//
// Respuesta (200):
// {
//   columns: [{ key, name, type, contest_id? }],
//   rows: [{
//     rank, team_id, team_name,
//     contest_scores: { "1": 15 },
//     participations, additional_points, total, is_icpc_qualified
//   }]
// }
// ─────────────────────────────────────────────────────────────────────────────
export const fetchLeague = async () => {
  try {
    const { data } = await apiClient.get('/league');
    return { success: true, data };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar la liga') };
  }
};