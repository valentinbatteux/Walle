import { useState, useEffect, useCallback } from 'react';
import { ShoppingItem } from '../types';
import { api } from '../lib/api';
import { useSocket } from './useSocket';
import { DEMO_SHOPPING } from '../lib/demoData';

function isDemo(): boolean {
  return (window as unknown as { __walleDemo?: boolean }).__walleDemo === true;
}

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo()) {
      setItems(DEMO_SHOPPING);
      setLoading(false);
      return;
    }
    api.getShopping()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useSocket({
    'shopping:created': (data) => {
      const item = data as ShoppingItem;
      setItems(prev => {
        if (prev.some(i => i.id === item.id)) return prev;
        return [...prev, item];
      });
    },
    'shopping:updated': (data) => {
      const item = data as ShoppingItem;
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    },
    'shopping:deleted': (data) => {
      const { id } = data as { id: number };
      setItems(prev => prev.filter(i => i.id !== id));
    },
    'shopping:reset': () => {
      setItems(prev => prev.map(i => ({ ...i, completed: 0 })));
    },
  });

  const addItem = useCallback(async (input: { name: string; quantity?: string; category?: string; recurring?: boolean }) => {
    const item = await api.createShoppingItem(input);
    return item;
  }, []);

  const toggleItem = useCallback(async (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: i.completed ? 0 : 1 } : i));
    try {
      const updated = await api.toggleShoppingItem(id);
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, completed: i.completed ? 0 : 1 } : i));
    }
  }, []);

  const deleteItem = useCallback(async (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await api.deleteShoppingItem(id);
  }, []);

  const resetList = useCallback(async () => {
    await api.resetShoppingList();
  }, []);

  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const cat = item.category || 'Divers';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return { items, grouped, loading, addItem, toggleItem, deleteItem, resetList };
}
