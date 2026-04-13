/**
 * Builds a rich natural-language context string from live widget data,
 * and caches parsed data for inline widget cards in the chat.
 */
import { WidgetMap } from '../types/widgets';
import { getLastMatches, FootballMatch } from '../hooks/useFootball';
import type { BrocanteEvent } from '../hooks/useBrocante';

// ── Exported cache for inline chat cards ──────────────────────────────────────
export interface LastWeatherData {
  city: string; temp: number; feels: number;
  desc: string; code: number; humidity: number; wind: number; sym: string;
  forecast: Array<{ day: string; code: number; high: number; low: number }>;
}
export interface LastContextData {
  weather?: LastWeatherData;
  football?: FootballMatch[];
  brocante?: BrocanteEvent[];
  news?: string[];
}
let lastData: LastContextData = {};
export function getLastContextData(): LastContextData { return lastData; }

// ── WMO weather code → French ─────────────────────────────────────────────────
const WMO: Record<number, string> = {
  0: 'ciel dégagé', 1: 'principalement dégagé', 2: 'partiellement nuageux', 3: 'couvert',
  45: 'brouillard', 48: 'brouillard givrant',
  51: 'bruine légère', 53: 'bruine', 55: 'bruine dense',
  61: 'pluie légère', 63: 'pluie', 65: 'forte pluie',
  71: 'neige légère', 73: 'neige', 75: 'forte neige',
  80: 'averses légères', 81: 'averses', 82: 'averses violentes',
  95: 'orage', 99: 'orage avec grêle',
};
function wmoDesc(code: number) {
  return WMO[code] ?? WMO[Math.floor(code / 10) * 10] ?? 'variable';
}

// ── Weather ───────────────────────────────────────────────────────────────────
async function fetchWeatherContext(city: string, unit: 'celsius' | 'fahrenheit'): Promise<string> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`
    );
    const geo = await geoRes.json();
    if (!geo.results?.length) return '';
    const { latitude, longitude, name } = geo.results[0];

    const sym = unit === 'fahrenheit' ? '°F' : '°C';
    const tempParam = unit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';

    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5` +
      tempParam
    );
    const w = await wRes.json();
    const c = w.current;

    const forecastDays = (w.daily.time as string[]).slice(1, 4).map((d: string, i: number) => ({
      day: new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }),
      code: w.daily.weather_code[i + 1] as number,
      high: Math.round(w.daily.temperature_2m_max[i + 1]),
      low:  Math.round(w.daily.temperature_2m_min[i + 1]),
    }));

    lastData.weather = {
      city: name,
      temp:     Math.round(c.temperature_2m),
      feels:    Math.round(c.apparent_temperature),
      desc:     wmoDesc(c.weather_code),
      code:     c.weather_code,
      humidity: c.relative_humidity_2m,
      wind:     Math.round(c.wind_speed_10m),
      sym,
      forecast: forecastDays,
    };

    const forecastText = forecastDays.map(f =>
      `${f.day}: ${f.high}/${f.low}${sym} ${wmoDesc(f.code)}`
    );

    return [
      `Météo à ${name} : ${lastData.weather.temp}${sym} (ressenti ${lastData.weather.feels}${sym}), ${lastData.weather.desc}, humidité ${lastData.weather.humidity}%, vent ${lastData.weather.wind} km/h`,
      `Prévisions : ${forecastText.join(' · ')}`,
    ].join('\n');
  } catch {
    return '';
  }
}

// ── Brocante ──────────────────────────────────────────────────────────────────
function getBrocanteContext(city: string, radiusKm: number): string {
  try {
    const raw = localStorage.getItem('walle_brocante_cache');
    if (!raw) return '';
    const cache = JSON.parse(raw) as { events?: BrocanteEvent[] };
    const events = (cache.events ?? []).filter((e: BrocanteEvent) => e.distanceKm <= radiusKm);
    if (!events.length) return '';
    lastData.brocante = events;
    const lines = events.map((e: BrocanteEvent) =>
      `  • ${e.name} — ${e.date} à ${e.location} (${e.distanceKm} km, ${e.exhibitors} exposants)`
    );
    return `Brocantes à venir autour de ${city} :\n${lines.join('\n')}`;
  } catch {
    return '';
  }
}

