import { motion } from 'framer-motion';
import { useState } from 'react';

const PARTICLES = [
  { angle: 42,  r: 1.42, size: 2.5, delay: 0,    dur: 3.2 },
  { angle: 118, r: 1.55, size: 1.5, delay: 0.8,  dur: 4.1 },
  { angle: 195, r: 1.38, size: 2,   delay: 1.4,  dur: 3.6 },
  { angle: 268, r: 1.50, size: 1.5, delay: 0.4,  dur: 5.0 },
  { angle: 325, r: 1.60, size: 1,   delay: 1.8,  dur: 4.4 },
  { angle: 75,  r: 1.48, size: 1,   delay: 2.2,  dur: 3.8 },
];

interface Props {
  size?: number;
  onClick?: () => void;
}

export function WalleAvatar({ size = 180, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const half = size / 2;

  return (
    <motion.div
      style={{ width: size, height: size, position: 'relative', cursor: 'pointer' }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
    >
      {/* Outer ambient glow */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -size * 0.35,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(120,80,220,0.22) 0%, rgba(60,180,200,0.10) 45%, transparent 70%)`,
          filter: `blur(${size * 0.18}px)`,
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary color glow (teal) */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -size * 0.15,
          borderRadius: '50%',
          background: `radial-gradient(circle at 70% 30%, rgba(78,205,196,0.18) 0%, transparent 60%)`,
          filter: `blur(${size * 0.12}px)`,
          pointerEvents: 'none',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main sphere */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 38% 32%, rgba(180,130,255,0.35) 0%, transparent 50%),
                       radial-gradient(circle, #110820 30%, #2d0a50 70%, #1a0535 100%)`,
          boxShadow: hovered
            ? `0 0 ${size*0.4}px rgba(140,80,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`
            : `0 0 ${size*0.25}px rgba(100,60,200,0.35), inset 0 1px 0 rgba(255,255,255,0.12)`,
          transition: 'box-shadow 0.4s ease',
        }}
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Iridescent border ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: size * 0.018,
          background: `conic-gradient(from 0deg, #4ECDC4, #a78bfa, #f472b6, #60a5fa, #34d399, #4ECDC4)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: 0.9,
        }}
      />

      {/* Rotating shimmer on ring */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: size * 0.018,
          background: `conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.6) 15%, transparent 30%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Specular highlight */}
      <div style={{
        position: 'absolute',
        top: size * 0.12,
        left: size * 0.2,
        width: size * 0.28,
        height: size * 0.18,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 100%)',
        filter: `blur(${size * 0.03}px)`,
        pointerEvents: 'none',
      }} />

      {/* Eyes */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: size * 0.12,
      }}>
        {[0, 1].map(i => (
          <motion.div
            key={i}
            style={{
              width: size * 0.095,
              height: size * 0.22,
              borderRadius: size * 0.05,
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 0 8px rgba(255,255,255,0.6)',
              transformOrigin: 'center',
            }}
            animate={hovered
              ? { scaleY: 0.25, scaleX: 1.2 }
              : {
                  scaleY: [1, 1, 1, 0.08, 1, 1],
                  scaleX: [1, 1, 1, 1.3, 1, 1],
                }
            }
            transition={hovered
              ? { duration: 0.15 }
              : {
                  duration: 5,
                  repeat: Infinity,
                  times: [0, 0.82, 0.88, 0.90, 0.93, 1],
                  delay: i * 0.04,
                }
            }
          />
        ))}
      </div>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const cx = half + Math.cos(rad) * half * p.r;
        const cy = half + Math.sin(rad) * half * p.r;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: cx - p.size / 2,
              top: cy - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(160,220,255,0.9)' : 'rgba(200,160,255,0.9)',
              boxShadow: `0 0 ${p.size * 3}px ${i % 2 === 0 ? 'rgba(160,220,255,0.8)' : 'rgba(200,160,255,0.8)'}`,
            }}
            animate={{
              x: [0, Math.cos(rad + 0.5) * 8, 0],
              y: [0, Math.sin(rad + 0.5) * 8, 0],
              opacity: [0, 0.9, 0.5, 0.9, 0],
              scale: [0.5, 1.2, 0.8, 1, 0.5],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </motion.div>
  );
}
