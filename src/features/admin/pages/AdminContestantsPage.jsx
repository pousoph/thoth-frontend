import React, { useEffect, useState } from 'react';
import { fetchContestants } from '../services/adminService';
import { LevelBadge, EmptyState } from '@/features/contestant/components/SharedComponents';

const AdminContestantsPage = () => {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [query, setQuery]             = useState('');
  const [error, setError]             = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchContestants();
      if (res.success) setContestants(res.data);
      else setError(res.message);
      setLoading(false);
    })();
  }, []);

  // Búsqueda debounced
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(async () => {
      const res = await fetchContestants({ q: query });
      if (res.success) setContestants(res.data);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--color-text-primary)', marginBottom: 4,
        }}>Competidores</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {contestants.length} competidor{contestants.length !== 1 ? 'es' : ''} registrado{contestants.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 16,
          background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)',
        }}>{error}</div>
      )}

      {/* Buscador */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <input
          placeholder="Buscar por nombre o usuario..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', fontSize: 13,
            background: 'var(--color-surface-3)', color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            outline: 'none', fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {loading ? (
        <div style={{
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 16, overflow: 'hidden',
        }}>
          <div className="skeleton" style={{ height: 36, marginBottom: 10 }} />
          {[1,2,3,4,5].map((i) => (
            <div className="skeleton" style={{ height: 48, marginBottom: 8 }} key={i} />
          ))}
        </div>
      ) : contestants.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Sin competidores"
          description={query ? `Sin resultados para "${query}"` : 'No hay competidores registrados.'}
        />
      ) : (
        <div style={{
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['#', 'Competidor', 'Usuario', 'Codeforces', 'Nivel'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: h === '#' ? 'center' : 'left',
                      color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase',
                      letterSpacing: '0.06em', borderBottom: '1px solid var(--color-border)',
                      fontWeight: 600, background: 'var(--color-surface-3)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contestants.map((c, i) => (
                  <tr key={c.id ?? i} style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(180,190,255,0.015)',
                  }}>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--color-text-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {c.name} {c.last_name}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>
                      @{c.username}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {c.codeforces_handle ? (
                        <a
                          href={`https://codeforces.com/profile/${encodeURIComponent(c.codeforces_handle)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--level-primary)', fontWeight: 600, textDecoration: 'none' }}
                        >
                          @{c.codeforces_handle}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <LevelBadge level={c.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContestantsPage;
