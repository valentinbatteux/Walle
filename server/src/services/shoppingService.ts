import { getDB } from '../db/database';
import { ShoppingItem } from '../types';

export const shoppingService = {
  getAll(): ShoppingItem[] {
    const db = getDB();
    return db.prepare(
      'SELECT * FROM shopping_items WHERE completed != -1 ORDER BY category ASC, name ASC'
    ).all() as ShoppingItem[];
  },

  getById(id: number): ShoppingItem | undefined {
    const db = getDB();
    return db.prepare('SELECT * FROM shopping_items WHERE id = ?').get(id) as ShoppingItem | undefined;
  },

  create(input: { name: string; quantity?: string; category?: string; recurring?: boolean }): ShoppingItem {
    const db = getDB();
    const result = db.prepare(`
      INSERT INTO shopping_items (name, quantity, category, recurring)
      VALUES (?, ?, ?, ?)
    `).run(
      input.name,
      input.quantity ?? null,
      input.category ?? null,
      input.recurring ? 1 : 0
    );
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, input: Partial<{ name: string; quantity: string; category: string; recurring: boolean }>): ShoppingItem | undefined {
    const db = getDB();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
    if (input.quantity !== undefined) { fields.push('quantity = ?'); values.push(input.quantity); }
    if (input.category !== undefined) { fields.push('category = ?'); values.push(input.category); }
    if (input.recurring !== undefined) { fields.push('recurring = ?'); values.push(input.recurring ? 1 : 0); }

    if (fields.length === 0) return this.getById(id);
    values.push(id);

    db.prepare(`UPDATE shopping_items SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  toggleComplete(id: number): ShoppingItem | undefined {
    const db = getDB();
    const item = this.getById(id);
    if (!item) return undefined;
    db.prepare('UPDATE shopping_items SET completed = ? WHERE id = ?')
      .run(item.completed ? 0 : 1, id);
    return this.getById(id);
  },

  delete(id: number): boolean {
    const db = getDB();
    const result = db.prepare('DELETE FROM shopping_items WHERE id = ?').run(id);
    return result.changes > 0;
  },

  resetList(): void {
    const db = getDB();
    db.prepare('UPDATE shopping_items SET completed = 0 WHERE recurring = 0').run();
    db.prepare('UPDATE shopping_items SET completed = 0 WHERE recurring = 1').run();
  },
};
