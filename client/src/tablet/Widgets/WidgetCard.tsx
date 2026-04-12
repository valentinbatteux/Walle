import { ReactNode } from 'react';
import { motion, DragControls } from 'framer-motion';
import { WidgetId } from '../../types/widgets';

export const WIDGET_THEME: Record<WidgetId, { bg: string; glow: string }> = {
  weather:  { bg: 'rgba(3,105,161,0.88)',  glow: 'rgba(14,165,233,0.45)'  },
  tasks:    { bg: 'rgba(91,33,182,0.88)',  glow: 'rgba(124,58,237,0.45)'  },
  football: { bg: 'rgba(20,83,45,0.90)',   glow: 'rgba(22,163,74,0.45)'   },
  shopping: { bg: 'rgba(194,65,12,0.90)',  glow: 'rgba(234,88,12,0.45)'   },
  brocante: { bg: 'rgba(146,64,14,0.90)',  glow: 'rgba(217,119,6,0.45)'   },
};

// Grip handle rendered inside WidgetCard header
function GripDots({ dragControls }: { dragControls: DragControls }) {
  return (
    <div
      onPointerDown={e => { e.stopPropagation(); dragControls.start(e); }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 3, padding: '4px 8px', cursor: 'grab', touchAction: 'none',
        borderRadius: '0.5rem',
        opacity: 0.45,
      }}
      title="Maintenir pour déplacer"
    >
      {[0, 1].map(row => (
        <div key={row} style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map(col => (
            <div key={col} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />
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

export function WidgetCard({
  id, title, icon, children, wide, isDragging, dragControls, onSettingsClick,
}: Props) {
  const theme = WIDGET_THEME[id];

  return (
    <div
      onClick={onSettingsClick}
      style={{
        gridColumn: wide ? '1 / -1' : 'span 1',
        borderRadius: '1.4rem',
        background: theme.bg,
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: isDragging
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${theme.glow}`
          : `0 4px 32px rgba(0,0,0,0.45), 0 0 24px ${theme.glow}`,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
        transform: isDragging ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      }} />

      {/* Header row: icon+title | grip | settings gear */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0.75rem 0.9rem 0.4rem',
        gap: '0.4rem',
      }}>
        {/* Title */}
        <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{
          fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', flex: 1,
        }}>
          {title}
        </span>

        {/* Grip handle — stops click propagation so it doesn't open settings */}
        <GripDots dragControls={dragControls} />

        {/* Settings gear */}
        <div
          onClick={e => { e.stopPropagation(); onSettingsClick?.(); }}
          style={{ padding: '3px', opacity: 0.4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Paramètres"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </div>
      </div>

      {/* Content — stop propagation so inner interactions don't trigger settings */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ padding: '0 1rem 1rem' }}
      >
        {children}
      </div>
    </div>
  );
}
