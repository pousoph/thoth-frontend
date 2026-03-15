import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import LoadingButton from '../components/LoadingButton';
import { FormError, FormSuccess } from '../components/FormAlerts';
import { forgotPassword } from '../services/authService';

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ForgotPasswordPage = () => {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setApiError(''); setSuccess('');

    if (!email) { setError('El correo es requerido'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setSuccess(
        'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña en breve.'
      );
      setEmail('');
    } else {
      setApiError(result.message);
    }
  };

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo institucional y te enviaremos las instrucciones"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid" style={{ gap: '20px' }}>
          <FormError   message={apiError} />
          <FormSuccess message={success} />

          <InputField
            label="Correo institucional"
            name="email"
            type="email"
            placeholder="tu@universidad.edu.co"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            error={error}
            required
            autoComplete="email"
            icon={<MailIcon />}
          />

          <LoadingButton isLoading={isLoading} loadingText="Enviando instrucciones...">
            Enviar instrucciones
          </LoadingButton>
        </div>
      </form>

      <p className="form-footer" style={{ marginTop: '24px' }}>
        <Link to="/login">← Volver al inicio de sesión</Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
