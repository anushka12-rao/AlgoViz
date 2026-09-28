import Database from 'better-sqlite3';

export const CREATE_ALGORITHMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS algorithms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN (
    'sorting',
    'searching',
    'data_structures',
    'trees',
    'graphs'
  )),
  description TEXT NOT NULL,
  time_complexity_best TEXT NOT NULL,
  time_complexity_avg TEXT NOT NULL,
  time_complexity_worst TEXT NOT NULL,
  space_complexity TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK(input_type IN (
    'array',
    'array_and_target',
    'data_structure_ops',
    'tree_preorder',
    'bst_values',
    'graph_edges'
  )),
  display_order INTEGER NOT NULL UNIQUE,
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK(is_enabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_algorithms_category ON algorithms(category);
CREATE INDEX IF NOT EXISTS idx_algorithms_enabled_order ON algorithms(is_enabled, display_order);
`;

export const CREATE_USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
`;

export function initializeSchema(db: Database.Database): void {
  db.exec(CREATE_ALGORITHMS_TABLE_SQL);
  db.exec(CREATE_USERS_TABLE_SQL);
}
