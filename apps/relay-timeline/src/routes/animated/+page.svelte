<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import AnimatedFlow from '$lib/components/AnimatedFlow.svelte';

	export let data;

	// Playback state
	let isPlaying = false;
	let speed = 1;
	let currentIndex = 0;
	let playbackInterval: ReturnType<typeof setInterval> | null = null;

	// Speed options
	const speedOptions = [0.5, 1, 2, 4];

	// Computed values
	$: totalMessages = data.messages.length;
	$: progress = totalMessages > 0 ? (currentIndex / totalMessages) * 100 : 0;
	$: currentMessages = data.messages.slice(0, currentIndex);

	// Get time range from messages
	$: startTime = data.messages.length > 0 ? data.messages[0].ts : 0;
	$: endTime = data.messages.length > 0 ? data.messages[data.messages.length - 1].ts : 0;
	$: currentTime = currentIndex > 0 && currentIndex <= data.messages.length
		? data.messages[currentIndex - 1].ts
		: startTime;

	function formatTime(ts: number): string {
		return new Date(ts).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function play() {
		if (currentIndex >= totalMessages) {
			currentIndex = 0;
		}
		isPlaying = true;
		startPlayback();
	}

	function pause() {
		isPlaying = false;
		stopPlayback();
	}

	function togglePlayPause() {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	}

	function reset() {
		pause();
		currentIndex = 0;
	}

	function setSpeed(newSpeed: number) {
		speed = newSpeed;
		if (isPlaying) {
			stopPlayback();
			startPlayback();
		}
	}

	function startPlayback() {
		stopPlayback();
		const interval = 1000 / speed;
		playbackInterval = setInterval(() => {
			if (currentIndex < totalMessages) {
				currentIndex++;
			} else {
				pause();
			}
		}, interval);
	}

	function stopPlayback() {
		if (playbackInterval) {
			clearInterval(playbackInterval);
			playbackInterval = null;
		}
	}

	function handleProgressClick(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const percentage = x / rect.width;
		currentIndex = Math.floor(percentage * totalMessages);
	}

	onDestroy(() => {
		stopPlayback();
	});
</script>

<svelte:head>
	<title>Message Flow Animation | Agent Relay</title>
	<meta name="description" content="Animated visualization of agent message flow" />
</svelte:head>

<div class="min-h-screen bg-slate-900 text-white">
	<!-- Header -->
	<header class="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700">
		<div class="max-w-7xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<h1 class="text-2xl font-bold text-white flex items-center gap-3">
						<svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Message Flow Animation
					</h1>
				</div>

				<a
					href="/"
					class="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to Timeline
				</a>
			</div>
		</div>

		<!-- Playback Controls Bar -->
		<div class="border-t border-slate-700 bg-slate-800/50">
			<div class="max-w-7xl mx-auto px-6 py-3">
				<div class="flex items-center gap-6">
					<!-- Play/Pause Button -->
					<button
						class="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg"
						on:click={togglePlayPause}
					>
						{#if isPlaying}
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
							</svg>
						{:else}
							<svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
						{/if}
					</button>

					<!-- Reset Button -->
					<button
						class="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
						on:click={reset}
						title="Reset"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					</button>

					<!-- Speed Selector -->
					<div class="flex items-center gap-2">
						<span class="text-sm text-slate-400">Speed:</span>
						<div class="flex gap-1">
							{#each speedOptions as s}
								<button
									class="px-3 py-1.5 rounded text-sm font-medium transition-colors {speed === s ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}"
									on:click={() => setSpeed(s)}
								>
									{s}x
								</button>
							{/each}
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="flex-1 mx-4">
						<div
							class="h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
							on:click={handleProgressClick}
							role="progressbar"
							aria-valuenow={currentIndex}
							aria-valuemin={0}
							aria-valuemax={totalMessages}
						>
							<div
								class="h-full bg-emerald-500 transition-all duration-100"
								style="width: {progress}%"
							></div>
						</div>
						<div class="flex justify-between mt-1 text-xs text-slate-500">
							<span>{formatTime(startTime)}</span>
							<span>{formatTime(endTime)}</span>
						</div>
					</div>

					<!-- Message Counter -->
					<div class="text-right min-w-[120px]">
						<div class="text-lg font-mono text-emerald-400">
							{currentIndex} <span class="text-slate-500">/</span> {totalMessages}
						</div>
						<div class="text-xs text-slate-500">messages</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-6 py-6">
		<div class="h-[600px]">
			<AnimatedFlow
				messages={data.messages}
				animationSpeed={speed}
			/>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-700 px-6 py-4 mt-8">
		<div class="max-w-7xl mx-auto text-center text-slate-500 text-sm">
			Agent Relay Message Flow Visualization
		</div>
	</footer>
</div>
