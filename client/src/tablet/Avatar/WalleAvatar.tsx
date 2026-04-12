import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useWalleSounds } from '../../hooks/useWalleSounds';

const PARTICLES = [
  { angle: 42,  r: 1.42, size: 2.5, delay: 0,   dur: 3.2 },
  { angle: 118, r: 1.55, size: 1.5, delay: 0.8, dur: 4.1 },
  { angle: 195, r: 1.38, size: 2,   delay: 1.4, dur: 3.6 },
  { angle: 268, r: 1.50, size: 1.5, delay: 0.4, dur: 5.0 },
  { angle: 325, r: 1.60, size: 1,   delay: 1.8, dur: 4.4 },
  { angle: 75,  r: 1.48, size: 1,   delay: 2.2, dur: 3.8 },
];

type Expression = 'idle' | 'curious' | 'blink' | 'happy' | 'sleepy';

interface Props { size?: number; onClick?: () => void; }

export function WalleAvatar({ size = 180, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const [expr, setExpr] = useState<Expression>('idle');
  const half = size / 2;

  // Eye gaze offset — springs for smooth movement
  const eyeX = useMotionValue(0);
  const eyeY = useMotionValue(0);
  const eyeSpringX = useSpring(eyeX, { stiffness: 60, damping: 18 });
  const eyeSpringY = useSpring(eyeY, { stiffness: 60, damping: 18 });

  // Body drift — adds a subtle random x wander on top of the float
  const bodyX = useMotionValue(0);
  const bodySpringX = useSpring(bodyX, { stiffness: 25, damping: 12 });

  const { playChirp, playGreeting, playBlip, playQuestion } = useWalleSounds();
  const greetedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = useCallback(() => {
    const delay = 4000 + Math.random() * 8000; // 4–12 s between behaviours
    timerRef.current = setTimeout(() => {
      const roll = Math.random();

      if (roll < 0.25) {
        // Look left or right
        const dir = Math.random() > 0.5 ? 1 : -1;
        eyeX.set(dir * (size * 0.025));
        eyeY.set(0);
        setExpr('curious');
        playQuestion();
        setTimeout(() => { eyeX.set(0); eyeY.set(0); setExpr('idle'); }, 1800);

      } else if (roll < 0.45) {
        // Look up-right (curious pose)
        eyeX.set(size * 0.022);
        eyeY.set(-size * 0.018);
        setExpr('curious');
        setTimeout(() => { eyeX.set(0); eyeY.set(0); setExpr('idle'); }, 2000);

      } else if (roll < 0.60) {
        // Double blink
        setExpr('blink');
        setTimeout(() => setExpr('idle'), 600);

      } else if (roll < 0.72) {
        // Subtle body drift
        const dx = (Math.random() - 0.5) * size * 0.12;
        bodyX.set(dx);
        setTimeout(() => bodyX.set(0), 3000);

      } else if (roll < 0.82) {
        // Happy — eyes go wide then squint
        setExpr('happy');
        playBlip();
        setTimeout(() => setExpr('idle'), 1000);

      } else if (roll < 0.90) {
        // Sleepy — slow squint
        setExpr('sleepy');
        setTimeout(() => setExpr('idle'), 3000);

      } else {
        // Idle blip sound only
        playBlip();
      }

      scheduleNext();
    }, delay);
  }, [eyeX, eyeY, bodyX, size, playBlip, playQuestion]);

  useEffect(() => {
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scheduleNext]);

  const handleClick = useCallback(() => {
    if (!greetedRef.current) {
      greetedRef.current = true;
      playGreeting();
    } else {
      playChirp();
    }
    // Eyes widen briefly on click
    eyeY.set(-size * 0.015);
    setExpr('happy');
    setTimeout(() => { eyeY.set(0); setExpr('idle'); }, 700);
    onClick?.();
  }, [onClick, playGreeting, playChirp, eyeY, size]);

  // Eye shape per expression
  const eyeAnim = (i: number) => {
    if (hovered)     return { scaleY: 0.25, scaleX: 1.2, y: 0 };
    if (expr === 'blink')  return { scaleY: 0.06, scaleX: 1.3, y: 0 };
    if (expr === 'happy')  return { scaleY: 0.4, scaleX: 1.15, y: -size * 0.01 };
    if (expr === 'sleepy') return { scaleY: 0.5, scaleX: 0.9, y: size * 0.008 };
    if (expr === 'curious') return { scaleY: 1.15, scaleX: 0.9, y: -size * 0.008 };
    // idle: keep blink keyframes running
    return {
      scaleY: [1, 1, 1, 0.07, 1, 1],
      scaleX: [1, 1, 1, 1.3, 1, 1],
      y: 0,
    };
  };

  const eyeTransition = (i: number) =>
    (expr === 'idle' && !hovered)
      ? { duration: 5, repeat: Infinity, times: [0, 0.82, 0.88, 0.9, 0.93, 1], delay: i * 0.04 }
      : { duration: 0.18, ease: 'easeOut' };

  return (
    <motion.div
      style={{ width: size, height: size, position: 'relative', cursor: 'pointer', x: bodySpringX }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer ambient glow */}
      <motion.div
        style={{
          position: 'absolute', inset: -size * 0.35, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(120,80,220,0.22) 0%, rgba(60,180,200,0.10) 45%, transparent 70%)`,
          filter: `blur(${size * 0.18}px)`, pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating teal secondary glow */}
      <motion.div
        style={{
          position: 'absolute', inset: -size * 0.15, borderRadius: '50%',
          background: `radial-gradient(circle at 70% 30%, rgba(78,205,196,0.18) 0%, transparent 60%)`,
          filter: `blur(${size * 0.12}px)`, pointerEvents: 'none',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main sphere */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `radial-gradient(circle at 38% 32%, rgba(180,130,255,0.35) 0%, transparent 50%),
                       radial-gradient(circle, #110820 30%, #2d0a50 70%, #1a0535 100%)`,
          boxShadow: hovered
            ? `0 0 ${size * 0.4}px rgba(140,80,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`
            : `0 0 ${size * 0.25}px rgba(100,60,200,0.35), inset 0 1px 0 rgba(255,255,255,0.12)`,
          transition: 'box-shadow 0.4s ease',
        }}
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Iridescent border ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', padding: size * 0.018,
        background: `conic-gradient(from 0deg, #4ECDC4, #a78bfa, #f472b6, #60a5fa, #34d399, #4ECDC4)`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude', opacity: 0.9,
      }} />

      {/* Rotating shimmer */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%', padding: size * 0.018,
          background: `conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.6) 15%, transparent 30%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Specular highlight */}
      <div style={{
        position: 'absolute', top: size * 0.12, left: size * 0.2,
        width: size * 0.28, height: size * 0.18, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 100%)',
        filter: `blur(${size * 0.03}px)`, pointerEvents: 'none',
      }} />

      {/* Eyes — with spring-based gaze offset */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: size * 0.12,
      }}>
        {[0, 1].map(i => (
          <motion.div
            key={i}
            style={{
              width: size * 0.095, height: size * 0.22,
              borderRadius: size * 0.05,
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 0 8px rgba(255,255,255,0.6)',
              transformOrigin: 'center',
              // Apply spring-driven gaze offset
              x: eyeSpringX,
              y: eyeSpringY,
            }}
            animate={eyeAnim(i)}
            transition={eyeTransition(i)}
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
              left: cx - p.size / 2, top: cy - p.size / 2,
              width: p.size, height: p.size, borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(160,220,255,0.9)' : 'rgba(200,160,255,0.9)',
              boxShadow: `0 0 ${p.size * 3}px ${i % 2 === 0 ? 'rgba(160,220,255,0.8)' : 'rgba(200,160,255,0.8)'}`,
            }}
            animate={{
              x: [0, Math.cos(rad + 0.5) * 8, 0],
              y: [0, Math.sin(rad + 0.5) * 8, 0],
              opacity: [0, 0.9, 0.5, 0.9, 0],
              scale: [0.5, 1.2, 0.8, 1, 0.5],
            }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        );
      })}
    </motion.div>
  );
}
