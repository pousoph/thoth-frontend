import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import useAuthStore from '@/store/authStore';
import useContestantStore from '@/store/contestantStore';
import { fetchDashboard } from '../services/contestantService';
import {
  MetricCard, ChartContainer, SkeletonMetrics,
  SkeletonCard, SectionHeader, EmptyState,
} from '../components/SharedComponents';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconTrophy  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>;
const IconCheck   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconStar    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconRank    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: 'var(--level-light)' }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Level history timeline ─────────────────────────────────────────────────────
const LevelTimeline = ({ history }) => {
  if (!history?.length) return (
    <EmptyState icon="📊" title="Sin cambios de nivel registrados" />
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 12 }}>
      {history.map((entry, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '12px 0', borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
            background: 'var(--level-primary)', boxShadow: '0 0 8px var(--level-glow)',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {entry.old_level} → <span style={{ color: 'var(--level-light)' }}>{entry.new_level}</span>
            </div>
            {entry.reasons && (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
                {entry.reasons}
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>
            {entry.changed_at ? new Date(entry.changed_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── DashboardPage ─────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const user      = useAuthStore((s) => s.user);
  const { dashboard, dashboardLoaded, setDashboard } = useContestantStore();
  const [loading, setLoading] = useState(!dashboardLoaded);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (dashboardLoaded) return;
    (async () => {
      setLoading(true);
      const res = await fetchDashboard();
      if (res.success) {
        setDashboard(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, []);

  const d = dashboard;

  // Contest performance → datos para gráfica
  const contestChart = d?.contest_performance?.map((c) => ({
    name:     c.contest_name?.replace(/RPC|ICPC/g, '').trim() || `C${c.contest_id}`,
    globos:   c.balloons,
    posicion: c.position,
    puntaje:  c.score,
  })) ?? [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div>
      {/* Header */}
      <div className="cl-page-header">
        <h1 className="cl-page-title">
          {greeting()}, {user?.username ?? 'Competidor'} 👋
        </h1>
        <p className="cl-page-subtitle">
          {d?.team_name
            ? `Equipo: ${d.team_name} · Ranking liga: #${d.team_league_rank ?? '—'}`
            : 'Aún no tienes equipo asignado'}
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 20,
          background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)',
        }}>
          {error}
        </div>
      )}

      {/* Metric cards — task_stats del backend */}
      {loading ? (
        <SkeletonMetrics />
      ) : (
        <div className="cl-metrics-grid">
          <MetricCard
            label="Tareas Totales"
            value={d?.task_stats?.total ?? 0}
            icon={<IconCheck />}
            delay={0}
          />
          <MetricCard
            label="Tareas Completadas"
            value={d?.task_stats?.completed ?? 0}
            icon={<IconCheck />}
            trend="up"
            trendLabel={`${Math.round((d?.task_stats?.completion_rate ?? 0) * 100)}% completadas`}
            delay={60}
          />
          <MetricCard
            label="Tareas Pendientes"
            value={d?.task_stats?.pending ?? 0}
            icon={<IconStar />}
            trend={d?.task_stats?.pending > 0 ? 'down' : 'up'}
            trendLabel={d?.task_stats?.pending > 0 ? 'Por completar' : '¡Todo al día!'}
            delay={120}
          />
          <MetricCard
            label="Puntos en Liga"
            value={d?.team_league_points ?? 0}
            icon={<IconRank />}
            trendLabel={`Posición #${d?.team_league_rank ?? '—'} en liga`}
            delay={180}
          />
        </div>
      )}

      {/* Charts */}
      <div className="cl-charts-grid">
        {/* Globos por competencia */}
        <ChartContainer
          title="Globos por Competencia"
          subtitle="Problemas resueltos en cada evento"
          pill="Historial"
        >
          {loading ? (
            <div className="cl-skeleton" style={{ height: 200 }} />
          ) : contestChart.length === 0 ? (
            <EmptyState icon="🎈" title="Sin competencias registradas" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contestChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="globos" name="Globos" fill="var(--level-primary)" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Posición histórica */}
        <ChartContainer
          title="Posición en Competencias"
          subtitle="Historial de posiciones (menor = mejor)"
          pill="Posición"
        >
          {loading ? (
            <div className="cl-skeleton" style={{ height: 200 }} />
          ) : contestChart.length === 0 ? (
            <EmptyState icon="📈" title="Sin datos de posición" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={contestChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis reversed tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="posicion" name="Posición" stroke="var(--level-primary)" strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--level-primary)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Puntaje acumulado — wide */}
        <ChartContainer
          title="Puntaje por Competencia"
          subtitle="Puntos de liga obtenidos en cada evento"
          pill="Puntaje"
          wide
        >
          {loading ? (
            <div className="cl-skeleton" style={{ height: 160 }} />
          ) : contestChart.length === 0 ? (
            <EmptyState icon="🏆" title="Participa en competencias para ver tu puntaje" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={contestChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--level-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--level-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="puntaje" name="Puntaje" stroke="var(--level-primary)"
                  strokeWidth={2} fill="url(#gradScore)"
                  dot={{ r: 3, fill: 'var(--level-primary)' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      {/* Historial de cambios de nivel */}
      <div className="cl-activity-card">
        <div className="cl-chart-header">
          <div>
            <div className="cl-chart-title">Historial de Nivel</div>
            <div className="cl-chart-subtitle">Evolución de tu nivel de habilidad</div>
          </div>
          {d?.current_level && (
            <span className="cl-chart-pill" style={{ textTransform: 'capitalize' }}>
              Nivel actual: {d.current_level}
            </span>
          )}
        </div>
        {loading
          ? <div className="cl-skeleton" style={{ height: 80, marginTop: 16 }} />
          : <LevelTimeline history={d?.level_history} />
        }
      </div>
    </div>
  );
};

export default DashboardPage;
