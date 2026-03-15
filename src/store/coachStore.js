/**
 * THOTH — Coach Store (Zustand)
 *
 * Endpoints que alimentan este store:
 *   GET  /dashboard                          → dashboardData (HU-10)
 *   GET  /teams/available-contestants?q=     → availableContestants
 *   POST /teams                              → crear equipo (HU-05)
 *   GET  /tasks/team/:teamId                 → tareas de un equipo (HU-08)
 *   POST /tasks                              → crear tarea (HU-08)
 *   PUT  /tasks/:id                          → editar tarea (HU-08)
 *   DELETE /tasks/:id                        → eliminar tarea (HU-08)
 *   POST /tasks/:id/undo-completion          → deshacer completado (HU-09)
 *   PUT  /contestants/level                  → cambiar nivel (HU-06)
 *   GET  /contestants/level-changes          → historial de niveles (HU-06)
 *   GET  /league                             → tabla de liga (HU-07-1)
 */

import { create } from 'zustand';

const useCoachStore = create((set, get) => ({
  // ── Dashboard (HU-10) ─────────────────────────────────────────────────────
  // {
  //   teams: [{ team_id, team_name, is_active, member_count, total_balloons,
  //             contests_participated, avg_position, task_completion_rate,
  //             league_rank, league_points }],
  //   league_comparison: { coach_avg_points, coach_avg_balloons, coach_avg_position,
  //                        university_avg_points, university_avg_balloons, university_avg_position }
  // }
  dashboardData:       null,
  dashboardLoaded:     false,
  setDashboardData:    (d) => set({ dashboardData: d, dashboardLoaded: true }),

  // ── Available contestants para búsqueda (crear equipo) ────────────────────
  // [{ id, name, last_name, username, codeforces_handle, level }]
  availableContestants: [],
  setAvailableContestants: (list) => set({ availableContestants: list }),

  // ── Tareas indexadas por teamId ───────────────────────────────────────────
  // tasksByTeam: { [teamId]: Task[] }
  tasksByTeam:   {},
  setTasksForTeam: (teamId, tasks) =>
    set((s) => ({ tasksByTeam: { ...s.tasksByTeam, [teamId]: tasks } })),
  addTask: (teamId, task) =>
    set((s) => ({
      tasksByTeam: {
        ...s.tasksByTeam,
        [teamId]: [task, ...(s.tasksByTeam[teamId] ?? [])],
      },
    })),
  updateTask: (taskId, patch) =>
    set((s) => ({
      tasksByTeam: Object.fromEntries(
        Object.entries(s.tasksByTeam).map(([tid, tasks]) => [
          tid,
          tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        ])
      ),
    })),
  removeTask: (taskId) =>
    set((s) => ({
      tasksByTeam: Object.fromEntries(
        Object.entries(s.tasksByTeam).map(([tid, tasks]) => [
          tid,
          tasks.filter((t) => t.id !== taskId),
        ])
      ),
    })),

  // ── Historial cambios de nivel ────────────────────────────────────────────
  levelChanges:       [],
  levelChangesLoaded: false,
  levelChangesPage:   1,
  levelChangesTotal:  0,
  setLevelChanges: (data, page, total) =>
    set({ levelChanges: data, levelChangesLoaded: true, levelChangesPage: page, levelChangesTotal: total }),

  // ── Liga ──────────────────────────────────────────────────────────────────
  league:       null,
  leagueLoaded: false,
  setLeague:    (l) => set({ league: l, leagueLoaded: true }),

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetCoach: () =>
    set({
      dashboardData: null, dashboardLoaded: false,
      availableContestants: [],
      tasksByTeam: {},
      levelChanges: [], levelChangesLoaded: false, levelChangesPage: 1, levelChangesTotal: 0,
      league: null, leagueLoaded: false,
    }),
}));

export default useCoachStore;