// Simulated event stream for relay-pty visualization demos
// Generates realistic agent communication patterns using BaseEvent schema

import { readable, type Readable } from 'svelte/store';
import type { BaseEvent, EventPayload } from '$lib/types/events';
import { makeId, kindFromPayload } from '$lib/types/events';

// ============================================
// Constants
// ============================================

const SESSION_ID = 'demo-session-001';
const AGENTS = ['Lead', 'Worker-1', 'Worker-2', 'Worker-3'];
const CLIS = ['claude', 'codex', 'gemini', 'aider'];

// ============================================
// Event Factory
// ============================================

function createEvent(
  source: string,
  payload: EventPayload,
  target?: string,
  channel?: string,
  thread?: string
): BaseEvent {
  const subtype = payload.type.includes('/') ? payload.type.split('/')[1] : payload.type;
  return {
    id: makeId(),
    ts: new Date().toISOString(),
    sessionId: SESSION_ID,
    kind: kindFromPayload(payload),
    subtype,
    source,
    target,
    payload,
    channel,
    thread,
  };
}

// ============================================
// Scenario Generators
// ============================================

interface Scenario {
  name: string;
  events: BaseEvent[];
}

function createSpawnSequence(): Scenario {
  const ptyId = makeId();
  return {
    name: 'spawn-sequence',
    events: [
      // Lead opens PTY
      createEvent('Lead', {
        type: 'pty/open',
        ptyId,
        cmd: 'claude',
        cwd: '/workspace',
      }),
      // Lead joins system
      createEvent('daemon', {
        type: 'system/state',
        action: 'join',
        member: 'Lead',
      }),
      // Workers spawn
      createEvent('Lead', {
        type: 'agent/msg', body: 'Spawning Worker-1 for task A',
      }, 'Worker-1'),
      createEvent('daemon', {
        type: 'system/state',
        action: 'join',
        member: 'Worker-1',
      }),
      createEvent('Lead', {
        type: 'agent/msg', body: 'Spawning Worker-2 for task B',
      }, 'Worker-2'),
      createEvent('daemon', {
        type: 'system/state',
        action: 'join',
        member: 'Worker-2',
      }),
      // Workers ACK
      createEvent('Worker-1', {
        type: 'agent/msg', body: 'ACK: Starting task A',
      }, 'Lead'),
      createEvent('Worker-2', {
        type: 'agent/msg', body: 'ACK: Starting task B',
      }, 'Lead'),
    ],
  };
}

function createMessageFlurry(): Scenario {
  const events: BaseEvent[] = [];

  for (let i = 0; i < 8; i++) {
    const from = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    let to = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    while (to === from) to = AGENTS[Math.floor(Math.random() * AGENTS.length)];

    events.push(createEvent(from, {
      type: 'agent/msg', body: `Status update #: progress on subtask`,
    }, to));
  }

  return { name: 'message-flurry', events };
}

function createBroadcast(): Scenario {
  return {
    name: 'broadcast',
    events: [
      createEvent('Lead', {
        type: 'agent/msg', body: 'ATTENTION: All agents sync checkpoint',
        isBroadcast: true,
        isUrgent: true,
      }),
      createEvent('Worker-1', {
        type: 'agent/msg', body: 'ACK: Checkpoint received',
      }, 'Lead'),
      createEvent('Worker-2', {
        type: 'agent/msg', body: 'ACK: Checkpoint received',
      }, 'Lead'),
      createEvent('Worker-3', {
        type: 'agent/msg', body: 'ACK: Checkpoint received',
      }, 'Lead'),
    ],
  };
}

function createChannelChat(): Scenario {
  return {
    name: 'channel-chat',
    events: [
      createEvent('Worker-1', {
        type: 'agent/msg', body: 'Found a bug in the auth module',
        channel: 'general',
      }, undefined, 'general'),
      createEvent('Worker-2', {
        type: 'agent/msg', body: 'Can you share the stack trace?',
        channel: 'general',
      }, undefined, 'general'),
      createEvent('Worker-1', {
        type: 'agent/msg', body: 'TypeError at line 42, null reference',
        channel: 'general',
      }, undefined, 'general'),
      createEvent('Lead', {
        type: 'agent/msg', body: 'Good catch, Worker-2 please assist',
        channel: 'general',
      }, undefined, 'general'),
    ],
  };
}

function createPtyActivity(): Scenario {
  const ptyId = makeId();
  return {
    name: 'pty-activity',
    events: [
      createEvent('Worker-1', {
        type: 'pty/io',
        ptyId,
        stream: 'stdout',
        data: 'Running tests...\n',
        len: 18,
      }),
      createEvent('Worker-1', {
        type: 'pty/io',
        ptyId,
        stream: 'stdout',
        data: 'Test 1/5 passed\n',
        len: 16,
      }),
      createEvent('Worker-1', {
        type: 'pty/io',
        ptyId,
        stream: 'stdout',
        data: 'Test 2/5 passed\n',
        len: 16,
      }),
      createEvent('daemon', {
        type: 'daemon/status',
        component: 'relay-pty',
        status: 'ok',
        detail: 'All PTY sessions healthy',
      }),
    ],
  };
}

