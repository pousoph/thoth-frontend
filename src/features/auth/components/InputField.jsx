import React, { forwardRef } from 'react';

/**
 * InputField — generic text / email / date / number input
 *
 * Props:
 *   label        {string}   - field label
 *   name         {string}   - input name attr
 *   type         {string}   - input type (default: 'text')
 *   placeholder  {string}
 *   value        {string}
 *   onChange     {function}
 *   onBlur       {function}
 *   error        {string}   - field-level error message
 *   hint         {string}   - helper text below input
 *   required     {boolean}
 *   disabled     {boolean}
 *   icon         {ReactNode} - left icon
 *   autoComplete {string}
 *   className    {string}
 */
const InputField = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      hint,
      required = false,
      disabled = false,
      icon,
      autoComplete,
      className = '',
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label htmlFor={name} className={`input-label ${required ? 'input-label--required' : ''}`}>
            {label}
          </label>
        )}

        <div className="input-field-wrapper">
          {icon && <span className="input-field-icon">{icon}</span>}
          <input
            ref={ref}
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            autoComplete={autoComplete}
            className={[
              'input-field',
              icon ? 'input-field--with-icon' : '',
              error ? 'input-field--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />
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

        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
