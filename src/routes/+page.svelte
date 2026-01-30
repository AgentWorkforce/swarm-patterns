<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { gsap } from 'gsap';
  import { Background, Controls, Minimap, Node, Svelvet } from 'svelvet';
  import { activeStage, events, metrics, startMockStream, stopMockStream } from '$lib/stores/stream';
  import type { Stage } from '$lib/types';

  const stages: { id: Stage; title: string; blurb: string; color: string }[] = [
    {
      id: 'queue',
      title: 'Message Queue',
      blurb: 'Daemon batches and prioritizes commands before transport.',
      color: 'var(--primary)'
    },
    {
      id: 'socket',
      title: 'Socket Relay',
      blurb: 'WebSocket/mTLS pipe carrying framed command packets.',
      color: 'var(--accent)'
    },
    {
      id: 'pty',
      title: 'PTY Injection',
      blurb: 'Commands land in agent PTY with echo suppression + shim.',
      color: 'var(--amber)'
    },
    {
      id: 'verification',
      title: 'Verification',
      blurb: 'Signature + checksum validation, post-flight audit.',
      color: 'var(--ink)'
    }
  ];

  const nodes = [
    {
      id: 'queue',
      label: 'Daemon Queue',
      stage: 'queue',
      position: { x: 40, y: 140 },
      dimensions: { width: 180, height: 90 },
      connections: ['socket']
    },
    {
      id: 'socket',
      label: 'Relay Socket',
      stage: 'socket',
      position: { x: 320, y: 110 },
      dimensions: { width: 180, height: 90 },
      connections: ['pty']
    },
    {
      id: 'pty',
      label: 'Agent PTY',
      stage: 'pty',
      position: { x: 600, y: 140 },
      dimensions: { width: 180, height: 90 },
      connections: ['verification']
    },
    {
      id: 'verification',
      label: 'Verifier',
      stage: 'verification',
      position: { x: 880, y: 120 },
      dimensions: { width: 190, height: 90 },
      connections: []
    }
  ];

  let playing = false;
  let gsapCtx: gsap.Context | null = null;

  const stageColor: Record<Stage, string> = {
    queue: '#0f8bff',
    socket: '#24d6a2',
    pty: '#ff9f1c',
    verification: '#0c1a33'
  };

  const stageIcon: Record<Stage, string> = {
    queue: '⬡',
    socket: '⦿',
    pty: '⌘',
    verification: '✔'
  };

  const togglePlay = () => {
    if (playing) {
      stopMockStream();
      playing = false;
      return;
    }
    startMockStream();
    playing = true;
  };

  const pulseEdges = () => {
    if (gsapCtx) gsapCtx.revert();
    gsapCtx = gsap.context(() => {
      gsap.fromTo(
        '.edge-flow',
        { opacity: 0.35, filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' },
        {
          opacity: 1,
          duration: 1.8,
          repeat: -1,
          ease: 'sine.inOut',
          stagger: 0.12,
          filter: 'drop-shadow(0 0 12px rgba(0,98,255,0.5))'
        }
      );
    });
  };

  onMount(() => {
    startMockStream();
    playing = true;
    pulseEdges();
  });

  onDestroy(() => {
    stopMockStream();
    gsapCtx?.revert();
  });
</script>

<main class="page">
  <section class="hero glass">
    <div class="hero__text">
      <div class="badge">Relay-PTY lifecycle • live</div>
      <h1>Animate the full relay → socket → PTY → verification path.</h1>
      <p>
        Watch commands exit the daemon queue, flow through the relay WebSocket, land in the agent PTY,
        and clear integrity checks. Designed for high-signal monitoring and demo storytelling.
      </p>
      <div class="hero__actions">
        <button class="button-primary" on:click={togglePlay}>{playing ? 'Pause stream' : 'Play stream'}</button>
        <div class="chip">SvelteKit · GSAP timelines · Svelvet graph</div>
      </div>
      <div class="metrics">
        <div class="metric">
          <div class="label">Throughput</div>
          <div class="value">{$metrics.throughput}</div>
        </div>
        <div class="metric">
          <div class="label">Success</div>
          <div class="value">{$metrics.successRate}</div>
        </div>
        <div class="metric">
          <div class="label">Avg latency</div>
          <div class="value">{$metrics.latency}</div>
        </div>
      </div>
    </div>
    <div class="hero__ribbon">
      {#each stages as stage}
        <div class={`ribbon-step ${$activeStage === stage.id ? 'is-active' : ''}`}>
          <div class="stage-icon">{stageIcon[stage.id]}</div>
          <div>
            <div class="stage-title">{stage.title}</div>
            <p>{stage.blurb}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="grid">
    <article class="panel graph glass">
      <header>
        <div>
          <p class="eyebrow">Flow Graph</p>
          <h3>Relay → PTY orchestration map</h3>
        </div>
        <div class="chip pulse">{$activeStage}</div>
      </header>
      <div class="graph__canvas">
        <Svelvet width={1100} height={420} trackpadPan zoom={0.95} minimap edgesAboveNode={true}>
          {#each nodes as node (node.id)}
            <Node
              id={node.id}
              label={node.label}
              position={node.position}
              dimensions={node.dimensions}
              connections={node.connections}
              bgColor={($activeStage === node.stage ? stageColor[node.stage] : '#f8fbff') as any}
              textColor={($activeStage === node.stage ? '#ffffff' : '#0c1a33') as any}
              borderColor={$activeStage === node.stage ? '#7ab7ff' : '#dce5f5'}
              borderRadius={16}
            />
          {/each}
          <Background slot="background" bgColor="transparent" dotColor="rgba(12,26,51,0.08)" gridWidth={90} />
          <Controls />
          <Minimap />
        </Svelvet>
        <div class="edge-overlay">
          <span class="edge-flow" style="left: 18%;"></span>
          <span class="edge-flow" style="left: 47%;"></span>
          <span class="edge-flow" style="left: 76%;"></span>
        </div>
      </div>
    </article>

    <article class="panel stream glass">
      <header>
        <div>
          <p class="eyebrow">Live stream</p>
          <h3>Event packets in-flight</h3>
        </div>
        <div class="chip">Newest → oldest</div>
      </header>
      <div class="event-list">
        {#each $events as evt (evt.id)}
          <div class="event" in:fly={{ y: 10, duration: 150 }} out:fade={{ duration: 120 }}>
            <div class="event__meta">
              <span class="status-dot" style={`background:${stageColor[evt.stage]}`}></span>
              <strong>{evt.actor}</strong>
              <span class="event__stage">{evt.stage}</span>
            </div>
            <div class="event__body">{evt.message}</div>
            <div class="event__foot">
              <span>{evt.latency} ms</span>
              <span class={`pill ${evt.status === 'ok' ? 'good' : 'warn'}`}>{evt.status}</span>
              <span>{new Date(evt.ts).toLocaleTimeString()}</span>
            </div>
          </div>
        {/each}
      </div>
    </article>
  </section>

  <section class="panel scripts glass">
    <header>
      <p class="eyebrow">Storyboard</p>
      <h3>Explainable steps for the relay-pty lifecycle</h3>
    </header>
    <div class="grid-2">
      {#each stages as stage}
        <div class="step-card">
          <div class="step-head">
            <span class="status-dot" style={`background:${stage.color}`}></span>
            <strong>{stage.title}</strong>
          </div>
          <p>{stage.blurb}</p>
          <ul>
            {#if stage.id === 'queue'}
              <li>Visualize queuing and backpressure with pulsing badges.</li>
              <li>Show bundling + checksum before leaving the daemon.</li>
            {:else if stage.id === 'socket'}
              <li>Animate packets along the relay WebSocket spine.</li>
              <li>Display negotiated capabilities + retries.</li>
            {:else if stage.id === 'pty'}
              <li>Depict PTY shim, echo suppression, stdout/stderr taps.</li>
              <li>Highlight safety rails during injection.</li>
            {:else}
              <li>Run signature + checksum verification.</li>
              <li>Render approval/fail badges for demos.</li>
            {/if}
          </ul>
        </div>
      {/each}
    </div>
  </section>
</main>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 26px;
    padding: 28px;
    max-width: 1280px;
    margin: 0 auto 40px;
  }

  .hero {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    padding: 26px;
  }

  .hero__text h1 {
    font-size: clamp(30px, 4vw, 44px);
    margin: 10px 0;
  }

  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 16px 0 10px;
    align-items: center;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .metric {
    padding: 14px;
    border-radius: 14px;
    background: rgba(12, 26, 51, 0.04);
    border: 1px solid rgba(12, 26, 51, 0.07);
  }

  .metric .label { color: var(--muted); font-size: 13px; }
  .metric .value { font-size: 22px; font-weight: 800; }

  .hero__ribbon {
    display: grid;
    gap: 12px;
    align-content: center;
  }

  .ribbon-step {
    display: grid;
    grid-template-columns: 58px 1fr;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid rgba(12, 26, 51, 0.06);
    background: linear-gradient(120deg, rgba(15, 139, 255, 0.05), rgba(255, 255, 255, 0.7));
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  .ribbon-step.is-active {
    transform: translateY(-2px);
    border-color: rgba(15, 139, 255, 0.28);
    box-shadow: 0 12px 30px rgba(0, 98, 255, 0.15);
  }

  .stage-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: white;
    font-weight: 800;
    color: var(--ink);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 8px 20px rgba(12, 26, 51, 0.08);
  }

  .stage-title { font-weight: 700; }

  .grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 20px;
  }

  .panel {
    padding: 18px;
    border-radius: var(--radius);
    position: relative;
    overflow: hidden;
  }

  .panel header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 12px;
  }

  .eyebrow {
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    font-size: 12px;
    margin: 0 0 4px;
  }

  .graph__canvas {
    position: relative;
    height: 420px;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(233, 243, 255, 0.95));
    border: 1px solid rgba(12, 26, 51, 0.08);
  }

  :global(.svelvet-container) {
    background: transparent;
  }

  :global(.pulse-node) {
    box-shadow: 0 10px 30px rgba(15, 139, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.7);
  }

  :global(.idle-node) {
    box-shadow: 0 10px 20px rgba(12, 26, 51, 0.08);
  }

  .edge-overlay {
    pointer-events: none;
    position: absolute;
    inset: 0;
  }

  .edge-flow {
    position: absolute;
    top: 48%;
    width: 14%;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(0, 98, 255, 0.8), transparent);
    border-radius: 999px;
    opacity: 0.6;
    filter: drop-shadow(0 0 6px rgba(0, 98, 255, 0.45));
    transform: translateY(-50%);
  }

  .stream .event-list {
    max-height: 420px;
    overflow: hidden;
    display: grid;
    gap: 10px;
  }

  .event {
    padding: 12px;
    border-radius: 14px;
    border: 1px solid rgba(12, 26, 51, 0.07);
    background: rgba(255, 255, 255, 0.86);
    box-shadow: 0 8px 20px rgba(12, 26, 51, 0.06);
  }

  .event__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 4px;
  }

  .event__body { color: var(--muted); font-weight: 600; }

  .event__foot {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: var(--muted);
    margin-top: 6px;
    align-items: center;
  }

  .event__stage {
    padding: 4px 8px;
    border-radius: 10px;
    background: rgba(12, 26, 51, 0.05);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 11px;
  }

  .pill {
    padding: 4px 8px;
    border-radius: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .pill.good { background: rgba(36, 214, 162, 0.2); color: #0d8a65; }
  .pill.warn { background: rgba(255, 159, 28, 0.18); color: #c06500; }

  .scripts ul {
    padding-left: 18px;
    margin: 8px 0 0;
    color: var(--muted);
    line-height: 1.5;
  }

  .step-card {
    padding: 16px;
    border-radius: 14px;
    border: 1px solid rgba(12, 26, 51, 0.08);
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 12px 30px rgba(12, 26, 51, 0.06);
  }

  .step-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
  }

  @media (max-width: 1000px) {
    .hero { grid-template-columns: 1fr; }
    .grid { grid-template-columns: 1fr; }
  }
</style>
