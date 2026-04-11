import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskInput } from '../types';
import { api } from '../lib/api';
import { useSocket } from './useSocket';

export function useTasks(date: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTasks(date).then((data) => {
      setTasks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [date]);

  useSocket({
    'task:created': (data) => {
      const task = data as Task;
      if (task.date === date) {
        setTasks(prev => {
          if (prev.some(t => t.id === task.id)) return prev;
          return [...prev, task];
        });
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
    try {
      const created = await api.createTask(input);
      setTasks(prev => prev.map(t => t.id === tempId ? created : t));
      return created;
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== tempId));
      throw err;
    }
  }, []);

  const toggleTask = useCallback(async (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: t.completed ? 0 : 1 } : t));
    try {
      const updated = await api.toggleTask(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: t.completed ? 0 : 1 } : t));
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await api.deleteTask(id).catch(() => {
      api.getTasks(date).then(setTasks);
    });
  }, [date]);

  return { tasks, loading, addTask, toggleTask, deleteTask };
}

export function useTaskRange(from: string, to: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTaskRange(from, to).then((data) => {
      setTasks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [from, to]);

  useSocket({
    'task:created': (data) => {
      const task = data as Task;
      if (task.date >= from && task.date <= to) {
        setTasks(prev => {
          if (prev.some(t => t.id === task.id)) return prev;
          return [...prev, task];
        });
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
