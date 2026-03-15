import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCoachStore from '@/store/coachStore';
import {
  fetchCoachDashboard, fetchTeamTasks,
  createTask, updateTask, deleteTask, undoTaskCompletion,
} from '../services/coachService';
import {
  SectionHeader, EmptyState, StatusBadge, ProgressBar,
  Modal, Field, Alert, isoToBackendDate, deadlineStatus,
  completionRate, Sk, SkList,
} from '../components/SharedComponents';

// ── Task Modal ─────────────────────────────────────────────────────────────────
const TaskModal = ({ teamId, task, onClose, onSaved }) => {
  const editing = !!task;
  const [title,  setTitle]  = useState(task?.title       ?? '');
  const [desc,   setDesc]   = useState(task?.description ?? '');
  const [date,   setDate]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  // Convertir DD-MM-YYYY del backend → YYYY-MM-DD para input[type=date]
  useEffect(() => {
    if (task?.limit_date) {
      const [d, m, y] = task.limit_date.split('-');
      setDate(`${y}-${m}-${d}`);
    }
  }, [task]);

  const handleSave = async () => {
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    if (!date)         { setError('La fecha límite es obligatoria.'); return; }
    setSaving(true); setError('');
    const backendDate = isoToBackendDate(date); // YYYY-MM-DD → DD-MM-YYYY
    const res = editing
      ? await updateTask(task.id, { title, description: desc, limitDate: backendDate })
      : await createTask({ teamId, title, description: desc, limitDate: backendDate });
    setSaving(false);
    if (res.success) { onSaved(); onClose(); }
    else setError(res.message);
  };

  return (
    <Modal
      title={editing ? 'Editar Tarea' : 'Nueva Tarea'}
      onClose={onClose}
      footer={
        <>
          <button className="co-btn co-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="co-btn co-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear Tarea'}
          </button>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}
      <Field label="Título">
        <input className="co-field__input" placeholder="Ej. Resolver problema de grafos" value={title}
          onChange={(e) => setTitle(e.target.value)} autoFocus />
      </Field>
      <Field label="Descripción" hint="Incluye la URL del problema directamente en la descripción.">
        <textarea className="co-field__textarea" placeholder="Instrucciones o enlace al problema…"
          value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
      </Field>
      <Field label="Fecha límite">
        <input className="co-field__input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
    </Modal>
  );
};

