import React, { useEffect, useState } from 'react';
import { fetchLevelChanges } from '../services/sharedService';

const LEVEL_COLORS = {
  rookie: '#9ca3af', aprendiz: '#f97316',
  basica: '#3b82f6', 'básica': '#3b82f6',
  intermediate: '#a855f7', intermedia: '#a855f7',
  advanced: '#ef4444', avanzada: '#ef4444',
  elite: '#c9a84c',
};

const LevelChangesPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchLevelChanges();
      if (res.success) {
        setEntries(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, []);

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
            <div key={entry.id ?? i} style={{
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
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                    Competidor #{entry.contestant_id}
                  </span>
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
                {entry.reasons && (
                  <div style={{
                    fontSize: 13, color: 'var(--color-text-secondary)',
                    marginTop: 4, lineHeight: 1.6,
                  }}>
                    {entry.reasons}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  por Coach #{entry.coach_id ?? '—'}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                {entry.created_at
                  ? new Date(entry.created_at).toLocaleDateString('es-CO', {
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

export default LevelChangesPage;
