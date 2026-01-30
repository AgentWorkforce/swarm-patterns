<script lang="ts">
  import { spring } from 'svelte/motion';
  import { onMount } from 'svelte';
  import {
    springs,
    durations,
    agentColors,
    connectionDraw,
    type AgentRole
  } from '$lib/animations';

  // Props
  export let fromX: number;
  export let fromY: number;
  export let toX: number;
  export let toY: number;
  export let fromRole: AgentRole = 'default';
  export let toRole: AgentRole = 'default';
  export let active: boolean = false;
  export let messageInFlight: boolean = false;
  export let bidirectional: boolean = false;
  export let label: string = '';

  // Animated positions with spring physics
  const from = spring({ x: fromX, y: fromY }, springs.connection);
  const to = spring({ x: toX, y: toY }, springs.connection);

  $: from.set({ x: fromX, y: fromY });
  $: to.set({ x: toX, y: toY });

  // Calculate path
  $: dx = $to.x - $from.x;
  $: dy = $to.y - $from.y;
  $: distance = Math.sqrt(dx * dx + dy * dy);

  // Curved path with control point
  $: controlOffset = Math.min(distance * 0.2, 50);
  $: midX = ($from.x + $to.x) / 2;
  $: midY = ($from.y + $to.y) / 2 - controlOffset;

  // Path data for curved line
  $: pathD = `M ${$from.x} ${$from.y} Q ${midX} ${midY} ${$to.x} ${$to.y}`;

  // Colors based on source agent role
  $: color = agentColors[fromRole]?.primary || agentColors.default.primary;
  $: glowColor = agentColors[fromRole]?.glow || agentColors.default.glow;

  // Label position (center of curve)
  $: labelX = midX;
  $: labelY = midY - 8;

  // Message animation position (0 to 1 along path)
  let messageProgress = 0;
  let messageAnimating = false;
  let pathEl: SVGPathElement;

  $: if (messageInFlight && !messageAnimating && pathEl) {
    animateMessage();
  }

  function animateMessage() {
    messageAnimating = true;
    messageProgress = 0;

    const startTime = performance.now();
    const duration = durations.messageTrail;

    function tick(now: number) {
      const elapsed = now - startTime;
      messageProgress = Math.min(elapsed / duration, 1);

      if (messageProgress < 1) {
        requestAnimationFrame(tick);
      } else {
        messageAnimating = false;
      }
    }

    requestAnimationFrame(tick);
  }

  // Get point along path for message dot
  function getPointOnPath(progress: number): { x: number; y: number } {
    if (!pathEl) return { x: $from.x, y: $from.y };

    const length = pathEl.getTotalLength();
    const point = pathEl.getPointAtLength(length * progress);
    return { x: point.x, y: point.y };
  }

  $: messagePoint = getPointOnPath(messageProgress);
</script>

<svg class="connection" class:active class:messageInFlight>
  <!-- Glow filter -->
  <defs>
    <filter id="glow-{fromRole}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feFlood flood-color={glowColor} flood-opacity="0.5" />
      <feComposite in2="blur" operator="in" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Arrow marker for direction -->
    <marker
      id="arrow-{fromRole}"
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  </defs>

  <!-- Background path (always visible, dim) -->
  <path
    class="connection-bg"
    d={pathD}
    stroke={color}
    stroke-opacity="0.2"
    stroke-width="2"
    fill="none"
  />

  <!-- Active path (animated) -->
  <path
    bind:this={pathEl}
    class="connection-line"
    class:active
    d={pathD}
    stroke={color}
    stroke-width={active ? 3 : 2}
    fill="none"
    stroke-linecap="round"
    marker-end={!bidirectional ? `url(#arrow-${fromRole})` : undefined}
    filter={active ? `url(#glow-${fromRole})` : undefined}
    in:connectionDraw={{ duration: durations.move }}
  />

  <!-- Bidirectional arrows -->
  {#if bidirectional}
    <path
      d={pathD}
      stroke="transparent"
      stroke-width="2"
      fill="none"
      marker-start="url(#arrow-{fromRole})"
      marker-end="url(#arrow-{fromRole})"
    />
  {/if}

  <!-- Message dot traveling along path -->
  {#if messageAnimating}
    <circle
      class="message-dot"
      cx={messagePoint.x}
      cy={messagePoint.y}
      r="6"
      fill={glowColor}
    />
    <circle
      class="message-dot-core"
      cx={messagePoint.x}
      cy={messagePoint.y}
      r="3"
      fill="white"
    />
  {/if}

  <!-- Label -->
  {#if label && active}
    <text
      class="connection-label"
      x={labelX}
      y={labelY}
      text-anchor="middle"
      fill="white"
    >
      {label}
    </text>
  {/if}
</svg>

<style>
  .connection {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  }

  .connection-line {
    transition: stroke-width 0.2s ease;
  }

  .connection-line.active {
    stroke-dasharray: 8 4;
    animation: dash 0.5s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -12;
    }
  }

  .message-dot {
    filter: blur(2px);
    opacity: 0.8;
  }

  .message-dot-core {
    filter: drop-shadow(0 0 4px white);
  }

  .connection-label {
    font-size: 10px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }
</style>
