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
        borderRadius: '0.5rem', opacity: 0.35,
      }}
      title="Maintenir pour déplacer"
    >
      {[0, 1].map(row => (
        <div key={row} style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map(col => (
            <div key={col} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
          ))}
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
        borderRadius: '1.4rem',
        background: isDragging ? 'rgba(255,255,255,0.07)' : 'rgba(8,5,20,0.55)',
        boxShadow: isDragging
          ? '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)'
          : '0 4px 24px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        willChange: isDragging ? 'transform' : 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0.75rem 0.9rem 0.4rem', gap: '0.4rem',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', flex: 1,
        }}>
          {title}
        </span>
        <GripDots dragControls={dragControls} />
        <div
          onClick={e => { e.stopPropagation(); onSettingsClick?.(); }}
          style={{ padding: '3px', opacity: 0.3, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Paramètres"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </div>
      </div>

      <div onClick={e => e.stopPropagation()} style={{ padding: '0 1rem 1rem' }}>
        {children}
      </div>
    </motion.div>
  );
}
