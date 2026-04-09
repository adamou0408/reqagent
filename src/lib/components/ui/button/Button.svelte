<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		children?: Snippet;
	}

	let { variant = 'default', size = 'default', class: className, children, ...rest }: Props = $props();

	const variantClasses: Record<string, string> = {
		default: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90',
		destructive: 'bg-red-500 text-neutral-50 hover:bg-red-500/90',
		outline: 'border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900',
		secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80',
		ghost: 'hover:bg-neutral-100 hover:text-neutral-900',
		link: 'text-neutral-900 underline-offset-4 hover:underline'
	};

	const sizeClasses: Record<string, string> = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};
</script>

<button
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
	{...rest}
>
	{#if children}{@render children()}{/if}
</button>
