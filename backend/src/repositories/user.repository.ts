import Database from 'better-sqlite3';
import { getDatabase } from '../db/connection';
import { UserRecord, SafeUser } from '../types/user';

export class UserRepository {
  private customDb?: Database.Database;

  constructor(db?: Database.Database) {
    this.customDb = db;
  }

  private get db(): Database.Database {
    return this.customDb || getDatabase();
  }

  public create(user: {
    id: string;
    email: string;
    username: string;
    password_hash: string;
  }): SafeUser {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, username, password_hash)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(user.id, user.email.toLowerCase(), user.username, user.password_hash);

    return {
      id: user.id,
      email: user.email.toLowerCase(),
      username: user.username,
    };
  }

  public findByEmail(email: string): UserRecord | null {
    const row = this.db
      .prepare('SELECT id, email, username, password_hash, created_at FROM users WHERE email = ? COLLATE NOCASE LIMIT 1')
      .get(email.toLowerCase()) as UserRecord | undefined;
    return row || null;
  }

  public findByUsername(username: string): UserRecord | null {
    const row = this.db
      .prepare('SELECT id, email, username, password_hash, created_at FROM users WHERE username = ? COLLATE NOCASE LIMIT 1')
      .get(username) as UserRecord | undefined;
    return row || null;
  }

  public findById(id: string): SafeUser | null {
    const row = this.db
      .prepare('SELECT id, email, username, created_at FROM users WHERE id = ? LIMIT 1')
      .get(id) as SafeUser | undefined;
    return row || null;
  }

  public findFullById(id: string): UserRecord | null {
    const row = this.db
      .prepare('SELECT id, email, username, password_hash, created_at FROM users WHERE id = ? LIMIT 1')
      .get(id) as UserRecord | undefined;
    return row || null;
  }
}
