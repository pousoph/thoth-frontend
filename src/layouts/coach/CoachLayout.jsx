import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useCoachStore from '@/store/coachStore';
import '@/styles/coach.css';

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconTeams = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const IconCompetitors = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    <path d="M12 11v4"/><path d="M10 13h4"/>
  </svg>
);

const IconTasks = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);

const IconAnalytics = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

// ── Nav config ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/coach/dashboard',   label: 'Dashboard',     Icon: IconDashboard  },
  { to: '/coach/teams',       label: 'Equipos',       Icon: IconTeams      },
  { to: '/coach/competitors', label: 'Competidores',  Icon: IconCompetitors },
  { to: '/coach/tasks',       label: 'Tareas',        Icon: IconTasks      },
  { to: '/coach/analytics',   label: 'Estadísticas',  Icon: IconAnalytics  },
];

const PAGE_TITLES = {
  '/coach/dashboard':   { title: 'Dashboard',        breadcrumb: 'Vista general del coach' },
  '/coach/teams':       { title: 'Equipos',           breadcrumb: 'Gestión de equipos' },
  '/coach/competitors': { title: 'Competidores',      breadcrumb: 'Gestión de competidores' },
  '/coach/tasks':       { title: 'Tareas',            breadcrumb: 'Asignación de tareas' },
  '/coach/analytics':   { title: 'Estadísticas',      breadcrumb: 'Análisis de rendimiento' },
};

// ── Sidebar ────────────────────────────────────────────────────────────────────
const Sidebar = ({ user, onLogout }) => {
  const initials = user?.username?.[0]?.toUpperCase() ?? 'C';

  return (
    <aside className="co-sidebar">
      <div className="co-sidebar__grid" />
      <div className="co-sidebar__glow" />

      {/* User card */}
      <div className="co-user-card">
        <div className="co-user-avatar">
          <div className="co-user-avatar__ring" />
          <div className="co-user-avatar__inner">{initials}</div>
        </div>
        <div className="co-user-name">{user?.username ?? 'Coach'}</div>
        <div className="co-user-username">@{user?.username ?? '—'}</div>
        <span className="co-role-badge">
          <span className="co-role-badge__dot" />
          Coach
        </span>
      </div>

      {/* Nav */}
      <nav className="co-nav">
        <div className="co-nav__section-label">Navegación</div>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `co-nav__item${isActive ? ' co-nav__item--active' : ''}`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="co-sidebar__footer">
        <button className="co-nav__item" onClick={onLogout} style={{ width: '100%' }}>
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

// ── Topbar ─────────────────────────────────────────────────────────────────────
const Topbar = ({ pathname }) => {
  // Match exact or prefix (for /coach/teams/:id)
  const key = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k)) ?? '';
  const info = PAGE_TITLES[key] ?? { title: 'THOTH', breadcrumb: '' };

  return (
    <header className="co-topbar">
      <div className="co-topbar__left">
        <div className="co-topbar__title">{info.title}</div>
        {info.breadcrumb && (
          <div className="co-topbar__breadcrumb">THOTH · {info.breadcrumb}</div>
        )}
      </div>
      <div className="co-topbar__right">
        <button className="co-topbar__icon-btn" title="Notificaciones">
          <IconBell />
        </button>
      </div>
    </header>
  );
};

// ── CoachLayout ────────────────────────────────────────────────────────────────
const CoachLayout = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const user        = useAuthStore((s) => s.user);
  const clearAuth   = useAuthStore((s) => s.clearAuth);
  const resetCoach  = useCoachStore((s) => s.resetCoach);

  const handleLogout = () => {
    resetCoach();
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="co-layout">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="co-main">
        <Topbar pathname={location.pathname} />
        <main className="co-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoachLayout;
