import { motion } from 'framer-motion';
import { DayData } from './calendarUtils';

interface Props {
  day: DayData;
  isSelected: boolean;
  taskCount: number;
  onClick: () => void;
}

export function DayTile({ day, isSelected, taskCount, onClick }: Props) {
  const dots = Math.min(taskCount, 3);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.94 }}
      className="flex flex-col items-center flex-shrink-0 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 focus:outline-none"
      style={{
        background: isSelected
          ? 'rgba(255,255,255,0.18)'
          : day.isToday
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.03)',
        backdropFilter: isSelected ? 'blur(20px)' : 'none',
        border: isSelected
          ? '1px solid rgba(255,255,255,0.25)'
          : day.isToday
          ? '1px solid rgba(255,255,255,0.12)'
          : '1px solid rgba(255,255,255,0.04)',
        minWidth: '3.5rem',
      }}
    >
      <span
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)' }}
      >
        {day.dayName}
      </span>

      <span
        className="text-2xl leading-tight mt-1"
        style={{
          color: isSelected ? '#fff' : day.isToday ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
          fontWeight: day.isToday ? 300 : 200,
        }}
      >
        {day.dayNumber}
      </span>

      {/* Task dots */}
      <div className="flex gap-1 mt-2 h-1.5 items-center">
        {Array.from({ length: dots }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{
              background: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </motion.button>
  );
}
