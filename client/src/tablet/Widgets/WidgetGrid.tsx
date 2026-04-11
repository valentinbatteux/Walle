import { AnimatePresence } from 'framer-motion';
import { WidgetConfig } from '../../types/widgets';
import { WeatherWidget } from './WeatherWidget';
import { FootballWidget } from './FootballWidget';
import { BrocanteWidget } from './BrocanteWidget';
import { ShoppingWidget } from './ShoppingWidget';
import { TasksWidget } from './TasksWidget';

interface Props {
  widgets: WidgetConfig[];
}

export function WidgetGrid({ widgets }: Props) {
  const enabled = widgets.filter(w => w.enabled);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.9rem',
      padding: '0 1.25rem 9rem',
    }}>
      <AnimatePresence>
        {enabled.map(w => {
          switch (w.id) {
            case 'weather':
              return <WeatherWidget key={w.id} config={w.config} />;
            case 'football':
              return <FootballWidget key={w.id} config={w.config} />;
            case 'brocante':
              return <BrocanteWidget key={w.id} config={w.config} />;
            case 'shopping':
              return <ShoppingWidget key={w.id} config={w.config} />;
            case 'tasks':
              return <TasksWidget key={w.id} config={w.config} />;
            default:
              return null;
          }
        })}
      </AnimatePresence>
    </div>
  );
}
