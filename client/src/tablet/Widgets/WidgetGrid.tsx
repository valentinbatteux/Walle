import { useRef, useState } from 'react';
import { motion, useDragControls, useMotionValue, AnimatePresence } from 'framer-motion';
import { WidgetConfig, WidgetId } from '../../types/widgets';
import { WeatherWidget } from './WeatherWidget';
import { FootballWidget } from './FootballWidget';
import { BrocanteWidget } from './BrocanteWidget';
import { ShoppingWidget } from './ShoppingWidget';
import { TasksWidget } from './TasksWidget';
import { WidgetSettingsSheet } from './WidgetSettingsSheet';

interface Props {
  widgets: WidgetConfig[];
  widgetMap: Record<WidgetId, WidgetConfig>;
  onSwap: (id1: WidgetId, id2: WidgetId) => void;
  onUpdate: (id: WidgetId, patch: Partial<WidgetConfig>) => void;
  onToggle: (id: WidgetId) => void;
}

// One draggable slot per widget
function DraggableSlot({
  widget,
  allRefs,
  onDrop,
  onSettingsClick,
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
      layout
      layoutId={widget.id}
      drag
      dragControls={dragControls}
      dragListener={false}      // only drag via grip handle
      dragMomentum={false}
      dragElastic={0.08}
      style={{
        x, y,
        gridColumn: widget.id === 'football' ? '1 / -1' : 'span 1',
        zIndex: dragging ? 50 : 1,
        position: 'relative',
      }}
      animate={{ scale: dragging ? 1.04 : 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        onDrop(widget.id, info.point);
        // Snap back to grid position
        x.set(0);
        y.set(0);
      }}
    >
      {/* Render the actual widget, passing drag controls + settings callback */}
      <WidgetContent
        widget={widget}
        dragControls={dragControls}
        isDragging={dragging}
        onSettingsClick={onSettingsClick}
      />
    </motion.div>
  );
}

function WidgetContent({
  widget,
  dragControls,
  isDragging,
  onSettingsClick,
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

export function WidgetGrid({ widgets, widgetMap, onSwap, onUpdate, onToggle }: Props) {
  const allRefs = useRef<Record<string, HTMLElement | null>>({});
  const [openSettings, setOpenSettings] = useState<WidgetId | null>(null);
  const enabled = widgets.filter(w => w.enabled);

  const handleDrop = (draggedId: WidgetId, dropPoint: { x: number; y: number }) => {
    // Find which widget's DOM element the drop point lands closest to
    let closest: WidgetId | null = null;
    let minDist = 200; // px threshold — must be within this distance

    Object.entries(allRefs.current).forEach(([id, el]) => {
      if (id === draggedId || !el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(dropPoint.x - cx, dropPoint.y - cy);
      if (dist < minDist) {
        minDist = dist;
        closest = id as WidgetId;
      }
    });

    if (closest) onSwap(draggedId, closest);
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
        <AnimatePresence>
          {enabled.map(w => (
            <DraggableSlot
              key={w.id}
              widget={w}
              allRefs={allRefs}
              onDrop={handleDrop}
              onSettingsClick={() => setOpenSettings(w.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Per-widget settings bottom sheet */}
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
