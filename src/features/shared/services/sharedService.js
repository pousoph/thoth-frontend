/**
 * THOTH — Shared Service
 * Endpoints accesibles por todos los roles.
 */

import apiClient, { getApiError } from '@/services/apiClient';

const pick = (obj, ...keys) => {
  for (const k of keys) { if (obj[k] !== undefined) return obj[k]; }
  return undefined;
};

const normalizeColumn = (c) => ({
  key:        c.key ?? '',
  name:       c.name ?? '',
  type:       c.type ?? 'fixed',
  contest_id: pick(c, 'contest_id', 'contest-id', 'contestId') ?? null,
});

const normalizeLeagueRow = (r) => ({
  ...r,
  team_id:              pick(r, 'team_id', 'team-id', 'teamId'),
  team_name:            pick(r, 'team_name', 'team-name', 'teamName') ?? '',
  is_icpc_qualified:    !!(pick(r, 'is_icpc_qualified', 'is-icpc-qualified', 'isIcpcQualified')),
  additional_points:    pick(r, 'additional_points', 'additional-points', 'additionalPoints') ?? 0,
  contest_scores:       pick(r, 'contest_scores', 'contest-scores', 'contestScores') ?? {},
  balloons_virtual:     pick(r, 'balloons_virtual', 'balloons-virtual', 'balloonsVirtual') ?? 0,
  balloons_presencial:  pick(r, 'balloons_presencial', 'balloons-presencial', 'balloonsPresencial') ?? 0,
  balloons_icpc:        pick(r, 'balloons_icpc', 'balloons-icpc', 'balloonsIcpc') ?? 0,
  balloons_interna:     pick(r, 'balloons_interna', 'balloons-interna', 'balloonsInterna') ?? 0,
  balloon_points:       pick(r, 'balloon_points', 'balloon-points', 'balloonPoints') ?? 0,
});

const normalizeLevelChange = (e) => ({
  id:              e.id ?? null,
  coach_name:      pick(e, 'coach_name', 'coach-name', 'coachName') ?? '',
  contestant_name: pick(e, 'contestant_name', 'contestant-name', 'contestantName') ?? '',
  old_level:       pick(e, 'old_level', 'old-level', 'oldLevel') ?? '',
  new_level:       pick(e, 'new_level', 'new-level', 'newLevel') ?? '',
  reasons:         e.reasons ?? '',
  created_at:      pick(e, 'created_at', 'created-at', 'createdAt') ?? '',
});

// GET /league
export const fetchLeague = async () => {
  try {
    const { data } = await apiClient.get('/league');
    const columns = Array.isArray(data.columns) ? data.columns.map(normalizeColumn) : [];
    const rows = Array.isArray(data.rows) ? data.rows.map(normalizeLeagueRow) : [];
    return { success: true, data: { columns, rows } };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar la liga') };
  }
};

// GET /codeforces/ranking
const normalizeRankingEntry = (r) => ({
  name:              r.name ?? '',
  codeforces_handle: pick(r, 'codeforces_handle', 'codeforces-handle', 'codeforcesHandle') ?? '',
  role:              r.role ?? '',
  rating:            r.rating ?? 0,
  max_rating:        pick(r, 'max_rating', 'max-rating', 'maxRating') ?? 0,
  rank:              r.rank ?? '',
});

export const fetchCodeforcesRanking = async () => {
  try {
    const { data } = await apiClient.get('/codeforces/ranking');
    const entries = Array.isArray(data) ? data.map(normalizeRankingEntry) : [];
    return { success: true, data: entries };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar el ranking de Codeforces') };
  }
};

// GET /contests
const normalizeContest = (c) => ({
  id:   c.id ?? null,
  name: c.name ?? '',
  type: c.type ?? '',
});

export const fetchContests = async () => {
  try {
    const { data } = await apiClient.get('/contests');
    const list = Array.isArray(data) ? data.map(normalizeContest) : [];
    return { success: true, data: list };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar competencias') };
  }
};

// GET /contests/:id/results
const normalizeContestResult = (r) => ({
  team_id:   pick(r, 'team_id', 'team-id', 'teamId') ?? null,
  team_name: pick(r, 'team_name', 'team-name', 'teamName') ?? '',
  position:  r.position ?? 0,
  balloons:  r.balloons ?? 0,
  score:     r.score ?? 0,
});

export const fetchContestResults = async (contestId) => {
  try {
    const { data } = await apiClient.get(`/contests/${contestId}/results`);
    return {
      success: true,
      data: {
        contest_id:   pick(data, 'contest_id', 'contest-id', 'contestId') ?? contestId,
        contest_name: pick(data, 'contest_name', 'contest-name', 'contestName') ?? '',
        contest_type: pick(data, 'contest_type', 'contest-type', 'contestType') ?? '',
        results:      Array.isArray(data.results) ? data.results.map(normalizeContestResult) : [],
      },
    };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar resultados') };
  }
};

// GET /contestants/level-changes
export const fetchLevelChanges = async () => {
  try {
    const { data } = await apiClient.get('/contestants/level-changes');
    const entries = Array.isArray(data) ? data.map(normalizeLevelChange) : [];
    return { success: true, data: entries };
  } catch (err) {
    return { success: false, message: getApiError(err, 'Error al cargar historial de niveles') };
  }
};
