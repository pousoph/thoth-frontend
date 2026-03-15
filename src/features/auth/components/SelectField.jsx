import React, { forwardRef } from 'react';

/**
 * SelectField — styled <select> wrapper
 */
const SelectField = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      error,
      required = false,
      disabled = false,
      children,
      placeholder,
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

        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={['input-field input-select', error ? 'input-field--error' : '']
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>

        {error && (
          <span className="field-error">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 3.5v3M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {error}
          </span>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;
