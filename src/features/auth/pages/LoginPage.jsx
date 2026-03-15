import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard    from '../components/AuthCard';
import InputField  from '../components/InputField';
import PasswordField from '../components/PasswordField';
import LoadingButton from '../components/LoadingButton';
import { FormError } from '../components/FormAlerts';
import { login } from '../services/authService';

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fe = {};
    if (!username.trim()) fe.username = 'El usuario es requerido';
    if (!password)        fe.password = 'La contraseña es requerida';
    if (Object.keys(fe).length) { setErrors(fe); return; }

    setLoading(true);
    setApiError('');

    const result = await login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Cuenta no activada → el backend reenvió el OTP y guardó el id en el store
    if (result.code === 'ACCOUNT_NOT_ACTIVATED') {
      setApiError(result.message);
      setTimeout(() => navigate('/verify-account'), 2000);
      return;
    }

    setApiError(result.message);
  };

  return (
    <AuthCard title="Bienvenido de vuelta"
      subtitle="Ingresa tu usuario y contraseña para acceder al sistema">

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid" style={{ gap: '20px' }}>
          <FormError message={apiError} />

          <InputField label="Nombre de usuario" name="username"
            placeholder="carlosm" value={username}
            onChange={e => { setUsername(e.target.value); setErrors(p => ({...p, username:''})); setApiError(''); }}
            onBlur={() => { if (!username.trim()) setErrors(p => ({...p, username:'El usuario es requerido'})); }}
            error={errors.username} required icon={<UserIcon />} autoComplete="username" />

          <PasswordField label="Contraseña" name="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password:''})); setApiError(''); }}
            error={errors.password} required autoComplete="current-password" />

          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'-8px' }}>
            <Link to="/forgot-password" style={{ fontSize:'13px' }}>¿Olvidaste tu contraseña?</Link>
          </div>

          <LoadingButton isLoading={loading} loadingText="Iniciando sesión...">
            Iniciar sesión
          </LoadingButton>
        </div>
      </form>

      <p className="form-footer" style={{ marginTop:'24px' }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </AuthCard>
  );
};

export default LoginPage;
