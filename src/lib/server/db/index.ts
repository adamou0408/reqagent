import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { join } from 'path';
import { mkdirSync } from 'fs';

let _db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb(): BetterSQLite3Database<typeof schema> {
	if (!_db) {
		const dbPath = process.env.REQAGENT_DB_PATH || join(process.cwd(), 'data', 'reqagent.db');
		const dir = dbPath.substring(0, dbPath.lastIndexOf('/'));
		mkdirSync(dir, { recursive: true });

		const sqlite = new Database(dbPath);
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');
		_db = drizzle(sqlite, { schema });
	}
	return _db;
}

// Convenience getter — lazily initialized
export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
	get(_target, prop) {
		return (getDb() as Record<string | symbol, unknown>)[prop];
	}
});
