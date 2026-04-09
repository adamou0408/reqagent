<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		projectName: string;
		previewUrl?: string;
		onpreview: () => void;
		onpublish: () => void;
		onrollback: () => void;
	}

	let { projectName, previewUrl, onpreview, onpublish, onrollback }: Props = $props();
</script>

<Card class="mx-auto max-w-2xl">
	<CardHeader>
		<CardTitle>Deploy: {projectName}</CardTitle>
		<p class="text-sm text-neutral-500">Your app is ready. Preview it or go back to make changes.</p>
	</CardHeader>
	<CardContent>
		{#if previewUrl}
			<div class="mb-4 rounded-md bg-neutral-50 p-3">
				<p class="text-sm text-neutral-600">Preview available at:</p>
				<a href={previewUrl} target="_blank" rel="noopener" class="text-sm font-medium text-blue-600 hover:underline">
					{previewUrl}
				</a>
			</div>
		{/if}

		<div class="flex gap-2">
			<Button onclick={onpreview}>
				Preview
			</Button>
			<Button variant="secondary" onclick={onpublish}>
				<Badge variant="outline" class="mr-1">v0.2</Badge> Publish
			</Button>
			<Button variant="outline" onclick={onrollback}>
				Go Back
			</Button>
		</div>
	</CardContent>
</Card>
