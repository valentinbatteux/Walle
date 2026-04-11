import { getDB } from '../db/database';
import { Task, CreateTaskInput } from '../types';
import { patternService } from './patternService';

export const taskService = {
  getByDate(date: string): Task[] {
    const db = getDB();
    return db.prepare(
      'SELECT * FROM tasks WHERE date = ? AND completed != -1 ORDER BY time ASC, priority DESC, created_at ASC'
    ).all(date) as Task[];
  },

  getByRange(from: string, to: string): Task[] {
    const db = getDB();
    return db.prepare(
      'SELECT * FROM tasks WHERE date BETWEEN ? AND ? AND completed != -1 ORDER BY date ASC, time ASC'
    ).all(from, to) as Task[];
  },

  getById(id: number): Task | undefined {
    const db = getDB();
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  },

  create(input: CreateTaskInput): Task {
    const db = getDB();
    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO tasks (title, description, date, time, recurring, category, priority, ai_suggested, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.title,
      input.description ?? null,
      input.date,
      input.time ?? null,
      input.recurring ?? null,
      input.category ?? null,
      input.priority ?? 'medium',
      input.ai_suggested ? 1 : 0,
      now,
      now
    );
    const task = this.getById(result.lastInsertRowid as number)!;
    // Record pattern asynchronously
    patternService.record(task);
    return task;
  },

  update(id: number, input: Partial<CreateTaskInput>): Task | undefined {
    const db = getDB();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.title !== undefined) { fields.push('title = ?'); values.push(input.title); }
    if (input.description !== undefined) { fields.push('description = ?'); values.push(input.description); }
    if (input.date !== undefined) { fields.push('date = ?'); values.push(input.date); }
    if (input.time !== undefined) { fields.push('time = ?'); values.push(input.time); }
    if (input.recurring !== undefined) { fields.push('recurring = ?'); values.push(input.recurring); }
    if (input.category !== undefined) { fields.push('category = ?'); values.push(input.category); }
    if (input.priority !== undefined) { fields.push('priority = ?'); values.push(input.priority); }

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  toggleComplete(id: number): Task | undefined {
    const db = getDB();
    const task = this.getById(id);
    if (!task) return undefined;
    const newCompleted = task.completed ? 0 : 1;
    db.prepare('UPDATE tasks SET completed = ?, updated_at = ? WHERE id = ?')
      .run(newCompleted, new Date().toISOString(), id);
    return this.getById(id);
  },

  delete(id: number): boolean {
    const db = getDB();
    const result = db.prepare('UPDATE tasks SET completed = -1 WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
