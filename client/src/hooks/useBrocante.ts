import { useState, useEffect } from 'react';

export interface BrocanteEvent {
  name: string;
  date: string;       // "DD/MM/YYYY"
  location: string;
  distanceKm: number;
  exhibitors: number;
}

const KEY_STORAGE     = 'walle_openai_key';
const CACHE_STORAGE   = 'walle_brocante_cache';
const CACHE_HOURS     = 20;

interface CacheEntry { events: BrocanteEvent[]; city: string; date: string; ts: number; }

function loadCache(city: string, dateKey: string): BrocanteEvent[] | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.city !== city || entry.date !== dateKey) return null;
    if (Date.now() - entry.ts > CACHE_HOURS * 3_600_000) return null;
    return entry.events;
  } catch { return null; }
}

function saveCache(city: string, dateKey: string, events: BrocanteEvent[]) {
  try {
    const entry: CacheEntry = { events, city, date: dateKey, ts: Date.now() };
    localStorage.setItem(CACHE_STORAGE, JSON.stringify(entry));
  } catch { /* quota exceeded — ignore */ }
}

export function useBrocante(city: string, radiusKm: number) {
  const [events, setEvents]   = useState<BrocanteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPowered, setAiPowered] = useState(false);

  useEffect(() => {
    if (!city.trim()) { setLoading(false); return; }
    let cancelled = false;

    const apiKey  = localStorage.getItem(KEY_STORAGE) ?? '';
    const today   = new Date();
    const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Return cache if fresh
    const cached = loadCache(city, dateKey);
    if (cached) {
      setEvents(cached.filter(e => e.distanceKm <= radiusKm));
      setAiPowered(true);
      setLoading(false);
      return;
    }

    if (!apiKey) { setLoading(false); return; }

    const todayFr = today.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    setLoading(true);

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'system',
          content: 'Tu es un assistant qui génère des listes JSON de brocantes françaises à venir. Réponds UNIQUEMENT avec un objet JSON valide.',
        }, {
          role: 'user',
          content: `Génère 5 brocantes, vide-greniers ou marchés aux puces plausibles et typiques dans les 30 prochains jours autour de "${city}" (rayon ${radiusKm} km max).
Date d'aujourd'hui : ${todayFr}.
Les événements se déroulent principalement le dimanche et parfois le samedi.
Les lieux sont des villes ou communes réelles proches de ${city}.
Les distances doivent être inférieures à ${radiusKm} km.
Réponds avec ce JSON exact :
{"events":[{"name":"...","date":"JJ/MM/AAAA","location":"...","distanceKm":N,"exhibitors":N}]}`,
        }],
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const content = data.choices?.[0]?.message?.content ?? '{}';
        const parsed  = JSON.parse(content) as { events?: BrocanteEvent[] };
        const evts    = (parsed.events ?? []).filter(e => e.distanceKm <= radiusKm);
        saveCache(city, dateKey, evts);
        setEvents(evts);
        setAiPowered(true);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [city, radiusKm]);

  return { events, loading, aiPowered };
}
