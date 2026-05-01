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

const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4';

/* ── Navbar ───────────────────────────────────────────────────────────────── */
function Navbar({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { time, date } = useClock();
  return (
    <div style={{
      position: 'fixed', top: 20, left: 0, right: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
    }}>
      {/* Logo */}
      <span style={{
        fontFamily: "'Anton', sans-serif",
        fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#EFF4FF',
      }}>Walle.AI</span>

      {/* Center nav pill */}
      <div className="liquid-glass" style={{
        borderRadius: 999, padding: '10px 28px',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        {['Accueil','Widgets','Météo','Foot','Agenda'].map(link => (
          <span key={link} style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(239,244,255,0.7)', cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#6FFF00')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,244,255,0.7)')}
          >{link}</span>
        ))}
      </div>

      {/* Clock / Settings trigger */}
      <button onClick={onSettingsClick} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', padding: 0 }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: '#EFF4FF', letterSpacing: '0.04em', lineHeight: 1 }}>{time}</div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 9, color: 'rgba(239,244,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 3 }}>{date}</div>
      </button>
    </div>
  );
}

/* ── Hero heading ─────────────────────────────────────────────────────────── */
function HeroHeading() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <h1 style={{
        fontFamily: "'Anton', sans-serif",
        fontSize: 'clamp(2rem, 7vw, 5.5rem)',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        lineHeight: 1.0,
        color: '#EFF4FF',
        margin: 0,
        maxWidth: 680,
      }}>
        Beyond earth<br />
        and (its)<br />
        familiar space
      </h1>
      {/* Condiment accent */}
      <span style={{
        fontFamily: "'Condiment', cursive",
        fontSize: 'clamp(1.2rem, 3.5vw, 3rem)',
        color: '#6FFF00',
        position: 'absolute',
        right: '-5%',
        bottom: '18%',
        transform: 'rotate(-2deg)',
        mixBlendMode: 'exclusion',
        opacity: 0.9,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}>Your AI companion</span>
    </div>
  );
}

/* ── Widget section header ────────────────────────────────────────────────── */
function SectionHeader() {
  return (
    <div style={{ padding: '3rem 1.5rem 1.5rem', position: 'relative' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginLeft: '5%' }}>
        <h2 style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(2rem, 6vw, 4.5rem)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: 0.95,
          color: '#EFF4FF',
          margin: 0,
        }}>
          Collection of<br />
          <span style={{ marginLeft: '8%', display: 'inline-block' }}>
            <span style={{ fontFamily: "'Condiment', cursive", color: '#6FFF00', textTransform: 'none', letterSpacing: 0 }}>
              smart{' '}
            </span>
            widgets
          </span>
        </h2>
        {/* Neon underline */}
        <div style={{ height: 6, background: '#6FFF00', marginTop: 10, borderRadius: 999 }} />
      </div>
    </div>
  );
}

const AVATAR_SIZE = 160;

export function TabletApp() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { widgets, sorted, toggle, update, reorder, swap, setColSpan, setRowHeight } = useWidgetConfig();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#010828' }}>
      <DynamicBackground />

      {/* Fixed navbar */}
      <Navbar onSettingsClick={() => setSettingsOpen(s => !s)} />

      {/* WALL-E roams freely */}
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

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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

      {/* ─── Section 1: Hero with video background ─── */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', borderRadius: '0 0 32px 32px' }}>
        {/* Looping video */}
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          src={HERO_VIDEO}
        />
        {/* Subtle dark gradient overlay to make text readable */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(1,8,40,0.72) 0%, rgba(1,8,40,0.25) 60%, rgba(1,8,40,0.55) 100%)' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Spacer for navbar */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', padding: '0 6% 3%' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            >
              <HeroHeading />
            </motion.div>
          </div>

          {/* Calendar strip at bottom of hero */}
          <div style={{ flexShrink: 0 }}>
            <CalendarStrip selectedDate={selectedDate} onSelectDate={d => setSelectedDate(d || null)} />
          </div>
        </div>
      </div>

      {/* ─── Section 2: Widget grid ─── */}
      <div style={{ position: 'relative', background: '#010828' }}>
        <SectionHeader />
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 20, backdropFilter: 'blur(3px)', background: 'rgba(1,8,40,0.5)' }}
              onClick={() => setSelectedDate(null)}
            />
            <TaskPanel key="panel" date={selectedDate} onClose={() => setSelectedDate(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
