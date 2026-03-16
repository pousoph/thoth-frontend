import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { LevelBadge } from '@/features/contestant/components/SharedComponents';
import '@/styles/contestant.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconTasks = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);

const IconTeams = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const IconMetrics = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const IconProfile = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
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

// ── Nav items config ───────────────────────────────────────────────────────────
const IconLeague = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
  </svg>
);

const IconAscensos = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
    <line x1="12" y1="9" x2="12" y2="21"/>
    <line x1="4" y1="3" x2="20" y2="3"/>
  </svg>
);

const IconCF = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 16V8h4"/><path d="M8 12h3"/><path d="M16 16V8h-3v3h2"/>
  </svg>
);

const NAV_ITEMS = [
  { to: '/contestant/dashboard', label: 'Dashboard',  Icon: IconDashboard },
  { to: '/contestant/tasks',     label: 'Mis Tareas', Icon: IconTasks      },
  { to: '/contestant/teams',     label: 'Mis Equipos',Icon: IconTeams      },
  { to: '/contestant/metrics',   label: 'Métricas',   Icon: IconMetrics    },
  { to: '/contestant/league',    label: 'Liga',        Icon: IconLeague    },
  { to: '/contestant/ascensos',    label: 'Ascensos',          Icon: IconAscensos  },
  { to: '/contestant/cf-ranking', label: 'Ranking CF',        Icon: IconCF        },
  { to: '/contestant/profile',    label: 'Perfil',            Icon: IconProfile   },
];

// ── Page title map ─────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/contestant/dashboard': { title: 'Dashboard',    breadcrumb: 'Vista general' },
  '/contestant/tasks':     { title: 'Mis Tareas',   breadcrumb: 'Tareas asignadas por el coach' },
  '/contestant/teams':     { title: 'Mis Equipos',  breadcrumb: 'Historial de equipos' },
  '/contestant/metrics':   { title: 'Métricas',     breadcrumb: 'Tu rendimiento competitivo' },
  '/contestant/league':    { title: 'Liga',          breadcrumb: 'Tabla de posiciones' },
  '/contestant/ascensos':    { title: 'Ascensos',      breadcrumb: 'Historial de cambios de nivel' },
  '/contestant/cf-ranking': { title: 'Ranking CF',    breadcrumb: 'Ranking de Codeforces' },
  '/contestant/profile':    { title: 'Mi Perfil',     breadcrumb: 'Información personal' },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ user, onLogout }) => {
  const initials = user
    ? `${user.username?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <aside className="cl-sidebar">
      <div className="cl-sidebar__grid" />
      <div className="cl-sidebar__glow" />

      {/* User card */}
      <div className="cl-user-card">
        <div className="cl-user-avatar">
          <div className="cl-user-avatar__ring" />
          <div className="cl-user-avatar__inner">{initials}</div>
        </div>
        <div className="cl-user-name">{user?.username ?? 'Competidor'}</div>
        <div className="cl-user-username">@{user?.username ?? '—'}</div>
        <LevelBadge level={user?.level} />
      </div>

      {/* Nav */}
      <nav className="cl-nav">
        <div className="cl-nav__section-label">Navegación</div>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `cl-nav__item${isActive ? ' cl-nav__item--active' : ''}`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="cl-sidebar__footer">
        <button className="cl-nav__item" onClick={onLogout} style={{ width: '100%' }}>
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

// ── Topbar ────────────────────────────────────────────────────────────────────
const Topbar = ({ pathname }) => {
  const info = PAGE_TITLES[pathname] ?? { title: 'THOTH', breadcrumb: '' };

  return (
    <header className="cl-topbar">
      <div className="cl-topbar__left">
        <div className="cl-topbar__title">{info.title}</div>
        {info.breadcrumb && (
          <div className="cl-topbar__breadcrumb">THOTH · {info.breadcrumb}</div>
        )}
      </div>
      <div className="cl-topbar__right">
        <button className="cl-topbar__icon-btn" title="Notificaciones">
          <IconBell />
        </button>
      </div>
    </header>
  );
};

// ── CompetitorLayout ──────────────────────────────────────────────────────────
const CompetitorLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Aplicar data-level al root para el sistema de tematización
  useEffect(() => {
    const level = user?.level ?? 'Elite';
    document.documentElement.setAttribute('data-level', level);
    return () => document.documentElement.removeAttribute('data-level');
  }, [user?.level]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="cl-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="cl-main">
        <Topbar pathname={location.pathname} />
        <main className="cl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompetitorLayout;
