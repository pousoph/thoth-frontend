import React, { useState, useCallback } from 'react';
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
const IconLeague = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
  </svg>
);

const IconAscensos = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
    <line x1="12" y1="9" x2="12" y2="21"/>
    <line x1="4" y1="3" x2="20" y2="3"/>
  </svg>
);

const IconCF = () => (
  <svg className="co-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 16V8h4"/><path d="M8 12h3"/><path d="M16 16V8h-3v3h2"/>
  </svg>
);

const NAV_ITEMS = [
  { to: '/coach/dashboard',   label: 'Dashboard',     Icon: IconDashboard  },
  { to: '/coach/teams',       label: 'Equipos',       Icon: IconTeams      },
  { to: '/coach/competitors', label: 'Competidores',  Icon: IconCompetitors },
  { to: '/coach/tasks',       label: 'Tareas',        Icon: IconTasks      },
  { to: '/coach/analytics',   label: 'Estadísticas',  Icon: IconAnalytics  },
  { to: '/coach/league',      label: 'Liga',           Icon: IconLeague    },
  { to: '/coach/ascensos',    label: 'Ascensos',       Icon: IconAscensos  },
  { to: '/coach/cf-ranking',  label: 'Ranking CF',     Icon: IconCF        },
];

const PAGE_TITLES = {
  '/coach/dashboard':   { title: 'Dashboard',        breadcrumb: 'Vista general del coach' },
  '/coach/teams':       { title: 'Equipos',           breadcrumb: 'Gestión de equipos' },
  '/coach/competitors': { title: 'Competidores',      breadcrumb: 'Gestión de competidores' },
  '/coach/tasks':       { title: 'Tareas',            breadcrumb: 'Asignación de tareas' },
  '/coach/analytics':   { title: 'Estadísticas',      breadcrumb: 'Análisis de rendimiento' },
  '/coach/league':      { title: 'Liga',              breadcrumb: 'Tabla de posiciones' },
  '/coach/ascensos':    { title: 'Ascensos',          breadcrumb: 'Historial de cambios de nivel' },
  '/coach/cf-ranking':  { title: 'Ranking CF',        breadcrumb: 'Ranking de Codeforces' },
};

// ── Sidebar ────────────────────────────────────────────────────────────────────
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const Sidebar = ({ user, onLogout, open, onNavClick }) => {
  const initials = user?.username?.[0]?.toUpperCase() ?? 'C';

  return (
    <aside className={`co-sidebar${open ? ' co-sidebar--open' : ''}`}>
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
            onClick={onNavClick}
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
const Topbar = ({ pathname, onToggleSidebar }) => {
  // Match exact or prefix (for /coach/teams/:id)
  const key = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k)) ?? '';
  const info = PAGE_TITLES[key] ?? { title: 'THOTH', breadcrumb: '' };

  return (
    <header className="co-topbar">
      <button className="co-topbar__hamburger" onClick={onToggleSidebar} aria-label="Abrir menú">
        <IconMenu />
      </button>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = () => {
    resetCoach();
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="co-layout">
      <div className={`co-backdrop${sidebarOpen ? ' co-backdrop--open' : ''}`} onClick={closeSidebar} />
      <Sidebar user={user} onLogout={handleLogout} open={sidebarOpen} onNavClick={closeSidebar} />
      <div className="co-main">
        <Topbar pathname={location.pathname} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="co-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoachLayout;
