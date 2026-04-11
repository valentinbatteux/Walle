import Anthropic from '@anthropic-ai/sdk';
import { Task } from '../types';
import { patternService } from './patternService';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const cache = new Map<string, { data: Partial<Task>[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export async function getSuggestions(date: string, existingTasks: Task[]): Promise<Partial<Task>[]> {
  const cached = cache.get(date);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const patterns = patternService.getTopPatterns(dayOfWeek, 5);

  if (!client) {
    const fallback = patterns.slice(0, 4).map(p => ({
      title: p.suggested_title,
      category: p.category ?? 'maison',
      priority: 'medium' as const,
      ai_suggested: 1,
    }));
    cache.set(date, { data: fallback, ts: Date.now() });
    return fallback;
  }

  try {
    const dateFr = formatDateFr(date);
    const patternList = patterns.length > 0
      ? patterns.map(p => `"${p.suggested_title}"`).join(', ')
      : 'Aucun historique';
    const existingList = existingTasks.length > 0
      ? existingTasks.map(t => `"${t.title}"`).join(', ')
      : 'Aucune tâche planifiée';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: `Tu es un assistant domestique intelligent pour un tableau de bord familial installé dans une maison.
Suggère des tâches utiles, pratiques et contextuelles pour la journée.
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour.
Chaque objet: { "title": string, "category": "maison"|"courses"|"santé"|"travail"|"loisirs", "priority": "low"|"medium"|"high" }
Maximum 4 suggestions pertinentes et variées.`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Date: ${dateFr}
Habitudes ce jour: ${patternList}
Tâches déjà planifiées: ${existingList}
Suggère des tâches utiles pour cette journée.`,
        },
      ],
    });

    const text = response.content[0];
    if (text.type !== 'text') throw new Error('Unexpected response');

    const parsed: Array<{ title: string; category: string; priority: string }> = JSON.parse(text.text);
    const suggestions: Partial<Task>[] = parsed.map(s => ({
      title: s.title,
      category: s.category,
      priority: (s.priority as 'low' | 'medium' | 'high') || 'medium',
      ai_suggested: 1,
    }));

    cache.set(date, { data: suggestions, ts: Date.now() });
    return suggestions;
  } catch (err) {
    console.error('AI suggestion error:', err);
    const fallback = patterns.slice(0, 4).map(p => ({
      title: p.suggested_title,
      category: p.category ?? 'maison',
      priority: 'medium' as const,
      ai_suggested: 1,
    }));
    cache.set(date, { data: fallback, ts: Date.now() });
    return fallback;
  }
}

export async function recordFeedback(suggestionText: string, accepted: boolean, dateContext: string): Promise<void> {
  const { getDB } = await import('../db/database');
  getDB().prepare(
    'INSERT INTO ai_feedback (suggestion_text, accepted, date_context) VALUES (?, ?, ?)'
  ).run(suggestionText, accepted ? 1 : 0, dateContext);
}
