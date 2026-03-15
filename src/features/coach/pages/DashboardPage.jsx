import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import useAuthStore  from '@/store/authStore';
import useCoachStore from '@/store/coachStore';
import { fetchCoachDashboard } from '../services/coachService';
import {
  MetricCard, ChartContainer, SectionHeader, EmptyState, SkMetrics, Sk,
} from '../components/SharedComponents';

const IconTeams   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconTask    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
const IconBalloon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="7"/><path d="M12 16v6"/></svg>;

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

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  const { dashboardData, setDashboardData } = useCoachStore();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Siempre carga al montar — no depende de dashboardLoaded para evitar
  // que un estado corrupto de sesión anterior bloquee la carga
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      const res = await fetchCoachDashboard();
      if (res.success) {
        setDashboardData(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, []);

  // La respuesta del backend según HU-10:
  // { role: "coach", dashboard: { teams: [...], league_comparison: {...} } }
  // fetchCoachDashboard ya extrae data.dashboard, por lo que dashboardData = { teams, league_comparison }
  const teams       = dashboardData?.teams         ?? [];
  const lc          = dashboardData?.league_comparison ?? {};

  const activeTeams   = teams.filter((t) => t.is_active).length;
  const totalMembers  = teams.reduce((s, t) => s + (t.member_count        ?? 0), 0);
  const totalBalloons = teams.reduce((s, t) => s + (t.total_balloons      ?? 0), 0);
  const avgCompletion = teams.length
    ? Math.round(teams.reduce((s, t) => s + (t.task_completion_rate ?? 0), 0) / teams.length * 100)
    : 0;

  const teamChart = teams.map((t) => ({
    name:    t.team_name?.length > 10 ? t.team_name.slice(0,10)+'…' : t.team_name,
    puntaje: t.league_points         ?? 0,
    globos:  t.total_balloons        ?? 0,
    tareas:  Math.round((t.task_completion_rate ?? 0) * 100),
  }));

  const benchData = [
    { name: 'Puntos',   coach: lc.coach_avg_points   ?? 0, uni: lc.university_avg_points   ?? 0 },
    { name: 'Globos',   coach: lc.coach_avg_balloons ?? 0, uni: lc.university_avg_balloons ?? 0 },
    { name: 'Posición', coach: lc.coach_avg_position ?? 0, uni: lc.university_avg_position ?? 0 },
  ];

  const hasBenchData = Object.keys(lc).length > 0;

  return (
    <div>
      <SectionHeader
        title={`${greeting()}, ${user?.username ?? 'Coach'} 👋`}
        subtitle={
          loading
            ? 'Cargando datos…'
            : `${activeTeams} equipo${activeTeams !== 1 ? 's' : ''} activo${activeTeams !== 1 ? 's' : ''} · ${totalMembers} competidores`
        }
      />

      {error && (
        <div className="co-alert co-alert--error" style={{ marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Métricas */}
      {loading ? <SkMetrics /> : (
        <div className="co-metrics-grid">
          <MetricCard label="Equipos Activos"  value={activeTeams}         icon={<IconTeams />}   trendLabel={`${teams.length} totales`}           delay={0}   />
          <MetricCard label="Competidores"     value={totalMembers}        icon={<IconTeams />}                                                     delay={60}  />
          <MetricCard label="Globos Totales"   value={totalBalloons}       icon={<IconBalloon />} trendLabel="en competencias"                      delay={120} />
          <MetricCard label="Cumplimiento"     value={`${avgCompletion}%`} icon={<IconTask />}    trend={avgCompletion >= 70 ? 'up' : 'down'} trendLabel="promedio tareas" delay={180} />
        </div>
      )}

      {/* Charts — solo cuando hay equipos */}
      {!loading && teams.length > 0 && (
        <div className="co-charts-grid">
          <ChartContainer title="Puntaje Liga por Equipo" subtitle="Puntos acumulados en la liga" pill="Liga">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teamChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} />
                <Bar dataKey="puntaje" name="Puntaje" fill="var(--co-primary)" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Cumplimiento de Tareas" subtitle="% completadas por equipo" pill="Tareas">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teamChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<CT />} formatter={(v) => `${v}%`} />
                <Bar dataKey="tareas" name="Cumplimiento" fill="#4ade80" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {hasBenchData && (
            <ChartContainer title="Coach vs Universidad" subtitle="Tus promedios vs el promedio general de la UEB" wide pill="Benchmark">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={benchData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CT />} />
                  <Legend formatter={(v) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="coach" name="Tu promedio" fill="var(--co-primary)"      radius={[4,4,0,0]} />
                  <Bar dataKey="uni"   name="Prom. UEB"   fill="var(--color-surface-4)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      )}

      {/* Lista rápida de equipos */}
      {!loading && teams.length > 0 && (
        <div className="co-activity-card">
          <div className="co-chart-header">
            <div>
              <div className="co-chart-title">Estado de Equipos</div>
              <div className="co-chart-subtitle">Resumen de todos tus equipos</div>
            </div>
            <button
              onClick={() => navigate('/coach/teams')}
              style={{ fontSize: 12, color: 'var(--co-text)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Ver todos →
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            {teams.map((team, i) => (
              <div
                key={team.team_id ?? i}
                onClick={() => navigate(`/coach/teams/${team.team_id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: team.is_active ? 'var(--co-primary)' : 'var(--color-text-muted)',
                    boxShadow: team.is_active ? '0 0 6px var(--co-glow)' : 'none',
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {team.team_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {team.member_count ?? 0} miembros
                      {team.league_rank ? ` · #${team.league_rank} en liga` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, textAlign: 'right' }}>
                  <div style={{ fontSize: 11 }}>
                    <div style={{ color: 'var(--co-light)', fontWeight: 700 }}>{team.league_points ?? 0}</div>
                    <div style={{ color: 'var(--color-text-muted)' }}>pts liga</div>
                  </div>
                  <div style={{ fontSize: 11 }}>
                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {Math.round((team.task_completion_rate ?? 0) * 100)}%
                    </div>
                    <div style={{ color: 'var(--color-text-muted)' }}>tareas</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && teams.length === 0 && (
        <div className="co-activity-card">
          <EmptyState
            icon="👥"
            title="Aún no tienes equipos"
            description="Crea tu primer equipo para ver estadísticas aquí."
            action={
              <button className="co-btn co-btn--primary co-btn--sm" onClick={() => navigate('/coach/teams')}>
                Crear primer equipo
              </button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
