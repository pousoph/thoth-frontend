import React from 'react';

const AlertIcon = () => (
  <svg className="form-error__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="form-error__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/**
 * FormError — shows an error alert banner inside a form
 * @param {string} message
 */
export const FormError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="form-error" role="alert">
      <AlertIcon />
      <span>{message}</span>
    </div>
  );
};

/**
 * FormSuccess — shows a success alert banner inside a form
 * @param {string} message
 */
export const FormSuccess = ({ message }) => {
  if (!message) return null;
  return (
    <div className="form-success" role="status">
      <CheckIcon />
      <span>{message}</span>
    </div>
  );
};
