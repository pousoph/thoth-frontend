import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard      from '../components/AuthCard';
import InputField    from '../components/InputField';
import PasswordField from '../components/PasswordField';
import SelectField   from '../components/SelectField';
import LoadingButton from '../components/LoadingButton';
import { FormError, FormSuccess } from '../components/FormAlerts';
import { registerContestant, registerCoach } from '../services/authService';

// ── Icons ─────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const AtIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ── Role Card ─────────────────────────────────────────────────────────────
const RoleCard = ({ value, current, icon, title, description, onClick }) => (
  <button type="button" onClick={() => onClick(value)}
    className={`role-card ${current === value ? 'role-card--active' : ''}`}
    style={{ textAlign: 'left' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
      <span className="role-card__icon" style={{ fontSize: '20px' }}>{icon}</span>
      <span className="role-card__title">{title}</span>
    </div>
    <span className="role-card__desc">{description}</span>
  </button>
);

// ── Constantes ────────────────────────────────────────────────────────────
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

// ── Estado en camelCase — buildPayload convierte a keys del backend ────────
const INIT = {
  name: '', lastName: '', username: '', email: '',
  gender: '', birthDate: '', size: '', codeforcesHandle: '',
  password: '', confirmPassword: '',
};

const toBackendDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

const buildPayload = (v) => ({
  'name':              v.name.trim(),
  'last-name':         v.lastName.trim(),
  'username':          v.username.trim(),
  'password':          v.password,
  'email':             v.email.trim(),
  'birth-date':        toBackendDate(v.birthDate),
  'size':              v.size,
  'codeforces-handle': v.codeforcesHandle.trim(),
  'gender':            v.gender,
});

const validate = (v) => {
  const e = {};
  if (!v.name.trim())             e.name             = 'Requerido';
  if (!v.lastName.trim())         e.lastName         = 'Requerido';
  if (!v.username.trim())         e.username         = 'Requerido';
  else if (/\s/.test(v.username)) e.username         = 'Sin espacios';
  if (!v.email.trim())            e.email            = 'Requerido';
  else if (!v.email.toLowerCase().endsWith('@unbosque.edu.co'))
                                  e.email            = 'Debe ser @unbosque.edu.co';
  if (!v.gender)                  e.gender           = 'Selecciona';
  if (!v.birthDate)               e.birthDate        = 'Requerido';
  if (!v.size)                    e.size             = 'Selecciona';
  if (!v.codeforcesHandle.trim()) e.codeforcesHandle = 'Requerido';
  if (!v.password)                e.password         = 'Requerido';
  else if (v.password.length < 6) e.password         = 'Mínimo 6 caracteres';
  if (v.password !== v.confirmPassword)
                                  e.confirmPassword  = 'No coinciden';
  return e;
};

// ── Sección agrupada del formulario ───────────────────────────────────────
const Section = ({ label, children }) => (
  <div className="register-section">
    <p className="register-section__label">{label}</p>
    {children}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole]         = useState('contestant');
  const [values, setValues]     = useState(INIT);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const set = (name, value) => {
    setValues(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleBlur = (e) => {
    const { name } = e.target;
    const fe = validate(values);
    if (fe[name]) setErrors(p => ({ ...p, [name]: fe[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fe = validate(values);
    if (Object.keys(fe).length) { setErrors(fe); return; }

    setLoading(true);
    const payload = buildPayload(values);
    const fn = role === 'contestant' ? registerContestant : registerCoach;
    const result = await fn(payload);
    setLoading(false);

    if (result.success) {
      setSuccess('¡Cuenta creada! Revisa tu correo para obtener el código de activación.');
      setTimeout(() => navigate('/verify-account'), 2500);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <AuthCard title="Crear cuenta" subtitle="Únete al grupo de programación competitiva THOTH">

      {/* ── Selector de rol ── */}
      <div className="role-selector" style={{ marginBottom: '4px' }}>
        <p className="role-selector__label">¿Cómo vas a participar?</p>
        <div className="role-selector__grid">
          <RoleCard value="contestant" current={role}
            onClick={r => { setRole(r); setErrors({}); setApiError(''); }}
            title="Competidor" description="Participa en competencias y practica." />
          <RoleCard value="coach" current={role}
            onClick={r => { setRole(r); setErrors({}); setApiError(''); }}
            title="Coach" description="Entrena y guía a tus equipos" />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <FormError   message={apiError} />
          <FormSuccess message={success}  />

          {/* ── Sección 1: Datos personales ── */}
          <Section label="Datos personales">
            {/* Nombre + Apellido en 2 columnas */}
            <div className="form-grid--2">
              <InputField label="Nombre" name="name" placeholder="Carlos"
                value={values.name} onChange={handleChange} onBlur={handleBlur}
                error={errors.name} required icon={<UserIcon />} autoComplete="given-name" />
              <InputField label="Apellido" name="lastName" placeholder="Martínez"
                value={values.lastName} onChange={handleChange} onBlur={handleBlur}
                error={errors.lastName} required autoComplete="family-name" />
            </div>

            {/* Género + Fecha en 2 columnas */}
            <div className="form-grid--2">
              <SelectField label="Género" name="gender"
                value={values.gender} onChange={handleChange} onBlur={handleBlur}
                error={errors.gender} required placeholder="Seleccionar">
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="n/a">Prefiero no decir</option>
              </SelectField>
              <InputField label="Fecha de nacimiento" name="birthDate" type="date"
                value={values.birthDate} onChange={handleChange} onBlur={handleBlur}
                error={errors.birthDate} required icon={<CalendarIcon />} />
            </div>
          </Section>

          {/* ── Sección 2: Cuenta ── */}
          <Section label="Cuenta">
            {/* Username + Email en 2 columnas */}
            <div className="form-grid--2">
              <InputField label="Usuario" name="username" placeholder="carlosm"
                value={values.username} onChange={handleChange} onBlur={handleBlur}
                error={errors.username} required icon={<AtIcon />} autoComplete="username"
                hint="Para iniciar sesión" />
              <InputField label="Correo institucional" name="email" type="email"
                placeholder="cmartinez@unbosque.edu.co"
                value={values.email} onChange={handleChange} onBlur={handleBlur}
                error={errors.email} required icon={<MailIcon />} autoComplete="email"
                hint="Solo @unbosque.edu.co" />
            </div>
          </Section>

          {/* ── Sección 3: Detalles competidor ── */}
          <Section label="Perfil de competidor">
            {/* Talla + Handle en 2 columnas */}
            <div className="form-grid--2">
              <SelectField label="Talla de camiseta" name="size"
                value={values.size} onChange={handleChange} onBlur={handleBlur}
                error={errors.size} required placeholder="Talla">
                {SHIRT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectField>
              <InputField label="Handle Codeforces" name="codeforcesHandle" placeholder="tourist"
                value={values.codeforcesHandle} onChange={handleChange} onBlur={handleBlur}
                error={errors.codeforcesHandle} required icon={<AtIcon />}
                hint="Se verifica automáticamente" />
            </div>
          </Section>

          {/* ── Sección 4: Seguridad ── */}
          <Section label="Seguridad">
            <div className="form-grid--2">
              <PasswordField label="Contraseña" name="password"
                value={values.password} onChange={handleChange} onBlur={handleBlur}
                error={errors.password} required showStrength autoComplete="new-password" />
              <PasswordField label="Confirmar contraseña" name="confirmPassword"
                value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                error={errors.confirmPassword} required autoComplete="new-password" />
            </div>
          </Section>

          <LoadingButton isLoading={loading}
            loadingText={`Registrando ${role === 'contestant' ? 'competidor' : 'coach'}...`}>
            {role === 'contestant' ? 'Registrarme como Competidor' : 'Registrarme como Coach'}
          </LoadingButton>
        </div>
      </form>

      <p className="form-footer" style={{ marginTop: '20px' }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthCard>
  );
};

export default RegisterPage;
