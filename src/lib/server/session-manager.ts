import type { ClaudeMessage } from './claude-bridge';

export interface Session {
	id: string;
	projectId: string;
	messages: ClaudeMessage[];
	listeners: Set<(msg: ClaudeMessage) => void>;
}

const sessions = new Map<string, Session>();

export function getOrCreateSession(projectId: string): Session {
	let session = sessions.get(projectId);
	if (!session) {
		session = {
			id: projectId,
			projectId,
			messages: [],
			listeners: new Set()
		};
		sessions.set(projectId, session);
	}
	return session;
}

export function pushMessage(projectId: string, msg: ClaudeMessage): void {
	const session = getOrCreateSession(projectId);
	session.messages.push(msg);
	for (const listener of session.listeners) {
		listener(msg);
	}
}

export function subscribe(projectId: string, listener: (msg: ClaudeMessage) => void): () => void {
	const session = getOrCreateSession(projectId);
	session.listeners.add(listener);
	return () => {
		session.listeners.delete(listener);
	};
}

export function getSession(projectId: string): Session | undefined {
	return sessions.get(projectId);
}
