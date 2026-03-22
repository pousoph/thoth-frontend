import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useCoachStore from '@/store/coachStore';
import { fetchCoachDashboard, fetchMyTeams, searchAvailableContestants, createTeam, updateTeam } from '../services/coachService';
import {
  SectionHeader, EmptyState, SkTable, StatusBadge, LevelBadge,
  Modal, Field, Alert, ProgressBar,
} from '../components/SharedComponents';

// ── CreateTeamModal ────────────────────────────────────────────────────────────
const CreateTeamModal = ({ onClose, onCreated }) => {
  const [name,      setName]      = useState('');
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [selected,  setSelected]  = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  // Búsqueda debounced — solo cuando hay texto (evita 400)
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchAvailableContestants(query);
      setResults(res.success ? res.data : []);
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const toggleSelect = (contestant) => {
    setSelected((prev) => {
      const exists = prev.find((c) => c.id === contestant.id);
      if (exists) return prev.filter((c) => c.id !== contestant.id);
      if (prev.length >= 3) { setError('Máximo 3 competidores por equipo.'); return prev; }
      setError('');
      return [...prev, contestant];
    });
  };

  const handleCreate = async () => {
    if (!name.trim())          { setError('El nombre del equipo es obligatorio.'); return; }
    if (selected.length === 0) { setError('Selecciona al menos un competidor.'); return; }
    setSaving(true); setError('');
    const res = await createTeam(name.trim(), selected.map((c) => c.id));
    setSaving(false);
    if (res.success) { onCreated(); onClose(); }
    else setError(res.message);
  };

  return (
    <Modal
      title="Crear Equipo"
      subtitle="Máximo 3 competidores por equipo"
      onClose={onClose}
      footer={
        <>
          <button className="co-btn co-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="co-btn co-btn--primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creando…' : 'Crear Equipo'}
          </button>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <Field label="Nombre del equipo">
        <input
          className="co-field__input"
          placeholder="Ej. Los Compiladores"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Field>

      <Field
        label="Buscar competidores disponibles"
        hint="Los competidores ya en un equipo activo no aparecen aquí."
      >
        <div className="co-search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="co-search-input"
            placeholder="Escribe un nombre o usuario para buscar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {(results.length > 0 || searching) && (
          <div className="co-search-results">
            {searching ? (
              <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                Buscando…
              </div>
            ) : results.map((c) => {
              const isSelected = selected.some((s) => s.id === c.id);
              return (
                <div
                  key={c.id}
                  className={`co-search-result-item${isSelected ? ' co-search-result-item--selected' : ''}`}
                  onClick={() => toggleSelect(c)}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {c.name} {c.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      @{c.username}{c.codeforces_handle ? ` · CF: ${c.codeforces_handle}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LevelBadge level={c.level} />
                    {isSelected && <span style={{ fontSize: 13, color: 'var(--co-light)' }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selected.length > 0 && (
          <div className="co-selected-members">
            {selected.map((c) => (
              <span key={c.id} className="co-selected-chip">
                {c.name} {c.last_name}
                <button
                  className="co-selected-chip__remove"
                  onClick={() => setSelected((p) => p.filter((s) => s.id !== c.id))}
                >✕</button>
              </span>
            ))}
          </div>
        )}
      </Field>
    </Modal>
  );
};

// ── EditTeamModal ─────────────────────────────────────────────────────────────
const EditTeamModal = ({ team, members = [], onClose, onSaved }) => {
  const [name,      setName]      = useState(team.team_name);
  const [isActive,  setIsActive]  = useState(team.is_active);
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [selected,  setSelected]  = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  // Búsqueda debounced
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchAvailableContestants(query);
      setResults(res.success ? res.data : []);
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const toggleSelect = (contestant) => {
    setSelected((prev) => {
      const exists = prev.find((c) => c.id === contestant.id);
      if (exists) return prev.filter((c) => c.id !== contestant.id);
      if (prev.length >= 3) { setError('Máximo 3 competidores por equipo.'); return prev; }
      setError('');
      return [...prev, contestant];
    });
  };

  const handleSave = async () => {
    const patch = {};
    if (name.trim() !== team.team_name) {
      if (!name.trim()) { setError('El nombre no puede estar vacío.'); return; }
      patch.name = name.trim();
    }
    if (isActive !== team.is_active) patch.isActive = isActive;
    if (selected.length > 0) patch.contestantIds = selected.map((c) => c.id);

    if (Object.keys(patch).length === 0) { onClose(); return; }

    setSaving(true); setError('');
    const res = await updateTeam(team.team_id, patch);
    setSaving(false);
    if (res.success) { onSaved(); onClose(); }
    else setError(res.message);
  };

  return (
    <Modal
      title="Editar Equipo"
      subtitle={team.team_name}
      onClose={onClose}
      footer={
        <>
          <button className="co-btn co-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="co-btn co-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <Field label="Nombre del equipo">
        <input
          className="co-field__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Field>

      <Field label="Estado">
        <button
          type="button"
          className={`co-btn co-btn--sm ${isActive ? 'co-btn--primary' : 'co-btn--ghost'}`}
          onClick={() => setIsActive((v) => !v)}
          style={{ minWidth: 120 }}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </button>
      </Field>

      {members.length > 0 && (
        <Field label="Miembros actuales">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {members.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 8,
                background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {m.name} {m.last_name}
                </span>
                <LevelBadge level={m.level} />
                {m.codeforces_handle && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    CF: {m.codeforces_handle}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Field>
      )}

      <Field
        label="Reemplazar miembros (opcional)"
        hint="Si seleccionas competidores aquí, reemplazarán a los miembros actuales. Deja vacío para no cambiar."
      >
        <div className="co-search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="co-search-input"
            placeholder="Buscar competidores disponibles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {(results.length > 0 || searching) && (
          <div className="co-search-results">
            {searching ? (
              <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                Buscando…
              </div>
            ) : results.map((c) => {
              const isSelected = selected.some((s) => s.id === c.id);
              return (
                <div
                  key={c.id}
                  className={`co-search-result-item${isSelected ? ' co-search-result-item--selected' : ''}`}
                  onClick={() => toggleSelect(c)}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {c.name} {c.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      @{c.username}{c.codeforces_handle ? ` · CF: ${c.codeforces_handle}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LevelBadge level={c.level} />
                    {isSelected && <span style={{ fontSize: 13, color: 'var(--co-light)' }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selected.length > 0 && (
          <div className="co-selected-members">
            {selected.map((c) => (
              <span key={c.id} className="co-selected-chip">
                {c.name} {c.last_name}
                <button
                  className="co-selected-chip__remove"
                  onClick={() => setSelected((p) => p.filter((s) => s.id !== c.id))}
                >✕</button>
              </span>
            ))}
          </div>
        )}
      </Field>
    </Modal>
  );
};

// ── TeamsPage ──────────────────────────────────────────────────────────────────
const TeamsPage = () => {
  const navigate = useNavigate();
  const { dashboardData, setDashboardData, myTeams, setMyTeams } = useCoachStore();
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [showCreate,   setShowCreate]   = useState(false);
  const [editingTeam,  setEditingTeam]  = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const [dashRes, teamsRes] = await Promise.all([fetchCoachDashboard(), fetchMyTeams()]);
    if (dashRes.success) setDashboardData(dashRes.data);
    else setError(dashRes.message);
    if (teamsRes.success) setMyTeams(teamsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  // Mapa team_id → members (del endpoint my-teams)
  const membersMap = {};
  if (myTeams) myTeams.forEach((t) => { membersMap[t.team_id] = t.members; });

  const teams    = dashboardData?.teams ?? [];
  const active   = teams.filter((t) =>  t.is_active);
  const inactive = teams.filter((t) => !t.is_active);
  const filtered =
    activeFilter === 'active'   ? active   :
    activeFilter === 'inactive' ? inactive :
    teams;

  return (
    <div>
      <SectionHeader
        title="Equipos"
        subtitle="Gestiona los equipos bajo tu cargo"
        action={
          <button className="co-btn co-btn--primary" onClick={() => setShowCreate(true)}>
            <svg className="co-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Crear Equipo
          </button>
        }
      />

      {error && <div className="co-alert co-alert--error">{error}</div>}

      {/* Filter tabs */}
      <div className="co-filter-tabs">
        {[
          { key: 'all',      label: 'Todos',     count: teams.length    },
          { key: 'active',   label: 'Activos',   count: active.length   },
          { key: 'inactive', label: 'Inactivos', count: inactive.length },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`co-filter-tab${activeFilter === tab.key ? ' co-filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab.key)}
          >
            {tab.label}
            <span className="co-filter-tab__count">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <SkTable rows={4} />
      ) : filtered.length === 0 ? (
        <div className="co-table-card">
          <EmptyState
            icon="👥"
            title={activeFilter === 'all' ? 'No tienes equipos aún' : 'Sin equipos en esta categoría'}
            description="Crea tu primer equipo con el botón de arriba."
            action={
              <button className="co-btn co-btn--primary co-btn--sm" onClick={() => setShowCreate(true)}>
                Crear Equipo
              </button>
            }
          />
        </div>
      ) : (
        <div className="co-table-card">
          <table className="co-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Miembros</th>
                <th>Globos</th>
                <th>Rank Liga</th>
                <th>Cumplimiento</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((team, i) => (
                <tr
                  key={team.team_id ?? i}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/coach/teams/${team.team_id}`)}
                >
                  <td>
                    <div className="co-table__name">{team.team_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {team.contests_participated ?? 0} competencias
                    </div>
                  </td>
                  <td>{team.member_count ?? 0}</td>
                  <td style={{ color: 'var(--co-light)', fontWeight: 600 }}>
                    {team.total_balloons ?? 0}
                  </td>
                  <td>
                    {team.league_rank
                      ? <span style={{ color: 'var(--co-light)', fontWeight: 700 }}>#{team.league_rank}</span>
                      : '—'}
                  </td>
                  <td>
                    <ProgressBar value={team.task_completion_rate ?? 0} max={1} />
                  </td>
                  <td><StatusBadge active={team.is_active} /></td>
                  <td>
                    <div className="co-table__actions">
                      <button
                        className="co-btn co-btn--ghost co-btn--sm"
                        onClick={(e) => { e.stopPropagation(); setEditingTeam(team); }}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={() => loadData()}
        />
      )}

      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          members={membersMap[editingTeam.team_id] ?? []}
          onClose={() => setEditingTeam(null)}
          onSaved={() => loadData()}
        />
      )}
    </div>
  );
};

export default TeamsPage;
