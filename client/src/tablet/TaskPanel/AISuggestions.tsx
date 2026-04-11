import { motion, AnimatePresence } from 'framer-motion';
import { AISuggestion } from '../../types';

interface Props {
  suggestions: AISuggestion[];
  loading: boolean;
  onAccept: (s: AISuggestion) => void;
  onDismiss: (index: number) => void;
}

export function AISuggestions({ suggestions, loading, onAccept, onDismiss }: Props) {
  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'rgba(160,180,255,0.8)' }}
        />
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'rgba(160,180,255,0.7)' }}
        >
          Suggestions IA
        </span>
        {loading && (
          <motion.div
            className="w-3 h-3 rounded-full border border-blue-400/40 border-t-blue-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {suggestions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-1 rounded-full"
              style={{
                background: 'rgba(160,180,255,0.08)',
                border: '1px solid rgba(160,180,255,0.2)',
              }}
            >
              <button
                onClick={() => onAccept(s)}
                className="pl-3 pr-1 py-1.5 text-xs font-light"
                style={{ color: 'rgba(200,215,255,0.9)' }}
              >
                {s.title}
              </button>
              <button
                onClick={() => onDismiss(i)}
                className="pr-2 py-1.5"
                style={{ color: 'rgba(160,180,255,0.4)' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
