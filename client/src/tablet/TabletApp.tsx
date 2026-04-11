import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DynamicBackground } from './Background/DynamicBackground';
import { ClockDisplay } from './Clock/ClockDisplay';
import { CalendarStrip } from './Calendar/CalendarStrip';
import { TaskPanel } from './TaskPanel/TaskPanel';
import { todayString } from './Calendar/calendarUtils';

export function TabletApp() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date || null);
  };

  const handleClose = () => setSelectedDate(null);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <DynamicBackground />

      {/* Main content: clock centered */}
      <div className="flex items-center justify-center h-full pb-32">
        <ClockDisplay />
      </div>

      {/* Today shortcut */}
      <AnimatePresence>
        {!selectedDate && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5 }}
            onClick={() => setSelectedDate(todayString())}
            className="fixed top-8 right-8 px-4 py-2 rounded-full text-xs font-light tracking-widest uppercase"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(10px)',
            }}
          >
            Aujourd'hui
          </motion.button>
        )}
      </AnimatePresence>

      {/* Calendar strip (bottom) */}
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {/* Task panel (slides up) */}
      <AnimatePresence>
        {selectedDate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
              onClick={handleClose}
            />
            <TaskPanel date={selectedDate} onClose={handleClose} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