function createErrorRecovery(): Scenario {
  const ptyId = makeId();
  return {
    name: 'error-recovery',
    events: [
      createEvent('daemon', {
        type: 'daemon/status',
        component: 'Worker-2',
        status: 'error',
        detail: 'Connection timeout',
      }),
      createEvent('daemon', {
        type: 'system/state',
        action: 'leave',
        member: 'Worker-2',
      }),
      createEvent('daemon', {
        type: 'daemon/status',
        component: 'relay',
        status: 'warn',
        detail: 'Agent count reduced to 3',
      }),
      // Recovery
      createEvent('daemon', {
        type: 'system/state',
        action: 'join',
        member: 'Worker-2',
      }),
      createEvent('daemon', {
        type: 'daemon/status',
        component: 'relay',
        status: 'ok',
        detail: 'All agents reconnected',
      }),
      createEvent('Worker-2', {
        type: 'agent/msg', body: 'Reconnected, resuming task',
      }, 'Lead'),
    ],
  };
}

function createReleaseSequence(): Scenario {
  const ptyId = makeId();
  return {
    name: 'release-sequence',
    events: [
      createEvent('Worker-1', {
        type: 'agent/msg', body: 'DONE: Task A complete',
      }, 'Lead'),
      createEvent('Worker-2', {
        type: 'agent/msg', body: 'DONE: Task B complete',
      }, 'Lead'),
      createEvent('daemon', {
        type: 'system/state',
        action: 'leave',
        member: 'Worker-1',
      }),
      createEvent('Worker-1', {
        type: 'pty/exit',
        ptyId,
        code: 0,
      }),
      createEvent('daemon', {
        type: 'system/state',
        action: 'leave',
        member: 'Worker-2',
      }),
      createEvent('daemon', {
        type: 'daemon/status',
        component: 'relay',
        status: 'ok',
        detail: 'Session winding down',
      }),
    ],
  };
}

// ============================================
// Scenario Sequencer
// ============================================

const SCENARIOS = [
  createSpawnSequence,
  createMessageFlurry,
  createBroadcast,
  createChannelChat,
  createPtyActivity,
  createErrorRecovery,
  createReleaseSequence,
];

function* scenarioGenerator(): Generator<BaseEvent, void, unknown> {
  let scenarioIdx = 0;

  while (true) {
    const scenario = SCENARIOS[scenarioIdx % SCENARIOS.length]();
    for (const event of scenario.events) {
      // Update timestamp to current time
      yield { ...event, ts: new Date().toISOString() };
    }
    scenarioIdx++;
  }
}

// ============================================
// Simulated Event Stream
// ============================================

export function createSimulatedStream(eventsPerSec = 5): Readable<BaseEvent | null> {
  return readable<BaseEvent | null>(null, (set) => {
    const generator = scenarioGenerator();
    const intervalMs = 1000 / eventsPerSec;

    const interval = setInterval(() => {
      const { value, done } = generator.next();
      if (!done && value) {
        set(value);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  });
}

// ============================================
// Manual Event Trigger (for testing)
// ============================================

export function createManualStream(): {
  stream: Readable<BaseEvent | null>;
  emit: (event: BaseEvent) => void;
} {
  let emitter: ((event: BaseEvent) => void) | null = null;

  const stream = readable<BaseEvent | null>(null, (set) => {
    emitter = set;
    return () => {
      emitter = null;
    };
  });

  return {
    stream,
    emit: (event: BaseEvent) => emitter?.(event),
  };
}

// ============================================
// Demo Preset Data (for static views)
// ============================================

export const DEMO_AGENTS = [
  { id: '1', name: 'Lead', cli: 'claude', state: 'busy' as const, position: { x: 300, y: 200 } },
  { id: '2', name: 'Worker-1', cli: 'claude', state: 'idle' as const, spawner: 'Lead', position: { x: 150, y: 350 } },
  { id: '3', name: 'Worker-2', cli: 'codex', state: 'busy' as const, spawner: 'Lead', position: { x: 300, y: 400 } },
  { id: '4', name: 'Worker-3', cli: 'gemini', state: 'idle' as const, spawner: 'Lead', position: { x: 450, y: 350 } },
];

export const DEMO_MESSAGES: BaseEvent[] = [
  createEvent('Lead', { type: 'agent/msg', body: 'Implement feature X' }, 'Worker-1'),
  createEvent('Lead', { type: 'agent/msg', body: 'Review PR #123' }, 'Worker-2'),
  createEvent('Worker-1', { type: 'agent/msg', body: 'ACK: Starting now' }, 'Lead'),
  createEvent('Worker-2', { type: 'agent/msg', body: 'Found issue in tests', channel: 'general' }, undefined, 'general'),
];
