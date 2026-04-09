<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';

	interface Props {
		summary: string;
		tasks: string[];
		estimatedEffort: string;
		onapprove: () => void;
		onreject: () => void;
	}

	let { summary, tasks, estimatedEffort, onapprove, onreject }: Props = $props();
</script>

<Card class="mx-auto max-w-2xl">
	<CardHeader>
		<CardTitle>Implementation Plan</CardTitle>
		<p class="text-sm text-neutral-500">
			AI has created a plan to build your app. Review it and approve to start building.
		</p>
	</CardHeader>
	<CardContent>
		<div class="mb-4 rounded-md bg-neutral-50 p-4 text-sm">
			<p class="mb-2">{summary}</p>
			<p class="text-xs text-neutral-500">Estimated effort: {estimatedEffort}</p>
		</div>

		{#if tasks.length > 0}
			<div class="mb-4">
				<h4 class="mb-2 text-sm font-medium">What AI will do:</h4>
				<ul class="space-y-1">
					{#each tasks as task, i}
						<li class="flex items-start gap-2 text-sm">
							<span class="text-neutral-400">{i + 1}.</span>
							<span>{task}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="flex gap-2">
			<Button onclick={onapprove}>Approve & Start Building</Button>
			<Button variant="outline" onclick={onreject}>Reject & Revise</Button>
		</div>
	</CardContent>
</Card>
