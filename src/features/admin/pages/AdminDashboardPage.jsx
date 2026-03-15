import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import useAuthStore from '@/store/authStore';
import { fetchDashboard } from '../services/adminService';
import {
  MetricCard, ChartContainer, SkeletonMetrics, EmptyState,
} from '@/features/contestant/components/SharedComponents';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconCheck   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconAlert   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconUsers   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconServer  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 13, color: 'var(--color-text-primary)'
    }}>
      <div style={{ marginBottom: 4 }}><strong>{label}</strong></div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.fill || 'var(--level-light)' }}>
          Requests: {p.value}
        </div>
      ))}
    </div>
  );
};

// ── AdminDashboardPage ────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  const health = d?.['platform-health'] || {};
  const usersCount = d?.['user-counts-by-role'] || {};

  // Formato de endpoints para gráfica
  const endpointsChart = health['top-endpoints']?.map((ep) => ({
    name: `${ep.method} ${ep.path}`,
    count: ep.count,
  })) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="cl-page-header">
        <h1 className="cl-page-title">
          Dashboard Administrativo
        </h1>
        <p className="cl-page-subtitle">
          Vista general del sistema y métricas de plataforma
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

      {/* Metric cards — Salud de Plataforma */}
      <h2 style={{ fontSize: 18, marginBottom: 16, color: 'var(--color-text-primary)' }}>Métricas Globales</h2>
      {loading ? (
        <SkeletonMetrics />
      ) : (
        <div className="cl-metrics-grid" style={{ marginBottom: 32 }}>
          <MetricCard
            label="Logins (Hoy)"
            value={health['logins-today'] ?? 0}
            icon={<IconCheck />}
            trendLabel="Usuarios activos"
            delay={0}
          />
          <MetricCard
            label="Total Requests"
            value={health['total-requests'] ?? 0}
            icon={<IconServer />}
            trendLabel="Tráfico general"
            delay={60}
          />
          <MetricCard
            label="Errores 4xx"
            value={health['errors-4xx'] ?? 0}
            icon={<IconAlert />}
            trend={health['errors-4xx'] > 50 ? 'down' : 'up'}
            trendLabel="Client-side errors"
            delay={120}
          />
          <MetricCard
            label="Errores 5xx"
            value={health['errors-5xx'] ?? 0}
            icon={<IconAlert />}
            trend={health['errors-5xx'] > 5 ? 'down' : 'up'}
            trendLabel="Server-side errors"
            delay={180}
          />
        </div>
      )}

      <div className="cl-charts-grid">
        {/* Gráfica Endpoints */}
        <ChartContainer
          title="Top Endpoints"
          subtitle="Rutas más consultadas"
          pill="Tráfico"
          wide
        >
          {loading ? (
            <div className="cl-skeleton" style={{ height: 200 }} />
          ) : endpointsChart.length === 0 ? (
            <EmptyState icon="🌐" title="Sin datos de tráfico registrados" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={endpointsChart} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={150} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-2)' }} />
                <Bar dataKey="count" name="Requests" fill="var(--level-primary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Resumen de Usuarios */}
        <ChartContainer
          title="Desglose de Usuarios"
          subtitle="Conteo actual en la plataforma"
          pill="Usuarios"
        >
          {loading ? (
            <div className="cl-skeleton" style={{ height: 200 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Competidores</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{usersCount.contestant ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Coaches</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{usersCount.coach ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Administradores</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{usersCount.admin ?? 0}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--color-border)', marginTop: 8 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Equipos Activos</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{d?.['active-teams'] ?? 0} / {d?.['total-teams'] ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Coaches Pendientes</span>
                <strong style={{ color: 'var(--color-warning)' }}>{d?.['pending-coaches'] ?? 0}</strong>
              </div>
            </div>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
