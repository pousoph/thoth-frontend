import React, { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import useContestantStore from '@/store/contestantStore';
import { fetchDashboard, fetchLeague } from '../services/contestantService';
import { ChartContainer, SkeletonCard, SectionHeader, EmptyState } from '../components/SharedComponents';

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
        <div key={p.dataKey} style={{ color: 'var(--level-light)' }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const Sk = () => (
  <div className="cl-skeleton" style={{ height: 220, borderRadius: 'var(--radius-md)' }} />
);

const MetricsPage = () => {
  const { dashboard, dashboardLoaded, setDashboard, league, leagueLoaded, setLeague } = useContestantStore();
  const [loading, setLoading] = useState(!dashboardLoaded);

  useEffect(() => {
    const promises = [];
    if (!dashboardLoaded) {
      promises.push(fetchDashboard().then((r) => { if (r.success) setDashboard(r.data); }));
    }
    if (!leagueLoaded) {
      promises.push(fetchLeague().then((r) => { if (r.success) setLeague(r.data); }));
    }
    if (promises.length) {
      setLoading(true);
      Promise.all(promises).finally(() => setLoading(false));
    }
  }, []);

  const d = dashboard;

  // Contest performance chart data
  const contestData = d?.contest_performance?.map((c) => ({
    name:     c.contest_name?.replace(/RPC|ICPC/g, '').trim() || `C${c.contest_id}`,
    globos:   c.balloons,
    posicion: c.position,
    puntaje:  c.score,
  })) ?? [];

  // Task pie
  const taskPie = d?.task_stats ? [
    { name: 'Completadas', value: d.task_stats.completed },
    { name: 'Pendientes',  value: d.task_stats.pending },
  ] : [];

  const PIE_COLORS = ['var(--level-primary)', 'var(--color-surface-4)'];

  // League table — top 5 para radar comparativo
  const leagueRows = league?.rows ?? [];

  return (
    <div>
      <SectionHeader
        title="Métricas"
        subtitle="Análisis de tu rendimiento competitivo basado en datos reales"
      />

      <div className="cl-charts-grid">
        {/* Estado de tareas — Pie */}
        <ChartContainer title="Estado de Tareas" subtitle="Completadas vs pendientes">
          {loading ? <Sk /> : taskPie.length === 0 ? (
            <EmptyState icon="📋" title="Sin datos de tareas" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value">
                  {taskPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CT />} />
                <Legend formatter={(v) => (
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{v}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Posición histórica — Line */}
        <ChartContainer title="Posición en Competencias" subtitle="Menor posición = mejor resultado">
          {loading ? <Sk /> : contestData.length === 0 ? (
            <EmptyState icon="📈" title="Sin competencias registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={contestData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis reversed tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} />
                <Line type="monotone" dataKey="posicion" name="Posición"
                  stroke="var(--level-primary)" strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--level-primary)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Globos por competencia — Bar */}
        <ChartContainer title="Globos por Competencia" subtitle="Problemas resueltos en cada evento" wide>
          {loading ? <Sk /> : contestData.length === 0 ? (
            <EmptyState icon="🎈" title="Sin datos de competencias" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contestData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} />
                <Bar dataKey="globos" name="Globos" fill="var(--level-primary)" radius={[5, 5, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Tabla de liga — ranking */}
        <ChartContainer title="Tabla de Liga" subtitle="Top equipos por puntaje total" wide>
          {loading ? <Sk /> : leagueRows.length === 0 ? (
            <EmptyState icon="🏆" title="Sin datos de liga disponibles" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Pos', 'Equipo', 'Participaciones', 'Puntos Adicionales', 'Total'].map((h) => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left',
                        color: 'var(--color-text-muted)', fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: '1px solid var(--color-border)',
                        fontWeight: 600,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leagueRows.slice(0, 10).map((row, i) => (
                    <tr key={row.team_id ?? i} style={{
                      borderBottom: '1px solid var(--color-border)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(180,190,255,0.01)',
                    }}>
                      <td style={{ padding: '10px 12px', color: row.rank <= 3 ? 'var(--level-light)' : 'var(--color-text-muted)', fontWeight: row.rank <= 3 ? 700 : 400 }}>
                        {row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank-1] : `#${row.rank}`}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {row.team_name}
                        {row.is_icpc_qualified && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--level-light)',
                            background: 'var(--level-dim)', border: '1px solid var(--level-border)',
                            borderRadius: 10, padding: '1px 6px' }}>ICPC</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                        {row.participations}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                        {row.additional_points}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--level-light)', fontWeight: 700 }}>
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

export default MetricsPage;
