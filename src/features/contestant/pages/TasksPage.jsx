import React, { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import useContestantStore from '@/store/contestantStore';
import { fetchMyTasks, completeTask } from '../services/contestantService';
import { FilterTabs, SkeletonList, EmptyState, SectionHeader } from '../components/SharedComponents';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconClock = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconLink  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * El backend retorna limit_date en formato "DD-MM-YYYY".
 * Lo parseamos manualmente para evitar problemas de timezone.
 */
const parseBackendDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDeadline = (dateStr) => {
  if (!dateStr) return null;
  const date = parseBackendDate(dateStr);
  if (!date) return null;
  const now  = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

  if (diff < 0)   return { label: `Venció el ${label}`, urgent: true };
  if (diff === 0) return { label: 'Vence hoy',           urgent: true };
  if (diff <= 2)  return { label: `${diff}d — ${label}`, urgent: true };
  return { label, urgent: false };
};

/**
 * Extrae URLs de la descripción de la tarea.
 * El backend almacena links dentro del texto de description.
 */
const extractUrl = (description) => {
  if (!description) return null;
  const match = description.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
};

/**
 * Determina si la tarea está completada.
 * El backend /tasks/me devuelve is_completed directamente en la tarea.
 */
const isTaskCompleted = (task) => !!task.is_completed;

// ── TaskCard ──────────────────────────────────────────────────────────────────
const TaskCard = ({ task, userId, onComplete, index }) => {
  const [busy, setBusy]       = useState(false);
  const [apiError, setApiError] = useState('');
  const completed = isTaskCompleted(task);
  const deadline  = formatDeadline(task.limit_date);
  const link      = extractUrl(task.description);

  const handleComplete = async () => {
    if (busy || completed) return;
    setBusy(true);
    setApiError('');
    const res = await completeTask(task.id);
    if (res.success) {
      onComplete(task.id);
    } else {
      setApiError(res.message);
    }
    setBusy(false);
  };

  return (
    <div
      className={`cl-task-card${completed ? ' cl-task-card--completed' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Checkbox */}
      <button
        className={`cl-task-checkbox${completed ? ' cl-task-checkbox--checked' : ''}`}
        onClick={handleComplete}
        disabled={busy || completed}
        title={completed ? 'Tarea completada' : 'Marcar como completada'}
      >
        {(completed || busy) && <IconCheck />}
      </button>

      {/* Body */}
      <div className="cl-task-body">
        <div className="cl-task-title">{task.title}</div>
        <div className="cl-task-desc">{task.description}</div>

        <div className="cl-task-meta">
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="cl-task-link">
              <IconLink /> Ver recurso
            </a>
          )}
          {deadline && (
            <span className={`cl-task-deadline${deadline.urgent ? ' cl-task-deadline--urgent' : ''}`}>
              <IconClock /> {deadline.label}
            </span>
          )}
          {task.created_at && (
            <span className="cl-task-deadline">
              Asignada: {task.created_at}
            </span>
          )}
        </div>

        {apiError && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-error)' }}>
            ⚠ {apiError}
          </div>
        )}
      </div>

      {/* Status pill */}
      <div style={{ flexShrink: 0 }}>
        <span style={{
          fontSize: '10px', fontWeight: 600, padding: '3px 9px',
          borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em',
          background: completed ? 'var(--color-success-dim)' : 'var(--level-dim)',
          color: completed ? 'var(--color-success)' : 'var(--level-light)',
          border: `1px solid ${completed ? 'rgba(77,201,138,0.2)' : 'var(--level-border)'}`,
          whiteSpace: 'nowrap',
        }}>
          {busy ? '…' : completed ? '✓ Completada' : 'Pendiente'}
        </span>
      </div>
    </div>
  );
};

// ── TasksPage ─────────────────────────────────────────────────────────────────
const TasksPage = () => {
  const user = useAuthStore((s) => s.user);
  // El userId viene del store. El backend lo incluye en el token JWT.
  // Si el backend retorna el id en el login, estará en user.id.
  // Si no, completions[] se comparará con undefined y todas quedarán "pending".
  const userId = user?.id ?? null;

  const { tasks, setTasks, markTaskComplete } = useContestantStore();
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [apiError,  setApiError]  = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchMyTasks();
      if (res.success) setTasks(res.data);
      else setApiError(res.message);
      setLoading(false);
    })();
  }, []);

  const pending   = tasks.filter((t) => !isTaskCompleted(t));
  const completed = tasks.filter((t) =>  isTaskCompleted(t));
  const filtered  =
    activeTab === 'pending'   ? pending   :
    activeTab === 'completed' ? completed :
    tasks;

  return (
    <div>
      <SectionHeader
        title="Mis Tareas"
        subtitle="Tareas asignadas por el coach — márcalas como completadas cuando termines"
      />

      {apiError && (
        <div style={{
          padding: '12px 16px', marginBottom: 16,
          background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)',
        }}>
          {apiError}
        </div>
      )}

      <FilterTabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { key: 'all',       label: 'Todas',       count: tasks.length },
          { key: 'pending',   label: 'Pendientes',  count: pending.length },
          { key: 'completed', label: 'Completadas', count: completed.length },
        ]}
      />

      {loading ? (
        <SkeletonList rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={activeTab === 'completed' ? '🎉' : '📋'}
          title={
            activeTab === 'completed'  ? 'Aún no has completado tareas'
            : activeTab === 'pending' ? '¡Todo al día! Sin tareas pendientes'
            : 'No hay tareas asignadas'
          }
          description={
            activeTab === 'pending'
              ? 'Excelente — has completado todas tus tareas.'
              : 'El coach aún no ha asignado tareas a tu equipo.'
          }
        />
      ) : (
        <div className="cl-tasks-grid">
          {filtered.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              userId={userId}
              index={i}
              onComplete={(taskId) => markTaskComplete(taskId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Exportar helper para uso en otros componentes
export { isTaskCompleted };
export default TasksPage;
