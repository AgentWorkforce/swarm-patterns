<script lang="ts">
  import { spring } from 'svelte/motion';
  import { onMount, onDestroy } from 'svelte';
  import {
    springs,
    agentColors,
    statusColors,
    agentSpawn,
    agentDespawn,
    createActivityPulse,
    killAnimations,
    type AgentRole,
    type AgentStatus
  } from '$lib/animations';

  // Props
  export let id: string;
  export let name: string;
  export let role: AgentRole = 'default';
  export let status: AgentStatus = 'idle';
  export let x: number = 0;
  export let y: number = 0;
  export let size: number = 48;
  export let selected: boolean = false;
  export let showLabel: boolean = true;

  // Reactive position with spring physics
  const position = spring({ x, y }, springs.agent);
  $: position.set({ x, y });

  // Reactive scale based on status
  const scale = spring(1, springs.pulse);
  $: {
    if (status === 'active') scale.set(1.1);
    else if (status === 'busy') scale.set(1.05);
    else scale.set(1);
  }

  // Get colors for current role
  $: colors = agentColors[role] || agentColors.default;
  $: statusColor = statusColors[status] || statusColors.idle;

  // DOM reference for GSAP animations
  let agentEl: HTMLDivElement;
  let activityTimeline: gsap.core.Timeline | null = null;

  // Start activity pulse when active
  $: if (agentEl && status === 'active') {
    activityTimeline = createActivityPulse(agentEl, colors.primary);
  } else if (activityTimeline) {
    activityTimeline.kill();
    activityTimeline = null;
  }

  onDestroy(() => {
    if (agentEl) killAnimations(agentEl);
    if (activityTimeline) activityTimeline.kill();
  });

  // Role icons (simple Unicode for now, can be replaced with SVG)
  const roleIcons: Record<AgentRole, string> = {
    lead: '👑',
    worker: '⚙️',
    architect: '🏗️',
    researcher: '🔍',
    devops: '🚀',
    default: '🤖'
  };
</script>

<div
  bind:this={agentEl}
  class="agent"
  class:selected
  style:--agent-primary={colors.primary}
  style:--agent-glow={colors.glow}
  style:--agent-shadow={colors.shadow}
  style:--status-color={statusColor}
  style:--size={size}px
  style:transform="translate({$position.x}px, {$position.y}px) scale({$scale})"
  in:agentSpawn
  out:agentDespawn
  role="button"
  tabindex="0"
  aria-label="Agent {name}, role: {role}, status: {status}"
  on:click
  on:keydown
>
  <div class="agent-body">
    <span class="agent-icon">{roleIcons[role]}</span>
    <div class="status-indicator"></div>
  </div>

  {#if showLabel}
    <div class="agent-label">
      <span class="agent-name">{name}</span>
      <span class="agent-role">{role}</span>
    </div>
  {/if}
</div>

<style>
  .agent {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    user-select: none;
    will-change: transform;
    transition: filter 0.15s ease;
  }

  .agent:hover {
    filter: brightness(1.1);
  }

  .agent:focus-visible {
    outline: 2px solid var(--agent-primary);
    outline-offset: 4px;
    border-radius: 50%;
  }

  .agent-body {
    position: relative;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: linear-gradient(135deg, var(--agent-primary), color-mix(in srgb, var(--agent-primary) 70%, black));
    box-shadow: 0 4px 12px var(--agent-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s ease;
  }

  .selected .agent-body {
    box-shadow: 0 0 0 3px var(--agent-glow), 0 4px 20px var(--agent-shadow);
  }

  .agent-icon {
    font-size: calc(var(--size) * 0.45);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--status-color);
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .agent-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    text-align: center;
    max-width: calc(var(--size) + 20px);
  }

  .agent-name {
    font-size: 11px;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .agent-role {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>
