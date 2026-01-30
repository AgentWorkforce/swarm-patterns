<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import MessageCard from './MessageCard.svelte';
	import AgentFilter from './AgentFilter.svelte';

	interface Message {
		id: string;
		ts: number;
		from: string;
		to: string;
		kind: string;
		body: string;
		is_urgent: boolean;
		is_broadcast: boolean;
		data?: Record<string, unknown>;
	}

	interface MessageWrapper {
		type: string;
		message: Message;
	}

	export let messages: MessageWrapper[] = [];
	export let title: string = 'Agent Timeline';
	export let showFilters: boolean = true;

	let selectedAgents: Set<string> = new Set();
	let selectedChannels: Set<string> = new Set();
	let showFilterPanel: boolean = false;
	let searchQuery: string = '';

	$: allAgents = [...new Set(messages.map((m) => m.message.from))].sort();
	$: allChannels = [...new Set(messages.map((m) => m.message.to).filter((to) => to.startsWith('#')))].sort();

	$: filteredMessages = messages
		.filter((m) => {
			const msg = m.message;

			// Agent filter
			if (selectedAgents.size > 0 && !selectedAgents.has(msg.from)) {
				return false;
			}

			// Channel filter
			if (selectedChannels.size > 0 && msg.to.startsWith('#') && !selectedChannels.has(msg.to)) {
				return false;
			}

			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					msg.body.toLowerCase().includes(query) ||
					msg.from.toLowerCase().includes(query) ||
					msg.to.toLowerCase().includes(query)
				);
			}

			return true;
		})
		.sort((a, b) => a.message.ts - b.message.ts);

	function handleFilterChange(event: CustomEvent<{ agents: Set<string>; channels: Set<string> }>) {
		selectedAgents = event.detail.agents;
		selectedChannels = event.detail.channels;
	}

	function toggleFilterPanel() {
		showFilterPanel = !showFilterPanel;
	}

	function clearSearch() {
		searchQuery = '';
	}

	$: activeFiltersCount = selectedAgents.size + selectedChannels.size + (searchQuery ? 1 : 0);
</script>

<div class="min-h-screen bg-slate-900 text-white">
	<!-- Header -->
	<header class="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-6 py-4">
		<div class="max-w-4xl mx-auto">
			<div class="flex items-center justify-between mb-4">
				<h1 class="text-2xl font-bold text-white flex items-center gap-3" in:fly={{ y: -20, duration: 400 }}>
					<svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					{title}
				</h1>

				<div class="flex items-center gap-4">
					<span class="text-sm text-slate-400">
						{filteredMessages.length} of {messages.length} messages
					</span>

					{#if showFilters}
						<button
							class="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {showFilterPanel ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
							on:click={toggleFilterPanel}
						>
							<span class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
								</svg>
								Filters
							</span>

							{#if activeFiltersCount > 0}
								<span
									class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 text-xs flex items-center justify-center"
									in:fade={{ duration: 150 }}
								>
									{activeFiltersCount}
								</span>
							{/if}
						</button>
					{/if}
				</div>
			</div>

			<!-- Search Bar -->
			<div class="relative" in:fly={{ y: -10, duration: 300, delay: 100 }}>
				<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					placeholder="Search messages..."
					class="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
					bind:value={searchQuery}
				/>
				{#if searchQuery}
					<button
						class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
						on:click={clearSearch}
						in:fade={{ duration: 150 }}
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>

			<!-- Filter Panel -->
			{#if showFilters && showFilterPanel}
				<div class="mt-4" transition:slide={{ duration: 200, easing: quintOut }}>
					<AgentFilter
						agents={allAgents}
						channels={allChannels}
						{selectedAgents}
						{selectedChannels}
						on:filterChange={handleFilterChange}
					/>
				</div>
			{/if}
		</div>
	</header>

	<!-- Timeline Content -->
	<main class="max-w-4xl mx-auto px-6 py-8">
		{#if filteredMessages.length === 0}
			<div class="text-center py-16" in:fade={{ duration: 300 }}>
				<svg class="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
				<h3 class="text-lg font-medium text-slate-400 mb-2">No messages found</h3>
				<p class="text-slate-500">
					{#if searchQuery || activeFiltersCount > 0}
						Try adjusting your filters or search query
					{:else}
						No messages to display
					{/if}
				</p>
			</div>
		{:else}
			<div class="relative">
				{#each filteredMessages as wrapper, index (wrapper.message.id)}
					<MessageCard message={wrapper.message} {index} />
				{/each}
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-700 px-6 py-4 mt-8">
		<div class="max-w-4xl mx-auto text-center text-slate-500 text-sm">
			Agent Relay Timeline Viewer
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: rgb(15 23 42); /* slate-900 */
	}
</style>
