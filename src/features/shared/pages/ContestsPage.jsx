import React, { useEffect, useState } from 'react';
import { fetchContests, fetchContestResults, searchTeams } from '../services/sharedService';
import { updateContest, updateContestResults } from '@/features/admin/services/adminService';
import useAuthStore from '@/store/authStore';

const TYPE_COLORS = {
  virtual:    { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  presencial: { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.25)'  },
  icpc:       { bg: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: 'rgba(201,168,76,0.25)' },
  interna:    { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.25)' },
};

const TYPES = ['virtual', 'presencial', 'icpc', 'interna'];

// ── Edit Contest Modal ───────────────────────────────────────────────────────
const EditContestModal = ({ contest, onClose, onSaved }) => {
  const [name, setName]     = useState(contest.name);
  const [type, setType]     = useState(contest.type);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    const patch = {};
    if (name.trim() !== contest.name) {
      if (!name.trim()) { setError('El nombre no puede estar vacío.'); return; }
      patch.name = name.trim();
    }
    if (type !== contest.type) patch.type = type;
    if (Object.keys(patch).length === 0) { onClose(); return; }

    setSaving(true); setError('');
    const res = await updateContest(contest.id, patch);
    setSaving(false);
    if (res.success) { onSaved(); onClose(); }
    else setError(res.message);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>
          Editar Competencia
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre</label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Tipo</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map((t) => {
              const c = TYPE_COLORS[t];
              const active = type === t;
              return (
                <button key={t} onClick={() => setType(t)} style={{
                  fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 10,
                  textTransform: 'capitalize', cursor: 'pointer',
                  background: active ? c.color : c.bg, color: active ? 'var(--color-bg)' : c.color,
                  border: `1px solid ${c.border}`, transition: 'all 0.15s ease',
                }}>{t}</button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={onClose}>Cancelar</button>
          <button style={btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Team Search Field (inline) ───────────────────────────────────────────────
const TeamSearchField = ({ value, teamName, onChange }) => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchTeams(query);
      setResults(res.success ? res.data : []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ position: 'relative' }}>
      {value ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 8px', borderRadius: 6,
          background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
          fontSize: 12, color: 'var(--color-text-primary)', minWidth: 140,
        }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {teamName || `ID: ${value}`}
          </span>
          <button onClick={() => { onChange(null, ''); setQuery(''); }} style={{
            background: 'none', border: 'none', color: 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
          }}>✕</button>
        </div>
      ) : (
        <input
          style={{ ...inputCompactStyle, width: 150, textAlign: 'left' }}
          placeholder="Buscar equipo..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.trim() && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
      )}
      {open && !value && (results.length > 0 || searching) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 20,
          background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', maxHeight: 160, overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {searching ? (
            <div style={{ padding: 10, fontSize: 11, color: 'var(--color-text-muted)' }}>Buscando...</div>
          ) : results.map((t) => (
            <div key={t.id}
              onMouseDown={() => { onChange(t.id, t.name); setQuery(''); setOpen(false); }}
              style={{
                padding: '8px 10px', fontSize: 12, cursor: 'pointer',
                color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {t.name}
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 6 }}>#{t.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Edit Results Modal ───────────────────────────────────────────────────────
const EditResultsModal = ({ contestId, currentResults, onClose, onSaved }) => {
  const [rows, setRows]     = useState(() =>
    currentResults.map((r) => ({ team_id: r.team_id, team_name: r.team_name, balloons: r.balloons, position: r.position }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const updateRow = (idx, field, value) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const updateTeam = (idx, teamId, teamName) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, team_id: teamId, team_name: teamName } : r));
  };

  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const addRow = () => setRows((prev) => [...prev, { team_id: null, team_name: '', balloons: 0, position: prev.length + 1 }]);

  const handleSave = async () => {
    const cleaned = rows.filter((r) => r.team_id != null);
    if (cleaned.length === 0) { setError('Agrega al menos un resultado.'); return; }
    setSaving(true); setError('');
    const res = await updateContestResults(contestId, cleaned.map((r) => ({
      team_id: Number(r.team_id), balloons: Number(r.balloons), position: Number(r.position),
    })));
    setSaving(false);
    if (res.success) { onSaved(); onClose(); }
    else setError(res.message);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>
          Editar Resultados
        </div>
        {error && <div style={errorStyle}>{error}</div>}

        <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...thEditStyle, textAlign: 'left' }}>Equipo</th>
                <th style={thEditStyle}>Globos</th>
                <th style={thEditStyle}>Pos.</th>
                <th style={thEditStyle}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <TeamSearchField
                      value={r.team_id}
                      teamName={r.team_name}
                      onChange={(id, name) => updateTeam(idx, id, name)}
                    />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input style={{ ...inputCompactStyle, width: 60 }} type="number"
                      value={r.balloons} onChange={(e) => updateRow(idx, 'balloons', e.target.value)} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input style={{ ...inputCompactStyle, width: 50 }} type="number"
                      value={r.position} onChange={(e) => updateRow(idx, 'position', e.target.value)} />
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <button onClick={() => removeRow(idx)} style={{
                      background: 'none', border: 'none', color: 'var(--color-error)',
                      cursor: 'pointer', fontSize: 14,
                    }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addRow} style={{
          ...btnGhost, fontSize: 12, marginBottom: 16, width: '100%',
        }}>+ Agregar equipo</button>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={onClose}>Cancelar</button>
          <button style={btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar resultados'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ContestsPage ─────────────────────────────────────────────────────────────
const ContestsPage = () => {
  const role = useAuthStore((s) => s.getRole());
  const isAdmin = role === 'admin';

  const [contests, setContests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedId, setSelectedId]   = useState(null);
  const [results, setResults]         = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError]     = useState('');
  const [filter, setFilter]           = useState('all');
  const [editContest, setEditContest] = useState(null);
  const [editResults, setEditResults] = useState(null);

  const loadContests = async () => {
    setLoading(true);
    const res = await fetchContests();
    if (res.success) setContests(res.data);
    else setError(res.message);
    setLoading(false);
  };

  useEffect(() => { loadContests(); }, []);

  const handleSelect = async (id) => {
    if (selectedId === id) { setSelectedId(null); setResults(null); return; }
    setSelectedId(id);
    setResults(null);
    setResultsLoading(true);
    setResultsError('');
    const res = await fetchContestResults(id);
    if (res.success) setResults(res.data);
    else setResultsError(res.message);
    setResultsLoading(false);
  };

  const reloadResults = async (id) => {
    const res = await fetchContestResults(id);
    if (res.success) setResults(res.data);
  };

  const types = [...new Set(contests.map((c) => c.type))];
  const filtered = filter === 'all' ? contests : contests.filter((c) => c.type === filter);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--color-text-primary)', marginBottom: 4,
        }}>Competencias</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Resultados individuales de cada competencia
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 16,
          background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)',
        }}>{error}</div>
      )}

      {types.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 10,
              border: '1px solid var(--color-border)', cursor: 'pointer',
              background: filter === 'all' ? 'var(--color-text-primary)' : 'transparent',
              color: filter === 'all' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >Todas ({contests.length})</button>
          {types.map((type) => {
            const c = TYPE_COLORS[type] ?? { bg: 'var(--color-surface-3)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
            const active = filter === type;
            return (
              <button key={type} onClick={() => setFilter(active ? 'all' : type)} style={{
                fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 10,
                textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s ease',
                background: active ? c.color : c.bg, color: active ? 'var(--color-bg)' : c.color,
                border: `1px solid ${c.border}`,
              }}>{type} ({contests.filter((x) => x.type === type).length})</button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map((i) => (
            <div className="skeleton" style={{ height: 52 }} key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 16px',
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏅</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sin competencias disponibles
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((contest) => {
            const isSelected = selectedId === contest.id;
            const c = TYPE_COLORS[contest.type] ?? { bg: 'var(--color-surface-3)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
            return (
              <div key={contest.id}>
                <div
                  onClick={() => handleSelect(contest.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', cursor: 'pointer',
                    background: isSelected ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
                    border: `1px solid ${isSelected ? c.border : 'var(--color-border)'}`,
                    borderRadius: isSelected ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 10, textTransform: 'capitalize',
                      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                    }}>{contest.type}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {contest.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); setEditContest(contest); }} style={{
                        background: 'none', border: '1px solid var(--color-border)',
                        borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                        color: 'var(--color-text-secondary)', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}>Editar</button>
                    )}
                    <span style={{
                      fontSize: 12, color: 'var(--color-text-muted)',
                      transform: isSelected ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}>▼</span>
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    background: 'var(--color-surface-2)',
                    border: `1px solid ${c.border}`, borderTop: 'none',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    overflow: 'hidden',
                  }}>
                    {resultsLoading ? (
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[1,2,3].map((i) => <div className="skeleton" style={{ height: 40 }} key={i} />)}
                      </div>
                    ) : resultsError ? (
                      <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-error)' }}>{resultsError}</div>
                    ) : results && results.results.length > 0 ? (
                      <>
                        {isAdmin && (
                          <div style={{ padding: '10px 16px 0', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditResults({ contestId: contest.id, results: results.results })} style={{
                              background: 'none', border: '1px solid var(--color-border)',
                              borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                              color: 'var(--color-text-secondary)', cursor: 'pointer',
                            }}>Editar resultados</button>
                          </div>
                        )}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr>
                              <th style={thStyle}>#</th>
                              <th style={{ ...thStyle, textAlign: 'left' }}>Equipo</th>
                              <th style={thStyle}>Globos</th>
                              <th style={thStyle}>Puntaje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.results.map((r, idx) => (
                              <tr key={idx} style={{
                                borderBottom: '1px solid var(--color-border)',
                                background: idx % 2 === 0 ? 'transparent' : 'rgba(180,190,255,0.015)',
                              }}>
                                <td style={{
                                  padding: '10px 14px', textAlign: 'center',
                                  fontWeight: r.position <= 3 ? 700 : 400,
                                  color: r.position <= 3 ? 'var(--color-gold)' : 'var(--color-text-muted)',
                                }}>
                                  {r.position <= 3 ? ['🥇','🥈','🥉'][r.position - 1] : `#${r.position}`}
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                  {r.team_name}
                                  {isAdmin && (
                                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 6 }}>
                                      ID: {r.team_id}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: c.color, fontWeight: 600 }}>
                                  {r.balloons}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                  {r.score}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
                        Sin resultados para esta competencia
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editContest && (
        <EditContestModal
          contest={editContest}
          onClose={() => setEditContest(null)}
          onSaved={() => loadContests()}
        />
      )}

      {editResults && (
        <EditResultsModal
          contestId={editResults.contestId}
          currentResults={editResults.results}
          onClose={() => setEditResults(null)}
          onSaved={() => reloadResults(editResults.contestId)}
        />
      )}
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const thStyle = {
  padding: '10px 14px', textAlign: 'center',
  color: 'var(--color-text-muted)', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  fontWeight: 600, background: 'var(--color-surface-3)',
  borderBottom: '1px solid var(--color-border)',
};

const thEditStyle = {
  padding: '8px', textAlign: 'center', fontSize: 11, fontWeight: 600,
  color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)',
};

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};

const modalStyle = {
  background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)', padding: 24, width: '100%', maxWidth: 440,
  maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 16px 64px rgba(0,0,0,0.5)',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--color-text-secondary)', marginBottom: 6,
};

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)',
  outline: 'none', fontFamily: 'var(--font-body)',
};

const inputCompactStyle = {
  padding: '6px 8px', fontSize: 13, textAlign: 'center',
  background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
  borderRadius: 6, color: 'var(--color-text-primary)',
  outline: 'none', fontFamily: 'var(--font-body)',
};

const btnGhost = {
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  background: 'transparent', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)',
  cursor: 'pointer', fontFamily: 'var(--font-body)',
};

const btnPrimary = {
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  background: 'var(--color-gold)', border: '1px solid var(--color-gold)',
  borderRadius: 'var(--radius-md)', color: '#000',
  cursor: 'pointer', fontFamily: 'var(--font-body)',
};

const errorStyle = {
  padding: '8px 12px', marginBottom: 12, fontSize: 12,
  background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-error)',
};

export default ContestsPage;
