import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const project = db.select().from(projects).where(eq(projects.id, params.id)).get();
	if (!project) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	return json(project);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updates: Record<string, unknown> = { updatedAt: new Date() };

	if (body.name !== undefined) updates.name = body.name;
	if (body.description !== undefined) updates.description = body.description;
	if (body.state !== undefined) updates.state = body.state;
	if (body.orchestratorSnapshot !== undefined) updates.orchestratorSnapshot = body.orchestratorSnapshot;

	db.update(projects).set(updates).where(eq(projects.id, params.id)).run();

	const updated = db.select().from(projects).where(eq(projects.id, params.id)).get();
	return json(updated);
};
