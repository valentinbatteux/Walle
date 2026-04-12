import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
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

const SLEEP_AFTER = 4 * 60 * 1000;
const MARGIN = 60;
const WALL   = 130; // wall-avoidance activation distance

type Expr = 'idle' | 'curious' | 'happy' | 'sleepy' | 'blink' | 'wide' | 'sleeping';
interface Props { size?: number; onClick?: () => void; chatMode?: boolean; }

export function WalleAvatar({ size = 170, onClick, chatMode = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const [expr, setExpr]       = useState<Expr>('idle');
  const [sleeping, setSleeping] = useState(false);
  const [avatarScale, setAvatarScale] = useState(1);
  const half = size / 2;

  // Absolute viewport position — plain MotionValues, driven by RAF
  const posX = useMotionValue(window.innerWidth  / 2 - half);
  const posY = useMotionValue(window.innerHeight / 2 - half);

  // Eye springs
  const eyeXMv = useMotionValue(0);
  const eyeYMv = useMotionValue(0);
  // (keep springs for eyes only — they don't need 60fps updates)
  const eyeX = useSpring(eyeXMv, { stiffness: 55, damping: 16 });
  const eyeY = useSpring(eyeYMv, { stiffness: 55, damping: 16 });

  const { playChirp, playGreeting, playBlip, playQuestion } = useWalleSounds();
  const greetedRef    = useRef(false);
  const behaviourRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef        = useRef<number>(0);
  const chatModeRef   = useRef(chatMode);

  // Sync chatMode prop into ref so the RAF loop sees it without re-creating
  useEffect(() => { chatModeRef.current = chatMode; }, [chatMode]);

  // Physics state — mutable ref, no re-renders needed
  const physRef = useRef({
    x: window.innerWidth  / 2 - half,
    y: window.innerHeight / 2 - half,
    angle: Math.random() * Math.PI * 2,
    speed: 0.6,
  });

  // Viewport dims
  const vpW = useRef(window.innerWidth);
  const vpH = useRef(window.innerHeight);
  useEffect(() => {
    const onResize = () => { vpW.current = window.innerWidth; vpH.current = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sync sleeping state → physics speed
  useEffect(() => {
    physRef.current.speed = sleeping ? 0.15 : 0.6;
  }, [sleeping]);

  // ── RAF wandering loop (organic curved paths) ────────────────────────────────
  useEffect(() => {
    const loop = () => {
      const p = physRef.current;
      const W = vpW.current;
      const H = vpH.current;

      if (chatModeRef.current) {
        // Chat mode: smoothly spring toward left-center position
        const targetX = 20;
        const targetY = H / 2 - half;
        p.x += (targetX - p.x) * 0.07;
        p.y += (targetY - p.y) * 0.07;
      } else {
        // Normal wandering: gradual random angular drift → natural curves
        p.angle += (Math.random() * 2 - 1) * 0.02;

        // Wall avoidance: steer toward viewport center proportionally
        const toCenter = Math.atan2(H / 2 - p.y, W / 2 - p.x);
        const diff = ((toCenter - p.angle) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

        const lx = p.x - MARGIN;
        const rx = (W - size - MARGIN) - p.x;
        const ty = p.y - MARGIN;
        const by = (H - size - MARGIN) - p.y;

        const wallStrength = Math.max(
          lx < WALL ? (1 - lx / WALL) * 0.09 : 0,
          rx < WALL ? (1 - rx / WALL) * 0.09 : 0,
          ty < WALL ? (1 - ty / WALL) * 0.09 : 0,
          by < WALL ? (1 - by / WALL) * 0.09 : 0,
        );

        if (wallStrength > 0) {
          p.angle += Math.sign(diff) * Math.min(Math.abs(diff), wallStrength);
        }

        // Advance position
        p.x = Math.max(MARGIN, Math.min(W - size - MARGIN, p.x + Math.cos(p.angle) * p.speed));
        p.y = Math.max(MARGIN, Math.min(H - size - MARGIN, p.y + Math.sin(p.angle) * p.speed));
      }

      posX.set(p.x);
      posY.set(p.y);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [posX, posY, size, half]); // chatModeRef is a ref — no dep needed

  // ── Scroll-based scale ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const ratio = Math.min(window.scrollY / window.innerHeight, 1);
      setAvatarScale(1 - 0.55 * ratio);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Sleep management ─────────────────────────────────────────────────────────
  const resetSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleeping) {
      setSleeping(false);
      setExpr('idle');
      playBlip();
      eyeYMv.set(-size * 0.015);
      setTimeout(() => eyeYMv.set(0), 800);
    }
    sleepTimerRef.current = setTimeout(() => setSleeping(true), SLEEP_AFTER);
  }, [sleeping, playBlip, eyeYMv, size]);

  useEffect(() => {
    const wake = () => resetSleepTimer();
    window.addEventListener('pointerdown', wake, { passive: true });
    window.addEventListener('pointermove', wake, { passive: true });
    sleepTimerRef.current = setTimeout(() => setSleeping(true), SLEEP_AFTER);
    return () => {
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('pointermove', wake);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [resetSleepTimer]);

  // ── Behaviour scheduler (eye / expression only) ──────────────────────────────
  const scheduleBehaviour = useCallback(() => {
    const delay = sleeping
      ? 12000 + Math.random() * 18000
      : 3000  + Math.random() * 6000;

    behaviourRef.current = setTimeout(() => {
      if (sleeping) {
        if (Math.random() < 0.35) {
          eyeXMv.set((Math.random() - 0.5) * size * 0.015);
          setTimeout(() => eyeXMv.set(0), 1200);
        }
        if (Math.random() < 0.2) playBlip();
        scheduleBehaviour();
        return;
      }

      const roll = Math.random();
      if (roll < 0.20) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        eyeXMv.set(dir * size * 0.030);
        setExpr('curious'); playQuestion();
        setTimeout(() => { eyeXMv.set(0); setExpr('idle'); }, 2200);
      } else if (roll < 0.35) {
        eyeXMv.set(-size * 0.02); eyeYMv.set(-size * 0.022);
        setExpr('curious');
        setTimeout(() => { eyeXMv.set(0); eyeYMv.set(0); setExpr('idle'); }, 2500);
      } else if (roll < 0.48) {
        eyeYMv.set(size * 0.018); setExpr('sleepy');
        setTimeout(() => { eyeYMv.set(0); setExpr('idle'); }, 2000);
      } else if (roll < 0.60) {
        setExpr('blink');
        setTimeout(() => setExpr('idle'), 250);
        setTimeout(() => setExpr('blink'), 500);
        setTimeout(() => setExpr('idle'), 750);
      } else if (roll < 0.72) {
        setExpr('happy'); playBlip();
        setTimeout(() => setExpr('idle'), 900);
      } else if (roll < 0.82) {
        setExpr('wide');
        setTimeout(() => setExpr('idle'), 1200);
      } else {
        playBlip();
        eyeXMv.set((Math.random() - 0.5) * size * 0.014);
        setTimeout(() => eyeXMv.set(0), 700);
      }

      scheduleBehaviour();
    }, delay);
  }, [sleeping, size, eyeXMv, eyeYMv, playBlip, playQuestion]);

  useEffect(() => {
    scheduleBehaviour();
    return () => { if (behaviourRef.current) clearTimeout(behaviourRef.current); };
  }, [scheduleBehaviour]);

  // ── Click handler ─────────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    resetSleepTimer();
    if (!greetedRef.current) { greetedRef.current = true; playGreeting(); }
    else { playChirp(); }
    setExpr('happy');
    eyeYMv.set(-size * 0.018);
    setTimeout(() => { setExpr('idle'); eyeYMv.set(0); }, 800);
    onClick?.();
  }, [resetSleepTimer, playGreeting, playChirp, eyeYMv, size, onClick]);

  // ── Eye shape per expression ──────────────────────────────────────────────────
  const eyeScale = (() => {
    if (sleeping)          return { scaleY: 0.06, scaleX: 1.4  };
    if (hovered)           return { scaleY: 0.22, scaleX: 1.2  };
    if (expr === 'blink')  return { scaleY: 0.06, scaleX: 1.3  };
    if (expr === 'happy')  return { scaleY: 0.38, scaleX: 1.15 };
    if (expr === 'sleepy') return { scaleY: 0.48, scaleX: 0.92 };
    if (expr === 'curious')return { scaleY: 1.12, scaleX: 0.92 };
    if (expr === 'wide')   return { scaleY: 1.35, scaleX: 0.88 };
    return { scaleY: [1, 1, 1, 0.06, 1, 1], scaleX: [1, 1, 1, 1.35, 1, 1] };
  })();

  const eyeTransition = (i: number) =>
    (expr === 'idle' && !hovered && !sleeping)
      ? { duration: 5, repeat: Infinity, times: [0, 0.82, 0.88, 0.90, 0.93, 1], delay: i * 0.05 }
      : { duration: 0.2, ease: 'easeOut' };

  const breathDur = sleeping ? 7 : 3.5;
  const breathAmt = sleeping ? 1.008 : 1.025;

  return (
    // Outer: fixed position driven by RAF, scales with scroll
    <motion.div
      style={{
        position: 'fixed', left: 0, top: 0,
        x: posX, y: posY,
        scale: avatarScale,
        width: size, height: size,
        zIndex: 15,
        cursor: 'pointer',
        transformOrigin: 'center center',
        transition: 'transform 0.3s ease',
      }}
      onHoverStart={() => !sleeping && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      whileTap={{ scale: avatarScale * 0.95 }}
    >
      {/* Inner: breathing float, isolated from position */}
      <motion.div
        style={{ width: '100%', height: '100%', position: 'relative' }}
        animate={{ y: sleeping ? [0, -4, 0] : [0, -10, 0] }}
        transition={{ duration: sleeping ? 7 : 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Ambient glow */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: sleeping ? [0.25, 0.35, 0.25] : [0.7, 1, 0.7] }}
          transition={{ duration: sleeping ? 7 : 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -size * 0.35, borderRadius: '50%',
            background: sleeping
              ? `radial-gradient(circle, rgba(60,40,120,0.15) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(120,80,220,0.22) 0%, rgba(60,180,200,0.10) 45%, transparent 70%)`,
            filter: `blur(${size * 0.18}px)`, pointerEvents: 'none',
          }}
        />

        {/* Teal glow */}
        <motion.div
          style={{
            position: 'absolute', inset: -size * 0.15, borderRadius: '50%',
            background: `radial-gradient(circle at 70% 30%, rgba(78,205,196,0.18) 0%, transparent 60%)`,
            filter: `blur(${size * 0.12}px)`, pointerEvents: 'none', opacity: sleeping ? 0.2 : 1,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: sleeping ? 30 : 12, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main sphere */}
        <motion.div
          animate={{ scale: [1, breathAmt, 1] }}
          transition={{ duration: breathDur, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: sleeping
              ? `radial-gradient(circle, #0d0618 30%, #1a0530 70%, #0d0320 100%)`
              : `radial-gradient(circle at 38% 32%, rgba(180,130,255,0.35) 0%, transparent 50%),
                 radial-gradient(circle, #110820 30%, #2d0a50 70%, #1a0535 100%)`,
            boxShadow: sleeping
              ? `0 0 ${size*0.15}px rgba(60,30,120,0.2), inset 0 1px 0 rgba(255,255,255,0.06)`
              : `0 0 ${size*0.25}px rgba(100,60,200,0.35), inset 0 1px 0 rgba(255,255,255,0.12)`,
            transition: 'background 2s ease, box-shadow 1s ease',
          }}
        />

        {/* Iridescent ring */}
        <motion.div
          animate={{ opacity: sleeping ? 0.25 : 0.9 }}
          transition={{ duration: 2 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%', padding: size * 0.018,
            background: `conic-gradient(from 0deg, #4ECDC4, #a78bfa, #f472b6, #60a5fa, #34d399, #4ECDC4)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor', maskComposite: 'exclude',
          }}
        />

        {/* Shimmer ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: sleeping ? 12 : 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%', padding: size * 0.018,
            background: `conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.6) 15%, transparent 30%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor', maskComposite: 'exclude',
            opacity: sleeping ? 0.2 : 1,
          }}
        />

        {/* Specular */}
        <div style={{
          position: 'absolute', top: size * 0.12, left: size * 0.2,
          width: size * 0.28, height: size * 0.18, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 100%)',
          filter: `blur(${size * 0.03}px)`, pointerEvents: 'none', opacity: sleeping ? 0.4 : 1,
        }} />

        {/* Eyes */}
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
                background: sleeping ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.95)',
                boxShadow: sleeping ? 'none' : '0 0 8px rgba(255,255,255,0.6)',
                transformOrigin: 'center',
                x: eyeX, y: eyeY,
              }}
              animate={eyeScale}
              transition={eyeTransition(i)}
            />
          ))}
        </div>

        {/* Sleep zzz */}
        <AnimatePresence>
          {sleeping && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.7, 0], y: -size * 0.6, scale: [0.5, 1, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{
                position: 'absolute', right: size * 0.05, top: size * 0.1,
                fontSize: size * 0.14, color: 'rgba(180,140,255,0.7)',
                fontWeight: 300, pointerEvents: 'none',
              }}
            >
              z z
            </motion.div>
          )}
        </AnimatePresence>

        {/* Particles */}
        {PARTICLES.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const cx = half + Math.cos(rad) * half * p.r;
          const cy = half + Math.sin(rad) * half * p.r;
          return (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.cos(rad + 0.5) * 8, 0],
                y: [0, Math.sin(rad + 0.5) * 8, 0],
                opacity: sleeping ? [0, 0.2, 0] : [0, 0.9, 0.5, 0.9, 0],
                scale:   sleeping ? [0.3, 0.6, 0.3] : [0.5, 1.2, 0.8, 1, 0.5],
              }}
              transition={{ duration: sleeping ? p.dur * 2 : p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: cx - p.size / 2, top: cy - p.size / 2,
                width: p.size, height: p.size, borderRadius: '50%',
                background: i % 2 === 0 ? 'rgba(160,220,255,0.9)' : 'rgba(200,160,255,0.9)',
                boxShadow: `0 0 ${p.size * 3}px ${i % 2 === 0 ? 'rgba(160,220,255,0.8)' : 'rgba(200,160,255,0.8)'}`,
              }}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}
