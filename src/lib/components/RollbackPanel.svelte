<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';

	interface Props {
		errorSummary: string;
		attemptCount: number;
		onretry: () => void;
		onsimplify: () => void;
		onpause: () => void;
	}

	let { errorSummary, attemptCount, onretry, onsimplify, onpause }: Props = $props();
</script>

<Card class="mx-auto max-w-2xl border-amber-200 bg-amber-50">
	<CardHeader>
		<CardTitle class="text-amber-900">Build Paused</CardTitle>
		<p class="text-sm text-amber-700">
			AI tried {attemptCount} times but couldn't get the app to work correctly.
		</p>
	</CardHeader>
	<CardContent>
		<div class="mb-4 rounded-md bg-white p-3 text-sm text-neutral-700">
			{errorSummary}
		</div>

		<p class="mb-4 text-sm text-amber-800">What would you like to do?</p>

		<div class="flex flex-col gap-2">
			<Button onclick={onretry} class="justify-start">
				Try a different approach
			</Button>
			<Button variant="outline" onclick={onsimplify} class="justify-start">
				Simplify what I described earlier
			</Button>
			<Button variant="ghost" onclick={onpause} class="justify-start text-neutral-500">
				Pause for now, I'll come back later
			</Button>
		</div>
	</CardContent>
</Card>
