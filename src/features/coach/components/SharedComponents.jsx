import React from 'react';

// ── LEVEL CONFIG ──────────────────────────────────────────────────────────────
export const LEVELS = [
  { key: 'aprendiz',   label: 'Aprendiz',   color: '#f97316' },
  { key: 'basica',     label: 'Básica',      color: '#3b82f6' },
  { key: 'intermedia', label: 'Intermedia',  color: '#a855f7' },
  { key: 'avanzada',   label: 'Avanzada',    color: '#ef4444' },
];

export const getLevelColor = (level) => {
  const map = {
    aprendiz: '#f97316', aprendiz: '#f97316',
    basica: '#3b82f6', básica: '#3b82f6', Basica: '#3b82f6', Básica: '#3b82f6',
    intermedia: '#a855f7', Intermedia: '#a855f7',
    avanzada: '#ef4444', Avanzada: '#ef4444',
    elite: '#c9a84c', Elite: '#c9a84c',
  };
  return map[level] ?? '#72728a';
};

// ── Skeleton primitives ───────────────────────────────────────────────────────
export const Sk = ({ h = 80, w = '100%', radius = 10 }) => (
  <div className="cl-skeleton" style={{ height: h, width: w, borderRadius: radius }} />
);

export const SkMetrics = () => (
  <div className="co-metrics-grid">
    {[1,2,3,4].map((i) => <Sk key={i} h={120} />)}
  </div>
);

export const SkList = ({ rows = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: rows }).map((_, i) => <Sk key={i} h={90} />)}
  </div>
);

export const SkTable = ({ rows = 5 }) => (
  <div className="co-table-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Sk h={36} />
    {Array.from({ length: rows }).map((_, i) => <Sk key={i} h={52} />)}
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="co-empty">
    <div className="co-empty__icon">{icon}</div>
    <div className="co-empty__title">{title}</div>
    {description && <div className="co-empty__desc">{description}</div>}
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </div>
);

// ── Alert ─────────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'error', children }) => (
  <div className={`co-alert co-alert--${type}`}>{children}</div>
);

// ── MetricCard ────────────────────────────────────────────────────────────────
export const MetricCard = ({ label, value, icon, trend, trendLabel, delay = 0 }) => (
  <div className="co-metric-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="co-metric-card__header">
      <span className="co-metric-card__label">{label}</span>
      <div className="co-metric-card__icon">{icon}</div>
    </div>
    <div className="co-metric-card__value">{value ?? '—'}</div>
    {trendLabel && (
      <div className={`co-metric-card__trend co-metric-card__trend--${trend ?? 'neutral'}`}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
      </div>
    )}
  </div>
);

// ── ChartContainer ────────────────────────────────────────────────────────────
export const ChartContainer = ({ title, subtitle, pill, children, wide = false }) => (
  <div className={`co-chart-card${wide ? ' co-chart-card--wide' : ''}`}>
    <div className="co-chart-header">
      <div>
        <div className="co-chart-title">{title}</div>
        {subtitle && <div className="co-chart-subtitle">{subtitle}</div>}
      </div>
      {pill && <span className="co-chart-pill">{pill}</span>}
    </div>
    {children}
  </div>
);

// ── StatusBadge ───────────────────────────────────────────────────────────────
export const StatusBadge = ({ active }) => (
  <span className={`co-status co-status--${active ? 'active' : 'inactive'}`}>
    {active ? 'Activo' : 'Inactivo'}
  </span>
);

// ── LevelBadge ────────────────────────────────────────────────────────────────
export const LevelBadge = ({ level }) => {
  if (!level) return null;
  const color = getLevelColor(level);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {level}
    </span>
  );
};

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 1 }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="co-progress">
      <div className="co-progress__bar">
        <div className="co-progress__fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="co-progress__label">{pct}%</span>
    </div>
  );
};

// ── SectionHeader ─────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="co-page-header">
    <div>
      <h1 className="co-page-title">{title}</h1>
      {subtitle && <p className="co-page-subtitle">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── FilterTabs ────────────────────────────────────────────────────────────────
export const FilterTabs = ({ tabs, active, onChange }) => (
  <div className="co-filter-tabs">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        className={`co-filter-tab${active === tab.key ? ' co-filter-tab--active' : ''}`}
        onClick={() => onChange(tab.key)}
      >
        {tab.label}
        {tab.count != null && (
          <span className="co-filter-tab__count">{tab.count}</span>
        )}
      </button>
    ))}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ title, subtitle, onClose, footer, children, size }) => (
  <div className="co-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`co-modal${size === 'lg' ? ' co-modal--lg' : ''}`}>
      <div className="co-modal__header">
        <div>
          <div className="co-modal__title">{title}</div>
          {subtitle && <div className="co-modal__subtitle">{subtitle}</div>}
        </div>
        <button className="co-modal__close" onClick={onClose} title="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="co-modal__body">{children}</div>
      {footer && <div className="co-modal__footer">{footer}</div>}
    </div>
  </div>
);

// ── Field ─────────────────────────────────────────────────────────────────────
export const Field = ({ label, hint, error, children }) => (
  <div className="co-field">
    {label && <label className="co-field__label">{label}</label>}
    {children}
    {hint  && <div className="co-field__hint">{hint}</div>}
    {error && <div className="co-field__error">{error}</div>}
  </div>
);

// ── Tooltip (date helper) ─────────────────────────────────────────────────────
/**
 * Convierte fecha ISO a formato DD-MM-YYYY que espera el backend.
 * Input: "2026-04-15" → Output: "15-04-2026"
 */
export const isoToBackendDate = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
};

/**
 * Convierte DD-MM-YYYY a formato legible.
 */
export const formatDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return '—';
  const [d, m, y] = ddmmyyyy.split('-');
  return new Date(+y, +m - 1, +d).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Calcula estado de deadline.
 */
export const deadlineStatus = (ddmmyyyy) => {
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const now  = new Date(); now.setHours(0,0,0,0);
  const diff = Math.ceil((date - now) / 86400000);
  if (diff < 0)   return { label: 'Vencida',       urgent: true };
  if (diff === 0) return { label: 'Vence hoy',      urgent: true };
  if (diff <= 2)  return { label: `${diff}d`,        urgent: true };
  return { label: formatDate(ddmmyyyy), urgent: false };
};

/**
 * Calcula % de completado de una tarea dado sus completions.
 */
export const completionRate = (completions = []) => {
  if (!completions.length) return 0;
  const done = completions.filter((c) => c.is_completed).length;
  return Math.round((done / completions.length) * 100);
};
