import { useRef, useEffect, useMemo, useCallback } from 'react';
import { DayTile } from './DayTile';
import { generateDays, todayString, toDateString } from './calendarUtils';
import { useTaskRange } from '../../hooks/useTasks';

interface Props {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarStrip({ selectedDate, onSelectDate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Range for task count dots
  const today = new Date();
  const from = toDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30));
  const to   = toDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30));
  const { tasks } = useTaskRange(from, to);

  const taskCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => { if (t.completed !== 1) map[t.date] = (map[t.date] || 0) + 1; });
    return map;
  }, [tasks]);

  const days = useMemo(() => generateDays(new Date(), 90), []);

  // Scroll to today on mount
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const todayEl = container.querySelector('[data-today="true"]') as HTMLElement | null;
    if (!todayEl) return;
    const offset = todayEl.offsetLeft - container.offsetWidth / 2 + todayEl.offsetWidth / 2;
    container.scrollLeft = offset;
  }, []);

  // Touch drag scrolling
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const c = scrollRef.current!;
    drag.current = { active: true, startX: e.pageX - c.offsetLeft, scrollLeft: c.scrollLeft };
    c.style.cursor = 'grabbing';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const c = scrollRef.current!;
    const x = e.pageX - c.offsetLeft;
    c.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX) * 1.4;
  }, []);

  const onMouseUp = useCallback(() => {
    drag.current.active = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))' }} />

      {/* Side fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10"
        style={{ background: 'linear-gradient(to right, rgba(3,4,8,0.9), transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10"
        style={{ background: 'linear-gradient(to left, rgba(3,4,8,0.9), transparent)' }} />

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto py-5 px-16 gap-2.5 select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {days.map(day => (
          <div
            key={day.dateString}
            data-today={day.isToday ? 'true' : undefined}
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
