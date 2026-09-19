import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { initializeSchema } from './schema';
import { seedAlgorithms } from './seed';

let dbInstance: Database.Database | null = null;

export function getDatabasePath(customPath?: string): string {
  const target = customPath || env.DATABASE_PATH;
  if (target === ':memory:') {
    return ':memory:';
  }
  return path.isAbsolute(target) ? target : path.resolve(__dirname, '../../', target);
}

export function initDatabase(dbPath?: string): Database.Database {
  try {
    const resolvedPath = getDatabasePath(dbPath);

    if (resolvedPath !== ':memory:') {
      const dir = path.dirname(resolvedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const db = new Database(resolvedPath);

    if (resolvedPath !== ':memory:') {
      db.pragma('journal_mode = WAL');
    }

    // Initialize tables and indexes
    initializeSchema(db);

    // Idempotent seeding
    seedAlgorithms(db);

    dbInstance = db;
    return db;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Database initialization failed: ${msg}`);
  }
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance && dbInstance.open) {
    dbInstance.close();
  }
  dbInstance = null;
}
