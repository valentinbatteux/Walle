import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

const SLEEP_AFTER = 4 * 60 * 1000;
const MARGIN = 60;
const WALL   = 130;

type Expr = 'idle' | 'curious' | 'happy' | 'sleepy' | 'blink' | 'wide' | 'sleeping';
interface Props { size?: number; onClick?: () => void; chatMode?: boolean; }

/* Star particles that drift around WALL-E */
const STARS = [
  { angle: 42,  r: 1.45, s: 1.8, delay: 0,   dur: 3.5 },
  { angle: 118, r: 1.58, s: 1.2, delay: 0.9, dur: 4.2 },
  { angle: 200, r: 1.40, s: 2.0, delay: 1.5, dur: 3.8 },
  { angle: 270, r: 1.52, s: 1.2, delay: 0.5, dur: 5.1 },
  { angle: 328, r: 1.62, s: 0.9, delay: 1.9, dur: 4.5 },
  { angle: 78,  r: 1.49, s: 0.9, delay: 2.3, dur: 3.9 },
];

export function WalleAvatar({ size = 170, onClick, chatMode = false }: Props) {
  const [expr, setExpr]       = useState<Expr>('idle');
  const [sleeping, setSleeping] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [avatarScale, setAvatarScale] = useState(1);
  const half = size / 2;

  const posX = useMotionValue(window.innerWidth  / 2 - half);
  const posY = useMotionValue(window.innerHeight / 2 - half);

  const eyeXMv = useMotionValue(0);
  const eyeYMv = useMotionValue(0);
  const eyeX   = useSpring(eyeXMv, { stiffness: 55, damping: 16 });
  const eyeY   = useSpring(eyeYMv, { stiffness: 55, damping: 16 });

  /* Clamp pupil offset to lens radius (≈2.8 units in viewBox coords) */
  const scale = size / 100;
  const pupilX = useTransform(eyeX, (v: number) => Math.max(-2.8 * scale, Math.min(2.8 * scale, v * 0.35)));
  const pupilY = useTransform(eyeY, (v: number) => Math.max(-2.8 * scale, Math.min(2.8 * scale, v * 0.35)));

  const behaviourRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef        = useRef<number>(0);
  const chatModeRef   = useRef(chatMode);
  useEffect(() => { chatModeRef.current = chatMode; }, [chatMode]);

  const physRef = useRef({
    x: window.innerWidth  / 2 - half,
    y: window.innerHeight / 2 - half,
    angle: Math.random() * Math.PI * 2,
    speed: 0.5,
  });

  const vpW = useRef(window.innerWidth);
  const vpH = useRef(window.innerHeight);
  useEffect(() => {
    const onResize = () => { vpW.current = window.innerWidth; vpH.current = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { physRef.current.speed = sleeping ? 0.12 : 0.5; }, [sleeping]);

  /* RAF wandering */
  useEffect(() => {
    const loop = () => {
      const p = physRef.current;
      const W = vpW.current;
      const H = vpH.current;

      if (chatModeRef.current) {
        const targetX = 20;
        const targetY = H / 2 - half;
        p.x += (targetX - p.x) * 0.07;
        p.y += (targetY - p.y) * 0.07;
      } else {
        p.angle += (Math.random() * 2 - 1) * 0.02;
        const toCenter = Math.atan2(H / 2 - p.y, W / 2 - p.x);
        const diff = ((toCenter - p.angle) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
        const lx = p.x - MARGIN, rx = (W - size - MARGIN) - p.x;
        const ty = p.y - MARGIN, by = (H - size - MARGIN) - p.y;
        const ws = Math.max(
          lx < WALL ? (1 - lx / WALL) * 0.09 : 0,
          rx < WALL ? (1 - rx / WALL) * 0.09 : 0,
          ty < WALL ? (1 - ty / WALL) * 0.09 : 0,
          by < WALL ? (1 - by / WALL) * 0.09 : 0,
        );
        if (ws > 0) p.angle += Math.sign(diff) * Math.min(Math.abs(diff), ws);
        p.x = Math.max(MARGIN, Math.min(W - size - MARGIN, p.x + Math.cos(p.angle) * p.speed));
        p.y = Math.max(MARGIN, Math.min(H - size - MARGIN, p.y + Math.sin(p.angle) * p.speed));
      }
      posX.set(p.x); posY.set(p.y);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [posX, posY, size, half]);

  /* Scroll scale */
  useEffect(() => {
    const onScroll = () => setAvatarScale(1 - 0.55 * Math.min(window.scrollY / window.innerHeight, 1));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Sleep */
  const resetSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleeping) { setSleeping(false); setExpr('idle'); eyeYMv.set(-size * 0.015); setTimeout(() => eyeYMv.set(0), 800); }
    sleepTimerRef.current = setTimeout(() => setSleeping(true), SLEEP_AFTER);
  }, [sleeping, eyeYMv, size]);

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

  /* Behaviour */
  const scheduleBehaviour = useCallback(() => {
    const delay = sleeping ? 12000 + Math.random() * 18000 : 3000 + Math.random() * 6000;
    behaviourRef.current = setTimeout(() => {
      if (sleeping) {
        if (Math.random() < 0.35) { eyeXMv.set((Math.random() - 0.5) * size * 0.012); setTimeout(() => eyeXMv.set(0), 1200); }
        scheduleBehaviour(); return;
      }
      const roll = Math.random();
      if (roll < 0.20) {
        eyeXMv.set((Math.random() > 0.5 ? 1 : -1) * size * 0.025);
        setExpr('curious'); setTimeout(() => { eyeXMv.set(0); setExpr('idle'); }, 2200);
      } else if (roll < 0.35) {
        eyeXMv.set(-size * 0.018); eyeYMv.set(-size * 0.020);
        setExpr('curious'); setTimeout(() => { eyeXMv.set(0); eyeYMv.set(0); setExpr('idle'); }, 2500);
      } else if (roll < 0.48) {
        eyeYMv.set(size * 0.016); setExpr('sleepy'); setTimeout(() => { eyeYMv.set(0); setExpr('idle'); }, 2000);
      } else if (roll < 0.60) {
        setExpr('blink'); setTimeout(() => setExpr('idle'), 250);
        setTimeout(() => setExpr('blink'), 500); setTimeout(() => setExpr('idle'), 750);
      } else if (roll < 0.72) {
        setExpr('happy'); setTimeout(() => setExpr('idle'), 900);
      } else if (roll < 0.82) {
        setExpr('wide'); setTimeout(() => setExpr('idle'), 1200);
      } else {
        eyeXMv.set((Math.random() - 0.5) * size * 0.012); setTimeout(() => eyeXMv.set(0), 700);
      }
      scheduleBehaviour();
    }, delay);
  }, [sleeping, size, eyeXMv, eyeYMv]);

  useEffect(() => {
    scheduleBehaviour();
    return () => { if (behaviourRef.current) clearTimeout(behaviourRef.current); };
  }, [scheduleBehaviour]);

  const handleClick = useCallback(() => {
    resetSleepTimer(); setExpr('happy');
    eyeYMv.set(-size * 0.016); setTimeout(() => { setExpr('idle'); eyeYMv.set(0); }, 800);
    onClick?.();
  }, [resetSleepTimer, eyeYMv, size, onClick]);

  /* Eye expression → lens scaleY/scaleX */
  const eyeScale = (() => {
    if (sleeping || expr === 'sleeping') return { scaleY: 0.06, scaleX: 1.4  };
    if (hovered)                         return { scaleY: 0.22, scaleX: 1.15 };
    if (expr === 'blink')                return { scaleY: 0.06, scaleX: 1.3  };
    if (expr === 'happy')                return { scaleY: 0.38, scaleX: 1.12 };
    if (expr === 'sleepy')               return { scaleY: 0.50, scaleX: 0.90 };
    if (expr === 'curious')              return { scaleY: 1.10, scaleX: 0.90 };
    if (expr === 'wide')                 return { scaleY: 1.32, scaleX: 0.88 };
    return { scaleY: [1,1,1,0.06,1,1], scaleX: [1,1,1,1.35,1,1] };
  })();
  const eyeTrans = (i: number) =>
    (expr === 'idle' && !hovered && !sleeping)
      ? { duration: 5, repeat: Infinity, times: [0,0.82,0.88,0.90,0.93,1], delay: i * 0.05 }
      : { duration: 0.18, ease: 'easeOut' };

  /* Eye housing tilt per expression */
  const leftTilt  = expr === 'curious' ? -14 : expr === 'happy' ? 8 : expr === 'sleepy' ? 6 : 0;
  const rightTilt = expr === 'curious' ?  14 : expr === 'happy' ? -8 : expr === 'sleepy' ? 6 : 0;

  const vb = 100; // viewBox width = 100 (arbitrary units, SVG handles the rest)

  return (
    <motion.div
      style={{ position: 'fixed', left: 0, top: 0, x: posX, y: posY, scale: avatarScale, width: size, height: size, zIndex: 15, cursor: 'pointer', transformOrigin: 'center center' }}
      onHoverStart={() => !sleeping && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      whileTap={{ scale: avatarScale * 0.94 }}
    >
      <motion.div
        style={{ width: '100%', height: '100%', position: 'relative' }}
        animate={{ y: sleeping ? [0,-3,0] : [0,-7,0] }}
        transition={{ duration: sleeping ? 7 : 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Green neon ground glow */}
        <motion.div
          animate={{ opacity: sleeping ? [0.1,0.18,0.1] : [0.25,0.45,0.25] }}
          transition={{ duration: sleeping ? 7 : 3, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: -size*0.05, left: size*0.08, right: size*0.08, height: size*0.12,
            background: 'radial-gradient(ellipse, rgba(111,255,0,0.35) 0%, transparent 70%)',
            filter: `blur(${size*0.09}px)`, pointerEvents: 'none',
          }}
        />

        {/* Star particles orbiting WALL-E */}
        {STARS.map((st, i) => {
          const rad = (st.angle * Math.PI) / 180;
          const cx = half + Math.cos(rad) * half * st.r;
          const cy = half + Math.sin(rad) * half * st.r;
          return (
            <motion.div key={i}
              animate={{
                x: [0, Math.cos(rad + 0.5) * 7, 0],
                y: [0, Math.sin(rad + 0.5) * 7, 0],
                opacity: sleeping ? [0,0.15,0] : [0,0.75,0.4,0.75,0],
                scale:   sleeping ? [0.3,0.5,0.3] : [0.4,1.1,0.7,1,0.4],
              }}
              transition={{ duration: sleeping ? st.dur*2 : st.dur, repeat: Infinity, delay: st.delay, ease: 'easeInOut' }}
              style={{
                position: 'absolute', left: cx - st.s/2, top: cy - st.s/2,
                width: st.s, height: st.s, borderRadius: '50%',
                background: i%2===0 ? 'rgba(111,255,0,0.85)' : 'rgba(200,255,160,0.9)',
                boxShadow: `0 0 ${st.s*3}px rgba(111,255,0,0.7)`,
              }}
            />
          );
        })}

        {/* ── WALL-E SVG ── */}
        <svg
          width={size} height={size}
          viewBox={`0 0 ${vb} 115`}
          style={{ overflow: 'visible', filter: sleeping ? 'brightness(0.7)' : 'none', transition: 'filter 1.5s ease' }}
        >
          <defs>
            <linearGradient id="wbody" x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%"   stopColor="#9A8252" />
              <stop offset="45%"  stopColor="#6E5635" />
              <stop offset="100%" stopColor="#3C2C16" />
            </linearGradient>
            <linearGradient id="wbodyR" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"  stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
            </linearGradient>
            <linearGradient id="whouse" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3A3225" />
              <stop offset="100%" stopColor="#1A1510" />
            </linearGradient>
            <linearGradient id="wtrack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#252525" />
              <stop offset="100%" stopColor="#0C0C0C" />
            </linearGradient>
            <radialGradient id="wlens" cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stopColor="rgba(111,255,0,0.55)" />
              <stop offset="45%"  stopColor="#0F2200" />
              <stop offset="100%" stopColor="#050800" />
            </radialGradient>
            <filter id="eyeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.8" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="bodyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── TANK TREADS ── */}
          {/* Left tread */}
          <rect x="4"  y="80" width="34" height="26" rx="13" fill="url(#wtrack)" />
          {[0,1,2,3].map(k => <rect key={k} x={7+k*7}  y={82} width={5} height={22} rx={2} fill="rgba(255,255,255,0.05)" />)}
          <circle cx="10"  cy="93" r="9"  fill="#141414" stroke="#2a2a2a" strokeWidth="1.5" />
          <circle cx="30"  cy="93" r="9"  fill="#141414" stroke="#2a2a2a" strokeWidth="1.5" />
          <circle cx="10"  cy="93" r="4"  fill="#1e1e1e" />
          <circle cx="30"  cy="93" r="4"  fill="#1e1e1e" />
          {/* Right tread */}
          <rect x="62" y="80" width="34" height="26" rx="13" fill="url(#wtrack)" />
          {[0,1,2,3].map(k => <rect key={k} x={65+k*7} y={82} width={5} height={22} rx={2} fill="rgba(255,255,255,0.05)" />)}
          <circle cx="70" cy="93" r="9"  fill="#141414" stroke="#2a2a2a" strokeWidth="1.5" />
          <circle cx="90" cy="93" r="9"  fill="#141414" stroke="#2a2a2a" strokeWidth="1.5" />
          <circle cx="70" cy="93" r="4"  fill="#1e1e1e" />
          <circle cx="90" cy="93" r="4"  fill="#1e1e1e" />
          {/* Tread top shimmer */}
          <ellipse cx="21" cy="80" rx="17" ry="3" fill="rgba(255,255,255,0.04)" />
          <ellipse cx="79" cy="80" rx="17" ry="3" fill="rgba(255,255,255,0.04)" />

          {/* ── MAIN BODY ── */}
          {/* Drop shadow */}
          <rect x="14" y="48" width="72" height="36" rx="5" fill="rgba(0,0,0,0.5)" transform="translate(2,2)" />
          {/* Body */}
          <rect x="14" y="46" width="72" height="36" rx="5" fill="url(#wbody)" />
          {/* Side highlight */}
          <rect x="14" y="46" width="72" height="36" rx="5" fill="url(#wbodyR)" />
          {/* Top sheen */}
          <rect x="16" y="46" width="68" height="7"  rx="4" fill="rgba(255,255,255,0.09)" />
          {/* Bottom shadow */}
          <rect x="16" y="75" width="68" height="7"  rx="2" fill="rgba(0,0,0,0.3)" />
          {/* Chest compression panel */}
          <rect x="22" y="52" width="56" height="22" rx="3" fill="rgba(0,0,0,0.30)" />
          <rect x="24" y="54" width="52" height="18" rx="2" fill="#1E1608" />
          {[0,1,2].map(k => (
            <g key={k}>
              <rect x={27+k*17} y={56} width={14} height={14} rx={1.5} fill="#130F06" />
              <rect x={29+k*17} y={58} width={10} height={4}  rx={1}   fill="rgba(111,255,0,0.12)" />
            </g>
          ))}
          {/* Side ribs */}
          <rect x="15" y="50" width="4" height="28" rx="2" fill="rgba(0,0,0,0.28)" />
          <rect x="81" y="50" width="4" height="28" rx="2" fill="rgba(0,0,0,0.28)" />
          {/* Side solar-cell strip (left) */}
          {[0,1,2].map(k => <rect key={k} x={16} y={52+k*8} width={3} height={6} rx={1} fill="rgba(111,255,0,0.10)" />)}

          {/* ── NECK ── */}
          <rect x="30" y="38" width="40" height="12" rx="4" fill="#2A2418" />
          <rect x="32" y="39" width="36" height="5"  rx="2" fill="rgba(255,255,255,0.06)" />
          {/* Neck bolts */}
          <circle cx="35" cy="44" r="1.5" fill="#1A140A" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <circle cx="65" cy="44" r="1.5" fill="#1A140A" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

          {/* ── EYE HOUSINGS ── */}
          {/* === LEFT EYE === */}
          <motion.g
            animate={{ rotate: leftTilt }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ originX: '31px', originY: '24px' } as React.CSSProperties}
          >
            {/* Housing outer */}
            <rect x="17" y="6"  width="28" height="34" rx="9" fill="url(#whouse)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            {/* Housing top sheen */}
            <rect x="19" y="7"  width="24" height="7"  rx="5" fill="rgba(255,255,255,0.07)" />
            {/* Housing bottom screw line */}
            <rect x="21" y="36" width="20" height="2"  rx="1" fill="rgba(0,0,0,0.4)" />
            {/* Lens bezel */}
            <circle cx="31" cy="24" r="12" fill="#080804" />
            {/* Lens glass */}
            <circle cx="31" cy="24" r="10" fill="url(#wlens)" filter="url(#bodyGlow)" />
            {/* Iris ring */}
            <circle cx="31" cy="24" r="7"  fill="none" stroke="rgba(111,255,0,0.45)" strokeWidth="0.8" />
            {/* Inner pupil area */}
            <circle cx="31" cy="24" r="4.5" fill="rgba(5,10,0,0.85)" />
            {/* Lens expression group — scales with eyeScale */}
            <motion.g
              animate={eyeScale}
              transition={eyeTrans(0)}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' } as React.CSSProperties}
            >
              {/* Pupil glow */}
              <motion.circle cx="31" cy="24" r="2.8" fill="rgba(111,255,0,0.92)" filter="url(#eyeGlow)"
                style={{ x: pupilX, y: pupilY }} />
              {/* Specular highlight */}
              <motion.circle cx="26.5" cy="20" r="1.5" fill="rgba(255,255,255,0.65)"
                style={{ x: useTransform(eyeX, v => v * 0.1), y: useTransform(eyeY, v => v * 0.1) }} />
            </motion.g>
          </motion.g>

          {/* === RIGHT EYE === */}
          <motion.g
            animate={{ rotate: rightTilt }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ originX: '69px', originY: '24px' } as React.CSSProperties}
          >
            <rect x="55" y="6"  width="28" height="34" rx="9" fill="url(#whouse)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <rect x="57" y="7"  width="24" height="7"  rx="5" fill="rgba(255,255,255,0.07)" />
            <rect x="59" y="36" width="20" height="2"  rx="1" fill="rgba(0,0,0,0.4)" />
            <circle cx="69" cy="24" r="12" fill="#080804" />
            <circle cx="69" cy="24" r="10" fill="url(#wlens)" filter="url(#bodyGlow)" />
            <circle cx="69" cy="24" r="7"  fill="none" stroke="rgba(111,255,0,0.45)" strokeWidth="0.8" />
            <circle cx="69" cy="24" r="4.5" fill="rgba(5,10,0,0.85)" />
            <motion.g
              animate={eyeScale}
              transition={eyeTrans(1)}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' } as React.CSSProperties}
            >
              <motion.circle cx="69" cy="24" r="2.8" fill="rgba(111,255,0,0.92)" filter="url(#eyeGlow)"
                style={{ x: pupilX, y: pupilY }} />
              <motion.circle cx="64.5" cy="20" r="1.5" fill="rgba(255,255,255,0.65)"
                style={{ x: useTransform(eyeX, v => v * 0.1), y: useTransform(eyeY, v => v * 0.1) }} />
            </motion.g>
          </motion.g>
        </svg>

        {/* Sleep zzz */}
        <AnimatePresence>
          {sleeping && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0,0.7,0], y: -size*0.55, scale: [0.5,1,0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{
                position: 'absolute', right: size*0.08, top: size*0.12,
                fontSize: size*0.13, color: 'rgba(111,255,0,0.55)',
                fontFamily: "'Barlow', sans-serif", fontWeight: 300, pointerEvents: 'none',
              }}
            >z z</motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
