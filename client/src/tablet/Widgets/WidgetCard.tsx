import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  icon: ReactNode;
  accentColor?: string;
  children: ReactNode;
  wide?: boolean;
}

export function WidgetCard({ title, icon, accentColor = 'rgba(167,139,250,0.6)', children, wide }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      style={{
        gridColumn: wide ? 'span 2' : 'span 1',
        borderRadius: '1.5rem',
        background: 'rgba(12, 8, 28, 0.72)',
        backdropFilter: 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(0,0,0,0.3)`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        borderRadius: 999,
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '1rem 1.25rem 0.6rem',
      }}>
        <span style={{ color: accentColor, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{
          fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
        }}>
          {title}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        {children}
      </div>
    </motion.div>
  );
}
