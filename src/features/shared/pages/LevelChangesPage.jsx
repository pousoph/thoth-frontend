import React, { useEffect, useState } from 'react';
import { fetchLevelChanges } from '../services/sharedService';

const LEVEL_COLORS = {
  aprendiz: '#f97316', basica: '#3b82f6', 'básica': '#3b82f6',
  intermedia: '#a855f7', avanzada: '#ef4444', elite: '#c9a84c',
};

const LevelChangesPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const pageSize = 20;

  const load = async (p) => {
    setLoading(true);
    const res = await fetchLevelChanges(p, pageSize);
    if (res.success) {
      setEntries(res.data);
      setPage(res.page);
      setTotal(res.total);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--color-text-primary)', marginBottom: 4,
        }}>Ascensos</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Historial de cambios de nivel y sus justificaciones
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 16,
          background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)',
        }}>{error}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4,5].map((i) => (
            <div key={i} style={{
              height: 64, borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-3)', animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 16px',
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sin cambios de nivel registrados
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '8px 24px',
        }}>
          {entries.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '16px 0',
              borderBottom: i < entries.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                background: LEVEL_COLORS[entry.new_level?.toLowerCase()] ?? 'var(--color-gold)',
                boxShadow: `0 0 8px ${LEVEL_COLORS[entry.new_level?.toLowerCase()] ?? 'var(--color-gold)'}40`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {entry.contestant_name}
                  <span style={{ color: 'var(--color-text-muted)', margin: '0 8px', fontWeight: 400 }}>·</span>
                  <span style={{
                    color: LEVEL_COLORS[entry.old_level?.toLowerCase()] ?? 'var(--color-text-muted)',
                    fontSize: 12, textTransform: 'capitalize',
                  }}>
                    {entry.old_level}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', margin: '0 6px' }}>→</span>
                  <span style={{
                    color: LEVEL_COLORS[entry.new_level?.toLowerCase()] ?? 'var(--color-gold)',
                    fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                  }}>
                    {entry.new_level}
                  </span>
                </div>
                {entry.justification && (
                  <div style={{
                    fontSize: 13, color: 'var(--color-text-secondary)',
                    marginTop: 4, lineHeight: 1.6,
                  }}>
                    {entry.justification}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  por {entry.changed_by || '—'}
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

          {/* Paginacion */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
              padding: '16px 0', borderTop: '1px solid var(--color-border)',
            }}>
              <button
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                style={{
                  padding: '6px 16px', fontSize: 12, fontWeight: 600,
                  background: page <= 1 ? 'var(--color-surface-3)' : 'var(--color-surface-4)',
                  color: page <= 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >Anterior</button>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => load(page + 1)}
                style={{
                  padding: '6px 16px', fontSize: 12, fontWeight: 600,
                  background: page >= totalPages ? 'var(--color-surface-3)' : 'var(--color-surface-4)',
                  color: page >= totalPages ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >Siguiente</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelChangesPage;