// ── Football ──────────────────────────────────────────────────────────────────
function getFootballContext(teams: string[]): string {
  const matches = getLastMatches(teams);
  if (!matches.length) return '';
  lastData.football = matches;

  const now = new Date();
  const lines = matches.map(m => {
    const diffDays = Math.round((m.date.getTime() - now.getTime()) / 86_400_000);
    const when = m.status === 'live' ? '🔴 En direct'
      : diffDays === 0 ? `aujourd'hui à ${m.time}`
      : diffDays === 1 ? `demain à ${m.time}`
      : diffDays === -1 ? 'hier'
      : m.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + ` à ${m.time}`;
    const score = m.homeScore !== null ? `${m.homeScore}–${m.awayScore}` : 'vs';
    return `  • ${m.home} ${score} ${m.away} — ${when} (${m.competition})`;
  });
  return `Matchs de foot :\n${lines.join('\n')}`;
}

// ── Actualités (RSS Le Monde via rss2json CORS proxy) ────────────────────────
async function fetchNewsContext(): Promise<string> {
  try {
    const rssUrl = 'https://www.lemonde.fr/rss/une.xml';
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=8`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    if (data.status !== 'ok' || !data.items?.length) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const titles = (data.items as any[]).map((item: any) => item.title as string);
    lastData.news = titles;
    return `Actualités du moment (Le Monde) — utilise UNIQUEMENT ces titres pour répondre sur l'actu :\n${titles.map(t => `  • ${t}`).join('\n')}`;
  } catch {
    return '';
  }
}

// ── Shopping (server-side, best-effort) ───────────────────────────────────────
async function fetchShoppingContext(): Promise<string> {
  try {
    const res = await fetch('/api/shopping', { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = await res.json();
    if (!items.length) return '';
    const pending = items.filter(i => !i.completed);
    const done    = items.filter(i => i.completed);
    const lines: string[] = [];
    if (pending.length) lines.push(`  À acheter : ${pending.map(i => i.name + (i.quantity ? ` (${i.quantity})` : '')).join(', ')}`);
    if (done.length)    lines.push(`  Déjà fait : ${done.map(i => i.name).join(', ')}`);
    return `Liste de courses :\n${lines.join('\n')}`;
  } catch {
    return '';
  }
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
async function fetchTasksContext(): Promise<string> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res   = await fetch(`/api/tasks?date=${today}`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasks: any[] = await res.json();
    if (!tasks.length) return "Aucune tâche pour aujourd'hui.";
    const lines = tasks.map(t => `  ${t.completed ? '✓' : '○'} ${t.title}${t.time ? ` à ${t.time}` : ''}`);
    return `Tâches d'aujourd'hui :\n${lines.join('\n')}`;
  } catch {
    return '';
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function buildWidgetContext(widgetConfig: WidgetMap): Promise<string> {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const hour = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const sections: string[] = [`Date et heure : ${today} à ${hour}`];

  const w = widgetConfig.weather;
  const b = widgetConfig.brocante;
  const f = widgetConfig.football;
  const s = widgetConfig.shopping;
  const t = widgetConfig.tasks;

  const [weatherCtx, newsCtx, shoppingCtx, tasksCtx] = await Promise.all([
    w?.id === 'weather' ? fetchWeatherContext(w.config.city, w.config.unit) : Promise.resolve(''),
    fetchNewsContext(),
    s?.id === 'shopping' ? fetchShoppingContext() : Promise.resolve(''),
    t?.id === 'tasks'    ? fetchTasksContext()    : Promise.resolve(''),
  ]);

  if (weatherCtx)  sections.push(weatherCtx);
  if (newsCtx)     sections.push(newsCtx);
  if (shoppingCtx) sections.push(shoppingCtx);
  if (tasksCtx)    sections.push(tasksCtx);

  if (b?.id === 'brocante') {
    const ctx = getBrocanteContext(b.config.city, b.config.radiusKm);
    if (ctx) sections.push(ctx);
  }

  if (f?.id === 'football') {
    const ctx = getFootballContext(f.config.teams);
    if (ctx) sections.push(ctx);
    else if (f.config.teams.length)
      sections.push(`Équipes suivies : ${f.config.teams.join(', ')} (données pas encore chargées)`);
  }

  return sections.join('\n\n');
}
