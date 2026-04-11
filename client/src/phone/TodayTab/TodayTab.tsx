import { motion } from 'framer-motion';
import { useTasks } from '../../hooks/useTasks';
import { useAISuggestions } from '../../hooks/useAISuggestions';
import { useClock } from '../../hooks/useClock';
import { todayString } from '../../tablet/Calendar/calendarUtils';
import { api } from '../../lib/api';
import { AISuggestion } from '../../types';

const today = todayString();

export function TodayTab() {
  const { tasks, toggleTask, deleteTask, addTask } = useTasks(today);
  const { suggestions, loading: aiLoading, dismiss } = useAISuggestions(today);
  const { dayName, date } = useClock();

  const pending = tasks.filter(t => t.completed !== 1);
  const done = tasks.filter(t => t.completed === 1);

  const handleAccept = async (s: AISuggestion) => {
    await addTask({ title: s.title, date: today, category: s.category, priority: s.priority, ai_suggested: true });
    api.sendFeedback(s.title, true, today).catch(() => {});
    const idx = suggestions.findIndex(x => x.title === s.title);
    if (idx !== -1) dismiss(idx);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-6" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium tracking-widest uppercase mb-1"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          {dayName}
        </p>
        <h1 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {date}
        </h1>
      </div>

      {/* AI Suggestions */}
      {(aiLoading || suggestions.length > 0) && (
        <div className="mb-6">
          <p className="text-xs font-medium tracking-widest uppercase mb-3"
            style={{ color: 'rgba(160,180,255,0.6)' }}>
            {aiLoading ? 'Suggestions...' : 'Suggestions IA'}
          </p>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: 'rgba(160,180,255,0.07)',
                  border: '1px solid rgba(160,180,255,0.15)',
                }}
              >
                <span className="flex-1 text-sm font-light" style={{ color: 'rgba(200,215,255,0.85)' }}>
                  {s.title}
                </span>
                <button
                  onClick={() => handleAccept(s)}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(160,180,255,0.15)', color: 'rgba(200,215,255,0.9)' }}
                >
                  Ajouter
                </button>
                <button onClick={() => dismiss(i)} style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Pending tasks */}
      <div className="mb-4">
        <p className="text-xs font-medium tracking-widest uppercase mb-3"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          {pending.length > 0 ? `${pending.length} à faire` : 'Tout est fait !'}
        </p>
        {pending.map(task => (
          <motion.div
            key={task.id}
            layout
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}
            />
            <span className="flex-1 text-sm font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {task.title}
            </span>
            {task.time && (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{task.time}</span>
            )}
          </motion.div>
        ))}
        {pending.length === 0 && (
          <p className="text-sm font-light py-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Journée libre ✦
          </p>
        )}
      </div>

      {/* Done tasks */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-widest uppercase mb-3"
            style={{ color: 'rgba(255,255,255,0.15)' }}>
            Complétées
          </p>
          {done.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2.5 opacity-40"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <span
                className="flex-1 text-sm font-light line-through"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {task.title}
              </span>
              <button onClick={() => deleteTask(task.id)} style={{ color: 'rgba(255,255,255,0.2)' }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
