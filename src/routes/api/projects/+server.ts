import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { desc } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const all = db.select().from(projects).orderBy(desc(projects.updatedAt)).all();
	return json(all);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { name, description } = body;

	if (!name) {
		return json({ error: 'Missing name' }, { status: 400 });
	}

	const now = new Date();
	const project = {
		id: nanoid(),
		name,
		description: description || null,
		state: 'intake' as const,
		orchestratorSnapshot: null,
		specPath: null,
		planPath: null,
		workspacePath: null,
		createdAt: now,
		updatedAt: now
	};

	db.insert(projects).values(project).run();
	return json(project, { status: 201 });
};
