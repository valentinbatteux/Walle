export type WidgetId = 'football' | 'weather' | 'brocante' | 'shopping' | 'tasks';

export interface FootballConfig {
  teams: string[];
}

export interface WeatherConfig {
  city: string;
  unit: 'celsius' | 'fahrenheit';
}

export interface BrocanteConfig {
  city: string;
  radiusKm: number;
}

export interface ShoppingConfig {
  maxItems: number;
}

export interface TasksConfig {
  showCompleted: boolean;
}

export type WidgetConfig =
  | { id: 'football'; enabled: boolean; order: number; config: FootballConfig }
  | { id: 'weather'; enabled: boolean; order: number; config: WeatherConfig }
  | { id: 'brocante'; enabled: boolean; order: number; config: BrocanteConfig }
  | { id: 'shopping'; enabled: boolean; order: number; config: ShoppingConfig }
  | { id: 'tasks'; enabled: boolean; order: number; config: TasksConfig };

export type WidgetMap = Record<WidgetId, WidgetConfig>;
