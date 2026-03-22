import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import LoadingButton from '../components/LoadingButton';
import { FormError, FormSuccess } from '../components/FormAlerts';
import { forgotPassword, resetPassword } from '../services/authService';

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const HashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

// ── Step 1: Request reset code ───────────────────────────────────────────────
const StepEmail = ({ onCodeSent }) => {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setApiError('');

    if (!email) { setError('El correo es requerido'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      onCodeSent(email);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo institucional y te enviaremos un código de verificación"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid" style={{ gap: '20px' }}>
          <FormError message={apiError} />

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

          <LoadingButton isLoading={isLoading} loadingText="Enviando código...">
            Enviar código
          </LoadingButton>
        </div>
      </form>

      <p className="form-footer" style={{ marginTop: '24px' }}>
        <Link to="/login">← Volver al inicio de sesión</Link>
      </p>
    </AuthCard>
  );
};

// ── Step 2: Enter code + new password ────────────────────────────────────────
const StepReset = ({ email, onBack }) => {
  const navigate = useNavigate();
  const [code, setCode]               = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [errors, setErrors]           = useState({});
  const [apiError, setApiError]       = useState('');
  const [success, setSuccess]         = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    setErrors((p) => ({ ...p, code: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fe = {};
    if (!code)              fe.code     = 'El código es requerido';
    else if (code.length !== 6) fe.code = 'El código debe tener 6 dígitos';
    if (!password)          fe.password = 'La nueva contraseña es requerida';
    else if (password.length < 6) fe.password = 'Mínimo 6 caracteres';
    if (!confirm)           fe.confirm  = 'Confirma la contraseña';
    else if (password !== confirm) fe.confirm = 'Las contraseñas no coinciden';
    if (Object.keys(fe).length) { setErrors(fe); return; }

    setIsLoading(true);
    setApiError('');
    const result = await resetPassword(email, code, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess('¡Contraseña actualizada! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <AuthCard
      title="Nueva contraseña"
      subtitle="Ingresa el código que enviamos a tu correo y tu nueva contraseña"
    >
      <div className="verify-info-banner">
        <p className="verify-info-banner__text">
          Enviamos un código de 6 dígitos a <strong>{email}</strong>. Expira en 5 minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: '24px' }}>
        <div className="form-grid" style={{ gap: '20px' }}>
          <FormError   message={apiError} />
          <FormSuccess message={success} />

          <InputField
            label="Código de verificación" name="code"
            placeholder="482910" value={code}
            onChange={handleCodeChange} error={errors.code}
            required icon={<HashIcon />}
            inputMode="numeric" autoComplete="one-time-code"
            style={{ letterSpacing: '0.3em', fontSize: '22px', fontWeight: '700', textAlign: 'center' }}
          />

          <PasswordField
            label="Nueva contraseña" name="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirmar contraseña" name="confirm-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
            error={errors.confirm}
            required
            autoComplete="new-password"
          />

          <LoadingButton isLoading={isLoading} loadingText="Actualizando...">
            Restablecer contraseña
          </LoadingButton>
        </div>
      </form>

      <p className="form-footer" style={{ marginTop: '24px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}
        >
          ← Usar otro correo
        </button>
      </p>
    </AuthCard>
  );
};

// ── ForgotPasswordPage ───────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const [sentEmail, setSentEmail] = useState(null);

  if (sentEmail) {
    return <StepReset email={sentEmail} onBack={() => setSentEmail(null)} />;
  }

  return <StepEmail onCodeSent={(email) => setSentEmail(email)} />;
};

export default ForgotPasswordPage;
