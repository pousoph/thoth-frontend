import React from 'react';

/**
 * AuthCard — container card for auth forms
 *
 * Props:
 *   title     {string}
 *   subtitle  {string}
 *   children  {ReactNode}
 *   className {string}
 */
const AuthCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`auth-card ${className}`}>
      {(title || subtitle) && (
        <div className="auth-card__header">
          {title    && <h1 className="auth-card__title">{title}</h1>}
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default AuthCard;
