import { motion, AnimatePresence } from 'framer-motion';
import { useTimeOfDay } from '../../hooks/useTimeOfDay';
import { BG_CONFIG } from './backgroundConfig';

export function DynamicBackground() {
  const timeOfDay = useTimeOfDay();
  const config = BG_CONFIG[timeOfDay];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={timeOfDay}
        className="fixed inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
        style={{ background: config.base }}
      >
        {/* Animated orb 1 */}
        <motion.div
          className="absolute w-[60vw] h-[60vw] rounded-full"
          style={{
            background: config.orb1,
            top: '-10%',
            left: '-5%',
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 25, 0],
            scale: [1, 1.08, 0.94, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Animated orb 2 */}
        <motion.div
          className="absolute w-[50vw] h-[50vw] rounded-full"
          style={{
            background: config.orb2,
            bottom: '10%',
            right: '-10%',
          }}
          animate={{
            x: [0, -35, 15, 0],
            y: [0, 25, -20, 0],
            scale: [1, 0.92, 1.06, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Animated orb 3 */}
        <motion.div
          className="absolute w-[40vw] h-[40vw] rounded-full"
          style={{
            background: config.orb3,
            top: '40%',
            left: '40%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -15, 20, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Subtle noise overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
