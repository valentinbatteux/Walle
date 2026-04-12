import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { DynamicBackground } from './Background/DynamicBackground';
import { WalleAvatar } from './Avatar/WalleAvatar';
import { CalendarStrip } from './Calendar/CalendarStrip';
import { TaskPanel } from './TaskPanel/TaskPanel';
import { WidgetGrid } from './Widgets/WidgetGrid';
import { SettingsPanel } from './Settings/SettingsPanel';
import { WalleChat } from './Chat/WalleChat';
import { useClock } from '../hooks/useClock';
import { useWidgetConfig } from '../hooks/useWidgetConfig';

function TopClock({ onClick }: { onClick: () => void }) {
  const { time, date, dayName } = useClock();
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="fixed top-6 right-8 z-30 text-right select-none"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.75rem' }}
    >
      <motion.div
        whileHover={{ background: 'rgba(255,255,255,0.04)' }}
        style={{ borderRadius: '0.75rem', padding: '0.25rem 0.5rem' }}
      >
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
      </motion.div>
    </motion.button>
  );
}

/* Scroll hint arrow */
function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.5, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, delay: 3 }}
      style={{
        position: 'absolute', bottom: '7.5rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
        pointerEvents: 'none',
      }}
    >
      <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
        widgets
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}

const AVATAR_SIZE = 170;

export function TabletApp() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { widgets, sorted, toggle, update, reorder, swap, setColSpan, setRowHeight } = useWidgetConfig();

  const handleSelectDate = (date: string) => setSelectedDate(date || null);
  const handleClose = () => setSelectedDate(null);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <DynamicBackground />

      {/* Avatar: clic → ouvre le chat / reclic → ferme */}
      <WalleAvatar
        size={AVATAR_SIZE}
        chatMode={chatOpen}
        onClick={() => setChatOpen(o => !o)}
      />

      {/* Chat overlay */}
      <WalleChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        widgetConfig={widgets}
        avatarSize={AVATAR_SIZE}
      />

      {/* Fixed top clock — tapping opens settings */}
      <TopClock onClick={() => setSettingsOpen(s => !s)} />

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              onClick={() => setSettingsOpen(false)}
            />
            <SettingsPanel
              key="settings-panel"
              widgets={widgets}
              onClose={() => setSettingsOpen(false)}
              onToggle={toggle}
              onUpdate={update}
              onReorder={reorder}
            />
          </>
        )}
      </AnimatePresence>

      {/* ─── Screen 1: hero section ─── */}
      <div style={{
        position: 'relative', height: '100vh', display: 'flex',
        flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Empty center — avatar now roams freely across the screen */}
        <div style={{ flex: 1 }} />

        {/* Scroll hint */}
        <ScrollHint />

        {/* Calendar strip pinned to bottom of screen 1 */}
        <div style={{ flexShrink: 0 }}>
          <CalendarStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        </div>
      </div>

      {/* ─── Screen 2: Widget grid ─── */}
      <div style={{ position: 'relative' }}>
        {/* Section header */}
        <div style={{
          padding: '2rem 1.5rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))' }} />
          <span style={{
            fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          }}>
            Tableau de bord
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
        </div>

        <WidgetGrid
          widgets={sorted}
          widgetMap={widgets}
          onSwap={swap}
          onUpdate={update}
          onToggle={toggle}
          onColSpan={setColSpan}
          onRowHeight={setRowHeight}
        />
      </div>

      {/* Task panel overlay */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 20,
                backdropFilter: 'blur(3px)', background: 'rgba(0,0,0,0.25)',
              }}
              onClick={handleClose}
            />
            <TaskPanel key="panel" date={selectedDate} onClose={handleClose} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
