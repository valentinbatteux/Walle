import { getDB } from '../db/database';
import { Task, TaskPattern } from '../types';

function tokenize(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-zàâçéèêëîïôùûüÿñæœ\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function getPatternKey(tokens: string[]): string {
  return JSON.stringify(tokens.sort());
}

export const patternService = {
  record(task: Task): void {
    try {
      const db = getDB();
      const dayOfWeek = new Date(task.date + 'T12:00:00').getDay();
      const tokens = tokenize(task.title);
      if (tokens.length === 0) return;

      const tokenKey = getPatternKey(tokens);
      const existing = db.prepare(
        'SELECT * FROM task_patterns WHERE day_of_week = ? AND title_tokens = ?'
      ).get(dayOfWeek, tokenKey) as TaskPattern | undefined;

      if (existing) {
        db.prepare(
          'UPDATE task_patterns SET frequency = frequency + 1, last_seen = datetime("now") WHERE id = ?'
        ).run(existing.id);
      } else {
        db.prepare(
          'INSERT INTO task_patterns (day_of_week, category, title_tokens, frequency) VALUES (?, ?, ?, 1)'
        ).run(dayOfWeek, task.category ?? null, tokenKey);
      }
    } catch {
      // Pattern recording is best-effort
    }
  },

  getTopPatterns(dayOfWeek: number, limit: number): TaskPattern[] {
    const db = getDB();
    const rows = db.prepare(`
      SELECT *, title_tokens as tokens_raw
      FROM task_patterns
      WHERE (day_of_week = ? OR day_of_week IS NULL)
        AND frequency >= 2
      ORDER BY frequency DESC
      LIMIT ?
    `).all(dayOfWeek, limit) as (TaskPattern & { tokens_raw: string })[];

    return rows.map(row => {
      const tokens: string[] = JSON.parse(row.tokens_raw);
      return {
        ...row,
        suggested_title: tokens
          .map(t => t.charAt(0).toUpperCase() + t.slice(1))
          .join(' '),
      };
    });
  },

  getAll(): TaskPattern[] {
    const db = getDB();
    const rows = db.prepare(
      'SELECT * FROM task_patterns ORDER BY frequency DESC LIMIT 50'
    ).all() as (TaskPattern & { tokens_raw?: string })[];
    return rows.map(row => ({
      ...row,
      suggested_title: JSON.parse(row.title_tokens)
        .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
        .join(' '),
    }));
  },
};
