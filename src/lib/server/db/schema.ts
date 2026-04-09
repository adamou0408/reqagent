import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	state: text('state').notNull().default('intake'),
	orchestratorSnapshot: text('orchestrator_snapshot', { mode: 'json' }),
	specPath: text('spec_path'),
	planPath: text('plan_path'),
	workspacePath: text('workspace_path'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const messages = sqliteTable('messages', {
	id: text('id').primaryKey(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id),
	role: text('role').notNull(),
	content: text('content').notNull(),
	metadata: text('metadata', { mode: 'json' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const conflicts = sqliteTable('conflicts', {
	id: text('id').primaryKey(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id),
	conflictId: text('conflict_id').notNull(),
	description: text('description').notNull(),
	resolution: text('resolution'),
	resolvedAt: integer('resolved_at', { mode: 'timestamp' })
});
