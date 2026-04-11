export interface Task {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: number;
  recurring?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  ai_suggested: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  recurring?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  ai_suggested?: boolean;
}

export interface ShoppingItem {
  id: number;
  name: string;
  quantity?: string;
  category?: string;
  completed: number;
  recurring: number;
  created_at: string;
}

export interface AISuggestion {
  title: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  ai_suggested: number;
}

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
