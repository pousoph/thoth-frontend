import React, { useEffect, useState } from 'react';
import { fetchContests, fetchContestResults } from '../services/sharedService';

const TYPE_COLORS = {
  virtual:    { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  presencial: { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.25)'  },
  icpc:       { bg: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: 'rgba(201,168,76,0.25)' },
  interna:    { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.25)' },
};

const ContestsPage = () => {
  const [contests, setContests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedId, setSelectedId]   = useState(null);
  const [results, setResults]         = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError]     = useState('');
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchContests();
      if (res.success) setContests(res.data);
      else setError(res.message);
      setLoading(false);
    })();
  }, []);

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

      {/* Filtros por tipo */}
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
              <button
                key={type}
                onClick={() => setFilter(active ? 'all' : type)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 10,
                  textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s ease',
                  background: active ? c.color : c.bg,
                  color: active ? 'var(--color-bg)' : c.color,
                  border: `1px solid ${c.border}`,
                }}
              >{type} ({contests.filter((x) => x.type === type).length})</button>
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
                {/* Contest card */}
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
                      background: c.bg, color: c.color,
                      border: `1px solid ${c.border}`,
                    }}>{contest.type}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {contest.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12, color: 'var(--color-text-muted)',
                    transform: isSelected ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}>▼</span>
                </div>

                {/* Results panel */}
                {isSelected && (
                  <div style={{
                    background: 'var(--color-surface-2)',
                    border: `1px solid ${c.border}`,
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    overflow: 'hidden',
                  }}>
                    {resultsLoading ? (
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[1,2,3].map((i) => (
                          <div className="skeleton" style={{ height: 40 }} key={i} />
                        ))}
                      </div>
                    ) : resultsError ? (
                      <div style={{
                        padding: '12px 16px', fontSize: 13, color: 'var(--color-error)',
                      }}>{resultsError}</div>
                    ) : results && results.results.length > 0 ? (
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
                              <td style={{
                                padding: '10px 14px', color: 'var(--color-text-primary)',
                                fontWeight: 500,
                              }}>{r.team_name}</td>
                              <td style={{
                                padding: '10px 14px', textAlign: 'center',
                                color: c.color, fontWeight: 600,
                              }}>{r.balloons}</td>
                              <td style={{
                                padding: '10px 14px', textAlign: 'center',
                                color: 'var(--color-text-secondary)', fontWeight: 600,
                              }}>{r.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{
                        padding: '24px 16px', textAlign: 'center',
                        fontSize: 13, color: 'var(--color-text-muted)',
                      }}>Sin resultados para esta competencia</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: '10px 14px', textAlign: 'center',
  color: 'var(--color-text-muted)', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  fontWeight: 600, background: 'var(--color-surface-3)',
  borderBottom: '1px solid var(--color-border)',
};

export default ContestsPage;
