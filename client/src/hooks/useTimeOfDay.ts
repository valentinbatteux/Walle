import { useState, useEffect } from 'react';
import { TimeOfDay } from '../types';

function getTimeOfDay(now: Date): TimeOfDay {
  const h = now.getHours() + now.getMinutes() / 60;
  if (h >= 5.5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17.5) return 'day';
  if (h >= 17.5 && h < 20) return 'dusk';
  return 'night';
}

export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeOfDay(getTimeOfDay(new Date()));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return timeOfDay;
}
