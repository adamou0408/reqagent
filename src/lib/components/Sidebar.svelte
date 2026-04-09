<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	interface Project {
		id: string;
		name: string;
		state: string;
	}

	interface Props {
		projects: Project[];
		activeProjectId: string | null;
		onselect: (id: string) => void;
		oncreate: () => void;
	}

	let { projects, activeProjectId, onselect, oncreate }: Props = $props();
</script>

<aside class="flex h-full w-64 flex-col border-r border-neutral-200 bg-neutral-50">
	<div class="flex items-center justify-between border-b border-neutral-200 p-4">
		<h2 class="text-sm font-semibold">Projects</h2>
		<Button variant="outline" size="sm" onclick={oncreate}>+ New</Button>
	</div>

	<nav class="flex-1 overflow-y-auto p-2">
		{#each projects as project (project.id)}
			<button
				class="mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-200 {project.id ===
				activeProjectId
					? 'bg-neutral-200 font-medium'
					: ''}"
				onclick={() => onselect(project.id)}
			>
				<span class="truncate">{project.name}</span>
				<Badge variant="outline" class="ml-2 text-xs">{project.state}</Badge>
			</button>
		{/each}

		{#if projects.length === 0}
			<p class="p-4 text-center text-sm text-neutral-400">No projects yet</p>
		{/if}
	</nav>
</aside>
