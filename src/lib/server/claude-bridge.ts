import { spawn, type ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface ClaudeMessage {
	type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'done';
	content: string;
	raw?: unknown;
}

export interface ClaudeBridgeOptions {
	prompt: string;
	cwd?: string;
	env?: Record<string, string>;
	allowedTools?: string[];
}

export class ClaudeBridge extends EventEmitter {
	private process: ChildProcess | null = null;
	private buffer = '';

	async run(options: ClaudeBridgeOptions): Promise<void> {
		const args = ['--print', '--output-format', 'json'];

		if (options.allowedTools?.length) {
			for (const tool of options.allowedTools) {
				args.push('--allowedTools', tool);
			}
		}

		args.push(options.prompt);

		const env = {
			...process.env,
			...options.env
		};

		return new Promise((resolve, reject) => {
			this.process = spawn('claude', args, {
				cwd: options.cwd || process.cwd(),
				env,
				stdio: ['pipe', 'pipe', 'pipe']
			});

			this.process.stdout?.on('data', (data: Buffer) => {
				this.buffer += data.toString();
				this.processBuffer();
			});

			this.process.stderr?.on('data', (data: Buffer) => {
				const text = data.toString().trim();
				if (text) {
					this.emit('message', {
						type: 'error',
						content: text
					} satisfies ClaudeMessage);
				}
			});

			this.process.on('close', (code) => {
				this.flushBuffer();
				this.emit('message', {
					type: 'done',
					content: `Process exited with code ${code}`
				} satisfies ClaudeMessage);
				this.process = null;
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Claude Code exited with code ${code}`));
				}
			});

			this.process.on('error', (err) => {
				this.emit('message', {
					type: 'error',
					content: err.message
				} satisfies ClaudeMessage);
				reject(err);
			});
		});
	}

	private processBuffer(): void {
		const lines = this.buffer.split('\n');
		this.buffer = lines.pop() || '';

		for (const line of lines) {
			this.parseLine(line.trim());
		}
	}

	private flushBuffer(): void {
		if (this.buffer.trim()) {
			this.parseLine(this.buffer.trim());
			this.buffer = '';
		}
	}

	private parseLine(line: string): void {
		if (!line) return;

		try {
			const parsed = JSON.parse(line);
			this.emit('message', {
				type: parsed.type || 'text',
				content: typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content),
				raw: parsed
			} satisfies ClaudeMessage);
		} catch {
			// Non-JSON output — treat as plain text
			this.emit('message', {
				type: 'text',
				content: line
			} satisfies ClaudeMessage);
		}
	}

	kill(): void {
		if (this.process) {
			this.process.kill('SIGTERM');
			this.process = null;
		}
	}
}
