import React, { useEffect, useState } from 'react';
import useCoachStore from '@/store/coachStore';
import {
  fetchContestants, searchAvailableContestants,
  changeContestantLevel, fetchLevelChanges, fetchCoachDashboard,
} from '../services/coachService';
import {
  SectionHeader, EmptyState, LevelBadge, Modal, Field, Alert,
  FilterTabs, SkTable, Sk, LEVELS,
} from '../components/SharedComponents';

// ── ChangeLevelModal ───────────────────────────────────────────────────────────
const ChangeLevelModal = ({ contestant, onClose, onChanged }) => {
  const [level,         setLevel]         = useState('');
  const [justification, setJustification] = useState('');
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');

  const handleSave = async () => {
    if (!level)               { setError('Selecciona un nivel.'); return; }
    if (!justification.trim()) { setError('La justificación es obligatoria.'); return; }
    setSaving(true); setError('');
    const res = await changeContestantLevel(contestant.id, level, justification.trim());
    setSaving(false);
    if (res.success) { onChanged(); onClose(); }
    else setError(res.message);
  };

  return (
    <Modal
      title="Cambiar Nivel"
      subtitle={`${contestant.name} ${contestant.last_name} · @${contestant.username}`}
      onClose={onClose}
      footer={
        <>
          <button className="co-btn co-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="co-btn co-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Confirmar cambio'}
          </button>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
        }}>
          Nivel actual
        </div>
        <LevelBadge level={contestant.level} />
      </div>

      <Field label="Nuevo nivel">
        <div className="co-level-grid">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              className={`co-level-option${level === l.key ? ' co-level-option--selected' : ''}`}
              onClick={() => setLevel(l.key)}
              type="button"
            >
              <span className="co-level-option__dot" style={{ background: l.color }} />
              <span className="co-level-option__label">{l.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Justificación" hint="Explica el motivo del cambio. Quedará en el historial.">
        <textarea
          className="co-field__textarea"
          placeholder="Ej: Resolvió 50 problemas en Codeforces y ganó 2 competencias…"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          rows={3}
        />
      </Field>
    </Modal>
  );
};

// ── LevelHistoryPanel ──────────────────────────────────────────────────────────
const LEVEL_COLORS = {
  aprendiz: '#f97316', basica: '#3b82f6', básica: '#3b82f6',
  intermedia: '#a855f7', avanzada: '#ef4444', elite: '#c9a84c',
};

