import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCoachStore from '@/store/coachStore';
import {
  fetchCoachDashboard, fetchTeamTasks, createTask, deleteTask,
} from '../services/coachService';
import {
  SectionHeader, EmptyState, FilterTabs, Modal, Field, Alert,
  ProgressBar, SkList, Sk, deadlineStatus, completionRate, formatDate, isoToBackendDate,
} from '../components/SharedComponents';

// ── CreateTaskModal ────────────────────────────────────────────────────────────
const CreateTaskModal = ({ teams, onClose, onCreated }) => {
  const [teamId,  setTeamId]  = useState('');
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [date,    setDate]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleCreate = async () => {
    if (!teamId)       { setError('Selecciona un equipo.'); return; }
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    if (!date)         { setError('La fecha límite es obligatoria.'); return; }
    setSaving(true); setError('');
    const res = await createTask({
      teamId:      Number(teamId),
      title:       title.trim(),
      description: desc.trim(),
      limitDate:   isoToBackendDate(date),
    });
    setSaving(false);
    if (res.success) { onCreated(Number(teamId), res.data); onClose(); }
    else setError(res.message);
  };

  return (
    <Modal
      title="Nueva Tarea"
      subtitle="Asigna una tarea a uno de tus equipos"
      onClose={onClose}
      footer={
        <>
          <button className="co-btn co-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="co-btn co-btn--primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creando…' : 'Crear Tarea'}
          </button>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <Field label="Equipo destinatario">
        <select
          className="co-field__select"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="">Seleccionar equipo…</option>
          {teams.map((t) => (
            <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
          ))}
        </select>
      </Field>

      <Field label="Título">
        <input
          className="co-field__input"
          placeholder="Ej. Resolver problema de grafos"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </Field>

      <Field label="Descripción" hint="Puedes incluir la URL del problema directamente aquí.">
        <textarea
          className="co-field__textarea"
          placeholder="Instrucciones, enlace al problema de Codeforces, etc."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
        />
      </Field>

      <Field label="Fecha límite">
        <input
          className="co-field__input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
    </Modal>
  );
};

// ── TaskCard ───────────────────────────────────────────────────────────────────
const TaskCard = ({ task, teamName, teamId, onDelete, navigate }) => {
  const dl   = deadlineStatus(task.limit_date);
  const done = task.completions?.filter((c) => c.is_completed).length ?? 0;
  const total = task.completions?.length ?? 0;

  // Extract first URL from description (only allow http/https)
  const urlRaw = task.description?.match(/https?:\/\/[^\s]+/);
  let urlMatch = null;
  if (urlRaw) {
    try {
      const parsed = new URL(urlRaw[0]);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') urlMatch = [parsed.href];
    } catch { /* invalid URL, ignore */ }
  }

  return (
    <div className="co-task-card">
      <div className="co-task-card__header">
        <div>
          <div className="co-task-card__title">{task.title}</div>
          <div style={{ fontSize: 11, color: 'var(--co-text)', marginTop: 2, fontWeight: 500 }}>
            {teamName}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            className="co-btn co-btn--ghost co-btn--sm"
            onClick={() => navigate(`/coach/teams/${teamId}`)}
          >
            Ver equipo
          </button>
          <button
            className="co-btn co-btn--danger co-btn--sm"
            onClick={() => onDelete(task.id)}
          >
            Eliminar
          </button>
        </div>
      </div>

      {task.description && (
        <div className="co-task-card__desc">{task.description}</div>
      )}

      <div className="co-task-card__footer">
        <div className="co-task-card__meta">
          {dl && (
            <span className={`co-task-card__meta-item${dl.urgent ? ' co-task-card__meta-item--urgent' : ''}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {dl.label}
            </span>
          )}
          {urlMatch && (
            <a
              href={urlMatch[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="co-task-card__meta-item"
              style={{ color: 'var(--co-text)', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Ver problema
            </a>
          )}
          <span className="co-task-card__meta-item">{done}/{total} completadas</span>
        </div>
        {total > 0 && (
          <div style={{ minWidth: 140 }}>
            <ProgressBar value={done} max={total} />
          </div>
        )}
      </div>
    </div>
  );
};

// ── TasksPage ──────────────────────────────────────────────────────────────────
const TasksPage = () => {
  const navigate = useNavigate();
  const { dashboardData, setDashboardData, tasksByTeam, setTasksForTeam, addTask, removeTask } = useCoachStore();

  const [loading,     setLoading]     = useState(true);
  const [loadingTasks,setLoadingTasks]= useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('all');
  const [delConfirm,  setDelConfirm]  = useState(null);
  const [error,       setError]       = useState('');

  const teams = dashboardData?.teams ?? [];

  // Load dashboard
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchCoachDashboard();
      if (res.success) setDashboardData(res.data);
      else setError(res.message);
      setLoading(false);
    })();
  }, []);

  // Load tasks for all teams once dashboard is ready
  useEffect(() => {
    if (!teams.length) return;
    const unloaded = teams.filter((t) => !tasksByTeam[t.team_id]);
    if (!unloaded.length) return;
    setLoadingTasks(true);
    Promise.all(unloaded.map((t) => fetchTeamTasks(t.team_id))).then((results) => {
      results.forEach((res, i) => {
        if (res.success) setTasksForTeam(unloaded[i].team_id, res.data);
      });
      setLoadingTasks(false);
    });
  }, [teams.length]);

  // Flatten all tasks with team info
  const allTasks = teams.flatMap((team) =>
    (tasksByTeam[team.team_id] ?? []).map((task) => ({
      ...task,
      _teamName: team.team_name,
      _teamId:   team.team_id,
    }))
  );

  // Filter
  const now = new Date(); now.setHours(0,0,0,0);
  const pending  = allTasks.filter((t) => {
    const dl = deadlineStatus(t.limit_date);
    return !dl || !dl.urgent || (dl && dl.label !== 'Vencida');
  });
  const overdue  = allTasks.filter((t) => {
    if (!t.limit_date) return false;
    const [d,m,y] = t.limit_date.split('-').map(Number);
    return new Date(y, m-1, d) < now;
  });

  const tabs = [
    { key: 'all',     label: 'Todas',    count: allTasks.length },
    { key: 'overdue', label: 'Vencidas', count: overdue.length  },
    ...teams.map((t) => ({
      key:   `team_${t.team_id}`,
      label: t.team_name.length > 12 ? t.team_name.slice(0,12)+'…' : t.team_name,
      count: (tasksByTeam[t.team_id] ?? []).length,
    })),
  ];

  const filtered =
    activeTab === 'all'     ? allTasks :
    activeTab === 'overdue' ? overdue  :
    activeTab.startsWith('team_')
      ? allTasks.filter((t) => t._teamId === Number(activeTab.replace('team_', '')))
      : allTasks;

  const handleDeleteTask = async (taskId) => {
    const res = await deleteTask(taskId);
    if (res.success) removeTask(taskId);
    setDelConfirm(null);
  };

  const handleTaskCreated = (teamId, task) => {
    addTask(teamId, task);
  };

  const isLoading = loading || loadingTasks;

  return (
    <div>
      <SectionHeader
        title="Tareas"
        subtitle={`${allTasks.length} tarea${allTasks.length !== 1 ? 's' : ''} asignada${allTasks.length !== 1 ? 's' : ''} en ${teams.length} equipo${teams.length !== 1 ? 's' : ''}`}
        action={
          <button
            className="co-btn co-btn--primary"
            onClick={() => setShowCreate(true)}
            disabled={teams.length === 0}
          >
            <svg className="co-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva Tarea
          </button>
        }
      />

      {error && <div className="co-alert co-alert--error">{error}</div>}

      <FilterTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <SkList rows={4} />
      ) : filtered.length === 0 ? (
        <div className="co-activity-card">
          <EmptyState
            icon="📋"
            title={activeTab === 'overdue' ? 'Sin tareas vencidas 🎉' : 'Sin tareas en esta categoría'}
            description={
              activeTab === 'all'
                ? 'Crea la primera tarea con el botón de arriba.'
                : activeTab === 'overdue'
                ? 'Todos los equipos están al día.'
                : 'Este equipo no tiene tareas asignadas aún.'
            }
            action={
              activeTab !== 'overdue' && (
                <button className="co-btn co-btn--primary co-btn--sm" onClick={() => setShowCreate(true)}>
                  Nueva Tarea
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="co-task-list">
          {filtered.map((task) => (
            <TaskCard
              key={`${task._teamId}-${task.id}`}
              task={task}
              teamName={task._teamName}
              teamId={task._teamId}
              onDelete={(id) => setDelConfirm(id)}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateTaskModal
          teams={teams}
          onClose={() => setShowCreate(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <Modal
          title="¿Eliminar tarea?"
          subtitle="Esta acción no se puede deshacer."
          onClose={() => setDelConfirm(null)}
          footer={
            <>
              <button className="co-btn co-btn--ghost" onClick={() => setDelConfirm(null)}>Cancelar</button>
              <button className="co-btn co-btn--danger" onClick={() => handleDeleteTask(delConfirm)}>
                Eliminar
              </button>
            </>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Se eliminará la tarea y todas las marcas de completado de los competidores del equipo.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default TasksPage;
