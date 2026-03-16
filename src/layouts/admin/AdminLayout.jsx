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

const IconUsers = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const IconTrophy = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/>
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

// ── Nav items config ───────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard',    Icon: IconDashboard },
  { to: '/admin/coaches',   label: 'Coaches',      Icon: IconUsers     },
  { to: '/admin/contests',  label: 'Competencias', Icon: IconTrophy    },
  { to: '/admin/league',      label: 'Liga',          Icon: IconLeague   },
  { to: '/admin/ascensos',    label: 'Ascensos',      Icon: IconAscensos },
  { to: '/admin/cf-ranking',  label: 'Ranking CF',    Icon: IconCF       },
];

// ── Page title map ─────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/admin/dashboard': { title: 'Admin Dashboard', breadcrumb: 'Salud de Plataforma' },
  '/admin/coaches':   { title: 'Gestión de Coaches', breadcrumb: 'Solicitudes pendientes' },
  '/admin/contests':  { title: 'Competencias', breadcrumb: 'Registrar resultados' },
  '/admin/league':    { title: 'Liga',          breadcrumb: 'Tabla de posiciones' },
  '/admin/ascensos':    { title: 'Ascensos',      breadcrumb: 'Historial de cambios de nivel' },
  '/admin/cf-ranking':  { title: 'Ranking CF',    breadcrumb: 'Ranking de Codeforces' },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ user, onLogout }) => {
  const initials = user
    ? `${user.username?.[0] ?? ''}`.toUpperCase()
    : 'A';

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
        <div className="cl-user-name">{user?.username ?? 'Administrador'}</div>
        <div className="cl-user-username">Admin</div>
        <LevelBadge level="legendary" />
      </div>

      {/* Nav */}
      <nav className="cl-nav">
        <div className="cl-nav__section-label">Gestión</div>
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
  const info = PAGE_TITLES[pathname] ?? { title: 'THOTH Admin', breadcrumb: '' };

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

// ── AdminLayout ──────────────────────────────────────────────────────────
const AdminLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Apply a specific theme indicator for admins if needed (force elite/legendary look)
  useEffect(() => {
    document.documentElement.setAttribute('data-level', 'legendary');
    return () => document.documentElement.removeAttribute('data-level');
  }, []);

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

export default AdminLayout;
