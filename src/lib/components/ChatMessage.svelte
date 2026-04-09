<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		role: 'user' | 'assistant' | 'system' | 'error';
		content: string;
	}

	let { role, content }: Props = $props();

	const roleColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
		user: 'secondary',
		assistant: 'default',
		system: 'outline',
		error: 'destructive'
	};
</script>

<div class="flex gap-3 py-3 {role === 'user' ? 'justify-end' : 'justify-start'}">
	<div class="max-w-[80%] space-y-1">
		<Badge variant={roleColors[role] || 'outline'}>{role}</Badge>
		<div
			class="rounded-lg px-4 py-2 text-sm {role === 'user'
				? 'bg-neutral-900 text-white'
				: role === 'error'
					? 'bg-red-50 text-red-900 border border-red-200'
					: 'bg-neutral-100 text-neutral-900'}"
		>
			{content}
		</div>
	</div>
</div>
