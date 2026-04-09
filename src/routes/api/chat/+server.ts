import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { messages } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { pushMessage } from '$lib/server/session-manager';
import { handleUserMessage } from '$lib/server/orchestrator';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { projectId, content } = body;

	if (!projectId || !content) {
		return json({ error: 'Missing projectId or content' }, { status: 400 });
	}

	// Store user message
	const userMsg = {
		id: nanoid(),
		projectId,
		role: 'user' as const,
		content,
		metadata: null,
		createdAt: new Date()
	};
	db.insert(messages).values(userMsg).run();

	// Push to SSE
	pushMessage(projectId, { type: 'text', content: `[user] ${content}` });

	// Hand off to orchestrator (async, streams results via SSE)
	handleUserMessage(projectId, content).catch((err) => {
		pushMessage(projectId, {
			type: 'error',
			content: `Orchestrator error: ${err.message}`
		});
	});

	return json({ messageId: userMsg.id });
};
