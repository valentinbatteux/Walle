import { useRef } from 'react';
import { motion } from 'framer-motion';
import { TaskList } from './TaskList';
import { AISuggestions } from './AISuggestions';
import { useTasks } from '../../hooks/useTasks';
import { useAISuggestions } from '../../hooks/useAISuggestions';
import { AISuggestion, CreateTaskInput } from '../../types';
import { api } from '../../lib/api';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function formatPanelDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

interface Props {
  date: string;
  onClose: () => void;
}

export function TaskPanel({ date, onClose }: Props) {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks(date);
  const { suggestions, loading: aiLoading, dismiss } = useAISuggestions(date);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleAcceptSuggestion = async (s: AISuggestion) => {
    await addTask({ title: s.title, date, category: s.category, priority: s.priority, ai_suggested: true });
    api.sendFeedback(s.title, true, date).catch(() => {});
    const idx = suggestions.findIndex(x => x.title === s.title);
    if (idx !== -1) dismiss(idx);
  };

  const handleAdd = async (input: CreateTaskInput) => {
    await addTask(input);
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }}
      className="fixed bottom-0 left-0 right-0 z-20 rounded-t-3xl overflow-hidden flex flex-col"
      style={{
        height: '65vh',
        background: 'rgba(8, 12, 24, 0.88)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
        <div
          className="w-10 h-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 flex-shrink-0">
        <h2
          className="text-xl font-light tracking-wide"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          {formatPanelDate(date)}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8" style={{ scrollbarWidth: 'none' }}>
        <AISuggestions
          suggestions={suggestions}
          loading={aiLoading}
          onAccept={handleAcceptSuggestion}
          onDismiss={dismiss}
        />
        <TaskList
          tasks={tasks}
          date={date}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onAdd={handleAdd}
        />
      </div>
    </motion.div>
  );
}
