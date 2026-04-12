import { useRef, useState } from 'react';
import { motion, useDragControls, useMotionValue, AnimatePresence } from 'framer-motion';
import { WidgetConfig, WidgetId, WidgetMap } from '../../types/widgets';
import { WeatherWidget } from './WeatherWidget';
import { FootballWidget } from './FootballWidget';
import { BrocanteWidget } from './BrocanteWidget';
import { ShoppingWidget } from './ShoppingWidget';
import { TasksWidget } from './TasksWidget';
import { WidgetSettingsSheet } from './WidgetSettingsSheet';

interface Props {
  widgets: WidgetConfig[];
  widgetMap: WidgetMap;
  onSwap: (id1: WidgetId, id2: WidgetId) => void;
  onUpdate: (id: WidgetId, patch: Partial<WidgetConfig>) => void;
  onToggle: (id: WidgetId) => void;
}

function WidgetContent({
  widget, dragControls, isDragging, onSettingsClick,
}: {
  widget: WidgetConfig;
  dragControls: ReturnType<typeof useDragControls>;
  isDragging: boolean;
  onSettingsClick: () => void;
}) {
  const shared = { dragControls, isDragging, onSettingsClick };
  switch (widget.id) {
    case 'weather':  return <WeatherWidget  config={widget.config} {...shared} />;
    case 'football': return <FootballWidget config={widget.config} {...shared} />;
    case 'brocante': return <BrocanteWidget config={widget.config} {...shared} />;
    case 'shopping': return <ShoppingWidget config={widget.config} {...shared} />;
    case 'tasks':    return <TasksWidget    config={widget.config} {...shared} />;
    default: return null;
  }
}

function DraggableSlot({
  widget, allRefs, onDrop, onSettingsClick,
}: {
  widget: WidgetConfig;
  allRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onDrop: (id: WidgetId, point: { x: number; y: number }) => void;
  onSettingsClick: () => void;
}) {
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      ref={(el: HTMLElement | null) => { allRefs.current[widget.id] = el; }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.05}
      style={{
        x, y,
        gridColumn: widget.id === 'football' ? '1 / -1' : 'span 1',
        zIndex: dragging ? 50 : 1,
        position: 'relative',
      }}
      animate={{ scale: dragging ? 1.04 : 1, filter: dragging ? 'brightness(1.1)' : 'brightness(1)' }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        // Reset transform first so layout is clean
        x.set(0);
        y.set(0);
        setDragging(false);
        onDrop(widget.id, info.point);
      }}
    >
      <WidgetContent
        widget={widget}
        dragControls={dragControls}
        isDragging={dragging}
        onSettingsClick={onSettingsClick}
      />
    </motion.div>
  );
}

export function WidgetGrid({ widgets, widgetMap, onSwap, onUpdate, onToggle }: Props) {
  const allRefs = useRef<Record<string, HTMLElement | null>>({});
  const [openSettings, setOpenSettings] = useState<WidgetId | null>(null);
  const enabled = widgets.filter(w => w.enabled);

  const handleDrop = (draggedId: WidgetId, dropPoint: { x: number; y: number }) => {
    // Find the first widget whose bounding rect contains the drop point
    for (const [id, el] of Object.entries(allRefs.current)) {
      if (id === draggedId || !el) continue;
      const rect = el.getBoundingClientRect();
      if (
        dropPoint.x >= rect.left && dropPoint.x <= rect.right &&
        dropPoint.y >= rect.top  && dropPoint.y <= rect.bottom
      ) {
        onSwap(draggedId, id as WidgetId);
        return;
      }
    }
  };

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridAutoRows: 'auto',
        alignItems: 'start',
        gap: '0.9rem',
        padding: '0 1.25rem 9rem',
      }}>
        {enabled.map(w => (
          <DraggableSlot
            key={w.id}
            widget={w}
            allRefs={allRefs}
            onDrop={handleDrop}
            onSettingsClick={() => setOpenSettings(w.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {openSettings && widgetMap[openSettings] && (
          <WidgetSettingsSheet
            key={openSettings}
            widget={widgetMap[openSettings]}
            onClose={() => setOpenSettings(null)}
            onUpdate={(patch) => onUpdate(openSettings, patch)}
            onToggle={() => onToggle(openSettings)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
