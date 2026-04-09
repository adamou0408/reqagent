import { execSync, type ExecSyncOptions } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ALLOWED_COMMANDS = ['npm', 'npx', 'node'];

const WORKSPACE_ROOT = process.env.REQAGENT_WORKSPACE || join(process.cwd(), 'workspace');

export interface SandboxResult {
	success: boolean;
	output: string;
	auditPassed: boolean;
	auditOutput?: string;
}

export function getProjectWorkspace(projectSlug: string): string {
	const dir = join(WORKSPACE_ROOT, 'projects', projectSlug);
	mkdirSync(dir, { recursive: true });
	return dir;
}

export function runSandboxed(command: string, projectSlug: string): SandboxResult {
	const parts = command.trim().split(/\s+/);
	const bin = parts[0];

	if (!ALLOWED_COMMANDS.includes(bin)) {
		return {
			success: false,
			output: `Command "${bin}" is not allowed. Allowed: ${ALLOWED_COMMANDS.join(', ')}`,
			auditPassed: false
		};
	}

	const cwd = getProjectWorkspace(projectSlug);
	const execOpts: ExecSyncOptions = {
		cwd,
		timeout: 120000,
		encoding: 'utf-8',
		env: { ...process.env, npm_config_ignore_scripts: 'true' }
	};

	try {
		const output = execSync(command, execOpts) as string;

		// Run audit after npm install
		if (command.includes('npm install') || command.includes('npm i')) {
			const auditResult = runAudit(cwd);
			return {
				success: auditResult.passed,
				output,
				auditPassed: auditResult.passed,
				auditOutput: auditResult.output
			};
		}

		return { success: true, output, auditPassed: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { success: false, output: message, auditPassed: false };
	}
}

function runAudit(cwd: string): { passed: boolean; output: string } {
	if (!existsSync(join(cwd, 'package.json'))) {
		return { passed: true, output: 'No package.json — skipping audit' };
	}

	try {
		const output = execSync('npm audit --audit-level=high --json', {
			cwd,
			timeout: 30000,
			encoding: 'utf-8'
		}) as string;
		return { passed: true, output };
	} catch (err) {
		// npm audit exits non-zero when vulnerabilities found
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes('high') || message.includes('critical')) {
			return { passed: false, output: `High/critical vulnerabilities found:\n${message}` };
		}
		return { passed: true, output: message };
	}
}
