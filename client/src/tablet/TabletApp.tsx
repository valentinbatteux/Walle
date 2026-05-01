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
    <button
      onClick={onClick}
      className="fixed top-6 right-8 z-30 text-right select-none"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem 0.6rem', borderRadius: '1rem' }}
    >
      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontStyle: 'italic',
        fontSize: '2rem',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.92)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {time}
      </div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: '0.62rem',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginTop: '0.3rem',
      }}>
        {dayName} · {date}
      </div>
    </button>
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
        autoStartVoice
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
            fontFamily: "'Barlow', sans-serif",
            fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
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
