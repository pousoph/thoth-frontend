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

// ── Helper: pick first defined value across naming variants ──
const pick = (obj, ...keys) => {
  for (const k of keys) { if (obj[k] !== undefined) return obj[k]; }
  return undefined;
};

// ── Normaliza dashboard del competidor (backend Go usa kebab-case) ──
const normalizeDashboard = (d) => {
  if (!d) return d;

  const taskStats = pick(d, 'task_stats', 'task-stats', 'taskStats') ?? {};
  const contestPerf = pick(d, 'contest_performance', 'contest-performance', 'contestPerformance') ?? [];
  const levelHistory = pick(d, 'level_history', 'level-history', 'levelHistory') ?? [];

  return {
    team_name:          pick(d, 'team_name', 'team-name', 'teamName') ?? '',
    current_level:      pick(d, 'current_level', 'current-level', 'currentLevel') ?? '',
    team_league_rank:   pick(d, 'team_league_rank', 'team-league-rank', 'teamLeagueRank'),
    team_league_points: pick(d, 'team_league_points', 'team-league-points', 'teamLeaguePoints') ?? 0,
    task_stats: {
      total:           taskStats.total           ?? 0,
      completed:       taskStats.completed       ?? 0,
      pending:         taskStats.pending         ?? 0,
      completion_rate: ((r) => r > 1 ? r / 100 : r)(pick(taskStats, 'completion_rate', 'completion-rate', 'completionRate') ?? 0),
    },
    contest_performance: contestPerf.map((c) => ({
      contest_id:   pick(c, 'contest_id', 'contest-id', 'contestId'),
      contest_name: pick(c, 'contest_name', 'contest-name', 'contestName') ?? '',
      balloons:     c.balloons ?? 0,
      position:     c.position ?? 0,
      score:        c.score    ?? 0,
    })),
    level_history: levelHistory.map((e) => ({
      old_level:  pick(e, 'old_level', 'old-level', 'oldLevel') ?? '',
      new_level:  pick(e, 'new_level', 'new-level', 'newLevel') ?? '',
      reasons:    e.reasons ?? '',
      changed_at: pick(e, 'changed_at', 'changed-at', 'changedAt') ?? '',
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD  —  GET /dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const fetchDashboard = async () => {
  try {
    const { data } = await apiClient.get('/dashboard');
    return { success: true, data: normalizeDashboard(data.dashboard) };
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
// ── Normaliza tarea (kebab → snake) ──
// El backend para /tasks/me devuelve is-completed y completed-at directamente en la tarea
// (no en un array completions). Normalizamos a un campo plano is_completed.
const normalizeTask = (t) => ({
  ...t,
  coach_id:     pick(t, 'coach_id', 'coach-id', 'coachId'),
  team_id:      pick(t, 'team_id', 'team-id', 'teamId'),
  limit_date:   pick(t, 'limit_date', 'limit-date', 'limitDate') ?? '',
  created_at:   pick(t, 'created_at', 'created-at', 'createdAt') ?? '',
  is_completed: !!(pick(t, 'is_completed', 'is-completed', 'isCompleted')),
  completed_at: pick(t, 'completed_at', 'completed-at', 'completedAt') ?? null,
});

export const fetchMyTasks = async () => {
  try {
    const { data } = await apiClient.get('/tasks/me');
    const tasks = Array.isArray(data) ? data.map(normalizeTask) : [];
    return { success: true, data: tasks };
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
// ── Normaliza persona (coach / teammate) ──
const normalizePerson = (p) => {
  if (!p) return p;
  return {
    name:              p.name ?? '',
    last_name:         pick(p, 'last_name', 'last-name', 'lastName') ?? '',
    codeforces_handle: pick(p, 'codeforces_handle', 'codeforces-handle', 'codeforcesHandle') ?? '',
    level:             p.level ?? '',
  };
};

// ── Normaliza equipo del competidor ──
const normalizeMyTeam = (t) => {
  if (!t) return t;
  return {
    team_name: pick(t, 'team_name', 'team-name', 'teamName') ?? '',
    is_active: !!(pick(t, 'is_active', 'is-active', 'isActive') ?? true),
    coach:     normalizePerson(t.coach),
    teammates: (t.teammates ?? []).map(normalizePerson),
  };
};

export const fetchMyTeam = async () => {
  try {
    const { data } = await apiClient.get('/teams/me');
    return { success: true, data: normalizeMyTeam(data) };
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
// ── Normaliza fila de liga (el backend Go varía el casing) ──
const normalizeLeagueRow = (r) => ({
  ...r,
  team_id:           r.team_id            ?? r['team-id']            ?? r.teamId,
  team_name:         r.team_name          ?? r['team-name']          ?? r.teamName          ?? '',
  is_icpc_qualified: r.is_icpc_qualified  ?? r['is-icpc-qualified']  ?? r.isIcpcQualified   ?? false,
});

export const fetchLeague = async () => {
  try {
    const { data } = await apiClient.get('/league');
    const rows = Array.isArray(data.rows) ? data.rows.map(normalizeLeagueRow) : [];
    return { success: true, data: { ...data, rows } };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar la liga') };
  }
};