import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskInput } from '../types';
import { api } from '../lib/api';
import { useSocket } from './useSocket';
import { DEMO_TASKS } from '../lib/demoData';

function isDemo(): boolean {
  // Demo mode when backend is not available (GitHub Pages etc.)
  return (window as unknown as { __walleDemo?: boolean }).__walleDemo === true;
}

export function useTasks(date: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (isDemo()) {
      setTasks(DEMO_TASKS.filter(t => t.date === date));
      setLoading(false);
      return;
    }
    api.getTasks(date)
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date]);

  useSocket({
    'task:created': (data) => {
      const task = data as Task;
      if (task.date === date) {
        setTasks(prev => prev.some(t => t.id === task.id) ? prev : [...prev, task]);
      }
    },
    'task:updated': (data) => {
      const task = data as Task;
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    },
    'task:deleted': (data) => {
      const { id } = data as { id: number };
      setTasks(prev => prev.filter(t => t.id !== id));
    },
  });

  const addTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    const tempId = -Date.now();
    const { ai_suggested, ...rest } = input;
    const optimistic: Task = {
      id: tempId,
      completed: 0,
      ai_suggested: ai_suggested ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      priority: 'medium',
      ...rest,
    };
    setTasks(prev => [...prev, optimistic]);
    if (isDemo()) return optimistic;
    try {
      const created = await api.createTask(input);
      setTasks(prev => prev.map(t => t.id === tempId ? created : t));
      return created;
    } catch {
      setTasks(prev => prev.filter(t => t.id !== tempId));
      return optimistic;
    }
  }, []);

  const toggleTask = useCallback(async (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: t.completed ? 0 : 1 } : t));
    if (!isDemo()) {
      try {
        const updated = await api.toggleTask(id);
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
      } catch {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: t.completed ? 0 : 1 } : t));
      }
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (!isDemo()) await api.deleteTask(id).catch(() => {});
  }, []);

  return { tasks, loading, addTask, toggleTask, deleteTask };
}

export function useTaskRange(from: string, to: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (isDemo()) {
      setTasks(DEMO_TASKS.filter(t => t.date >= from && t.date <= to));
      setLoading(false);
      return;
    }
    api.getTaskRange(from, to)
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [from, to]);

  useSocket({
    'task:created': (data) => {
      const task = data as Task;
      if (task.date >= from && task.date <= to) {
        setTasks(prev => prev.some(t => t.id === task.id) ? prev : [...prev, task]);
      }
    },
    'task:updated': (data) => {
      const task = data as Task;
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    },
    'task:deleted': (data) => {
      const { id } = data as { id: number };
      setTasks(prev => prev.filter(t => t.id !== id));
    },
  });

  return { tasks, loading };
}
