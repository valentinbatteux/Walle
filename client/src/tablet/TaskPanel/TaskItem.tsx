import { motion } from 'framer-motion';
import { Task } from '../../types';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const CAT_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  maison:  { bg: 'rgba(96,165,250,0.12)',  text: '#93C5FD', glow: 'rgba(96,165,250,0.2)'  },
  courses: { bg: 'rgba(52,211,153,0.12)',  text: '#6EE7B7', glow: 'rgba(52,211,153,0.2)'  },
  santé:   { bg: 'rgba(248,113,113,0.12)', text: '#FCA5A5', glow: 'rgba(248,113,113,0.2)' },
  travail: { bg: 'rgba(251,191,36,0.12)',  text: '#FDE68A', glow: 'rgba(251,191,36,0.2)'  },
  loisirs: { bg: 'rgba(167,139,250,0.12)', text: '#C4B5FD', glow: 'rgba(167,139,250,0.2)' },
  general: { bg: 'rgba(148,163,184,0.10)', text: '#CBD5E1', glow: 'rgba(148,163,184,0.15)'},
};

const PRIORITY_COLOR: Record<string, string> = {
  high: '#f87171', medium: '#fbbf24', low: '#6ee7b7',
};

export function TaskItem({ task, onToggle, onDelete }: Props) {
  const done = task.completed === 1;
  const cat = CAT_COLORS[task.category || 'general'] || CAT_COLORS.general;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: done ? 0.42 : 1, y: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="flex items-center gap-3 group"
      style={{
        padding: '0.7rem 1rem',
        marginBottom: '0.4rem',
        borderRadius: '1rem',
        background: done
          ? 'rgba(255,255,255,0.02)'
          : 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        boxShadow: done ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Priority dot */}
      <div style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: PRIORITY_COLOR[task.priority],
        boxShadow: `0 0 6px ${PRIORITY_COLOR[task.priority]}`,
        opacity: done ? 0.3 : 1,
      }} />

      {/* Checkbox */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.88 }}
        style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          border: `1.5px solid ${done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)'}`,
          background: done ? 'rgba(255,255,255,0.12)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {done && (
          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }}
            width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        )}
      </motion.button>

      {/* Title + time */}
      <div className="flex-1 min-w-0">
        <span style={{
          fontSize: '0.87rem', fontWeight: 300, display: 'block',
          color: done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.88)',
          textDecoration: done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </span>
        {task.time && (
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>
            {task.time}
          </span>
        )}
      </div>

      {/* Category pill */}
      {task.category && !done && (
        <span style={{
          fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em',
          padding: '0.18rem 0.55rem', borderRadius: '999px',
          background: cat.bg, color: cat.text,
          border: `1px solid ${cat.glow}`,
          boxShadow: `0 0 8px ${cat.glow}`, flexShrink: 0,
          textTransform: 'uppercase',
        }}>
          {task.category}
        </span>
      )}

      {/* Delete */}
      <motion.button
        onClick={onDelete}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="group-hover:opacity-100"
        style={{ opacity: 0, color: 'rgba(255,255,255,0.25)', padding: '0.2rem', cursor: 'pointer', background: 'none', border: 'none' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </motion.button>
    </motion.div>
  );
}
