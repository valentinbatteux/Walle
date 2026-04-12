import { useRef, useState, useCallback } from 'react';
import { motion, useDragControls, useMotionValue, AnimatePresence } from 'framer-motion';
import { WidgetConfig, WidgetId, WidgetMap } from '../../types/widgets';
import { WeatherWidget } from './WeatherWidget';
import { FootballWidget } from './FootballWidget';
import { BrocanteWidget } from './BrocanteWidget';
import { ShoppingWidget } from './ShoppingWidget';
import { TasksWidget } from './TasksWidget';
import { WidgetSettingsSheet } from './WidgetSettingsSheet';

const ROW_H: Record<1 | 2 | 3, number> = { 1: 140, 2: 220, 3: 320 };

interface Props {
  widgets: WidgetConfig[];
  widgetMap: WidgetMap;
  onSwap: (id1: WidgetId, id2: WidgetId) => void;
  onUpdate: (id: WidgetId, patch: Partial<WidgetConfig>) => void;
  onToggle: (id: WidgetId) => void;
  onColSpan: (id: WidgetId, v: 1 | 2) => void;
  onRowHeight: (id: WidgetId, v: 1 | 2 | 3) => void;
}

// ── Resize overlay (shown in edit mode) ─────────────────────────────────────
function ResizeOverlay({ widget, onColSpan, onRowHeight }: {
  widget: WidgetConfig;
  onColSpan: (v: 1 | 2) => void;
  onRowHeight: (v: 1 | 2 | 3) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Block pointer events so drag handle below doesn't start a drag
      onPointerDown={e => e.stopPropagation()}
      style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12,
        borderRadius: 16,
        background: 'rgba(8,4,22,0.82)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(167,139,250,0.3)',
      }}
    >
      <span style={{
        fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(167,139,250,0.75)', fontWeight: 600,
      }}>
        Redimensionner
      </span>

      {/* Width */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 50 }}>Largeur</span>
        {([1, 2] as const).map(v => (
          <button key={v} onClick={() => onColSpan(v)} style={{
            padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
            background: widget.colSpan === v ? 'rgba(167,139,250,0.85)' : 'rgba(255,255,255,0.07)',
            color: widget.colSpan === v ? '#fff' : 'rgba(255,255,255,0.4)',
          }}>
            {v === 1 ? '½' : '■ ■'}
          </button>
        ))}
      </div>

      {/* Height */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 50 }}>Hauteur</span>
        {([1, 2, 3] as const).map(v => (
          <button key={v} onClick={() => onRowHeight(v)} style={{
            padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
            background: widget.rowHeight === v ? 'rgba(167,139,250,0.85)' : 'rgba(255,255,255,0.07)',
            color: widget.rowHeight === v ? '#fff' : 'rgba(255,255,255,0.4)',
          }}>
            {v === 1 ? 'S' : v === 2 ? 'M' : 'L'}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Widget content switcher ──────────────────────────────────────────────────
function WidgetContent({ widget, dragControls, isDragging, onSettingsClick }: {
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

// ── Draggable slot ───────────────────────────────────────────────────────────
interface SlotProps {
  widget: WidgetConfig;
  isHoverTarget: boolean;
  editMode: boolean;
  slotRef: (el: HTMLDivElement | null) => void;
  onDragStart: (id: WidgetId) => void;
  onDragMove: (id: WidgetId, point: { x: number; y: number }) => void;
  onDragEnd: (id: WidgetId) => void;
  onSettingsClick: () => void;
  onColSpan: (v: 1 | 2) => void;
  onRowHeight: (v: 1 | 2 | 3) => void;
}

function DraggableSlot({
  widget, isHoverTarget, editMode, slotRef,
  onDragStart, onDragMove, onDragEnd, onSettingsClick,
  onColSpan, onRowHeight,
}: SlotProps) {
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  const minH = ROW_H[widget.rowHeight];
  const colStyle = widget.colSpan === 2 ? '1 / -1' : 'span 1';

  return (
    // Outer div: stays in grid flow — used for rect-based hit detection
    <div
      ref={slotRef}
      style={{ gridColumn: colStyle, minHeight: minH, position: 'relative' }}
    >
      {/* Inner motion.div: the draggable visual surface */}
      <motion.div
        drag={!editMode}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0.04}
        style={{
          x, y,
          width: '100%',
          minHeight: minH,
          position: 'relative',
          zIndex: dragging ? 50 : 1,
          borderRadius: 16,
        }}
        animate={{
          scale: dragging ? 1.04 : 1,
          filter: dragging
            ? 'brightness(1.15) drop-shadow(0 14px 28px rgba(0,0,0,0.55))'
            : 'brightness(1)',
          boxShadow: isHoverTarget
            ? '0 0 0 2px rgba(167,139,250,0.85), 0 0 24px rgba(120,80,220,0.4)'
            : '0 0 0 0px transparent',
        }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        onDragStart={() => {
          setDragging(true);
          onDragStart(widget.id);
        }}
        onDrag={(_, info) => onDragMove(widget.id, info.point)}
        onDragEnd={() => {
          x.set(0);
          y.set(0);
          setDragging(false);
          onDragEnd(widget.id);
        }}
      >
        <WidgetContent
          widget={widget}
          dragControls={dragControls}
          isDragging={dragging}
          onSettingsClick={onSettingsClick}
        />

        <AnimatePresence>
          {editMode && (
            <ResizeOverlay
              widget={widget}
              onColSpan={onColSpan}
              onRowHeight={onRowHeight}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── WidgetGrid ───────────────────────────────────────────────────────────────
export function WidgetGrid({ widgets, widgetMap, onSwap, onUpdate, onToggle, onColSpan, onRowHeight }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [openSettings, setOpenSettings] = useState<WidgetId | null>(null);
  const [hoverTarget, setHoverTarget] = useState<WidgetId | null>(null);
  const hoverRef = useRef<WidgetId | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const enabled = widgets.filter(w => w.enabled);

  const handleDragStart = useCallback((_id: WidgetId) => {
    hoverRef.current = null;
    setHoverTarget(null);
  }, []);

  // Called every frame while dragging — find which slot the cursor is over
  const handleDragMove = useCallback((draggedId: WidgetId, point: { x: number; y: number }) => {
    let found: WidgetId | null = null;
    for (const [id, el] of Object.entries(slotRefs.current)) {
      if (id === draggedId || !el) continue;
      const r = el.getBoundingClientRect();
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        found = id as WidgetId;
        break;
      }
    }
    if (found !== hoverRef.current) {
      hoverRef.current = found;
      setHoverTarget(found);
    }
  }, []);

  const handleDragEnd = useCallback((draggedId: WidgetId) => {
    const target = hoverRef.current;
    hoverRef.current = null;
    setHoverTarget(null);
    if (target) onSwap(draggedId, target);
  }, [onSwap]);

  return (
    <>
      {/* Toolbar row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1.25rem 0.75rem' }}>
        <motion.button
          onClick={() => setEditMode(e => !e)}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.06em',
            background: editMode ? 'rgba(167,139,250,0.22)' : 'rgba(255,255,255,0.06)',
            color: editMode ? 'rgba(220,200,255,0.9)' : 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(8px)',
            border: editMode
              ? '1px solid rgba(167,139,250,0.4)'
              : '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.2s',
          }}
        >
          {editMode ? '✓ Terminé' : '✏ Modifier'}
        </motion.button>
      </div>

      {/* Grid */}
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
            isHoverTarget={hoverTarget === w.id}
            editMode={editMode}
            slotRef={(el) => { slotRefs.current[w.id] = el; }}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onSettingsClick={() => setOpenSettings(w.id)}
            onColSpan={(v) => onColSpan(w.id, v)}
            onRowHeight={(v) => onRowHeight(w.id, v)}
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
