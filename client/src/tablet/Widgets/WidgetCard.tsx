import { ReactNode } from 'react';
import { motion, DragControls } from 'framer-motion';
import { WidgetId } from '../../types/widgets';

function GripDots({ dragControls }: { dragControls: DragControls }) {
  return (
    <div
      onPointerDown={e => { e.stopPropagation(); dragControls.start(e); }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 3, padding: '4px 8px', cursor: 'grab', touchAction: 'none',
        borderRadius: '0.5rem', opacity: 0.3,
      }}
      title="Maintenir pour déplacer"
    >
      {[0,1].map(r => (
        <div key={r} style={{ display: 'flex', gap: 3 }}>
          {[0,1,2].map(c => <div key={c} style={{ width: 3, height: 3, borderRadius: '50%', background: '#EFF4FF' }} />)}
        </div>
      ))}
    </div>
  );
}

interface Props {
  id: WidgetId;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  wide?: boolean;
  isDragging?: boolean;
  dragControls: DragControls;
  onSettingsClick?: () => void;
}

export function WidgetCard({ id: _id, title, icon, children, wide, isDragging, dragControls, onSettingsClick }: Props) {
  return (
    <motion.div
      onClick={onSettingsClick}
      className="liquid-glass"
      animate={{ scale: isDragging ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        gridColumn: wide ? '1 / -1' : 'span 1',
        borderRadius: 32,
        background: isDragging ? 'rgba(255,255,255,0.06)' : 'rgba(1,8,40,0.7)',
        boxShadow: isDragging
          ? '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(111,255,0,0.2)'
          : '0 4px 24px rgba(0,0,0,0.6)',
        cursor: 'pointer',
        willChange: isDragging ? 'transform' : 'auto',
        padding: 18,
        transition: 'background 0.2s ease',
      }}
      whileHover={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ color: '#6FFF00', display: 'flex', alignItems: 'center', opacity: 0.8 }}>{icon}</span>
        <span style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: '0.65rem', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(239,244,255,0.45)', flex: 1,
        }}>{title}</span>
        <GripDots dragControls={dragControls} />
        <div
          onClick={e => { e.stopPropagation(); onSettingsClick?.(); }}
          style={{ padding: 3, opacity: 0.28, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Paramètres"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EFF4FF" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </div>
      </div>

      {/* Neon separator */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(111,255,0,0.4) 0%, rgba(111,255,0,0) 100%)', marginBottom: 12 }} />

      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>

      {/* Bottom neon score bar — NFT card style */}
      <div className="liquid-glass" style={{
        borderRadius: 20, padding: '10px 14px', marginTop: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(239,244,255,0.55)' }}>
          Walle · Dashboard
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6FFF00, #3a9900)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(111,255,0,0.45)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#010828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
