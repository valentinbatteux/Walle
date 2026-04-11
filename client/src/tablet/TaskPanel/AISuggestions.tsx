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
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(167,139,250,0.9)', boxShadow: '0 0 8px rgba(167,139,250,0.8)' }}
        />
        <span style={{ fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.7)' }}>
          {loading ? 'Analyse en cours…' : 'Suggestions IA'}
        </span>
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(167,139,250,0.3)', borderTopColor: 'rgba(167,139,250,0.9)' }}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {suggestions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center"
              style={{
                borderRadius: '999px',
                background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(78,205,196,0.08))',
                border: '1px solid rgba(167,139,250,0.25)',
                boxShadow: '0 2px 12px rgba(140,100,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <button
                onClick={() => onAccept(s)}
                style={{ padding: '0.35rem 0.75rem 0.35rem 1rem', fontSize: '0.78rem', fontWeight: 300, color: 'rgba(210,200,255,0.92)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {s.title}
              </button>
              <button
                onClick={() => onDismiss(i)}
                style={{ paddingRight: '0.7rem', color: 'rgba(167,139,250,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
