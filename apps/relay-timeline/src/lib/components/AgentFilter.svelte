<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let agents: string[] = [];
	export let selectedAgents: Set<string> = new Set();
	export let channels: string[] = [];
	export let selectedChannels: Set<string> = new Set();

	const dispatch = createEventDispatcher<{
		filterChange: { agents: Set<string>; channels: Set<string> };
	}>();

	const agentColors: Record<string, string> = {
		'Dashboard': 'bg-purple-500 hover:bg-purple-400',
		'Architect': 'bg-blue-500 hover:bg-blue-400',
		'UI-Agent': 'bg-green-500 hover:bg-green-400',
		'Backend-Agent': 'bg-orange-500 hover:bg-orange-400',
		'DevOps-Agent': 'bg-red-500 hover:bg-red-400',
		'Lead': 'bg-yellow-500 hover:bg-yellow-400',
		'Designer': 'bg-pink-500 hover:bg-pink-400',
		'__system__': 'bg-slate-500 hover:bg-slate-400'
	};

	function getAgentColor(agent: string): string {
		return agentColors[agent] || 'bg-cyan-500 hover:bg-cyan-400';
	}

	function toggleAgent(agent: string) {
		if (selectedAgents.has(agent)) {
			selectedAgents.delete(agent);
		} else {
			selectedAgents.add(agent);
		}
		selectedAgents = selectedAgents;
		dispatch('filterChange', { agents: selectedAgents, channels: selectedChannels });
	}

	function toggleChannel(channel: string) {
		if (selectedChannels.has(channel)) {
			selectedChannels.delete(channel);
		} else {
			selectedChannels.add(channel);
		}
		selectedChannels = selectedChannels;
		dispatch('filterChange', { agents: selectedAgents, channels: selectedChannels });
	}

	function selectAllAgents() {
		selectedAgents = new Set(agents);
		dispatch('filterChange', { agents: selectedAgents, channels: selectedChannels });
	}

	function clearAllAgents() {
		selectedAgents = new Set();
		dispatch('filterChange', { agents: selectedAgents, channels: selectedChannels });
	}

	function selectAllChannels() {
		selectedChannels = new Set(channels);
		dispatch('filterChange', { agents: selectedAgents, channels: selectedChannels });
	}

	function clearAllChannels() {
		selectedChannels = new Set();
		dispatch('filterChange', { agents: selectedAgents, channels: selectedChannels });
	}

	$: activeFiltersCount = selectedAgents.size + selectedChannels.size;
</script>

<div class="bg-slate-800 rounded-lg p-4 border border-slate-700" in:slide={{ duration: 200 }}>
	<!-- Agents Section -->
	<div class="mb-4">
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-sm font-medium text-slate-300 flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
				Agents
			</h3>
			<div class="flex gap-2">
				<button
					class="text-xs text-slate-400 hover:text-slate-200 transition-colors"
					on:click={selectAllAgents}
				>
					All
				</button>
				<span class="text-slate-600">|</span>
				<button
					class="text-xs text-slate-400 hover:text-slate-200 transition-colors"
					on:click={clearAllAgents}
				>
					None
				</button>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each agents as agent (agent)}
				<button
					class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 {selectedAgents.has(agent) ? getAgentColor(agent) + ' text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
					on:click={() => toggleAgent(agent)}
					animate:flip={{ duration: 200 }}
				>
					{agent === '__system__' ? 'System' : agent}
					{#if selectedAgents.has(agent)}
						<span class="ml-1" in:fade={{ duration: 150 }}>✓</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Channels Section -->
	{#if channels.length > 0}
		<div class="pt-4 border-t border-slate-700">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-medium text-slate-300 flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
					</svg>
					Channels
				</h3>
				<div class="flex gap-2">
					<button
						class="text-xs text-slate-400 hover:text-slate-200 transition-colors"
						on:click={selectAllChannels}
					>
						All
					</button>
					<span class="text-slate-600">|</span>
					<button
						class="text-xs text-slate-400 hover:text-slate-200 transition-colors"
						on:click={clearAllChannels}
					>
						None
					</button>
				</div>
			</div>

			<div class="flex flex-wrap gap-2">
				{#each channels as channel (channel)}
					<button
						class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 {selectedChannels.has(channel) ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
						on:click={() => toggleChannel(channel)}
						animate:flip={{ duration: 200 }}
					>
						{channel}
						{#if selectedChannels.has(channel)}
							<span class="ml-1" in:fade={{ duration: 150 }}>✓</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Active Filters Summary -->
	{#if activeFiltersCount > 0}
		<div class="mt-4 pt-3 border-t border-slate-700" in:slide={{ duration: 150 }}>
			<div class="flex items-center justify-between">
				<span class="text-xs text-slate-400">
					{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
				</span>
				<button
					class="text-xs text-red-400 hover:text-red-300 transition-colors"
					on:click={() => {
						clearAllAgents();
						clearAllChannels();
					}}
				>
					Clear all filters
				</button>
			</div>
		</div>
	{/if}
</div>
