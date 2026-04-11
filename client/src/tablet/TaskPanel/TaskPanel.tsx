import { useRef } from 'react';
import { motion } from 'framer-motion';
import { TaskList } from './TaskList';
import { AISuggestions } from './AISuggestions';
import { useTasks } from '../../hooks/useTasks';
import { useAISuggestions } from '../../hooks/useAISuggestions';
import { AISuggestion, CreateTaskInput } from '../../types';
import { api } from '../../lib/api';

const DAYS_FR   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function fmtDate(s: string) {
  const d = new Date(s + 'T12:00:00');
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

interface Props { date: string; onClose: () => void; }

export function TaskPanel({ date, onClose }: Props) {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks(date);
  const { suggestions, loading: aiLoading, dismiss } = useAISuggestions(date);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleAccept = async (s: AISuggestion) => {
    await addTask({ title: s.title, date, category: s.category, priority: s.priority, ai_suggested: true });
    api.sendFeedback(s.title, true, date).catch(() => {});
    dismiss(suggestions.findIndex(x => x.title === s.title));
  };

  const handleAdd = async (input: CreateTaskInput) => { await addTask(input); };

  return (
    <motion.div
      ref={panelRef}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 34, stiffness: 340, mass: 0.75 }}
      className="fixed bottom-0 left-0 right-0 z-20 flex flex-col"
      style={{
        height: '62vh',
        borderRadius: '2rem 2rem 0 0',
        background: 'rgba(8, 6, 18, 0.82)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderTop: '1px solid rgba(167,139,250,0.2)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -20px 80px rgba(100,60,200,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
        <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.12)' }} />
      </div>

      {/* Iridescent top edge shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), rgba(78,205,196,0.5), transparent)',
        borderRadius: 999,
      }} />

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 flex-shrink-0">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 200, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.04em' }}>
          {fmtDate(date)}
        </h2>
        <motion.button
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8" style={{ scrollbarWidth: 'none' }}>
        <AISuggestions suggestions={suggestions} loading={aiLoading} onAccept={handleAccept} onDismiss={dismiss} />
        <TaskList tasks={tasks} date={date} onToggle={toggleTask} onDelete={deleteTask} onAdd={handleAdd} />
      </div>
    </motion.div>
  );
}