const LevelHistoryPanel = ({ refreshKey }) => {
  const { levelChanges, levelChangesLoaded, setLevelChanges } = useCoachStore();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    fetchLevelChanges(1, 10).then((res) => {
      if (res.success) setLevelChanges(res.data, res.page, res.total);
      else setError(res.message);
      setLoading(false);
    });
  }, [refreshKey]); // re-fetch every time a level changes

  return (
    <div className="co-activity-card" style={{ marginTop: 24 }}>
      <div className="co-chart-header">
        <div>
          <div className="co-chart-title">Historial de Cambios de Nivel</div>
          <div className="co-chart-subtitle">Últimos cambios realizados en tu grupo</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {[1,2,3].map((i) => <Sk key={i} h={52} />)}
        </div>
      ) : error ? (
        <div className="co-alert co-alert--error" style={{ marginTop: 12 }}>{error}</div>
      ) : levelChanges.length === 0 ? (
        <EmptyState icon="📊" title="Sin cambios de nivel registrados" />
      ) : (
        <div style={{ marginTop: 12 }}>
          {levelChanges.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 0', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                background: 'var(--co-primary)', boxShadow: '0 0 6px var(--co-glow)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {entry.contestant_name}
                  <span style={{ color: 'var(--color-text-muted)', margin: '0 6px' }}>·</span>
                  <span style={{ color: LEVEL_COLORS[entry.old_level?.toLowerCase()] ?? 'var(--color-text-muted)', fontSize: 12 }}>
                    {entry.old_level}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', margin: '0 5px' }}>→</span>
                  <span style={{ color: LEVEL_COLORS[entry.new_level?.toLowerCase()] ?? 'var(--co-light)', fontSize: 12, fontWeight: 600 }}>
                    {entry.new_level}
                  </span>
                </div>
                {entry.justification && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
                    {entry.justification}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  por {entry.changed_by ?? '—'}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                {entry.changed_at
                  ? new Date(entry.changed_at).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                  : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── CompetitorsPage ────────────────────────────────────────────────────────────
const CompetitorsPage = () => {
  const { setDashboardData } = useCoachStore();

  const [contestants, setContestants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searching,   setSearching]   = useState(false);
  const [query,       setQuery]       = useState('');
  const [activeTab,   setActiveTab]   = useState('all');
  const [levelModal,  setLevelModal]  = useState(null);
  const [historyKey,  setHistoryKey]  = useState(0); // incrementar para refrescar historial
  const [error,       setError]       = useState('');

  // Carga inicial — usa GET /contestants (acepta query vacía)
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchContestants();
      if (res.success) {
        setContestants(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, []);

  // Búsqueda debounced — usa GET /contestants?q=... (también acepta vacío)
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await fetchContestants({ q: query });
      if (res.success) setContestants(res.data);
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Niveles presentes para los tabs de filtro
  const presentLevels = [...new Set(contestants.map((c) => c.level?.toLowerCase()).filter(Boolean))];

  const filtered = activeTab === 'all'
    ? contestants
    : contestants.filter((c) => c.level?.toLowerCase() === activeTab);

  const tabs = [
    { key: 'all', label: 'Todos', count: contestants.length },
    ...LEVELS
      .filter((l) => presentLevels.includes(l.key))
      .map((l) => ({
        key:   l.key,
        label: l.label,
        count: contestants.filter((c) => c.level?.toLowerCase() === l.key).length,
      })),
  ];

  const handleLevelChanged = () => {
    // Refrescar lista de competidores
    fetchContestants({ q: query }).then((res) => {
      if (res.success) setContestants(res.data);
    });
    // Refrescar historial incrementando la key
    setHistoryKey((k) => k + 1);
  };

  return (
    <div>
      <SectionHeader
        title="Competidores"
        subtitle={`${contestants.length} competidor${contestants.length !== 1 ? 'es' : ''} en tu grupo`}
      />

      {error && <div className="co-alert co-alert--error">{error}</div>}

      {/* Buscador */}
      <div style={{ marginBottom: 20 }}>
        <div className="co-search-input-wrap" style={{ maxWidth: 400 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="co-search-input"
            placeholder="Buscar por nombre o usuario…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs por nivel */}
      <FilterTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tabla */}
      {loading || searching ? (
        <SkTable rows={5} />
      ) : filtered.length === 0 ? (
        <div className="co-table-card">
          <EmptyState
            icon="🔍"
            title="Sin competidores"
            description={query ? `Sin resultados para "${query}"` : 'No hay competidores registrados en tu grupo.'}
          />
        </div>
      ) : (
        <div className="co-table-card">
          <table className="co-table">
            <thead>
              <tr>
                <th>Competidor</th>
                <th>Codeforces</th>
                <th>Nivel</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--color-surface-3)',
                        border: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'var(--co-light)', flexShrink: 0,
                      }}>
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="co-table__name">{c.name} {c.last_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>@{c.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.codeforces_handle ? (
                      <a
                        href={`https://codeforces.com/profile/${c.codeforces_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--co-text)', fontSize: 13 }}
                      >
                        @{c.codeforces_handle}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td><LevelBadge level={c.level} /></td>
                  <td>
                    <div className="co-table__actions">
                      <button
                        className="co-btn co-btn--ghost co-btn--sm"
                        onClick={() => setLevelModal(c)}
                      >
                        Cambiar nivel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historial de cambios */}
      <LevelHistoryPanel refreshKey={historyKey} />

      {/* Modal de cambio de nivel */}
      {levelModal && (
        <ChangeLevelModal
          contestant={levelModal}
          onClose={() => setLevelModal(null)}
          onChanged={handleLevelChanged}
        />
      )}
    </div>
  );
};

export default CompetitorsPage;
