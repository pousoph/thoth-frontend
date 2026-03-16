import React, { useEffect, useState } from 'react';
import { fetchLeague } from '../services/sharedService';

const TYPE_COLORS = {
  virtual:    { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  presencial: { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.25)'  },
};

const LeaguePage = () => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchLeague();
      if (res.success) {
        setColumns(res.data.columns);
        setRows(res.data.rows);
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, []);

  // Separar columnas de competencia de las fijas
  const contestCols = columns.filter((c) => c.contest_id != null);

  // Obtener el valor de una celda según la columna
  const getCellValue = (row, col) => {
    if (col.key === 'rank') return row.rank;
    if (col.key === 'team-name') return row.team_name;
    if (col.key === 'participations') return row.participations ?? 0;
    if (col.key === 'additional-points') return row.additional_points ?? 0;
    if (col.key === 'total') return row.total ?? 0;
    // Columna de competencia dinámica
    if (col.contest_id != null) return row.contest_scores?.[String(col.contest_id)] ?? '—';
    return '—';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--color-text-primary)', marginBottom: 4,
        }}>Liga</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Tabla de posiciones completa del Grupo de Programacion Competitiva
        </p>
      </div>

      {/* Leyenda de tipos de competencia */}
      {contestCols.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {[...new Set(contestCols.map((c) => c.type))].map((type) => {
            const colors = TYPE_COLORS[type] ?? { bg: 'var(--color-surface-3)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
            return (
              <span key={type} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px',
                borderRadius: 10, textTransform: 'capitalize',
                background: colors.bg, color: colors.color,
                border: `1px solid ${colors.border}`,
              }}>{type}</span>
            );
          })}
        </div>
      )}

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
      ) : rows.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 16px',
          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sin datos de liga disponibles
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
                  {columns.map((col) => {
                    const isContest = col.contest_id != null;
                    const colors = TYPE_COLORS[col.type];
                    return (
                      <th key={col.key} style={{
                        padding: '12px 14px', textAlign: col.key === 'rank' ? 'center' : 'left',
                        color: isContest && colors ? colors.color : 'var(--color-text-muted)',
                        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                        borderBottom: '1px solid var(--color-border)',
                        fontWeight: 600, background: 'var(--color-surface-3)',
                        whiteSpace: 'nowrap',
                      }}>
                        {col.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.team_id ?? i} style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(180,190,255,0.015)',
                  }}>
                    {columns.map((col) => {
                      const value = getCellValue(row, col);

                      // Columna de posición
                      if (col.key === 'rank') {
                        return (
                          <td key={col.key} style={{
                            padding: '12px 14px', textAlign: 'center',
                            fontWeight: row.rank <= 3 ? 700 : 400,
                            color: row.rank <= 3 ? 'var(--color-gold)' : 'var(--color-text-muted)',
                          }}>
                            {row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank - 1] : `#${row.rank}`}
                          </td>
                        );
                      }

                      // Columna de equipo
                      if (col.key === 'team-name') {
                        return (
                          <td key={col.key} style={{
                            padding: '12px 14px', color: 'var(--color-text-primary)',
                            fontWeight: 500, whiteSpace: 'nowrap',
                          }}>
                            {row.team_name}
                            {row.is_icpc_qualified && (
                              <span style={{
                                marginLeft: 8, fontSize: 10,
                                background: 'rgba(201,168,76,0.15)', color: '#c9a84c',
                                border: '1px solid rgba(201,168,76,0.2)',
                                borderRadius: 10, padding: '2px 8px', fontWeight: 600,
                              }}>ICPC</span>
                            )}
                          </td>
                        );
                      }

                      // Columna total
                      if (col.key === 'total') {
                        return (
                          <td key={col.key} style={{
                            padding: '12px 14px', color: 'var(--color-gold)',
                            fontWeight: 700,
                          }}>{value}</td>
                        );
                      }

                      // Columna de competencia
                      if (col.contest_id != null) {
                        return (
                          <td key={col.key} style={{
                            padding: '12px 14px', textAlign: 'left',
                            color: value === '—' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                            fontWeight: value === '—' ? 400 : 600,
                          }}>{value}</td>
                        );
                      }

                      // Columnas fijas genéricas (participations, additional-points)
                      return (
                        <td key={col.key} style={{
                          padding: '12px 14px', color: 'var(--color-text-secondary)',
                        }}>{value}</td>
                      );
                    })}
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

export default LeaguePage;
