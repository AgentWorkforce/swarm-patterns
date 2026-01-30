<script lang="ts">
  /**
   * Swarm Patterns Demo Page
   *
   * Interactive visualization of agent swarming patterns
   * using simulated relay-pty events.
   */
  import { onMount, onDestroy } from 'svelte';
  import { SwarmGraph } from '$lib/components';
  import {
    agents,
    connections,
    messagesInFlight,
    handleEvent,
    resetStores,
    eventStats,
    daemonStatus
  } from '$lib/stores';
  import { initGSAP } from '$lib/animations';

  // Demo state
  let isRunning = false;
  let selectedAgentId: string | null = null;
  let eventInterval: ReturnType<typeof setInterval> | null = null;

  // Demo agent presets
  const DEMO_AGENTS = [
    { id: 'lead', name: 'Lead', role: 'lead' },
    { id: 'architect', name: 'Architect', role: 'architect' },
    { id: 'ui-agent', name: 'UI-Agent', role: 'worker' },
    { id: 'backend-agent', name: 'Backend-Agent', role: 'worker' },
    { id: 'devops-agent', name: 'DevOps-Agent', role: 'devops' },
    { id: 'researcher', name: 'Researcher', role: 'researcher' }
  ];

  // Demo message scenarios
  const DEMO_MESSAGES = [
    { from: 'lead', to: 'architect', text: 'Design the system architecture' },
    { from: 'architect', to: 'ui-agent', text: 'Implement animation components' },
    { from: 'architect', to: 'backend-agent', text: 'Set up event stores' },
    { from: 'lead', to: 'devops-agent', text: 'Configure CI/CD pipeline' },
    { from: 'ui-agent', to: 'lead', text: 'Components ready for review' },
    { from: 'backend-agent', to: 'architect', text: 'Stores implemented' },
    { from: 'researcher', to: 'lead', text: 'Documentation complete' },
    { from: 'lead', to: '*', text: 'Great work team!' }
  ];

  let messageIndex = 0;

  // Initialize GSAP on mount
  onMount(() => {
    initGSAP();
  });

  // Cleanup on destroy
  onDestroy(() => {
    stopDemo();
  });

  // Start demo simulation
  function startDemo() {
    if (isRunning) return;
    isRunning = true;
    resetStores();

    // Spawn agents with stagger
    DEMO_AGENTS.forEach((agent, i) => {
      setTimeout(() => {
        handleEvent({
          id: `spawn-${agent.id}`,
          ts: Date.now(),
          kind: 'agent',
          subtype: 'spawn',
          source: agent.id,
          payload: { name: agent.name, role: agent.role }
        });
      }, i * 200);
    });

    // Start message flow after agents spawn
    setTimeout(() => {
      eventInterval = setInterval(sendNextMessage, 1500);
    }, DEMO_AGENTS.length * 200 + 500);
  }

  // Stop demo simulation
  function stopDemo() {
    isRunning = false;
    if (eventInterval) {
      clearInterval(eventInterval);
      eventInterval = null;
    }
  }

  // Send next demo message
  function sendNextMessage() {
    const msg = DEMO_MESSAGES[messageIndex % DEMO_MESSAGES.length];

    // Handle broadcast
    if (msg.to === '*') {
      DEMO_AGENTS.filter(a => a.id !== msg.from).forEach((agent, i) => {
        setTimeout(() => {
          handleEvent({
            id: `msg-${Date.now()}-${agent.id}`,
            ts: Date.now(),
            kind: 'agent',
            subtype: 'msg',
            source: msg.from,
            target: agent.id,
            payload: { text: msg.text, channel: '#general' }
          });
        }, i * 100);
      });
    } else {
      handleEvent({
        id: `msg-${Date.now()}`,
        ts: Date.now(),
        kind: 'agent',
        subtype: 'msg',
        source: msg.from,
        target: msg.to,
        payload: { text: msg.text }
      });
    }

    messageIndex++;
  }

  // Reset demo
  function resetDemo() {
    stopDemo();
    resetStores();
    messageIndex = 0;
  }

  // Handle agent selection
  function handleAgentClick(event: CustomEvent<{ agent: { id: string } }>) {
    selectedAgentId = event.detail.agent.id;
  }

  // Transform stores to SwarmGraph format
  $: swarmAgents = $agents.map(a => ({
    id: a.id,
    name: a.name,
    role: a.role,
    status: a.status,
    x: a.x,
    y: a.y
  }));

  $: swarmConnections = $connections.map(c => ({
    id: c.id,
    from: c.from,
    to: c.to,
    active: c.active || $messagesInFlight.has(c.id)
  }));
</script>

<svelte:head>
  <title>Agent Swarm Visualization</title>
</svelte:head>

<div class="demo-page">
  <header class="header">
    <h1>Agent Swarm</h1>
    <p class="subtitle">Multi-Agent Communication Visualization</p>
  </header>

  <div class="controls">
    <button
      class="btn"
      class:active={isRunning}
      on:click={isRunning ? stopDemo : startDemo}
    >
      {isRunning ? 'Stop' : 'Start'} Demo
    </button>
    <button class="btn" on:click={resetDemo}>Reset</button>

    <div class="stats">
      <span class="stat">
        <span class="stat-label">Agents:</span>
        <span class="stat-value">{$eventStats.agentSpawns}</span>
      </span>
      <span class="stat">
        <span class="stat-label">Messages:</span>
        <span class="stat-value">{$eventStats.messagesSent}</span>
      </span>
      <span class="stat">
        <span class="stat-label">Status:</span>
        <span class="stat-value" class:online={$daemonStatus.status === 'online'}>
          {$daemonStatus.status}
        </span>
      </span>
    </div>
  </div>

  <main class="main">
    <SwarmGraph
      agents={swarmAgents}
      connections={swarmConnections}
      {selectedAgentId}
      width={800}
      height={600}
      on:agentClick={handleAgentClick}
    />
  </main>

  <footer class="footer">
    <p>Built with SvelteKit + Svelvet + GSAP</p>
    <a href="/">View Relay-PTY Flow</a>
  </footer>
</div>

<style>
  .demo-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    background: #0f172a;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .header {
    text-align: center;
    margin-bottom: 20px;
  }

  .header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .btn.active {
    background: #ef4444;
  }

  .stats {
    display: flex;
    gap: 16px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }

  .stat-value {
    font-weight: 600;
    font-size: 14px;
  }

  .stat-value.online {
    color: #22c55e;
  }

  .main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .footer {
    text-align: center;
    padding: 16px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .footer a {
    color: #3b82f6;
    text-decoration: none;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 840px) {
    .demo-page {
      padding: 12px;
    }

    .header h1 {
      font-size: 1.5rem;
    }

    .controls {
      flex-direction: column;
    }
  }
</style>
