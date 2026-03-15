import React, { useEffect, useState } from 'react';
import useContestantStore from '@/store/contestantStore';
import { fetchMyTeam } from '../services/contestantService';
import { SkeletonCard, EmptyState, SectionHeader, LevelBadge } from '../components/SharedComponents';

// ── TeamPage ──────────────────────────────────────────────────────────────────
/**
 * NOTA sobre el backend (HU-12):
 * GET /teams/me → solo retorna el equipo ACTUAL del competidor.
 * El backend NO rastrea historial de equipos anteriores.
 * Si el competidor no tiene equipo → 404 → mostramos empty state.
 */
const TeamsPage = () => {
  const { team, teamLoaded, setTeam } = useContestantStore();
  const [loading, setLoading] = useState(!teamLoaded);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (teamLoaded) return;
    (async () => {
      setLoading(true);
      const res = await fetchMyTeam();
      if (res.success) {
        setTeam(res.data); // null si 404 (sin equipo)
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="cl-page-header">
          <div className="cl-skeleton" style={{ height: 28, width: 200, borderRadius: 8 }} />
        </div>
        <SkeletonCard height={320} />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Mi Equipo"
        subtitle="Información de tu equipo actual en el GPC"
      />

      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 20,
          background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)',
        }}>
          {error}
        </div>
      )}

      {!team ? (
        <div className="cl-activity-card">
          <EmptyState
            icon="👥"
            title="Sin equipo asignado"
            description="Aún no perteneces a un equipo. El coach te agregará próximamente."
          />
        </div>
      ) : (
        <>
          {/* Team card principal */}
          <div className="cl-team-card cl-team-card--current" style={{ marginBottom: 16 }}>
            <div className="cl-team-card__header">
              <div>
                <div className="cl-team-name">{team.team_name}</div>
                <div className="cl-team-period">
                  {team.is_active ? 'Equipo activo' : 'Equipo inactivo'}
                </div>
              </div>
              <span className={`cl-team-badge cl-team-badge--${team.is_active ? 'current' : 'past'}`}>
                {team.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Coach */}
            {team.coach && (
              <div className="cl-team-info" style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
                }}>
                  Coach
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'var(--color-surface-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--level-dim)', border: '1px solid var(--level-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                    color: 'var(--level-light)',
                  }}>
                    {team.coach.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {team.coach.name} {team.coach.last_name}
                    </div>
                    {team.coach.codeforces_handle && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        CF: @{team.coach.codeforces_handle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Teammates */}
            {team.teammates?.length > 0 && (
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
                }}>
                  Compañeros de equipo
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {team.teammates.map((mate, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--color-surface-3)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--color-surface-4)',
                          border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)',
                        }}>
                          {mate.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {mate.name} {mate.last_name}
                          </div>
                          {mate.codeforces_handle && (
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                              CF: @{mate.codeforces_handle}
                            </div>
                          )}
                        </div>
                      </div>
                      {mate.level && (
                        <LevelBadge level={mate.level} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nota sobre historial */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5,
          }}>
            ℹ El historial de equipos anteriores no está disponible en esta versión del sistema.
          </div>
        </>
      )}
    </div>
  );
};

export default TeamsPage;
