import { DragControls } from 'framer-motion';
import { WidgetCard } from './WidgetCard';
import { TasksConfig } from '../../types/widgets';
import { useTasks } from '../../hooks/useTasks';
import { todayString } from '../Calendar/calendarUtils';

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const txt  = 'rgba(255,255,255,0.92)';
const mute = 'rgba(255,255,255,0.5)';
const dim  = 'rgba(255,255,255,0.28)';

const PRIO: Record<string, string> = { high: '#f87171', medium: '#fbbf24', low: '#6ee7b7' };

interface Props { config: TasksConfig; dragControls: DragControls; isDragging?: boolean; onSettingsClick?: () => void; }

export function TasksWidget({ config, dragControls, isDragging, onSettingsClick }: Props) {
  const { tasks } = useTasks(todayString());
  const visible = config.showCompleted ? tasks : tasks.filter(t => t.completed !== 1 && t.completed !== -1);
  const done  = tasks.filter(t => t.completed === 1).length;
  const total = tasks.filter(t => t.completed !== -1).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <WidgetCard id="tasks" title="Aujourd'hui" icon={<CheckIcon />} dragControls={dragControls} isDragging={isDragging} onSettingsClick={onSettingsClick}>
      {/* Big percentage stat */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.55rem' }}>
        <span style={{ fontSize: '2.6rem', fontWeight: 200, color: txt, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: '0.72rem', color: mute }}>{done}/{total}</span>
      </div>
      {/* Progress bar */}
      {total > 0 && (
        <div style={{ height: 3, borderRadius: 999, background: 'rgba(0,0,0,0.25)', marginBottom: '0.65rem', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999, width: `${pct}%`,
            background: 'rgba(255,255,255,0.7)', transition: 'width 0.5s ease',
          }} />
        </div>
      )}
      {visible.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute }}>
          {total === 0 ? 'Journée libre ✓' : 'Tout est terminé !'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
          {visible.slice(0, 5).map(task => (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.28rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: PRIO[task.priority] || '#6ee7b7', flexShrink: 0 }} />
              <span style={{
                fontSize: '0.76rem', fontWeight: 300, flex: 1,
                color: task.completed === 1 ? dim : txt,
                textDecoration: task.completed === 1 ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {task.title}
              </span>
              {task.time && <span style={{ fontSize: '0.58rem', color: dim, flexShrink: 0 }}>{task.time}</span>}
            </div>
          ))}
          {visible.length > 5 && <p style={{ fontSize: '0.6rem', color: mute }}>+{visible.length - 5} tâches</p>}
        </div>
      )}
    </WidgetCard>
  );
}
