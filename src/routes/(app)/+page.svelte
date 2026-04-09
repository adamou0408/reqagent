<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	interface Message {
		role: 'user' | 'assistant' | 'system' | 'error';
		content: string;
	}

	let chatMessages: Message[] = $state([]);
	let inputValue = $state('');
	let sending = $state(false);
	let chatContainer: HTMLDivElement | undefined = $state();
	let eventSource: EventSource | null = $state(null);

	// TODO: get activeProjectId from layout context
	let activeProjectId: string | null = $state(null);

	function connectSSE(projectId: string) {
		if (eventSource) {
			eventSource.close();
		}

		eventSource = new EventSource(`/api/sse?projectId=${projectId}`);

		eventSource.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				const role = msg.type === 'error' ? 'error' : 'assistant';
				chatMessages = [...chatMessages, { role, content: msg.content }];
				scrollToBottom();
			} catch {
				chatMessages = [...chatMessages, { role: 'assistant', content: event.data }];
				scrollToBottom();
			}
		};

		eventSource.onerror = () => {
			// EventSource auto-reconnects
		};
	}

	async function sendMessage() {
		if (!inputValue.trim() || !activeProjectId || sending) return;

		const content = inputValue.trim();
		inputValue = '';
		sending = true;

		chatMessages = [...chatMessages, { role: 'user', content }];
		scrollToBottom();

		try {
			await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ projectId: activeProjectId, content })
			});
		} catch (err) {
			chatMessages = [
				...chatMessages,
				{ role: 'error', content: `Failed to send: ${err instanceof Error ? err.message : 'unknown'}` }
			];
		} finally {
			sending = false;
		}
	}

	function scrollToBottom() {
		requestAnimationFrame(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	$effect(() => {
		if (activeProjectId) {
			chatMessages = [];
			connectSSE(activeProjectId);
		}
		return () => {
			if (eventSource) eventSource.close();
		};
	});
</script>

<div class="flex flex-1 flex-col">
	{#if !activeProjectId}
		<div class="flex flex-1 items-center justify-center text-neutral-400">
			<p>Select a project or create a new one to get started.</p>
		</div>
	{:else}
		<!-- Chat messages -->
		<div bind:this={chatContainer} class="flex-1 overflow-y-auto px-4 py-2">
			{#each chatMessages as msg}
				<ChatMessage role={msg.role} content={msg.content} />
			{/each}

			{#if chatMessages.length === 0}
				<div class="flex h-full items-center justify-center text-neutral-400">
					<p>Describe what you want to build...</p>
				</div>
			{/if}
		</div>

		<!-- Input area -->
		<div class="border-t border-neutral-200 p-4">
			<div class="flex gap-2">
				<Input
					bind:value={inputValue}
					placeholder="Tell me what you want to build..."
					disabled={sending}
					onkeydown={handleKeydown}
					class="flex-1"
				/>
				<Button onclick={sendMessage} disabled={sending || !inputValue.trim()}>
					{sending ? 'Sending...' : 'Send'}
				</Button>
			</div>
		</div>
	{/if}
</div>
