import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useThemeStore from '@/store/themeStore';
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
const IconContestants = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconContests = () => (
  <svg className="cl-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M12 14v8"/><path d="M9 18h6"/>
  </svg>
);

const NAV_ITEMS = [
  { to: '/admin/dashboard',     label: 'Dashboard',       Icon: IconDashboard    },
  { to: '/admin/coaches',       label: 'Coaches',          Icon: IconUsers        },
  { to: '/admin/contestants',   label: 'Competidores',     Icon: IconContestants  },
  { to: '/admin/contests',     label: 'Registrar Comp.',  Icon: IconTrophy       },
  { to: '/admin/league',        label: 'Liga',              Icon: IconLeague      },
  { to: '/admin/competencias',  label: 'Competencias',     Icon: IconContests    },
  { to: '/admin/ascensos',      label: 'Ascensos',         Icon: IconAscensos    },
  { to: '/admin/cf-ranking',    label: 'Ranking CF',       Icon: IconCF          },
];

// ── Page title map ─────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/admin/dashboard': { title: 'Admin Dashboard', breadcrumb: 'Salud de Plataforma' },
  '/admin/coaches':   { title: 'Gestión de Coaches', breadcrumb: 'Solicitudes pendientes' },
  '/admin/contests':     { title: 'Competencias', breadcrumb: 'Registrar resultados' },
  '/admin/contestants':  { title: 'Competidores', breadcrumb: 'Todos los competidores' },
  '/admin/league':        { title: 'Liga',          breadcrumb: 'Tabla de posiciones' },
  '/admin/competencias': { title: 'Competencias',  breadcrumb: 'Resultados por competencia' },
  '/admin/ascensos':     { title: 'Ascensos',      breadcrumb: 'Historial de cambios de nivel' },
  '/admin/cf-ranking':  { title: 'Ranking CF',    breadcrumb: 'Ranking de Codeforces' },
};

const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ user, onLogout, open, onNavClick }) => {
  const initials = user
    ? `${user.username?.[0] ?? ''}`.toUpperCase()
    : 'A';

  return (
    <aside className={`cl-sidebar${open ? ' cl-sidebar--open' : ''}`}>
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
            onClick={onNavClick}
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
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Topbar = ({ pathname, onToggleSidebar }) => {
  const { theme, toggleTheme } = useThemeStore();
  const info = PAGE_TITLES[pathname] ?? { title: 'THOTH Admin', breadcrumb: '' };

  return (
    <header className="cl-topbar">
      <button className="cl-topbar__hamburger" onClick={onToggleSidebar} aria-label="Abrir menú">
        <IconMenu />
      </button>
      <div className="cl-topbar__left">
        <div className="cl-topbar__title">{info.title}</div>
        {info.breadcrumb && (
          <div className="cl-topbar__breadcrumb">THOTH · {info.breadcrumb}</div>
        )}
      </div>
      <div className="cl-topbar__right">
        <button className="cl-topbar__icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

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
      <div className={`cl-backdrop${sidebarOpen ? ' cl-backdrop--open' : ''}`} onClick={closeSidebar} />
      <Sidebar user={user} onLogout={handleLogout} open={sidebarOpen} onNavClick={closeSidebar} />

      <div className="cl-main">
        <Topbar pathname={location.pathname} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="cl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
