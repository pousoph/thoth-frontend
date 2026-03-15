/**
 * THOTH — Contestant Store (Zustand)
 *
 * Estado normalizado según la respuesta real del backend:
 *
 * GET /dashboard → dashboard.task_stats, dashboard.contest_performance,
 *                  dashboard.level_history, dashboard.team_name,
 *                  dashboard.current_level, dashboard.team_league_rank,
 *                  dashboard.team_league_points
 *
 * GET /tasks/me  → array de tareas con completions[]
 * GET /teams/me  → { team_name, is_active, coach, teammates }
 */

import { create } from 'zustand';

const useContestantStore = create((set, get) => ({
  // ── Dashboard (HU-11) ─────────────────────────────────────────────────────
  dashboard:       null,
  dashboardLoaded: false,
  setDashboard:    (d) => set({ dashboard: d, dashboardLoaded: true }),

  // ── Tareas (HU-08 / HU-09) ────────────────────────────────────────────────
  // tasks = array raw del backend con completions[]
  tasks:       [],
  tasksLoaded: false,
  setTasks:    (tasks) => set({ tasks, tasksLoaded: true }),

  /**
   * Marca optimistamente una tarea como completada en el store.
   * Se pasa contestantId para ubicar la entrada correcta dentro de completions[].
   * Si no existe la entrada se agrega con is_completed: true.
   */
  markTaskComplete: (taskId, contestantId) =>
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const existing = t.completions?.find((c) => c.contestant_id === contestantId);
        if (existing) {
          return {
            ...t,
            completions: t.completions.map((c) =>
              c.contestant_id === contestantId
                ? { ...c, is_completed: true, completed_at: new Date().toISOString() }
                : c
            ),
          };
        }
        return {
          ...t,
          completions: [
            ...(t.completions ?? []),
            { contestant_id: contestantId, is_completed: true, completed_at: new Date().toISOString() },
          ],
        };
      }),
    })),

  // ── Equipo (HU-12) ────────────────────────────────────────────────────────
  team:       null,   // null = sin equipo | objeto = equipo actual
  teamLoaded: false,
  setTeam:    (team) => set({ team, teamLoaded: true }),

  // ── Liga (HU-07-1) ────────────────────────────────────────────────────────
  league:       null,
  leagueLoaded: false,
  setLeague:    (league) => set({ league, leagueLoaded: true }),

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetContestant: () =>
    set({
      dashboard: null, dashboardLoaded: false,
      tasks: [],       tasksLoaded: false,
      team: null,      teamLoaded: false,
      league: null,    leagueLoaded: false,
    }),
}));

export default useContestantStore;