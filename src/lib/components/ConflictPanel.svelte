<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';

	interface ConflictOption {
		id: string;
		label: string;
		description: string;
	}

	interface Props {
		conflictId: string;
		description: string;
		options: ConflictOption[];
		onresolve: (optionId: string) => void;
	}

	let { conflictId, description, options, onresolve }: Props = $props();
	let selectedOption: string | null = $state(null);
</script>

<Card class="mx-auto max-w-2xl">
	<CardHeader>
		<CardTitle>Conflict: {conflictId}</CardTitle>
		<p class="text-sm text-neutral-500">{description}</p>
	</CardHeader>
	<CardContent>
		<div class="mb-4 space-y-2">
			{#each options as option (option.id)}
				<button
					class="w-full rounded-lg border p-3 text-left transition-colors {selectedOption === option.id
						? 'border-neutral-900 bg-neutral-50'
						: 'border-neutral-200 hover:border-neutral-300'}"
					onclick={() => (selectedOption = option.id)}
				>
					<div class="font-medium text-sm">{option.label}</div>
					<div class="text-xs text-neutral-500">{option.description}</div>
				</button>
			{/each}
		</div>

		<Button disabled={!selectedOption} onclick={() => selectedOption && onresolve(selectedOption)}>
			Confirm Resolution
		</Button>
	</CardContent>
</Card>
