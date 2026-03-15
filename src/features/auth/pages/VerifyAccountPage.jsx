import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard    from '../components/AuthCard';
import InputField  from '../components/InputField';
import LoadingButton from '../components/LoadingButton';
import { FormError, FormSuccess } from '../components/FormAlerts';
import { activateAccount } from '../services/authService';

const HashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

const VerifyAccountPage = () => {
  const navigate = useNavigate();
  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    // Solo dígitos, máx 6
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    setError('');
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) { setError('El código es requerido'); return; }
    if (code.length !== 6) { setError('El código debe tener 6 dígitos'); return; }

    setLoading(true);
    setApiError('');

    // activateAccount recibe solo el código — lee el id del store internamente
    const result = await activateAccount(code);
    setLoading(false);

    if (result.success) {
      setSuccess('¡Cuenta activada! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <AuthCard title="Activa tu cuenta"
      subtitle="Ingresa el código de 6 dígitos que enviamos a tu correo">

      <div className="verify-info-banner">
        <p className="verify-info-banner__text">
          Revisa tu bandeja de entrada — te enviamos un código OTP de 6 dígitos al correo con el que te registraste.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: '24px' }}>
        <div className="form-grid" style={{ gap: '20px' }}>
          <FormError   message={apiError} />
          <FormSuccess message={success}  />

          <InputField
            label="Código de activación" name="code"
            placeholder="482917" value={code}
            onChange={handleChange} error={error}
            required icon={<HashIcon />}
            inputMode="numeric" autoComplete="one-time-code"
            style={{ letterSpacing: '0.3em', fontSize: '22px', fontWeight: '700', textAlign: 'center' }}
          />

          <LoadingButton isLoading={loading} loadingText="Verificando...">
            Activar cuenta
          </LoadingButton>
        </div>
      </form>

      <p className="form-footer" style={{ marginTop: '24px' }}>
        ¿Ya tienes cuenta activa? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthCard>
  );
};

export default VerifyAccountPage;
