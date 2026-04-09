<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
		children?: Snippet;
	}

	let { variant = 'default', class: className, children, ...rest }: Props = $props();

	const variantClasses: Record<string, string> = {
		default: 'border-transparent bg-neutral-900 text-neutral-50 hover:bg-neutral-900/80',
		secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80',
		destructive: 'border-transparent bg-red-500 text-neutral-50 hover:bg-red-500/80',
		outline: 'text-neutral-950'
	};
</script>

<div
	class={cn(
		'inline-flex items-center rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2',
		variantClasses[variant],
		className
	)}
	{...rest}
>
	{#if children}{@render children()}{/if}
</div>
