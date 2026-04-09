<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div class={cn('rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm', className)} {...rest}>
	{#if children}{@render children()}{/if}
</div>
