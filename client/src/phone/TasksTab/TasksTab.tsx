import { useState, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { useTaskRange } from '../../hooks/useTasks';
import { api } from '../../lib/api';
import { CreateTaskInput } from '../../types';
import { toDateString } from '../../tablet/Calendar/calendarUtils';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = toDateString(new Date());
  const tomorrow = toDateString(new Date(Date.now() + 86400000));
  if (dateStr === today) return "Aujourd'hui";
  if (dateStr === tomorrow) return 'Demain';
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

export function TasksTab() {
  const [showForm, setShowForm] = useState(false);

  const today = toDateString(new Date());
  const in14 = toDateString(new Date(Date.now() + 14 * 86400000));
  const { tasks } = useTaskRange(today, in14);

  const grouped = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.filter(t => t.completed !== 1).forEach(t => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  const handleAdd = async (input: CreateTaskInput) => {
    await api.createTask(input);
  };

  const handleToggle = async (id: number) => {
    await api.toggleTask(id);
  };

  const handleDelete = async (id: number) => {
    await api.deleteTask(id);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: 'none' }}>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>
          Tâches à venir
        </h1>
      </div>

      {grouped.length === 0 && (
        <p className="px-4 text-sm font-light" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Aucune tâche à venir.
        </p>
      )}

      {grouped.map(([date, dateTasks]) => (
        <div key={date} className="mb-2">
          <p
            className="px-4 py-2 text-xs font-medium tracking-widest uppercase sticky top-0"
            style={{
              color: 'rgba(255,255,255,0.35)',
              background: 'rgba(8,12,24,0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {formatGroupDate(date)}
          </p>
          <div className="px-4">
            {dateTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => handleToggle(task.id)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
        style={{
          background: 'rgba(160,180,255,0.2)',
          border: '1px solid rgba(160,180,255,0.3)',
          backdropFilter: 'blur(10px)',
          color: 'rgba(200,215,255,0.9)',
        }}
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {showForm && (
        <TaskForm
          defaultDate={today}
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
