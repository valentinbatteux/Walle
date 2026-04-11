import { motion } from 'framer-motion';
import { Task } from '../../types';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  maison: '#60A5FA',
  courses: '#34D399',
  santé: '#F87171',
  travail: '#FBBF24',
  loisirs: '#A78BFA',
  general: '#94A3B8',
};

const PRIORITY_DOT: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#6EE7B7',
};

export function TaskItem({ task, onToggle, onDelete }: Props) {
  const catColor = CATEGORY_COLORS[task.category || 'general'] || '#94A3B8';
  const isCompleted = task.completed === 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isCompleted ? 0.45 : 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 py-3 group"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Priority dot */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: PRIORITY_DOT[task.priority] }}
      />

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200"
        style={{
          borderColor: isCompleted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
          background: isCompleted ? 'rgba(255,255,255,0.15)' : 'transparent',
        }}
      >
        {isCompleted && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span
          className="text-sm font-light leading-tight block truncate"
          style={{
            color: isCompleted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </span>
        {task.time && (
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {task.time}
          </span>
        )}
      </div>

      {/* Category badge */}
      {task.category && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{
            background: `${catColor}18`,
            color: catColor,
            border: `1px solid ${catColor}30`,
          }}
        >
          {task.category}
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}
