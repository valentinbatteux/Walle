import { useState, useEffect } from 'react';

const WMO: Record<number, { desc: string; icon: string }> = {
  0:  { desc: 'Ciel dégagé',           icon: '☀️' },
  1:  { desc: 'Principalement dégagé', icon: '🌤' },
  2:  { desc: 'Partiellement nuageux', icon: '⛅' },
  3:  { desc: 'Couvert',               icon: '☁️' },
  45: { desc: 'Brouillard',            icon: '🌫' },
  48: { desc: 'Brouillard givrant',    icon: '🌫' },
  51: { desc: 'Bruine légère',         icon: '🌦' },
  53: { desc: 'Bruine',                icon: '🌧' },
  55: { desc: 'Bruine dense',          icon: '🌧' },
  61: { desc: 'Pluie légère',          icon: '🌦' },
  63: { desc: 'Pluie',                 icon: '🌧' },
  65: { desc: 'Forte pluie',           icon: '🌧' },
  71: { desc: 'Neige légère',          icon: '🌨' },
  73: { desc: 'Neige',                 icon: '❄️' },
  75: { desc: 'Forte neige',           icon: '❄️' },
  80: { desc: 'Averses légères',       icon: '🌦' },
  81: { desc: 'Averses',               icon: '🌧' },
  82: { desc: 'Averses violentes',     icon: '⛈' },
  85: { desc: 'Averses de neige',      icon: '🌨' },
  95: { desc: 'Orage',                 icon: '⛈' },
  99: { desc: 'Orage avec grêle',      icon: '⛈' },
};

function wmo(code: number) {
  return WMO[code] ?? WMO[Math.floor(code / 10) * 10] ?? { desc: 'Variable', icon: '🌡' };
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export interface WeatherData {
  city: string;
  temp: number;
  feels: number;
  desc: string;
  icon: string;
  humidity: number;
  wind: number;
  forecast: { day: string; icon: string; high: number; low: number }[];
}

export function useWeather(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city.trim()) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Debounce: wait 800ms after last city change before fetching
    const timer = setTimeout(async () => {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=fr&format=json`
        );
        const geo = await geoRes.json();
        if (!geo.results?.length) throw new Error(`"${city}" introuvable`);
        const { latitude, longitude, name } = geo.results[0];

        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
        );
        const w = await wRes.json();
        if (cancelled) return;

        const cur = w.current;
        setData({
          city: name,
          temp: Math.round(cur.temperature_2m),
          feels: Math.round(cur.apparent_temperature),
          desc: wmo(cur.weather_code).desc,
          icon: wmo(cur.weather_code).icon,
          humidity: cur.relative_humidity_2m,
          wind: Math.round(cur.wind_speed_10m),
          forecast: (w.daily.time as string[]).slice(0, 5).map((d, i) => ({
            day: DAYS_FR[new Date(d + 'T12:00:00').getDay()],
            icon: wmo(w.daily.weather_code[i]).icon,
            high: Math.round(w.daily.temperature_2m_max[i]),
            low: Math.round(w.daily.temperature_2m_min[i]),
          })),
        });
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erreur réseau');
          setLoading(false);
        }
      }
    }, 800);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [city]);

  return { data, loading, error };
}