// ── TaskRow ────────────────────────────────────────────────────────────────────
const TaskRow = ({ task, onEdit, onDeleteTask, onUndoCompletion }) => {
  const dl       = deadlineStatus(task.limit_date);
  const done     = task.completions?.filter((c) => c.is_completed).length ?? 0;
  const total    = task.completions?.length ?? 0;
  const urlMatch = task.description?.match(/https?:\/\/[^\s]+/);

  return (
    <div className="co-task-card">
      <div className="co-task-card__header">
        <div className="co-task-card__title">{task.title}</div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="co-btn co-btn--ghost co-btn--sm" onClick={() => onEdit(task)}>Editar</button>
          <button className="co-btn co-btn--danger co-btn--sm" onClick={() => onDeleteTask(task.id)}>Eliminar</button>
        </div>
      </div>

      {task.description && <div className="co-task-card__desc">{task.description}</div>}

      <div className="co-task-card__footer">
        <div className="co-task-card__meta">
          {dl && (
            <span className={`co-task-card__meta-item${dl.urgent ? ' co-task-card__meta-item--urgent' : ''}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {dl.label}
            </span>
          )}
          {urlMatch && (
            <a href={urlMatch[0]} target="_blank" rel="noopener noreferrer"
              className="co-task-card__meta-item" style={{ color: 'var(--co-text)', textDecoration: 'none' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Ver problema
            </a>
          )}
          <span className="co-task-card__meta-item">{done}/{total} completadas</span>
        </div>
        {total > 0 && (
          <div style={{ minWidth: 160 }}>
            <ProgressBar value={done} max={total} />
          </div>
        )}
      </div>

      {/* Completions por competidor */}
      {task.completions?.length > 0 && (
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {task.completions.map((c, i) => (
            <span key={c.contestant_id ?? i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, padding: '3px 9px', borderRadius: 20,
              background: c.is_completed ? 'var(--color-success-dim)' : 'var(--color-surface-3)',
              color: c.is_completed ? 'var(--color-success)' : 'var(--color-text-muted)',
              border: `1px solid ${c.is_completed ? 'rgba(77,201,138,0.2)' : 'var(--color-border)'}`,
            }}>
              {c.is_completed ? '✓' : '○'} ID {c.contestant_id}
              {c.is_completed && (
                <button
                  onClick={() => onUndoCompletion(task.id, c.contestant_id)}
                  style={{
                    marginLeft: 2, fontSize: 10, background: 'none', border: 'none',
                    color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0,
                  }}
                  title="Deshacer completado"
                >✕</button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── TeamDetailPage ─────────────────────────────────────────────────────────────
const TeamDetailPage = () => {
  const { teamId } = useParams();
  const navigate   = useNavigate();
  const {
    dashboardData, setDashboardData,
    tasksByTeam, setTasksForTeam, removeTask,
  } = useCoachStore();

  const [loading,      setLoading]      = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error,        setError]        = useState('');
  const [tasksError,   setTasksError]   = useState('');
  const [taskModal,    setTaskModal]    = useState(null); // null | 'create' | task
  const [delConfirm,   setDelConfirm]   = useState(null);

  const numId = Number(teamId);
  const team  = dashboardData?.teams?.find((t) => t.team_id === numId);

  // Siempre carga fresh para tener los datos del equipo actualizados
  useEffect(() => {
    fetchCoachDashboard().then((res) => {
      if (res.success) setDashboardData(res.data);
      else setError(res.message);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setTasksLoading(true);
    setTasksError('');
    fetchTeamTasks(numId).then((res) => {
      if (res.success) setTasksForTeam(numId, res.data);
      else setTasksError(res.message);
      setTasksLoading(false);
    });
  }, [numId]);

  const tasks = tasksByTeam[numId] ?? [];

  const handleDeleteTask = async (taskId) => {
    const res = await deleteTask(taskId);
    if (res.success) removeTask(taskId);
    setDelConfirm(null);
  };

  const handleUndoCompletion = async (taskId, contestantId) => {
    const res = await undoTaskCompletion(taskId, contestantId);
    if (res.success) {
      // Recargar tareas para reflejar el cambio
      const refreshed = await fetchTeamTasks(numId);
      if (refreshed.success) setTasksForTeam(numId, refreshed.data);
    }
  };

  const handleTaskSaved = async () => {
    const res = await fetchTeamTasks(numId);
    if (res.success) setTasksForTeam(numId, res.data);
  };

  if (loading) {
    return (
      <div>
        <button className="co-btn co-btn--ghost co-btn--sm" onClick={() => navigate('/coach/teams')} style={{ marginBottom: 20 }}>
          ← Equipos
        </button>
        <Sk h={300} />
      </div>
    );
  }

  if (!team) {
    return (
      <div>
        <button className="co-btn co-btn--ghost co-btn--sm" onClick={() => navigate('/coach/teams')} style={{ marginBottom: 20 }}>
          ← Equipos
        </button>
        <div className="co-activity-card">
          <EmptyState icon="🔍" title="Equipo no encontrado" description="El equipo no existe o no tienes acceso." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="co-btn co-btn--ghost co-btn--sm" onClick={() => navigate('/coach/teams')} style={{ marginBottom: 12 }}>
        ← Equipos
      </button>

      <SectionHeader
        title={team.team_name}
        subtitle={`${team.member_count ?? 0} miembros · ${team.contests_participated ?? 0} competencias`}
        action={<StatusBadge active={team.is_active} />}
      />

      {error && <div className="co-alert co-alert--error">{error}</div>}

      <div className="co-detail-grid">
        {/* ── Columna izquierda — stats ── */}
        <div className="co-info-card">
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
          }}>
            Estadísticas
          </div>
          {[
            { label: 'Rank liga',      value: team.league_rank    ? `#${team.league_rank}` : '—' },
            { label: 'Puntaje liga',   value: team.league_points  ?? 0 },
            { label: 'Globos totales', value: team.total_balloons ?? 0 },
            { label: 'Competencias',   value: team.contests_participated ?? 0 },
            { label: 'Pos. promedio',  value: team.avg_position != null ? team.avg_position.toFixed(1) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="co-info-row">
              <span className="co-info-label">{label}</span>
              <span className="co-info-value">{value}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
            }}>
              Cumplimiento de tareas
            </div>
            <ProgressBar value={team.task_completion_rate ?? 0} max={1} />
          </div>
        </div>

        {/* ── Columna derecha — tareas ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="co-chart-title">Tareas del Equipo</div>
              <div className="co-chart-subtitle">
                {tasksLoading ? 'Cargando…' : `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''} asignada${tasks.length !== 1 ? 's' : ''}`}
              </div>
            </div>
            <button className="co-btn co-btn--primary co-btn--sm" onClick={() => setTaskModal('create')}>
              <svg className="co-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nueva Tarea
            </button>
          </div>

          {tasksError && <div className="co-alert co-alert--error">{tasksError}</div>}

          {tasksLoading ? (
            <SkList rows={3} />
          ) : tasks.length === 0 ? (
            <div className="co-activity-card">
              <EmptyState
                icon="📋"
                title="Sin tareas asignadas"
                description="Crea la primera tarea para este equipo."
                action={
                  <button className="co-btn co-btn--primary co-btn--sm" onClick={() => setTaskModal('create')}>
                    Nueva Tarea
                  </button>
                }
              />
            </div>
          ) : (
            <div className="co-task-list">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onEdit={(t) => setTaskModal(t)}
                  onDeleteTask={(id) => setDelConfirm(id)}
                  onUndoCompletion={handleUndoCompletion}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {taskModal && (
        <TaskModal
          teamId={numId}
          task={taskModal === 'create' ? null : taskModal}
          onClose={() => setTaskModal(null)}
          onSaved={handleTaskSaved}
        />
      )}

      {delConfirm && (
        <Modal
          title="¿Eliminar tarea?"
          subtitle="Esta acción no se puede deshacer."
          onClose={() => setDelConfirm(null)}
          footer={
            <>
              <button className="co-btn co-btn--ghost" onClick={() => setDelConfirm(null)}>Cancelar</button>
              <button className="co-btn co-btn--danger" onClick={() => handleDeleteTask(delConfirm)}>Eliminar</button>
            </>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Se eliminará la tarea permanentemente.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default TeamDetailPage;
