import type { RequestHandler } from './$types';
import { subscribe, getOrCreateSession } from '$lib/server/session-manager';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	if (!projectId) {
		return new Response('Missing projectId', { status: 400 });
	}

	const lastEventId = url.searchParams.get('lastEventId');
	const session = getOrCreateSession(projectId);

	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();
			let eventId = 0;

			const send = (data: string, id?: number) => {
				const idStr = id !== undefined ? `id: ${id}\n` : '';
				controller.enqueue(encoder.encode(`${idStr}data: ${data}\n\n`));
			};

			// Replay missed events if reconnecting
			if (lastEventId) {
				const startFrom = parseInt(lastEventId, 10) + 1;
				for (let i = startFrom; i < session.messages.length; i++) {
					send(JSON.stringify(session.messages[i]), i);
				}
				eventId = session.messages.length;
			}

			const unsubscribe = subscribe(projectId, (msg) => {
				send(JSON.stringify(msg), eventId++);
			});

			// Clean up on close
			const checkClosed = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(': keepalive\n\n'));
				} catch {
					clearInterval(checkClosed);
					unsubscribe();
				}
			}, 15000);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
