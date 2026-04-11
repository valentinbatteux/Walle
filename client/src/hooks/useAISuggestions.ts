import { useState, useEffect } from 'react';
import { AISuggestion } from '../types';
import { api } from '../lib/api';

export function useAISuggestions(date: string | null) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setSuggestions([]);
    api.getSuggestions(date).then((data) => {
      setSuggestions(data);
      setLoading(false);
    }).catch(() => setLoading(false));
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
