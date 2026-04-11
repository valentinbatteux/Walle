import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateTaskInput } from '../../types';

interface Props {
  defaultDate: string;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES = ['maison', 'courses', 'santé', 'travail', 'loisirs'];
const PRIORITIES: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
const PRIORITY_LABELS: Record<string, string> = { low: 'Faible', medium: 'Normale', high: 'Haute' };
const RECURRING = [
  { value: '', label: 'Non' },
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdo' },
  { value: 'monthly', label: 'Mensuel' },
];

export function TaskForm({ defaultDate, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [recurring, setRecurring] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      title: title.trim(),
      date,
      time: time || undefined,
      category: category || undefined,
      priority,
      recurring: recurring || undefined,
    });
    onClose();
  };

  const fieldStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.9)',
    borderRadius: '0.75rem',
  };

  const chipStyle = (active: boolean) => ({
    background: active ? 'rgba(160,180,255,0.18)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? 'rgba(160,180,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
    color: active ? 'rgba(200,215,255,0.95)' : 'rgba(255,255,255,0.4)',
    borderRadius: '9999px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <motion.div
          className="relative w-full rounded-t-3xl overflow-auto"
          style={{
            background: 'rgba(8, 12, 24, 0.97)',
            backdropFilter: 'blur(40px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            maxHeight: '90vh',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-8 pt-4 flex flex-col gap-5">
            <h3 className="text-lg font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Nouvelle tâche
            </h3>

            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Titre de la tâche..."
              className="w-full px-4 py-3 text-sm font-light focus:outline-none"
              style={{ ...fieldStyle }}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs tracking-widest uppercase mb-1 block"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-light focus:outline-none"
                  style={{ ...fieldStyle }}
                />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase mb-1 block"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>Heure</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-light focus:outline-none"
                  style={{ ...fieldStyle }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase mb-2 block"
                style={{ color: 'rgba(255,255,255,0.3)' }}>Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(category === c ? '' : c)}
                    style={chipStyle(category === c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase mb-2 block"
                style={{ color: 'rgba(255,255,255,0.3)' }}>Priorité</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={chipStyle(priority === p)}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase mb-2 block"
                style={{ color: 'rgba(255,255,255,0.3)' }}>Récurrence</label>
              <div className="flex gap-2">
                {RECURRING.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRecurring(r.value)}
                    style={chipStyle(recurring === r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-200"
              style={{
                background: title.trim() ? 'rgba(160,180,255,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${title.trim() ? 'rgba(160,180,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: title.trim() ? 'rgba(200,215,255,0.95)' : 'rgba(255,255,255,0.2)',
              }}
            >
              {submitting ? 'Ajout...' : 'Ajouter la tâche'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
