import { useState, useEffect } from 'react';
import { AISuggestion } from '../types';
import { api } from '../lib/api';
import { DEMO_SUGGESTIONS } from '../lib/demoData';

function isDemo(): boolean {
  return (window as unknown as { __walleDemo?: boolean }).__walleDemo === true;
}

export function useAISuggestions(date: string | null) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    if (isDemo()) {
      setSuggestions(DEMO_SUGGESTIONS);
      return;
    }
    setLoading(true);
    setSuggestions([]);
    api.getSuggestions(date)
      .then(setSuggestions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date]);

  const dismiss = (index: number) => {
    const s = suggestions[index];
    if (s && date) {
      api.sendFeedback(s.title, false, date).catch(() => {});
    }
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  return { suggestions, loading, dismiss };
}
