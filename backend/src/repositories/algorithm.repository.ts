import Database from 'better-sqlite3';
import { getDatabase } from '../db/connection';
import { AlgorithmEntity } from '../types/algorithm';

export class AlgorithmRepository {
  private customDb?: Database.Database;

  constructor(db?: Database.Database) {
    this.customDb = db;
  }

  private get db(): Database.Database {
    return this.customDb || getDatabase();
  }

  public findAllEnabled(): AlgorithmEntity[] {
    return this.db
      .prepare('SELECT * FROM algorithms WHERE is_enabled = 1 ORDER BY display_order ASC')
      .all() as AlgorithmEntity[];
  }

  public findEnabledById(id: string): AlgorithmEntity | null {
    const row = this.db
      .prepare('SELECT * FROM algorithms WHERE id = ? AND is_enabled = 1 LIMIT 1')
      .get(id) as AlgorithmEntity | undefined;
    return row || null;
  }

  public findById(id: string): AlgorithmEntity | null {
    const row = this.db
      .prepare('SELECT * FROM algorithms WHERE id = ? LIMIT 1')
      .get(id) as AlgorithmEntity | undefined;
    return row || null;
  }
}
