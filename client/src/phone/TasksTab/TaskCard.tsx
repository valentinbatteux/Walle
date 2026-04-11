import { Task } from '../../types';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

export function TaskCard({ task, onToggle, onDelete }: Props) {
  const isCompleted = task.completed === 1;
  return (
    <div
      className="flex items-center gap-3 py-3 group"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        opacity: isCompleted ? 0.45 : 1,
      }}
    >
      <button
        onClick={onToggle}
        className="w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center"
        style={{
          borderColor: isCompleted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
          background: isCompleted ? 'rgba(255,255,255,0.12)' : 'transparent',
        }}
      >
        {isCompleted && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-light truncate"
          style={{
            color: isCompleted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {formatDate(task.date)}{task.time ? ` · ${task.time}` : ''}
        </p>
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
