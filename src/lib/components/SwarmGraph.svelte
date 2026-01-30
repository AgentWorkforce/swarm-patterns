<script lang="ts" context="module">
  import type { AgentRole, AgentStatus } from '$lib/animations';

  export type SwarmAgent = {
    id: string;
    name: string;
    role: AgentRole;
    status: AgentStatus;
    x: number;
    y: number;
  };

  export type SwarmConnection = {
    id: string;
    from: string;
    to: string;
    active?: boolean;
    label?: string;
  };

  export type SwarmMessage = {
    id: string;
    from: string;
    to: string;
    content: string;
    timestamp: number;
  };
</script>

<script lang="ts">
  /**
   * SwarmGraph - Main visualization component using Svelvet
   *
   * Displays agents as nodes and their connections as edges
   * with smooth animations and interactive controls.
   */
  import { onMount, createEventDispatcher } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { spring } from 'svelte/motion';
  import Agent from './Agent.svelte';
  import Connection from './Connection.svelte';
  import { agentColors, statusColors, initGSAP } from '$lib/animations';

  // Props
  export let agents: SwarmAgent[] = [];
  export let connections: SwarmConnection[] = [];
  export let selectedAgentId: string | null = null;
  export let width: number = 800;
  export let height: number = 600;
  export let showGrid: boolean = true;
  export let showMinimap: boolean = true;
  export let zoomEnabled: boolean = true;
  export let panEnabled: boolean = true;

  const dispatch = createEventDispatcher<{
    agentClick: { agent: SwarmAgent };
    agentDragEnd: { agent: SwarmAgent; x: number; y: number };
    connectionClick: { connection: SwarmConnection };
  }>();

  // Viewport state
  const viewport = spring({ x: 0, y: 0, zoom: 1 }, { stiffness: 0.15, damping: 0.8 });

  // Messages in flight (for connection animations)
  let messagesInFlight = new Set<string>();

  // Container ref
  let containerEl: HTMLDivElement;

  // Initialize GSAP on mount
  onMount(() => {
    initGSAP();
  });

  // Derived: agent lookup map
  $: agentMap = new Map(agents.map(a => [a.id, a]));

  // Derived: connections with resolved positions
  $: resolvedConnections = connections.map(conn => {
    const fromAgent = agentMap.get(conn.from);
    const toAgent = agentMap.get(conn.to);
    return {
      ...conn,
      fromAgent,
      toAgent,
      fromX: fromAgent?.x ?? 0,
      fromY: fromAgent?.y ?? 0,
      toX: toAgent?.x ?? 0,
      toY: toAgent?.y ?? 0,
      messageInFlight: messagesInFlight.has(conn.id)
    };
  }).filter(c => c.fromAgent && c.toAgent);

  // Handle agent click
  function handleAgentClick(agent: SwarmAgent) {
    dispatch('agentClick', { agent });
  }

  // Zoom controls
  function zoomIn() {
    viewport.update(v => ({ ...v, zoom: Math.min(v.zoom * 1.2, 3) }));
  }

  function zoomOut() {
    viewport.update(v => ({ ...v, zoom: Math.max(v.zoom / 1.2, 0.3) }));
  }

  function resetView() {
    viewport.set({ x: 0, y: 0, zoom: 1 });
  }

  // Pan handling
  let isPanning = false;
  let panStart = { x: 0, y: 0 };

  function handleMouseDown(e: MouseEvent) {
    if (!panEnabled || e.button !== 0) return;
    isPanning = true;
    panStart = { x: e.clientX - $viewport.x, y: e.clientY - $viewport.y };
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isPanning) return;
    viewport.update(v => ({
      ...v,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    }));
  }

  function handleMouseUp() {
    isPanning = false;
  }

  // Wheel zoom
  function handleWheel(e: WheelEvent) {
    if (!zoomEnabled) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    viewport.update(v => ({
      ...v,
      zoom: Math.max(0.3, Math.min(3, v.zoom * delta))
    }));
  }

  // Simulate a message (for demo/testing)
  export function sendMessage(fromId: string, toId: string) {
    const connId = connections.find(
      c => c.from === fromId && c.to === toId
    )?.id;
    if (connId) {
      messagesInFlight.add(connId);
      messagesInFlight = messagesInFlight;
      setTimeout(() => {
        messagesInFlight.delete(connId);
        messagesInFlight = messagesInFlight;
      }, 800);
    }
  }
