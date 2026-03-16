import React, { useEffect, useState } from 'react';
import { fetchCodeforcesRanking } from '../services/sharedService';

const RANK_COLORS = {
  newbie:           '#808080',
  pupil:            '#008000',
  specialist:       '#03a89e',
  expert:           '#0000ff',
  'candidate master': '#aa00aa',
  master:           '#ff8c00',
  'international master': '#ff8c00',
  grandmaster:      '#ff0000',
  'international grandmaster': '#ff0000',
  'legendary grandmaster': '#ff0000',
};

const getRankColor = (rank) => RANK_COLORS[rank?.toLowerCase()] ?? 'var(--color-text-secondary)';

const CodeforcesRankingPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchCodeforcesRanking();
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
        }}>Ranking Codeforces</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Ranking de Codeforces del Grupo de Programación Competitiva
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
        <div style={{
          height: 300, borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-3)', animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 16px',
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sin datos de ranking disponibles
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['#', 'Nombre', 'Handle', 'Rol', 'Rating', 'Max Rating', 'Rank'].map((h) => (
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
                {entries.map((e, i) => (
                  <tr key={e.codeforces_handle || i} style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(180,190,255,0.015)',
                  }}>
                    <td style={{
                      padding: '12px 14px', textAlign: 'center',
                      fontWeight: i < 3 ? 700 : 400,
                      color: i < 3 ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    }}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--color-text-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {e.name}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <a
                        href={`https://codeforces.com/profile/${encodeURIComponent(e.codeforces_handle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: getRankColor(e.rank), fontWeight: 600, textDecoration: 'none' }}
                      >
                        {e.codeforces_handle}
                      </a>
                    </td>
                    <td style={{
                      padding: '12px 14px', color: 'var(--color-text-secondary)',
                      textTransform: 'capitalize',
                    }}>{e.role}</td>
                    <td style={{ padding: '12px 14px', color: getRankColor(e.rank), fontWeight: 600 }}>
                      {e.rating}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>
                      {e.max_rating}
                    </td>
                    <td style={{
                      padding: '12px 14px', color: getRankColor(e.rank),
                      fontWeight: 600, textTransform: 'capitalize',
                    }}>{e.rank}</td>
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

export default CodeforcesRankingPage;
