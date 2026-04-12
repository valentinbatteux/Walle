import { useState } from 'react';
import { Reorder, useDragControls, AnimatePresence } from 'framer-motion';
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
  onReorderAll: (newIds: WidgetId[]) => void;
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

// Each item must be its own component so useDragControls can be called as a hook
function ReorderItem({
  widget, onSettingsClick,
}: {
  widget: WidgetConfig;
  onSettingsClick: () => void;
}) {
  const dragControls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      as="div"
      value={widget}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      style={{
        gridColumn: widget.id === 'football' ? '1 / -1' : undefined,
        position: 'relative',
        zIndex: dragging ? 50 : 1,
      }}
      whileDrag={{ scale: 1.04 }}
      layout
    >
      <WidgetContent
        widget={widget}
        dragControls={dragControls}
        isDragging={dragging}
        onSettingsClick={onSettingsClick}
      />
    </Reorder.Item>
  );
}

export function WidgetGrid({ widgets, widgetMap, onReorderAll, onUpdate, onToggle }: Props) {
  const [openSettings, setOpenSettings] = useState<WidgetId | null>(null);
  const enabled = widgets.filter(w => w.enabled);

  return (
    <>
      <Reorder.Group
        as="div"
        axis="y"
        values={enabled}
        onReorder={(newOrder: WidgetConfig[]) => onReorderAll(newOrder.map(w => w.id))}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridAutoRows: 'auto',
          alignItems: 'start',
          gap: '0.9rem',
          padding: '0 1.25rem 9rem',
          listStyle: 'none',
          margin: 0,
        }}
      >
        {enabled.map(w => (
          <ReorderItem
            key={w.id}
            widget={w}
            onSettingsClick={() => setOpenSettings(w.id)}
          />
        ))}
      </Reorder.Group>

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
