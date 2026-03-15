import React, { useEffect, useState } from 'react';
import {
  fetchPendingCoaches,
  activateCoach,
  rejectCoach,
} from '../services/adminService';
import { EmptyState } from '@/features/contestant/components/SharedComponents';
import '@/styles/components.css'; // For button styles

// ── AdminCoachQueuePage ────────────────────────────────────────────────────────
const AdminCoachQueuePage = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // coachId

  const loadCoaches = async () => {
    setLoading(true);
    const res = await fetchPendingCoaches();
    if (res.success) {
      setCoaches(res.data);
      setError('');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const handleAction = async (coachId, action) => {
    setActionLoading(coachId);
    const apiCall = action === 'approve' ? activateCoach : rejectCoach;
    const res = await apiCall(coachId);
    
    if (res.success) {
      // Remove the coach from the list optimistically or reload
      setCoaches((prev) => prev.filter((c) => c.id !== coachId));
    } else {
      alert(res.message); // simple error handling
    }
    setActionLoading(null);
  };

  return (
    <div>
      <div className="cl-page-header">
        <h1 className="cl-page-title">Solicitudes de Coach</h1>
        <p className="cl-page-subtitle">Aprueba o rechaza el registro de nuevos entrenadores</p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 20,
          background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)',
        }}>
          {error}
        </div>
      )}

      <div className="cl-activity-card">
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Cargando solicitudes...
          </div>
        ) : coaches.length === 0 ? (
          <EmptyState icon="📬" title="Sin solicitudes pendientes" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Nombre</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Email</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>CodeForces Handle</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((coach) => (
                  <tr key={coach.id} style={{ borderBottom: '1px solid var(--color-surface-2)' }}>
                    <td style={{ padding: '16px', color: 'var(--color-text-primary)' }}>
                      {coach.name} {coach.last_name}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                      {coach.email}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                      <a href={`https://codeforces.com/profile/${coach.codeforces_handle}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                        @{coach.codeforces_handle}
                      </a>
                    </td>
                    <td style={{ padding: '16px', display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 16px', fontSize: 13, minHeight: 32 }}
                        onClick={() => handleAction(coach.id, 'approve')}
                        disabled={actionLoading === coach.id}
                      >
                        {actionLoading === coach.id ? '...' : 'Aprobar'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 16px', fontSize: 13, minHeight: 32 }}
                        onClick={() => handleAction(coach.id, 'reject')}
                        disabled={actionLoading === coach.id}
                      >
                        {actionLoading === coach.id ? '...' : 'Rechazar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoachQueuePage;
