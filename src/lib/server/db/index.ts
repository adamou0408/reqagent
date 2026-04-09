import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { join } from 'path';
import { mkdirSync } from 'fs';

let _db: LibSQLDatabase<typeof schema> | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
	if (!_db) {
		const dbPath = process.env.REQAGENT_DB_PATH || join(process.cwd(), 'data', 'reqagent.db');
		const dir = dbPath.substring(0, dbPath.lastIndexOf('/'));
		if (dir) {
			mkdirSync(dir, { recursive: true });
		}

		const client = createClient({ url: `file:${dbPath}` });
		_db = drizzle(client, { schema });
	}
	return _db;
}

// Convenience getter — lazily initialized
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
	get(_target, prop) {
		return (getDb() as Record<string | symbol, unknown>)[prop];
	}
});
