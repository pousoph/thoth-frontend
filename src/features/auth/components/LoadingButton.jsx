import React from 'react';

/**
 * LoadingButton
 *
 * Props:
 *   isLoading   {boolean}
 *   loadingText {string}   - text shown while loading
 *   variant     {string}   - 'primary' | 'ghost'
 *   full        {boolean}  - full width
 *   type        {string}   - 'button' | 'submit' | 'reset'
 *   disabled    {boolean}
 *   onClick     {function}
 *   children    {ReactNode}
 *   className   {string}
 */
const LoadingButton = ({
  isLoading = false,
  loadingText = 'Cargando...',
  variant = 'primary',
  full = true,
  type = 'submit',
  disabled = false,
  onClick,
  children,
  className = '',
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={[
        'btn',
        `btn--${variant}`,
        full ? 'btn--full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
