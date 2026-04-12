import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WidgetConfig, WidgetId } from '../../types/widgets';
import { WeatherWidget } from './WeatherWidget';
import { FootballWidget } from './FootballWidget';
import { BrocanteWidget } from './BrocanteWidget';
import { ShoppingWidget } from './ShoppingWidget';
import { TasksWidget } from './TasksWidget';

interface Props {
  widgets: WidgetConfig[];
  onSwap: (id1: WidgetId, id2: WidgetId) => void;
}

export function WidgetGrid({ widgets, onSwap }: Props) {
  const [selected, setSelected] = useState<WidgetId | null>(null);
  const enabled = widgets.filter(w => w.enabled);

  const handleSelect = (id: WidgetId) => {
    if (selected === null) {
      setSelected(id);
    } else if (selected === id) {
      setSelected(null);
    } else {
      onSwap(selected, id);
      setSelected(null);
    }
  };

  const widgetProps = (w: WidgetConfig) => ({
    selected: selected === w.id,
    dimmed: selected !== null && selected !== w.id,
    onSelect: () => handleSelect(w.id),
  });

  return (
    <div>
      {/* Swap-mode hint banner */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{
              margin: '0 1.25rem 0.7rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.85rem',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.05em' }}>
              ↕ Tapez un autre widget pour l'échanger
            </span>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '0 0.2rem',
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridAutoRows: 'auto',
        alignItems: 'start',
        gap: '0.9rem',
        padding: '0 1.25rem 9rem',
      }}>
        <AnimatePresence>
          {enabled.map(w => {
            const p = widgetProps(w);
            switch (w.id) {
              case 'weather':  return <WeatherWidget  key={w.id} config={w.config} {...p} />;
              case 'football': return <FootballWidget key={w.id} config={w.config} {...p} />;
              case 'brocante': return <BrocanteWidget key={w.id} config={w.config} {...p} />;
              case 'shopping': return <ShoppingWidget key={w.id} config={w.config} {...p} />;
              case 'tasks':    return <TasksWidget    key={w.id} config={w.config} {...p} />;
              default: return null;
            }
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
