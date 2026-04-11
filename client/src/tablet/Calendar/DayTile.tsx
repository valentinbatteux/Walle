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
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex flex-col items-center flex-shrink-0 focus:outline-none"
      style={{
        minWidth: '3.8rem',
        padding: '0.65rem 0.85rem 0.55rem',
        borderRadius: '1.2rem',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(167,139,250,0.28), rgba(78,205,196,0.18))'
          : day.isToday
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isSelected
          ? '1px solid rgba(167,139,250,0.45)'
          : day.isToday
          ? '1px solid rgba(255,255,255,0.14)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isSelected
          ? '0 4px 24px rgba(140,100,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
          : day.isToday
          ? '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Day name */}
      <span style={{
        fontSize: '0.6rem',
        fontWeight: 500,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: isSelected ? 'rgba(200,185,255,0.95)' : 'rgba(255,255,255,0.38)',
      }}>
        {day.dayName}
      </span>

      {/* Day number */}
      <span style={{
        fontSize: '1.4rem',
        fontWeight: isSelected ? 300 : 200,
        lineHeight: 1.2,
        marginTop: '0.18rem',
        color: isSelected ? '#fff' : day.isToday ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.55)',
        textShadow: isSelected ? '0 0 16px rgba(200,180,255,0.5)' : 'none',
      }}>
        {day.dayNumber}
      </span>

      {/* Month label on 1st */}
      {day.dayNumber === 1 && (
        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginTop: '0.05rem' }}>
          {day.monthShort}
        </span>
      )}

      {/* Task dots */}
      <div className="flex gap-1 mt-1.5 h-1.5 items-center">
        {Array.from({ length: dots }).map((_, i) => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: '50%',
            background: isSelected
              ? 'rgba(200,185,255,0.9)'
              : 'rgba(255,255,255,0.35)',
            boxShadow: isSelected ? '0 0 6px rgba(200,185,255,0.6)' : 'none',
          }} />
        ))}
      </div>
    </motion.button>
  );
}
