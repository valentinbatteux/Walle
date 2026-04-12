import { useState, useCallback } from 'react';
import { WidgetConfig, WidgetId, WidgetMap } from '../types/widgets';

const STORAGE_KEY = 'walle_widgets_v3';

const DEFAULTS: WidgetMap = {
  weather:  { id: 'weather',  enabled: true, order: 0, colSpan: 1, rowHeight: 1, config: { city: 'Paris', unit: 'celsius' } },
  tasks:    { id: 'tasks',    enabled: true, order: 1, colSpan: 1, rowHeight: 1, config: { showCompleted: false } },
  football: { id: 'football', enabled: true, order: 2, colSpan: 2, rowHeight: 1, config: { teams: ['PSG', 'OM', 'OL'] } },
  shopping: { id: 'shopping', enabled: true, order: 3, colSpan: 1, rowHeight: 1, config: { maxItems: 5 } },
  brocante: { id: 'brocante', enabled: true, order: 4, colSpan: 1, rowHeight: 1, config: { city: 'Paris', radiusKm: 30 } },
};

function load(): WidgetMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<WidgetMap>;
    const merged: WidgetMap = { ...DEFAULTS };
    for (const id of Object.keys(parsed) as WidgetId[]) {
      if (merged[id]) {
        merged[id] = { ...merged[id], ...parsed[id] } as WidgetConfig;
      }
    }
    return merged;
  } catch {
    return DEFAULTS;
  }
}

function save(map: WidgetMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useWidgetConfig() {
  const [widgets, setWidgets] = useState<WidgetMap>(load);

  const update = useCallback((id: WidgetId, patch: Partial<WidgetConfig>) => {
    setWidgets(prev => {
      const next = { ...prev, [id]: { ...prev[id], ...patch } as WidgetConfig };
      save(next); return next;
    });
  }, []);

  const toggle = useCallback((id: WidgetId) => {
    setWidgets(prev => {
      const next = { ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } as WidgetConfig };
      save(next); return next;
    });
  }, []);

  const reorder = useCallback((id: WidgetId, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const sorted = Object.values(prev).sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(w => w.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const next = { ...prev };
      const aOrder = sorted[idx].order;
      const bOrder = sorted[swapIdx].order;
      next[sorted[idx].id] = { ...next[sorted[idx].id], order: bOrder } as WidgetConfig;
      next[sorted[swapIdx].id] = { ...next[sorted[swapIdx].id], order: aOrder } as WidgetConfig;
      save(next); return next;
    });
  }, []);

  const swap = useCallback((id1: WidgetId, id2: WidgetId) => {
    setWidgets(prev => {
      const o1 = prev[id1].order;
      const o2 = prev[id2].order;
      const next = {
        ...prev,
        [id1]: { ...prev[id1], order: o2 } as WidgetConfig,
        [id2]: { ...prev[id2], order: o1 } as WidgetConfig,
      };
      save(next); return next;
    });
  }, []);

  const setColSpan = useCallback((id: WidgetId, colSpan: 1 | 2) => {
    setWidgets(prev => {
      const next = { ...prev, [id]: { ...prev[id], colSpan } as WidgetConfig };
      save(next); return next;
    });
  }, []);

  const setRowHeight = useCallback((id: WidgetId, rowHeight: 1 | 2 | 3) => {
    setWidgets(prev => {
      const next = { ...prev, [id]: { ...prev[id], rowHeight } as WidgetConfig };
      save(next); return next;
    });
  }, []);

  const sorted = Object.values(widgets).sort((a, b) => a.order - b.order);

  return { widgets, sorted, update, toggle, reorder, swap, setColSpan, setRowHeight };
}
