export type WidgetId = 'football' | 'weather' | 'brocante' | 'shopping' | 'tasks';

export interface FootballConfig { teams: string[] }
export interface WeatherConfig  { city: string; unit: 'celsius' | 'fahrenheit' }
export interface BrocanteConfig { city: string; radiusKm: number }
export interface ShoppingConfig { maxItems: number }
export interface TasksConfig    { showCompleted: boolean }

// colSpan: 1 = half width, 2 = full width
// rowHeight: 1 = compact (~140px), 2 = medium (~220px), 3 = tall (~320px)
export type WidgetConfig =
  | { id: 'football'; enabled: boolean; order: number; colSpan: 1|2; rowHeight: 1|2|3; config: FootballConfig }
  | { id: 'weather';  enabled: boolean; order: number; colSpan: 1|2; rowHeight: 1|2|3; config: WeatherConfig  }
  | { id: 'brocante'; enabled: boolean; order: number; colSpan: 1|2; rowHeight: 1|2|3; config: BrocanteConfig }
  | { id: 'shopping'; enabled: boolean; order: number; colSpan: 1|2; rowHeight: 1|2|3; config: ShoppingConfig }
  | { id: 'tasks';    enabled: boolean; order: number; colSpan: 1|2; rowHeight: 1|2|3; config: TasksConfig    };

export type WidgetMap = Record<WidgetId, WidgetConfig>;
