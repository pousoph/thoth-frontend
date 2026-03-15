import React from 'react';
import { Outlet } from 'react-router-dom';
import thothLogo from '@/assets/thothLogo.png';

const BrandPanel = () => (
  <aside className="auth-layout__brand">
    <div className="auth-layout__brand-grid" />

    <img src={thothLogo} alt="" className="auth-layout__deco-logo" aria-hidden="true" />

    <div className="auth-layout__logo">
      <img src={thothLogo} alt="THOTH logo" className="auth-layout__logo-img" />
      <span className="auth-layout__logo-name">THOTH</span>
    </div>

    {/* Contenido central */}
    <div className="auth-layout__brand-content">
      <p className="auth-layout__tagline">Grupo de Programación Competitiva</p>

      <h2 className="auth-layout__headline">
        Somos<br />
        <span>GPC-UEB</span><br />
      </h2>

      <p className="auth-layout__description">
        Bienvenido a la plataforma de gestión del Grupo de Programación Competitiva de la Universidad
        el Bosque. <br />
        Aquí podrás gestionar tus competiciones, equipos y resultados.
      </p>

    </div>

    <footer className="auth-layout__brand-footer">
      © {new Date().getFullYear()} Thoth · Andres Espitia & Sophy Guiza
    </footer>
  </aside>
);

const AuthLayout = () => (
  <div className="auth-layout">
    <BrandPanel />

    <main className="auth-layout__form-panel">
      <div className="auth-layout__form-container">

        {/* Logo mobile-only */}
        <div className="auth-mobile-logo">
          <img src={thothLogo} alt="THOTH" className="auth-mobile-logo__img" />
          <span className="auth-mobile-logo__name">Thoth</span>
          <span className="auth-mobile-logo__tagline">Programación Competitiva</span>
        </div>

        <Outlet />
      </div>
    </main>
  </div>
);

export default AuthLayout;
