import { useRef, useEffect, useMemo } from 'react';
import { DayTile } from './DayTile';
import { generateDays, todayString } from './calendarUtils';
import { useTaskRange } from '../../hooks/useTasks';
import { toDateString } from './calendarUtils';

interface Props {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarStrip({ selectedDate, onSelectDate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  const today = new Date();
  const from = toDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30));
  const to = toDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30));
  const { tasks } = useTaskRange(from, to);

  const taskCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completed !== 1) {
        map[t.date] = (map[t.date] || 0) + 1;
      }
    });
    return map;
  }, [tasks]);

  const days = useMemo(() => generateDays(new Date(), 60), []);

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const el = todayRef.current;
      const container = scrollRef.current;
      const offset = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: 'instant' });
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}
      />

      {/* Side fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)' }}
      />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.5), transparent)' }}
      />

      <div
        ref={scrollRef}
        className="flex overflow-x-auto py-4 px-12 gap-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {days.map((day) => (
          <div
            key={day.dateString}
            ref={day.isToday ? (el) => { (todayRef as React.MutableRefObject<HTMLButtonElement | null>).current = el as HTMLButtonElement; } : undefined}
          >
            <DayTile
              day={day}
              isSelected={selectedDate === day.dateString}
              taskCount={taskCountByDate[day.dateString] || 0}
              onClick={() => onSelectDate(day.dateString === selectedDate ? '' : day.dateString)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
