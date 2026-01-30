<script>
	import { onMount, onDestroy } from 'svelte';
	import { patterns } from '$lib/swarm/patterns';

	/** @type {import('$lib/swarm/types').Agent[]} */
	let agents = [];

	/** @type {import('$lib/swarm/types').Message[]} */
	let messages = [];

	/** @type {HTMLCanvasElement} */
	let canvas;

	/** @type {CanvasRenderingContext2D | null} */
	let ctx = null;

	/** @type {number} */
	let animationId;

	let selectedPatternId = patterns[0]?.id ?? 'hub-spoke';
	let agentCount = 20;
	let showConnections = true;
	let showMessages = true;

	const roleColors = {
		lead: '#FFD700',
		coordinator: '#DC2626',
		worker: '#14B8A6',
		specialist: '#A855F7'
	};

	const roleLabels = {
		lead: 'Lead',
		coordinator: 'Coordinator',
		worker: 'Worker',
		specialist: 'Specialist'
	};

	$: selectedPattern = patterns.find((p) => p.id === selectedPatternId) ?? patterns[0];

	function initializeAgents(count) {
		if (!canvas) return;

		const roles = ['lead', 'worker', 'coordinator', 'specialist'];
		const newAgents = [];

		for (let i = 0; i < count; i++) {
			/** @type {'lead' | 'worker' | 'coordinator' | 'specialist'} */
			let role;
			if (i === 0) {
				role = 'lead';
			} else if (i < 3) {
				role = 'coordinator';
			} else if (i < 6) {
				role = 'specialist';
			} else {
				role = 'worker';
			}

			newAgents.push({
				id: `agent-${i}`,
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 2,
				vy: (Math.random() - 0.5) * 2,
				role,
				color: roleColors[role],
				connections: []
			});
		}

		agents = newAgents;
		updateConnections();
	}

	function updateConnections() {
		const lead = agents.find((a) => a.role === 'lead');
		const coordinators = agents.filter((a) => a.role === 'coordinator');
		const workers = agents.filter((a) => a.role === 'worker');
		const specialists = agents.filter((a) => a.role === 'specialist');

		agents.forEach((agent) => {
			agent.connections = [];
		});

		if (lead) {
			lead.connections = coordinators.map((c) => c.id);
		}

		coordinators.forEach((coord, idx) => {
			const workerSlice = workers.slice(
				Math.floor((idx * workers.length) / coordinators.length),
				Math.floor(((idx + 1) * workers.length) / coordinators.length)
			);
			coord.connections = workerSlice.map((w) => w.id);
		});

		specialists.forEach((spec) => {
			if (lead) {
				spec.connections = [lead.id];
			}
		});
	}

	function spawnMessage() {
		if (agents.length < 2) return;

		const fromAgent = agents[Math.floor(Math.random() * agents.length)];
		const possibleTargets =
			fromAgent.connections.length > 0
				? fromAgent.connections
				: agents.filter((a) => a.id !== fromAgent.id).map((a) => a.id);

		if (possibleTargets.length === 0) return;

		const toId = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

		messages = [
			...messages,
			{
				from: fromAgent.id,
				to: toId,
				progress: 0
			}
		];
	}

	function updateMessages() {
		messages = messages
			.map((msg) => ({
				...msg,
				progress: msg.progress + 0.02
			}))
			.filter((msg) => msg.progress < 1);
	}

	function drawAgent(agent) {
		if (!ctx) return;

		const radius = agent.role === 'lead' ? 16 : agent.role === 'coordinator' ? 12 : 8;

		ctx.beginPath();
		ctx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
		ctx.fillStyle = agent.color;
		ctx.fill();

		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.stroke();

		if (agent.role === 'lead') {
			ctx.beginPath();
			ctx.arc(agent.x, agent.y, radius + 4, 0, Math.PI * 2);
			ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}

	function drawConnections() {
		if (!ctx) return;

		agents.forEach((agent) => {
			agent.connections.forEach((targetId) => {
				const target = agents.find((a) => a.id === targetId);
				if (!target) return;

				ctx.beginPath();
				ctx.moveTo(agent.x, agent.y);
				ctx.lineTo(target.x, target.y);
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
				ctx.lineWidth = 1;
				ctx.stroke();
			});
		});
	}

	function drawMessages() {
		if (!ctx) return;

		messages.forEach((msg) => {
			const fromAgent = agents.find((a) => a.id === msg.from);
			const toAgent = agents.find((a) => a.id === msg.to);

			if (!fromAgent || !toAgent) return;

			const x = fromAgent.x + (toAgent.x - fromAgent.x) * msg.progress;
			const y = fromAgent.y + (toAgent.y - fromAgent.y) * msg.progress;

			ctx.beginPath();
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255, 255, 255, ${1 - msg.progress})`;
			ctx.fill();

			ctx.beginPath();
			ctx.arc(x, y, 6, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - msg.progress * 0.5})`;
			ctx.lineWidth = 1;
			ctx.stroke();
		});
	}

	function render() {
		if (!ctx || !canvas) return;

		ctx.fillStyle = '#0f172a';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (selectedPattern) {
			selectedPattern.update(agents, { width: canvas.width, height: canvas.height });
		}

		if (showConnections) {
			drawConnections();
		}

		agents.forEach(drawAgent);

		if (showMessages) {
			updateMessages();
			drawMessages();

			if (Math.random() < 0.05) {
				spawnMessage();
			}
		}

		animationId = requestAnimationFrame(render);
	}

	function handleResize() {
		if (!canvas) return;

		const container = canvas.parentElement;
		if (!container) return;

		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight;
	}

	function handlePatternChange(patternId) {
		selectedPatternId = patternId;
	}

	function handleAgentCountChange(event) {
		agentCount = parseInt(event.target.value, 10);
		initializeAgents(agentCount);
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		handleResize();
		initializeAgents(agentCount);
		render();

		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', handleResize);
		}
	});
