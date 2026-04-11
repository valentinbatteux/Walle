import { WidgetCard } from './WidgetCard';
import { TasksConfig } from '../../types/widgets';
import { useTasks } from '../../hooks/useTasks';
import { todayString } from '../Calendar/calendarUtils';

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PRIORITY_COLOR: Record<string, string> = { high: '#f87171', medium: '#fbbf24', low: '#6ee7b7' };

interface Props { config: TasksConfig }

export function TasksWidget({ config }: Props) {
  const today = todayString();
  const { tasks } = useTasks(today);
  const visible = config.showCompleted
    ? tasks
    : tasks.filter(t => t.completed !== 1 && t.completed !== -1);
  const done = tasks.filter(t => t.completed === 1).length;
  const total = tasks.filter(t => t.completed !== -1).length;

  return (
    <WidgetCard title="Aujourd'hui" icon={<CheckIcon />} accentColor="rgba(167,139,250,0.7)">
      {/* Progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
              {done} / {total} complétées
            </span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(167,139,250,0.7)' }}>
              {Math.round((done / total) * 100)}%
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, rgba(167,139,250,0.8), rgba(78,205,196,0.6))',
              width: `${(done / total) * 100}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '0.5rem 0' }}>
          {total === 0 ? 'Aucune tâche · journée libre ✓' : 'Toutes les tâches sont complètes !'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {visible.slice(0, 5).map(task => (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                background: PRIORITY_COLOR[task.priority] || '#6ee7b7',
              }} />
              <span style={{
                fontSize: '0.78rem', fontWeight: 300, flex: 1,
                color: task.completed === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.78)',
                textDecoration: task.completed === 1 ? 'line-through' : 'none',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {task.title}
              </span>
              {task.time && (
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{task.time}</span>
              )}
            </div>
          ))}
          {visible.length > 5 && (
            <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.2rem' }}>
              +{visible.length - 5} tâches
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
