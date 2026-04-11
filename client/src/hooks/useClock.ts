import { useState, useEffect } from 'react';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function snapshot(now: Date) {
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const day = DAYS_FR[now.getDay()];
  const date = `${now.getDate()} ${MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`;
  return { time: `${h}:${m}`, date, dayName: day };
}

export function useClock() {
  const [state, setState] = useState(() => snapshot(new Date()));

  useEffect(() => {
    const tick = () => setState(snapshot(new Date()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
