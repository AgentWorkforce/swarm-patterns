<script lang="ts">
	import { fly, fade } from 'svelte/transition';

	export let message: {
		id: string;
		ts: number;
		from: string;
		to: string;
		kind: string;
		body: string;
		is_urgent: boolean;
		is_broadcast: boolean;
	};
	export let index: number = 0;

	const agentColors: Record<string, string> = {
		'Dashboard': 'bg-purple-500',
		'Architect': 'bg-blue-500',
		'UI-Agent': 'bg-green-500',
		'Backend-Agent': 'bg-orange-500',
		'DevOps-Agent': 'bg-red-500',
		'Lead': 'bg-yellow-500',
		'Designer': 'bg-pink-500',
		'__system__': 'bg-slate-500'
	};

	function getAgentColor(agent: string): string {
		return agentColors[agent] || 'bg-cyan-500';
	}

	function formatTime(ts: number): string {
		return new Date(ts).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div
	class="relative pl-8 pb-8 group"
	in:fly={{ y: 20, duration: 300, delay: index * 50 }}
>
	<!-- Timeline line -->
	<div class="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-700 group-last:hidden"></div>

	<!-- Timeline dot -->
	<div class="absolute left-1.5 top-2 w-4 h-4 rounded-full border-2 border-slate-700 {getAgentColor(message.from)}"></div>

	<!-- Card -->
	<div
		class="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
		class:border-yellow-500={message.is_urgent}
		class:border-l-4={message.is_urgent}
	>
		<!-- Header -->
		<div class="flex items-center justify-between mb-2">
			<div class="flex items-center gap-2">
				<!-- Sender badge -->
				<span class="px-2 py-1 rounded-full text-xs font-medium text-white {getAgentColor(message.from)}">
					{message.from}
				</span>

				<!-- Arrow -->
				<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
				</svg>

				<!-- Recipient -->
				<span class="text-sm text-slate-400">{message.to}</span>

				<!-- Message kind badge -->
				{#if message.kind !== 'message'}
					<span class="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
						{message.kind}
					</span>
				{/if}

				{#if message.is_broadcast}
					<span class="px-2 py-0.5 rounded text-xs bg-indigo-900 text-indigo-300">
						broadcast
					</span>
				{/if}
			</div>

			<!-- Timestamp -->
			<div class="text-right">
				<div class="text-xs text-slate-500">{formatDate(message.ts)}</div>
				<div class="text-xs text-slate-400">{formatTime(message.ts)}</div>
			</div>
		</div>

		<!-- Body -->
		<div class="text-slate-200 text-sm whitespace-pre-wrap break-words">
			{message.body}
		</div>

		<!-- Urgent indicator -->
		{#if message.is_urgent}
			<div class="mt-2 flex items-center gap-1 text-yellow-500 text-xs" in:fade>
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
				<span>Urgent</span>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Additional hover effects */
	.group:hover .absolute.left-1\.5 {
		transform: scale(1.2);
		transition: transform 0.2s ease;
	}
</style>
