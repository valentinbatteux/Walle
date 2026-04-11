import { motion, AnimatePresence } from 'framer-motion';
import { useTimeOfDay } from '../../hooks/useTimeOfDay';

const BG: Record<string, { base: string; a: string; b: string }> = {
  dawn:  { base: '#0d0608', a: 'rgba(180,60,40,0.18)',   b: 'rgba(120,40,80,0.12)' },
  day:   { base: '#050810', a: 'rgba(40,80,180,0.16)',   b: 'rgba(30,120,160,0.10)' },
  dusk:  { base: '#080510', a: 'rgba(140,40,160,0.18)',  b: 'rgba(200,60,80,0.12)' },
  night: { base: '#030408', a: 'rgba(60,40,140,0.14)',   b: 'rgba(20,60,120,0.08)' },
};

export function DynamicBackground() {
  const tod = useTimeOfDay();
  const bg = BG[tod];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tod}
        className="fixed inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 5 }}
        style={{ background: bg.base }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '70vw', height: '70vw',
            top: '-20%', left: '-10%',
            background: `radial-gradient(circle, ${bg.a} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw',
            bottom: '5%', right: '-10%',
            background: `radial-gradient(circle, ${bg.b} 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
          animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
