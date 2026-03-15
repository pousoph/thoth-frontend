import React from 'react';

// ── LevelBadge ────────────────────────────────────────────────────────────────
export const LevelBadge = ({ level, size = 'sm' }) => {
  if (!level) return null;
  return (
    <span className="cl-level-badge" style={size === 'lg' ? { fontSize: '13px', padding: '5px 14px' } : {}}>
      <span className="cl-level-badge__dot" />
      {level}
    </span>
  );
};

// ── MetricCard ────────────────────────────────────────────────────────────────
export const MetricCard = ({ label, value, icon, trend, trendLabel, delay = 0 }) => (
  <div className="cl-metric-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="cl-metric-card__header">
      <span className="cl-metric-card__label">{label}</span>
      <div className="cl-metric-card__icon">{icon}</div>
    </div>
    <div className="cl-metric-card__value">{value ?? '—'}</div>
    {trendLabel && (
      <div className={`cl-metric-card__trend cl-metric-card__trend--${trend ?? 'neutral'}`}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
      </div>
    )}
  </div>
);

// ── SkeletonCard ──────────────────────────────────────────────────────────────
export const SkeletonCard = ({ height = 120 }) => (
  <div
    className="cl-skeleton"
    style={{ height, borderRadius: 'var(--radius-lg)' }}
  />
);

export const SkeletonMetrics = () => (
  <div className="cl-metrics-grid">
    {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height={120} />)}
  </div>
);

export const SkeletonList = ({ rows = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: rows }).map((_, i) => <SkeletonCard key={i} height={90} />)}
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, description }) => (
  <div className="cl-empty">
    <div className="cl-empty__icon">{icon}</div>
    <div className="cl-empty__title">{title}</div>
    {description && <div className="cl-empty__desc">{description}</div>}
  </div>
);

// ── ActivityFeed ──────────────────────────────────────────────────────────────
export const ActivityFeed = ({ items = [], loading }) => {
  if (loading) return <SkeletonList rows={5} />;
  if (!items.length) return <EmptyState icon="🔔" title="Sin actividad reciente" />;

  return (
    <div className="cl-activity-list">
      {items.map((item) => (
        <div key={item.id} className="cl-activity-item">
          <div className={`cl-activity-dot cl-activity-dot--${item.dot ?? 'info'}`} />
          <div
            className="cl-activity-text"
            dangerouslySetInnerHTML={{ __html: item.text }}
          />
          <div className="cl-activity-time">{item.time}</div>
        </div>
      ))}
    </div>
  );
};

// ── ChartContainer ────────────────────────────────────────────────────────────
export const ChartContainer = ({ title, subtitle, pill, children, wide = false, style }) => (
  <div className={`cl-chart-card${wide ? ' cl-chart-card--wide' : ''}`} style={style}>
    <div className="cl-chart-header">
      <div>
        <div className="cl-chart-title">{title}</div>
        {subtitle && <div className="cl-chart-subtitle">{subtitle}</div>}
      </div>
      {pill && <span className="cl-chart-pill">{pill}</span>}
    </div>
    {children}
  </div>
);

// ── FilterTabs ────────────────────────────────────────────────────────────────
export const FilterTabs = ({ tabs, active, onChange }) => (
  <div className="cl-filter-tabs">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        className={`cl-filter-tab${active === tab.key ? ' cl-filter-tab--active' : ''}`}
        onClick={() => onChange(tab.key)}
      >
        {tab.label}
        {tab.count != null && (
          <span className="cl-filter-tab__count">{tab.count}</span>
        )}
      </button>
    ))}
  </div>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="cl-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
    <div>
      <h1 className="cl-page-title">{title}</h1>
      {subtitle && <p className="cl-page-subtitle">{subtitle}</p>}
    </div>
    {action}
  </div>
);
