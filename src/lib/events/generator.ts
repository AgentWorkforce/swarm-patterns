import { writable, derived, get } from 'svelte/store';
import type { BaseEvent, EventPayload, Session } from '$lib/types/events';
import { kindFromPayload, makeId } from '$lib/types/events';

type ScenarioEvent = { at: number; payload: EventPayload; source: string; target?: string; thread?: string; channel?: string };

type SimulationState = 'idle' | 'running' | 'paused' | 'done';

const MAX_EVENTS = 2000;

// Default deterministic scenario (can be swapped for fixtures later)
const buildDefaultScenario = (): { session: Session; events: ScenarioEvent[] } => {
  const sessionId = `sim-${Date.now()}`;
  const startedAt = new Date().toISOString();
  return {
    session: {
      id: sessionId,
      startedAt,
      command: 'relay-pty demo',
      tags: ['demo', 'simulated'],
      agents: ['daemon', 'relay-pty', 'Agent-A'],
      stats: { eventCount: 0, ioBytes: 0 }
    },
    events: [
      { at: 0, payload: { type: 'pty/open', ptyId: 'pty-1', cmd: 'npm test', cwd: '/workspace' }, source: 'daemon' },
      { at: 80, payload: { type: 'daemon/status', component: 'relay', status: 'ok' }, source: 'daemon' },
      {
        at: 140,
        payload: { type: 'agent/msg', body: 'Agent connected to PTY', channel: '#general' },
        source: 'Agent-A',
        target: '#general'
      },
      { at: 220, payload: { type: 'pty/io', ptyId: 'pty-1', stream: 'stdout', data: 'Running tests...\n', len: 16 }, source: 'pty-1' },
      {
        at: 320,
        payload: { type: 'pty/io', ptyId: 'pty-1', stream: 'stdout', data: 'PASS  api/routes.spec.ts\n', len: 27 },
        source: 'pty-1'
      },
      {
        at: 420,
        payload: { type: 'agent/msg', body: 'Tests green ✅', channel: '#general' },
        source: 'Agent-A',
        target: '#general'
      },
      {
        at: 520,
        payload: { type: 'daemon/status', component: 'relay', status: 'warn', detail: 'Intermittent latency spike' },
        source: 'daemon'
      },
      { at: 680, payload: { type: 'pty/exit', ptyId: 'pty-1', code: 0 }, source: 'daemon' }
    ]
  };
};

// Stores
export const timeline = writable<BaseEvent[]>([]);
export const session = writable<Session | null>(null);
export const state = writable<SimulationState>('idle');
export const speed = writable(1); // multiplier (1x default)

let timer: ReturnType<typeof setTimeout> | null = null;
let pointer = 0;
let scenario = buildDefaultScenario();

const emitEvent = (spec: ScenarioEvent, sessionId: string) => {
  const ts = new Date().toISOString();
  const payload = spec.payload;
  const event: BaseEvent = {
    id: makeId(),
    ts,
    sessionId,
    kind: kindFromPayload(payload),
    subtype: payload.type.split('/')[1] ?? payload.type,
    source: spec.source,
    target: spec.target,
    thread: spec.thread,
    channel: spec.channel ?? payload.type === 'agent/msg' ? (payload as any).channel : undefined,
    payload
  };
  timeline.update((curr) => [event, ...curr].slice(0, MAX_EVENTS));
  session.update((meta) => ({
    ...(meta ?? scenario.session),
    lastEventAt: ts,
    stats: {
      eventCount: (meta?.stats?.eventCount ?? 0) + 1,
      ioBytes:
        (meta?.stats?.ioBytes ?? 0) +
        (payload.type === 'pty/io' ? (payload as any).len : 0)
    }
  }));
};

const scheduleNext = () => {
  if (!scenario) return;
  if (pointer >= scenario.events.length) {
    state.set('done');
    timer = null;
    return;
  }

  const current = scenario.events[pointer];
  const prevAt = pointer === 0 ? 0 : scenario.events[pointer - 1].at;
  const delay = Math.max(0, (current.at - prevAt) / get(speed));

  timer = setTimeout(() => {
    emitEvent(current, scenario.session.id);
    pointer += 1;
    scheduleNext();
  }, delay);
};

export const startSimulation = (opts?: { scenario?: { session: Session; events: ScenarioEvent[] }; speed?: number }) => {
  stopSimulation();
  pointer = 0;
  if (opts?.speed) speed.set(opts.speed);
  scenario = opts?.scenario ?? buildDefaultScenario();
  timeline.set([]);
  session.set(scenario.session);
  state.set('running');
  scheduleNext();
};

export const stopSimulation = () => {
  if (timer) clearTimeout(timer);
  timer = null;
  pointer = 0;
  state.set('idle');
};

export const pauseSimulation = () => {
  if (!timer) return;
  clearTimeout(timer);
  timer = null;
  state.set('paused');
};

export const resumeSimulation = () => {
  if (timer || get(state) === 'running' || pointer >= scenario.events.length) return;
  state.set('running');
  scheduleNext();
};

// Derived helpers
export const latest = derived(timeline, ($t) => $t[0]);
