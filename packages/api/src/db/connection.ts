import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { getEnv } from '../core/config'

let _conn: Database.Database | null = null

export function connect(): Database.Database {
  if (_conn) return _conn

  const env = getEnv()
  const dir = path.dirname(env.dbFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  _conn = new Database(env.dbFile)
  _conn.pragma('journal_mode = WAL')
  _conn.pragma('foreign_keys = ON')

  _conn.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      comment TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      expiration INTEGER,
      title TEXT,
      description TEXT,
      image TEXT,
      apple TEXT,
      google TEXT,
      cloaking INTEGER DEFAULT 0,
      redirect_with_query INTEGER DEFAULT 0,
      password TEXT,
      unsafe INTEGER DEFAULT 0,
      geo TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug);
    CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);

    CREATE TABLE IF NOT EXISTS links_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  // Migrations for existing databases
  try {
    const cols = _conn.pragma('table_info(links)') as Array<{ name: string }>
    if (!cols.some(c => c.name === 'tags')) {
      _conn.exec('ALTER TABLE links ADD COLUMN tags TEXT')
    }
  } catch {
    // ignore migration errors
  }

  _conn.exec(`

    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id TEXT,
      slug TEXT,
      url TEXT,
      ua TEXT,
      ip TEXT,
      referer TEXT,
      country TEXT,
      region TEXT,
      city TEXT,
      timezone TEXT,
      language TEXT,
      os TEXT,
      browser TEXT,
      browser_type TEXT,
      device TEXT,
      device_type TEXT,
      latitude REAL DEFAULT 0,
      longitude REAL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_access_logs_link_id ON access_logs(link_id);
    CREATE INDEX IF NOT EXISTS idx_access_logs_slug ON access_logs(slug);
    CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
  `)

  return _conn
}

export function disconnect(): void {
  if (_conn) { _conn.close(); _conn = null }
}
