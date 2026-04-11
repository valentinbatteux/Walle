import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database;

export function getDB(): Database.Database {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../walle.db');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const database = getDB();

      database.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
          id           INTEGER PRIMARY KEY AUTOINCREMENT,
          title        TEXT NOT NULL,
          description  TEXT,
          date         TEXT NOT NULL,
          time         TEXT,
          completed    INTEGER NOT NULL DEFAULT 0,
          recurring    TEXT,
          category     TEXT,
          priority     TEXT NOT NULL DEFAULT 'medium',
          ai_suggested INTEGER NOT NULL DEFAULT 0,
          created_at   TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);

        CREATE TABLE IF NOT EXISTS shopping_items (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          name       TEXT NOT NULL,
          quantity   TEXT,
          category   TEXT,
          completed  INTEGER NOT NULL DEFAULT 0,
          recurring  INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS task_patterns (
          id            INTEGER PRIMARY KEY AUTOINCREMENT,
          day_of_week   INTEGER,
          category      TEXT,
          title_tokens  TEXT NOT NULL,
          frequency     INTEGER NOT NULL DEFAULT 1,
          last_seen     TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS ai_feedback (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          suggestion_text TEXT NOT NULL,
          accepted        INTEGER NOT NULL DEFAULT 0,
          date_context    TEXT NOT NULL,
          created_at      TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      console.log('Database initialized');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