</script>

<div class="swarm-container">
	<div class="controls">
		<div class="control-group">
			<label class="control-label">Pattern</label>
			<div class="pattern-buttons">
				{#each patterns as pattern}
					<button
						class="pattern-btn"
						class:active={selectedPatternId === pattern.id}
						on:click={() => handlePatternChange(pattern.id)}
						title={pattern.description}
					>
						{pattern.name}
					</button>
				{/each}
			</div>
		</div>

		<div class="control-group">
			<label class="control-label" for="agent-count">
				Agents: {agentCount}
			</label>
			<input
				type="range"
				id="agent-count"
				min="5"
				max="50"
				value={agentCount}
				on:input={handleAgentCountChange}
				class="slider"
			/>
		</div>

		<div class="control-group toggles">
			<label class="toggle-label">
				<input type="checkbox" bind:checked={showConnections} />
				<span>Connections</span>
			</label>
			<label class="toggle-label">
				<input type="checkbox" bind:checked={showMessages} />
				<span>Messages</span>
			</label>
		</div>

		<div class="legend">
			{#each Object.entries(roleColors) as [role, color]}
				<div class="legend-item">
					<span class="legend-dot" style="background-color: {color}"></span>
					<span class="legend-label">{roleLabels[role]}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="canvas-wrapper">
		<canvas bind:this={canvas}></canvas>
	</div>
</div>

<style>
	.swarm-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #0f172a;
		color: #e2e8f0;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 1rem 1.5rem;
		background-color: #1e293b;
		border-bottom: 1px solid #334155;
		align-items: center;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
	}

	.pattern-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.pattern-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #475569;
		border-radius: 0.375rem;
		background-color: #334155;
		color: #e2e8f0;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.pattern-btn:hover {
		background-color: #475569;
		border-color: #64748b;
	}

	.pattern-btn.active {
		background-color: #3b82f6;
		border-color: #3b82f6;
		color: white;
	}

	.slider {
		width: 150px;
		height: 6px;
		border-radius: 3px;
		background: #475569;
		outline: none;
		cursor: pointer;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		border: none;
	}

	.toggles {
		flex-direction: row;
		gap: 1rem;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.toggle-label input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		accent-color: #3b82f6;
	}

	.legend {
		display: flex;
		gap: 1rem;
		margin-left: auto;
		padding-left: 1rem;
		border-left: 1px solid #334155;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.legend-label {
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.canvas-wrapper {
		flex: 1;
		overflow: hidden;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 768px) {
		.controls {
			flex-direction: column;
			align-items: flex-start;
		}

		.legend {
			margin-left: 0;
			padding-left: 0;
			border-left: none;
			padding-top: 0.5rem;
			border-top: 1px solid #334155;
		}
	}
</style>