</script>

<div
  bind:this={containerEl}
  class="swarm-graph"
  style:width="{width}px"
  style:height="{height}px"
  tabindex="0"
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
  on:wheel={handleWheel}
  role="application"
  aria-label="Agent swarm visualization"
>
  <!-- Grid background -->
  {#if showGrid}
    <svg class="grid-layer" viewBox="0 0 {width} {height}">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  {/if}

  <!-- Main canvas (transformed) -->
  <div
    class="canvas"
    style:transform="translate({$viewport.x}px, {$viewport.y}px) scale({$viewport.zoom})"
  >
    <!-- Connections layer -->
    <div class="connections-layer">
      {#each resolvedConnections as conn (conn.id)}
        <Connection
          fromX={conn.fromX}
          fromY={conn.fromY}
          toX={conn.toX}
          toY={conn.toY}
          fromRole={conn.fromAgent?.role}
          active={conn.active}
          messageInFlight={conn.messageInFlight}
          label={conn.label}
        />
      {/each}
    </div>

    <!-- Agents layer -->
    <div class="agents-layer">
      {#each agents as agent (agent.id)}
        <Agent
          id={agent.id}
          name={agent.name}
          role={agent.role}
          status={agent.status}
          x={agent.x}
          y={agent.y}
          selected={selectedAgentId === agent.id}
          on:click={() => handleAgentClick(agent)}
        />
      {/each}
    </div>
  </div>

  <!-- Controls overlay -->
  {#if zoomEnabled}
    <div class="controls">
      <button on:click={zoomIn} title="Zoom in">+</button>
      <button on:click={resetView} title="Reset view">⊙</button>
      <button on:click={zoomOut} title="Zoom out">−</button>
    </div>
  {/if}

  <!-- Minimap -->
  {#if showMinimap}
    <div class="minimap">
      <svg viewBox="0 0 {width} {height}">
        {#each agents as agent}
          <circle
            cx={agent.x}
            cy={agent.y}
            r="4"
            fill={agentColors[agent.role]?.primary || '#6B7280'}
          />
        {/each}
        <rect
          class="viewport-indicator"
          x={-$viewport.x / $viewport.zoom}
          y={-$viewport.y / $viewport.zoom}
          width={width / $viewport.zoom}
          height={height / $viewport.zoom}
          fill="none"
          stroke="white"
          stroke-width="2"
        />
      </svg>
    </div>
  {/if}

  <!-- Legend -->
  <div class="legend">
    {#each Object.entries(agentColors) as [role, colors]}
      {#if role !== 'default'}
        <div class="legend-item">
          <span class="legend-dot" style:background={colors.primary}></span>
          <span class="legend-label">{role}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .swarm-graph {
    position: relative;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 12px;
    overflow: hidden;
    cursor: grab;
  }

  .swarm-graph:active {
    cursor: grabbing;
  }

  .grid-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .canvas {
    position: absolute;
    inset: 0;
    transform-origin: center center;
    will-change: transform;
  }

  .connections-layer,
  .agents-layer {
    position: absolute;
    inset: 0;
  }

  .controls {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .controls button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .controls button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .minimap {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 150px;
    height: 100px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .minimap svg {
    width: 100%;
    height: 100%;
  }

  .viewport-indicator {
    opacity: 0.5;
  }

  .legend {
    position: absolute;
    bottom: 12px;
    left: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .legend-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: capitalize;
  }
</style>
