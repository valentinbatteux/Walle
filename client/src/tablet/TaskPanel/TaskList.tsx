import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { Task, CreateTaskInput } from '../../types';

interface Props {
  tasks: Task[];
  date: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: (input: CreateTaskInput) => Promise<void>;
}

export function TaskList({ tasks, date, onToggle, onDelete, onAdd }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pending = tasks.filter(t => t.completed !== 1);
  const done = tasks.filter(t => t.completed === 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = value.trim();
    if (!title) return;
    setSubmitting(true);
    await onAdd({ title, date });
    setValue('');
    setSubmitting(false);
    setShowInput(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          {pending.length > 0 ? `${pending.length} tâche${pending.length > 1 ? 's' : ''}` : 'Journée libre'}
        </span>
        <button
          onClick={() => setShowInput(v => !v)}
          className="text-xs font-light px-3 py-1 rounded-full transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          + Ajouter
        </button>
      </div>

      {/* Quick add input */}
      <AnimatePresence>
        {showInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 overflow-hidden"
          >
            <input
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Nouvelle tâche..."
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl text-sm font-light focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') setShowInput(false);
              }}
            />
          </motion.form>
        )}
      </AnimatePresence>

      {/* Pending tasks */}
      <AnimatePresence mode="popLayout">
        {pending.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggle(task.id)}
            onDelete={() => onDelete(task.id)}
          />
        ))}
      </AnimatePresence>

      {pending.length === 0 && !showInput && (
        <p
          className="text-sm font-light py-4"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Aucune tâche planifiée.
        </p>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <div className="mt-4">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-2"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Complétées
          </p>
          <AnimatePresence mode="popLayout">
            {done.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggle(task.id)}
                onDelete={() => onDelete(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
