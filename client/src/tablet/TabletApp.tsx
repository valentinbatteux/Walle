import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { DynamicBackground } from './Background/DynamicBackground';
import { WalleAvatar } from './Avatar/WalleAvatar';
import { CalendarStrip } from './Calendar/CalendarStrip';
import { TaskPanel } from './TaskPanel/TaskPanel';
import { todayString } from './Calendar/calendarUtils';
import { useClock } from '../hooks/useClock';

function TopClock() {
  const { time, date, dayName } = useClock();
  return (
    <div className="fixed top-6 right-8 z-20 text-right select-none pointer-events-none">
      <div style={{
        fontSize: '1.6rem',
        fontWeight: 200,
        color: 'rgba(255,255,255,0.88)',
        letterSpacing: '0.04em',
        lineHeight: 1,
        textShadow: '0 0 20px rgba(160,130,255,0.4)',
      }}>
        {time}
      </div>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 300,
        color: 'rgba(255,255,255,0.40)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginTop: '0.3rem',
      }}>
        {dayName} · {date}
      </div>
    </div>
  );
}

export function TabletApp() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleSelectDate = (date: string) => setSelectedDate(date || null);
  const handleClose = () => setSelectedDate(null);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <DynamicBackground />
      <TopClock />

      {/* Centered avatar */}
      <div className="flex items-center justify-center h-full pb-28">
        <div className="flex flex-col items-center gap-6">
          <WalleAvatar
            size={200}
            onClick={() => setSelectedDate(todayString())}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              fontSize: '0.72rem',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Touchez pour commencer
          </motion.p>
        </div>
      </div>

      {/* Calendar strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} />

      {/* Task panel */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              style={{ backdropFilter: 'blur(3px)', background: 'rgba(0,0,0,0.25)' }}
              onClick={handleClose}
            />
            <TaskPanel key="panel" date={selectedDate} onClose={handleClose} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
