import { Task, CreateTaskInput, ShoppingItem, AISuggestion } from '../types';

const BASE = '/api';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Tasks
  getTasks(date: string): Promise<Task[]> {
    return req(`/tasks?date=${date}`);
  },
  getTaskRange(from: string, to: string): Promise<Task[]> {
    return req(`/tasks?from=${from}&to=${to}`);
  },
  createTask(input: CreateTaskInput): Promise<Task> {
    return req('/tasks', { method: 'POST', body: JSON.stringify(input) });
  },
  updateTask(id: number, input: Partial<CreateTaskInput>): Promise<Task> {
    return req(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  toggleTask(id: number): Promise<Task> {
    return req(`/tasks/${id}/complete`, { method: 'PATCH' });
  },
  deleteTask(id: number): Promise<void> {
    return req(`/tasks/${id}`, { method: 'DELETE' });
  },

  // Shopping
  getShopping(): Promise<ShoppingItem[]> {
    return req('/shopping');
  },
  createShoppingItem(input: { name: string; quantity?: string; category?: string; recurring?: boolean }): Promise<ShoppingItem> {
    return req('/shopping', { method: 'POST', body: JSON.stringify(input) });
  },
  toggleShoppingItem(id: number): Promise<ShoppingItem> {
    return req(`/shopping/${id}/complete`, { method: 'PATCH' });
  },
  deleteShoppingItem(id: number): Promise<void> {
    return req(`/shopping/${id}`, { method: 'DELETE' });
  },
  resetShoppingList(): Promise<void> {
    return req('/shopping/reset', { method: 'POST' });
  },

  // AI
  getSuggestions(date: string): Promise<AISuggestion[]> {
    return req(`/ai/suggestions?date=${date}`);
  },
  sendFeedback(suggestionText: string, accepted: boolean, dateContext: string): Promise<void> {
    return req('/ai/feedback', {
      method: 'POST',
      body: JSON.stringify({ suggestion_text: suggestionText, accepted, date_context: dateContext }),
    });
  },

  // Health
  getHealth(): Promise<{ status: string; ai: boolean }> {
    return req('/health');
  },
};
