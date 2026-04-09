<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		projectId: string;
		checklistItems?: { label: string; passed: boolean }[];
		onapprove: () => void;
		onreject: () => void;
		onrequestchanges: () => void;
	}

	let {
		projectId,
		checklistItems = [],
		onapprove,
		onreject,
		onrequestchanges
	}: Props = $props();

	const allPassed = $derived(checklistItems.every((item) => item.passed));
</script>

<Card class="mx-auto max-w-2xl">
	<CardHeader>
		<CardTitle>Review Checkpoint</CardTitle>
		<p class="text-sm text-neutral-500">Review the implementation before proceeding to deployment.</p>
	</CardHeader>
	<CardContent>
		{#if checklistItems.length > 0}
			<div class="mb-4 space-y-2">
				{#each checklistItems as item}
					<div class="flex items-center gap-2">
						<Badge variant={item.passed ? 'default' : 'destructive'}>
							{item.passed ? 'PASS' : 'FAIL'}
						</Badge>
						<span class="text-sm">{item.label}</span>
					</div>
				{/each}
			</div>
		{/if}

		<div class="flex gap-2">
			<Button onclick={onapprove} disabled={!allPassed && checklistItems.length > 0}>
				Approve
			</Button>
			<Button variant="outline" onclick={onrequestchanges}>
				Request Changes
			</Button>
			<Button variant="destructive" onclick={onreject}>
				Reject
			</Button>
		</div>
	</CardContent>
</Card>
