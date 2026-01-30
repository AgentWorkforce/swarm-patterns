<script lang="ts">
	import Timeline from '$lib/components/Timeline.svelte';

	export let data;
</script>

<svelte:head>
	<title>Agent Relay Timeline</title>
	<meta name="description" content="Visualize agent communication patterns" />
</svelte:head>

<!-- Navigation Banner -->
<div class="bg-slate-800 border-b border-slate-700">
	<div class="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
		<span class="text-slate-400 text-sm">View messages as a timeline or animated flow</span>
		<a
			href="/animated"
			class="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			Animated Flow
		</a>
	</div>
</div>

<Timeline
	messages={data.messages}
	title="Agent Relay Timeline"
	showFilters={true}
/>
