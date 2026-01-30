import { derived, writable } from 'svelte/store';
import type { RelayEvent, Stage } from '$lib/types';

const stageOrder: Stage[] = ['queue', 'socket', 'pty', 'verification'];

const samples: Record<Stage, string[]> = {
  queue: [
    'Daemon queued command bundle',
    'Prefetching dependency map',
    'Compressing payload',
    'Snapshotting filesystem delta'
  ],
  socket: [
    'Relay opened secure WebSocket',
    'Negotiating protocol features',
    'Upgrading connection with mTLS',
    'Streaming chunks to agent socket'
  ],
  pty: [
    'Injecting command into PTY',
    'Applying terminal shim',
    'PTY echo suppression enabled',
    'Forwarding stdout/stderr'
  ],
  verification: [
    'Checksum verification',
    'Signature validated',
    'Policy pass: sandboxed',
    'Post-flight integrity audit'
  ]
};

const actors: Record<Stage, string> = {
  queue: 'Daemon',
  socket: 'Relay',
  pty: 'Agent PTY',
  verification: 'Verifier'
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLatency(stage: Stage) {
  const base = { queue: 35, socket: 60, pty: 85, verification: 45 }[stage];
  return Math.round(base + Math.random() * 40);
}

let tick = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const stream = writable<RelayEvent[]>([]);

const makeEvent = (): RelayEvent => {
  const stage = stageOrder[tick % stageOrder.length];
  tick += 1;
  const status = Math.random() > 0.08 ? 'ok' : 'fail';
  return {
    id: `evt-${Date.now()}-${tick}`,
    stage,
    actor: actors[stage],
    message: randomFrom(samples[stage]),
    status,
    latency: randomLatency(stage),
    ts: Date.now()
  };
};

export const startMockStream = () => {
  if (timer) return;
  timer = setInterval(() => {
    const evt = makeEvent();
    stream.update((current) => [evt, ...current].slice(0, 50));
  }, 1050);
};

export const stopMockStream = () => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
};

export const events = stream;

export const activeStage = derived(stream, ($events) => $events[0]?.stage ?? 'queue');

export const metrics = derived(stream, ($events) => {
  if ($events.length === 0) {
    return {
      throughput: '—',
      successRate: '—',
      latency: '—'
    };
  }

  const recent = $events.slice(0, 20);
  const ok = recent.filter((e) => e.status === 'ok').length;
  const successRate = Math.round((ok / recent.length) * 100);

  const window = recent.slice(0, 8);
  const span = window[0].ts - window.at(-1)!.ts || 1000;
  const throughputPerMin = Math.max(1, Math.round((window.length / span) * 60000));

  const avgLatency = Math.round(
    recent.reduce((acc, curr) => acc + curr.latency, 0) / recent.length
  );

  return {
    throughput: `${throughputPerMin}/min`,
    successRate: `${successRate}%`,
    latency: `${avgLatency} ms`
  };
});
