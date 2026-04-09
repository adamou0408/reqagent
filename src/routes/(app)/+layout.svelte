<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { Snippet } from 'svelte';

	interface Project {
		id: string;
		name: string;
		state: string;
	}

	let { children }: { children: Snippet } = $props();

	let projects: Project[] = $state([]);
	let activeProjectId: string | null = $state(null);

	async function loadProjects() {
		const res = await fetch('/api/projects');
		projects = await res.json();
	}

	async function createProject() {
		const name = prompt('Project name:');
		if (!name) return;

		const res = await fetch('/api/projects', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});
		const project = await res.json();
		projects = [project, ...projects];
		activeProjectId = project.id;
	}

	function selectProject(id: string) {
		activeProjectId = id;
	}

	$effect(() => {
		loadProjects();
	});
</script>

<div class="flex h-screen">
	<Sidebar {projects} {activeProjectId} onselect={selectProject} oncreate={createProject} />
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
</div>
