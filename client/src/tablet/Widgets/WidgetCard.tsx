import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { WidgetId } from '../../types/widgets';

export const WIDGET_THEME: Record<WidgetId, {
  bg: string; glow: string;
}> = {
  weather:  { bg: 'rgba(3,105,161,0.88)',  glow: 'rgba(14,165,233,0.45)'  },
  tasks:    { bg: 'rgba(91,33,182,0.88)',  glow: 'rgba(124,58,237,0.45)'  },
  football: { bg: 'rgba(20,83,45,0.90)',   glow: 'rgba(22,163,74,0.45)'   },
  shopping: { bg: 'rgba(194,65,12,0.90)',  glow: 'rgba(234,88,12,0.45)'   },
  brocante: { bg: 'rgba(146,64,14,0.90)',  glow: 'rgba(217,119,6,0.45)'   },
};

interface Props {
  id: WidgetId;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  wide?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  onSelect?: () => void;
}

export function WidgetCard({ id, title, icon, children, wide, selected, dimmed, onSelect }: Props) {
  const theme = WIDGET_THEME[id];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{
        opacity: dimmed ? 0.45 : 1,
        scale: selected ? 1.03 : 1,
        filter: dimmed ? 'brightness(0.6)' : 'brightness(1)',
      }}
      exit={{ opacity: 0, scale: 0.93 }}
      transition={{ type: 'spring', damping: 26, stiffness: 240 }}
      onClick={onSelect}
      style={{
        gridColumn: wide ? '1 / -1' : 'span 1',
        borderRadius: '1.4rem',
        background: theme.bg,
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        border: selected
          ? '1.5px solid rgba(255,255,255,0.75)'
          : '1px solid rgba(255,255,255,0.12)',
        boxShadow: selected
          ? `0 0 0 2px rgba(255,255,255,0.5), 0 8px 48px ${theme.glow}, 0 0 60px ${theme.glow}`
          : `0 4px 32px rgba(0,0,0,0.5), 0 0 28px ${theme.glow}`,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      }} />

      {/* Selected pulse */}
      {selected && (
        <motion.div
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{
            position: 'absolute', inset: -2, borderRadius: '1.5rem',
            border: '2px solid rgba(255,255,255,0.55)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1.1rem 0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>{icon}</span>
          <span style={{
            fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          }}>
            {title}
          </span>
        </div>
        {selected && (
          <span style={{
            fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.15)',
            borderRadius: 999, padding: '0.15rem 0.55rem',
          }}>
            Choisir emplacement
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '0 1.1rem 1.1rem' }}>
        {children}
      </div>
    </motion.div>
  );
}
