import { db } from './db';
import { projects, messages } from './db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { ClaudeBridge, type ClaudeMessage } from './claude-bridge';
import { pushMessage } from './session-manager';

export type ProjectState =
	| 'intake'
	| 'research'
	| 'translate'
	| 'conflicts'
	| 'plan'
	| 'implement'
	| 'review'
	| 'deploy'
	| 'done';

const STATE_TRANSITIONS: Record<ProjectState, ProjectState | null> = {
	intake: 'research',
	research: 'translate',
	translate: 'conflicts',
	conflicts: 'plan',
	plan: 'implement',
	implement: 'review',
	review: 'deploy',
	deploy: 'done',
	done: null
};

// Maps project state to the req-framework command to invoke
const STATE_COMMANDS: Record<ProjectState, string> = {
	intake: '/req-intake',
	research: '/req-research',
	translate: '/req-translate',
	conflicts: '/req-detect-conflicts',
	plan: '/req-plan',
	implement: '/req-implement',
	review: '/req-review',
	deploy: '/req-deploy',
	done: ''
};

// Surfacing policy per §4.5
type SurfaceType = 'must-surface' | 'background-trigger' | 'background' | 'escape-hatch';

const SURFACING_POLICY: Record<string, SurfaceType> = {
	'/req-intake': 'must-surface',
	'/req-research': 'background-trigger',
	'/req-translate': 'background',
	'/req-detect-conflicts': 'background-trigger',
	'/req-resolve-conflict': 'must-surface',
	'/req-review': 'must-surface',
	'/req-plan': 'must-surface',
	'/req-implement': 'background-trigger',
	'/req-deploy': 'must-surface',
	'/req-feedback': 'background',
	'/req-iterate': 'escape-hatch',
	'/req-audit': 'background-trigger',
	'/req-autonomy': 'background',
	'/req-onboard': 'background'
};

export async function handleUserMessage(projectId: string, content: string): Promise<void> {
	const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
	if (!project) {
		pushMessage(projectId, { type: 'error', content: 'Project not found' });
		return;
	}

	const state = project.state as ProjectState;
	const command = STATE_COMMANDS[state];
	if (!command) {
		pushMessage(projectId, { type: 'text', content: 'Project is complete.' });
		return;
	}

	const surfaceType = SURFACING_POLICY[command] || 'background';

	// Emit surface event for frontend to decide UI behavior
	pushMessage(projectId, {
		type: 'text',
		content: JSON.stringify({
			event: 'command-start',
			command,
			surfaceType,
			state
		})
	});

	// Run Claude Code with the appropriate command
	const bridge = new ClaudeBridge();

	bridge.on('message', (msg: ClaudeMessage) => {
		pushMessage(projectId, msg);

		// Store assistant messages in DB
		if (msg.type === 'text' && !msg.content.startsWith('[user]')) {
			db.insert(messages)
				.values({
					id: nanoid(),
					projectId,
					role: 'assistant',
					content: msg.content,
					metadata: JSON.stringify({ command, surfaceType }),
					createdAt: new Date()
				})
				.run();
		}
	});

	try {
		await bridge.run({
			prompt: `${command} ${content}`,
			cwd: project.workspacePath || process.cwd()
		});

		// Advance state on success
		const nextState = STATE_TRANSITIONS[state];
		if (nextState) {
			db.update(projects)
				.set({
					state: nextState,
					orchestratorSnapshot: JSON.stringify({ previousState: state, timestamp: Date.now() }),
					updatedAt: new Date()
				})
				.where(eq(projects.id, projectId))
				.run();

			pushMessage(projectId, {
				type: 'text',
				content: JSON.stringify({
					event: 'state-transition',
					from: state,
					to: nextState
				})
			});
		}
	} catch (err) {
		pushMessage(projectId, {
			type: 'error',
			content: `Command ${command} failed: ${err instanceof Error ? err.message : String(err)}`
		});
	}
}
