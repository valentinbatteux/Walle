import { motion } from 'framer-motion';
import { useClock } from '../../hooks/useClock';
import { useTimeOfDay } from '../../hooks/useTimeOfDay';
import { BG_CONFIG } from '../Background/backgroundConfig';

export function ClockDisplay() {
  const { time, date, dayName } = useClock();
  const timeOfDay = useTimeOfDay();
  const { textColor } = BG_CONFIG[timeOfDay];

  return (
    <motion.div
      className="flex flex-col items-center select-none pointer-events-none"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      <motion.time
        className="font-thin tracking-tight leading-none tabular-nums"
        style={{
          fontSize: 'clamp(5rem, 18vw, 16rem)',
          color: textColor,
          textShadow: '0 0 80px rgba(255,255,255,0.08)',
          fontWeight: 100,
        }}
        animate={{ color: textColor }}
        transition={{ duration: 4 }}
      >
        {time}
      </motion.time>

      <motion.div
        className="flex items-center gap-3 mt-2"
        style={{ color: textColor, opacity: 0.65 }}
        animate={{ color: textColor }}
        transition={{ duration: 4 }}
      >
        <span
          className="font-light tracking-[0.25em] uppercase"
          style={{ fontSize: 'clamp(0.7rem, 1.4vw, 1.3rem)' }}
        >
          {dayName}
        </span>
        <span className="opacity-40">·</span>
        <span
          className="font-light tracking-[0.15em]"
          style={{ fontSize: 'clamp(0.7rem, 1.4vw, 1.3rem)' }}
        >
          {date}
        </span>
      </motion.div>
    </motion.div>
  );
}
