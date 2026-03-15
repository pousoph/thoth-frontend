import React, { useState, forwardRef } from 'react';

// ── Password strength calculator ──────────────────────────────────────────

const getStrength = (password) => {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { min: 0, label: '' },
    { min: 1, label: 'Débil' },
    { min: 2, label: 'Regular' },
    { min: 3, label: 'Buena' },
    { min: 5, label: 'Fuerte' },
  ];

  let level = levels[0];
  for (const l of levels) {
    if (score >= l.min) level = l;
  }

  return { score, label: level.label };
};

const strengthClass = (score, bar) => {
  if (score === 0) return '';
  if (score === 1) return bar <= 1 ? 'password-strength__bar--active-weak'   : '';
  if (score === 2) return bar <= 2 ? 'password-strength__bar--active-fair'   : '';
  if (score === 3) return bar <= 3 ? 'password-strength__bar--active-good'   : '';
  return bar <= 4 ? 'password-strength__bar--active-strong' : '';
};

// ── Eye icons ─────────────────────────────────────────────────────────────

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────

/**
 * PasswordField — password input with visibility toggle and optional strength meter
 *
 * Props:
 *   showStrength {boolean} - show strength bar below input
 *   + all InputField props
 */
const PasswordField = forwardRef(
  (
    {
      label,
      name,
      value = '',
      onChange,
      onBlur,
      error,
      required = false,
      disabled = false,
      placeholder = '••••••••',
      showStrength = false,
      autoComplete = 'current-password',
      className = '',
      ...rest
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const strength = showStrength ? getStrength(value) : null;

    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label htmlFor={name} className={`input-label ${required ? 'input-label--required' : ''}`}>
            {label}
          </label>
        )}

        <div className="input-field-wrapper">
          {/* Lock icon */}
          <span className="input-field-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>

          <input
            ref={ref}
            id={name}
            name={name}
            type={visible ? 'text' : 'password'}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            autoComplete={autoComplete}
            className={[
              'input-field',
              'input-field--with-icon',
              'input-field--with-action',
              error ? 'input-field--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />

          <button
            type="button"
            className="input-action-btn"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {error && (
          <span className="field-error">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 3.5v3M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {error}
          </span>
        )}

        {showStrength && value && (
          <div className="password-strength">
            <div className="password-strength__bars">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`password-strength__bar ${strengthClass(Math.min(strength.score, 4), bar)}`}
                />
              ))}
            </div>
            <span className="password-strength__label">{strength.label}</span>
          </div>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
