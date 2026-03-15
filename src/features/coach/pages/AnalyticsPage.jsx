import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import useCoachStore from '@/store/coachStore';
import { fetchCoachDashboard, fetchLeague, fetchTeamTasks } from '../services/coachService';
import {
  SectionHeader, ChartContainer, EmptyState, Sk, SkMetrics, MetricCard, completionRate,
} from '../components/SharedComponents';

// ── Tooltip ────────────────────────────────────────────────────────────────────
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 12,
      color: 'var(--color-text-primary)',
    }}>
      {label && <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color ?? 'var(--co-light)' }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.value % 1 !== 0 ? p.value.toFixed(1) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = ['var(--co-primary)', '#4ade80', '#86efac', '#bbf7d0', '#22c55e'];
const LEG = (v) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{v}</span>;

// ── AnalyticsPage ──────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const {
    dashboardData, setDashboardData,
    tasksByTeam,   setTasksForTeam,
    league,        leagueLoaded, setLeague,
  } = useCoachStore();

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetches = [];
    fetches.push(fetchCoachDashboard().then((r) => { if (r.success) setDashboardData(r.data); }));
    if (!leagueLoaded)    fetches.push(fetchLeague().then((r) => { if (r.success) setLeague(r.data); }));
    if (fetches.length) {
      setLoading(true);
      Promise.all(fetches).then(() => setLoading(false));
    }
  }, []);

  // Load tasks for all teams (for task analytics)
  const teams = dashboardData?.teams ?? [];
  useEffect(() => {
    const unloaded = teams.filter((t) => !tasksByTeam[t.team_id]);
    if (!unloaded.length) return;
    Promise.all(unloaded.map((t) => fetchTeamTasks(t.team_id))).then((results) => {
      results.forEach((res, i) => {
        if (res.success) setTasksForTeam(unloaded[i].team_id, res.data);
      });
    });
  }, [teams.length]);

  const d  = dashboardData;
  const lc = d?.league_comparison ?? {};

  // ── Team performance radar data ──────────────────────────────────────────────
  const radarData = [
    { metric: 'Puntaje',     ...Object.fromEntries(teams.map((t) => [t.team_name, t.league_points ?? 0])) },
    { metric: 'Globos',      ...Object.fromEntries(teams.map((t) => [t.team_name, t.total_balloons ?? 0])) },
    { metric: 'Participaciones', ...Object.fromEntries(teams.map((t) => [t.team_name, t.contests_participated ?? 0])) },
    { metric: 'Cumplimiento', ...Object.fromEntries(teams.map((t) => [t.team_name, Math.round((t.task_completion_rate ?? 0) * 100)])) },
  ];

  // ── Task completion per team chart ───────────────────────────────────────────
  const taskChart = teams.map((team) => {
    const tasks = tasksByTeam[team.team_id] ?? [];
    const total = tasks.reduce((s, t) => s + (t.completions?.length ?? 0), 0);
    const done  = tasks.reduce((s, t) => s + (t.completions?.filter((c) => c.is_completed).length ?? 0), 0);
    return {
      name:       team.team_name.length > 10 ? team.team_name.slice(0,10)+'…' : team.team_name,
      tareas:     tasks.length,
      completadas: done,
      pendientes: total - done,
      pct:        total ? Math.round((done / total) * 100) : 0,
    };
  });

  // ── League position of my teams ──────────────────────────────────────────────
  const myTeamIds = new Set(teams.map((t) => t.team_id));
  const leagueRows = (league?.rows ?? []).slice(0, 10).map((row) => ({
    name:    row.team_name.length > 12 ? row.team_name.slice(0,12)+'…' : row.team_name,
    total:   row.total,
    isMine:  myTeamIds.has(row.team_id),
    rank:    row.rank,
    isIcpc:  row.is_icpc_qualified,
  }));

  // ── Benchmark comparison data ─────────────────────────────────────────────────
  const benchData = [
    { name: 'Puntos prom.',   coach: lc.coach_avg_points   ?? 0, uni: lc.university_avg_points   ?? 0 },
    { name: 'Globos prom.',   coach: lc.coach_avg_balloons ?? 0, uni: lc.university_avg_balloons ?? 0 },
    { name: 'Pos. prom.',     coach: lc.coach_avg_position ?? 0, uni: lc.university_avg_position ?? 0 },
  ];

  // ── Pie: task completion status ───────────────────────────────────────────────
  const allTasks = teams.flatMap((t) => tasksByTeam[t.team_id] ?? []);
  const totalCompletions = allTasks.reduce((s, t) => s + (t.completions?.length ?? 0), 0);
  const doneCompletions  = allTasks.reduce((s, t) => s + (t.completions?.filter((c) => c.is_completed).length ?? 0), 0);
  const taskPie = totalCompletions > 0 ? [
    { name: 'Completadas', value: doneCompletions },
    { name: 'Pendientes',  value: totalCompletions - doneCompletions },
  ] : [];

  // Aggregate metrics
  const totalBalloons  = teams.reduce((s, t) => s + (t.total_balloons ?? 0), 0);
  const avgPosition    = teams.length
    ? (teams.reduce((s, t) => s + (t.avg_position ?? 0), 0) / teams.length).toFixed(1)
    : '—';
  const avgCompletion  = teams.length
    ? Math.round(teams.reduce((s, t) => s + (t.task_completion_rate ?? 0), 0) / teams.length * 100)
    : 0;
  const totalContests  = Math.max(...teams.map((t) => t.contests_participated ?? 0), 0);

  const IconBalloon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="7"/><path d="M12 16v6"/></svg>;
  const IconPos     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
  const IconTask    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
  const IconFlag    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;

  return (
    <div>
      <SectionHeader
        title="Estadísticas"
        subtitle="Análisis de rendimiento de tus equipos y comparativa universitaria"
      />

      {error && <div className="co-alert co-alert--error">{error}</div>}

      {/* Summary metrics */}
      {loading ? <SkMetrics /> : (
        <div className="co-metrics-grid">
          <MetricCard label="Globos Totales"    value={totalBalloons}      icon={<IconBalloon />} trendLabel="en todas las competencias" delay={0}   />
          <MetricCard label="Pos. Promedio"     value={avgPosition}        icon={<IconPos />}     trendLabel="de tus equipos"            delay={60}  />
          <MetricCard label="Cumplimiento"      value={`${avgCompletion}%`} icon={<IconTask />}   trend={avgCompletion >= 70 ? 'up' : 'down'} trendLabel="promedio de tareas" delay={120} />
          <MetricCard label="Competencias"      value={totalContests}      icon={<IconFlag />}    trendLabel="máx. por equipo"            delay={180} />
        </div>
      )}

      <div className="co-charts-grid">
        {/* Cumplimiento por equipo */}
        <ChartContainer title="Cumplimiento por Equipo" subtitle="% de tareas completadas" pill="Tareas">
          {loading ? <Sk h={220} /> : taskChart.length === 0 ? (
            <EmptyState icon="📋" title="Sin datos de tareas" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<CT />} formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" name="Cumplimiento" fill="var(--co-primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Distribución tareas — pie */}
        <ChartContainer title="Estado Global de Tareas" subtitle="Completadas vs pendientes en todos los equipos" pill="Estado">
          {loading ? <Sk h={220} /> : taskPie.length === 0 ? (
            <EmptyState icon="⏳" title="Sin completions registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={4} dataKey="value">
                  <Cell fill="var(--co-primary)" />
                  <Cell fill="var(--color-surface-4)" />
                </Pie>
                <Tooltip content={<CT />} />
                <Legend formatter={LEG} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Benchmark coach vs UEB */}
        <ChartContainer title="Coach vs Universidad" subtitle="Tus promedios comparados con el promedio universitario" pill="Benchmark">
          {loading ? <Sk h={220} /> : benchData.every((d) => d.coach === 0 && d.uni === 0) ? (
            <EmptyState icon="📊" title="Sin datos comparativos" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={benchData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} />
                <Legend formatter={LEG} />
                <Bar dataKey="coach" name="Tu promedio"  fill="var(--co-primary)"      radius={[4,4,0,0]} />
                <Bar dataKey="uni"   name="Prom. UEB"    fill="var(--color-surface-4)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Tabla liga top 10 — wide */}
        <ChartContainer title="Tabla de Liga" subtitle="Top 10 equipos · Los tuyos se resaltan en verde" wide>
          {loading ? <Sk h={240} /> : leagueRows.length === 0 ? (
            <EmptyState icon="🏆" title="Sin datos de liga disponibles" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Pos', 'Equipo', 'Puntos'].map((h) => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left',
                        color: 'var(--color-text-muted)', fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: '1px solid var(--color-border)', fontWeight: 600,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leagueRows.map((row, i) => (
                    <tr key={i} style={{
                      borderBottom: '1px solid var(--color-border)',
                      background: row.isMine ? 'rgba(34,197,94,0.05)' : 'transparent',
                    }}>
                      <td style={{ padding: '10px 12px', color: row.rank <= 3 ? 'var(--co-light)' : 'var(--color-text-muted)', fontWeight: row.rank <= 3 ? 700 : 400 }}>
                        {row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank-1] : `#${row.rank}`}
                      </td>
                      <td style={{ padding: '10px 12px', color: row.isMine ? 'var(--co-light)' : 'var(--color-text-primary)', fontWeight: row.isMine ? 700 : 500 }}>
                        {row.name}
                        {row.isMine && (
                          <span style={{
                            marginLeft: 6, fontSize: 9, fontWeight: 700,
                            background: 'var(--co-dim)', color: 'var(--co-text)',
                            border: '1px solid var(--co-border)',
                            borderRadius: 10, padding: '1px 6px', textTransform: 'uppercase',
                          }}>
                            Tuyo
                          </span>
                        )}
                        {row.isIcpc && (
                          <span style={{
                            marginLeft: 4, fontSize: 9,
                            background: 'rgba(201,168,76,0.15)', color: '#c9a84c',
                            border: '1px solid rgba(201,168,76,0.2)',
                            borderRadius: 10, padding: '1px 6px',
                          }}>ICPC</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', color: row.isMine ? 'var(--co-light)' : 'var(--color-text-secondary)', fontWeight: row.isMine ? 700 : 400 }}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
