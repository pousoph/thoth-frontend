import React, { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import useContestantStore from '@/store/contestantStore';
import useCfHandle from '../hooks/useCfHandle';
import { LevelBadge, SectionHeader } from '../components/SharedComponents';
import InputField    from '@/features/auth/components/InputField';
import SelectField   from '@/features/auth/components/SelectField';
import LoadingButton from '@/features/auth/components/LoadingButton';
import { FormError } from '@/features/auth/components/FormAlerts';

// ── Codeforces API ────────────────────────────────────────────────────────────
const fetchCfProfile = async (handle) => {
  const clean = String(handle ?? '').trim();
  if (!clean) return { success: false };

  try {
    const url = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(clean)}&checkHistoricHandles=false`;
    const res = await fetch(url);
    if (!res.ok) return { success: false };

    const data = await res.json();
    if (data.status !== 'OK') return { success: false };

    const u = Array.isArray(data.result) ? data.result[0] : null;
    if (!u || !u.handle) return { success: false };

    return {
      success:   true,
      handle:    u.handle,
      rating:    u.rating    ?? 0,
      maxRating: u.maxRating ?? 0,
      rank:      u.rank      ?? 'unrated',
      avatar:    u.titlePhoto ?? null,
    };
  } catch {
    return { success: false };
  }
};

const RANK_COLOR = {
  newbie:                      '#808080',
  pupil:                       '#008000',
  specialist:                  '#03a89e',
  expert:                      '#0000ff',
  'candidate master':          '#aa00aa',
  master:                      '#ff8c00',
  'international master':      '#ff8c00',
  grandmaster:                 '#ff0000',
  'international grandmaster': '#ff0000',
  'legendary grandmaster':     '#ff0000',
};

// ── CodeforcesCard ────────────────────────────────────────────────────────────
const CodeforcesCard = ({ handle }) => {
  const [cf,      setCf]      = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchCfProfile(handle).then((res) => {
      if (res.success) setCf(res);
      else setError(true);
      setLoading(false);
    });
  }, [handle]);

  const color = cf
    ? (RANK_COLOR[cf.rank?.toLowerCase()] ?? 'var(--level-primary)')
    : 'var(--level-primary)';

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <rect width="24" height="24" rx="4" fill="#1f1f2e"/>
          <text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="13"
            fontWeight="bold" fontFamily="monospace">CF</text>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Codeforces
        </span>
        {cf && (
          <a
            href={`https://codeforces.com/profile/${cf.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--level-text)' }}
          >
            Ver perfil ↗
          </a>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 20 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="cl-skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="cl-skeleton" style={{ height: 14, width: '50%', marginBottom: 6 }} />
                <div className="cl-skeleton" style={{ height: 11, width: '30%' }} />
              </div>
            </div>
            <div className="cl-skeleton" style={{ height: 56 }} />
          </div>
        ) : error ? (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '8px 0' }}>
            No se pudo cargar el perfil de Codeforces.
          </div>
        ) : cf ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {cf.avatar ? (
                <img
                  src={cf.avatar} alt={cf.handle}
                  style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--color-border)', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--color-surface-3)', border: '2px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color,
                }}>
                  {cf.handle[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color }}>@{cf.handle}</div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color,
                  textTransform: 'capitalize', letterSpacing: '0.05em',
                }}>
                  {cf.rank}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 1, background: 'var(--color-border)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
            }}>
              {[
                { label: 'Rating actual', value: cf.rating    || 'Unrated' },
                { label: 'Rating máximo', value: cf.maxRating || 'Unrated' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--color-surface-2)', padding: '14px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                    color: value === 'Unrated' ? 'var(--color-text-muted)' : color,
                    lineHeight: 1,
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontSize: 10, color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

// ── ProfilePage ───────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const user      = useAuthStore((s) => s.user);
  const dashboard = useContestantStore((s) => s.dashboard);
  const { handle: cfHandle } = useCfHandle();

  const username  = user?.username ?? '—';
  const level     = dashboard?.current_level ?? user?.level ?? '—';
  const teamName  = dashboard?.team_name ?? null;
  const taskStats = dashboard?.task_stats ?? { total: 0, completed: 0, pending: 0 };
  const initials  = username.slice(0, 2).toUpperCase();

  const [form, setForm] = useState({
    name: '', lastName: '', gender: '', birthDate: '', size: '', phone: '',
  });
  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setApiError('');
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <SectionHeader title="Mi Perfil" subtitle="Información personal y vinculación con Codeforces" />

      <div className="cl-profile-grid">
        {/* ── Izquierda ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="cl-profile-card">
            <div className="cl-profile-avatar">
              <div className="cl-profile-avatar__ring" />
              <div className="cl-profile-avatar__inner">{initials}</div>
            </div>
            <div className="cl-profile-name">{username}</div>
            <div className="cl-profile-username">@{username}</div>
            <LevelBadge level={level} size="lg" />
            {teamName && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Equipo: {teamName}
              </div>
            )}
            <div className="cl-profile-stats">
              <div className="cl-profile-stat">
                <div className="cl-profile-stat__value">{taskStats.completed}</div>
                <div className="cl-profile-stat__label">Completadas</div>
              </div>
              <div className="cl-profile-stat">
                <div className="cl-profile-stat__value">{taskStats.pending}</div>
                <div className="cl-profile-stat__label">Pendientes</div>
              </div>
            </div>
            <div style={{ width: '100%', marginTop: 8 }}>
              <div style={{
                fontSize: 11, color: 'var(--color-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
              }}>Datos del sistema</div>
              {[
                { label: 'Usuario', value: username },
                { label: 'Nivel',   value: level,   highlight: true },
                { label: 'Rol',     value: 'Competidor' },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13,
                }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <span style={{
                    color: highlight ? 'var(--level-light)' : 'var(--color-text-secondary)',
                    fontWeight: highlight ? 600 : 400, textTransform: 'capitalize',
                  }}>{value ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <CodeforcesCard handle={cfHandle} />
        </div>

        {/* ── Derecha — formulario ── */}
        <form onSubmit={handleSave}>
          <div className="cl-form-card">
            {apiError && <div style={{ marginBottom: 16 }}><FormError message={apiError} /></div>}
            {saved && (
              <div style={{
                marginBottom: 16, padding: '10px 14px',
                background: 'var(--color-success-dim)',
                border: '1px solid rgba(77,201,138,0.2)',
                borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-success)',
              }}>✓ Cambios guardados</div>
            )}
            <div className="cl-form-section">
              <div className="cl-form-section__title">Información Personal</div>
              <div className="cl-form-grid">
                <InputField label="Nombre"   name="name"     placeholder="Carlos"   {...field('name')} />
                <InputField label="Apellido" name="lastName" placeholder="Martínez" {...field('lastName')} />
              </div>
            </div>
            <div className="cl-form-section">
              <div className="cl-form-section__title">Datos Adicionales</div>
              <div className="cl-form-grid">
                <SelectField label="Género" name="gender" value={form.gender} onChange={field('gender').onChange}>
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="n/a">Prefiero no decir</option>
                </SelectField>
                <InputField label="Fecha de Nacimiento" name="birthDate" type="date" {...field('birthDate')} />
                <SelectField label="Talla de Camiseta" name="size" value={form.size} onChange={field('size').onChange}>
                  <option value="">Seleccionar</option>
                  {['XS','S','M','L','XL'].map((s) => <option key={s} value={s}>{s}</option>)}
                </SelectField>
                <InputField label="Celular" name="phone" placeholder="+57 310 0000000" {...field('phone')} />
              </div>
            </div>
            <LoadingButton isLoading={saving} loadingText="Guardando...">
              Guardar cambios
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
