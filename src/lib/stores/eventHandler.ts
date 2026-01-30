/**
 * Event Handler
 *
 * Connects the event source to UI stores, dispatching events
 * to the appropriate store actions and triggering animations.
 */

import { writable, get } from 'svelte/store';
import {
  spawnAgent,
  releaseAgent,
  updateAgentStatus,
  clearAgents,
  type Agent
} from './agents';
import { sendMessage, clearMessages } from './messages';
import type { AgentRole, AgentStatus } from '$lib/animations';

// Event types (aligned with relay-pty schema)
export interface BaseEvent {
  id: string;
  ts: number;
  sessionId?: string;
  kind: string;
  subtype: string;
  source: string;
  target?: string;
  payload: Record<string, unknown>;
}

// Daemon status
export interface DaemonStatus {
  component: string;
  status: 'online' | 'offline' | 'error';
  detail?: string;
}

const daemonStatusStore = writable<DaemonStatus>({
  component: 'daemon',
  status: 'online'
});

export const daemonStatus = daemonStatusStore;

// Event statistics
const statsStore = writable({
  totalEvents: 0,
  agentSpawns: 0,
  agentReleases: 0,
  messagesSent: 0,
  errors: 0
});

export const eventStats = statsStore;

// Map role strings to AgentRole type
function parseRole(role: string): AgentRole {
  const validRoles: AgentRole[] = ['lead', 'worker', 'architect', 'researcher', 'devops'];
  return validRoles.includes(role as AgentRole) ? (role as AgentRole) : 'default';
}

// Map status strings to AgentStatus type
function parseStatus(status: string): AgentStatus {
  const validStatuses: AgentStatus[] = ['idle', 'active', 'busy', 'error', 'spawning', 'releasing'];
  return validStatuses.includes(status as AgentStatus) ? (status as AgentStatus) : 'idle';
}

// Layout helper - calculate position for new agent
let agentIndex = 0;
function getNextPosition(centerX: number = 400, centerY: number = 300, radius: number = 200): { x: number; y: number } {
  const angle = (agentIndex / 8) * Math.PI * 2 - Math.PI / 2;
  agentIndex++;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
}

/**
 * Handle incoming event from event source
 */
export function handleEvent(event: BaseEvent): void {
  statsStore.update((s) => ({ ...s, totalEvents: s.totalEvents + 1 }));

  const { kind, subtype, source, target, payload } = event;
  const eventType = `${kind}/${subtype}`;

  switch (eventType) {
    case 'agent/spawn': {
      const pos = getNextPosition();
      const agent: Omit<Agent, 'spawnedAt'> = {
        id: source,
        name: (payload.name as string) || source,
        role: parseRole((payload.role as string) || 'worker'),
        status: 'spawning',
        x: pos.x,
        y: pos.y,
        spawnedBy: payload.spawnedBy as string | undefined
      };
      spawnAgent(agent);
      statsStore.update((s) => ({ ...s, agentSpawns: s.agentSpawns + 1 }));

      // Transition to active after spawn animation
      setTimeout(() => {
        updateAgentStatus(source, 'active');
      }, 300);
      break;
    }

    case 'agent/release': {
      updateAgentStatus(source, 'releasing');
      statsStore.update((s) => ({ ...s, agentReleases: s.agentReleases + 1 }));

      // Remove after despawn animation
      setTimeout(() => {
        releaseAgent(source);
      }, 200);
      break;
    }

    case 'agent/state': {
      const status = parseStatus((payload.status as string) || 'idle');
      updateAgentStatus(source, status);
      break;
    }

    case 'agent/msg':
    case 'message/send': {
      if (target) {
        sendMessage({
          id: event.id,
          from: source,
          to: target,
          // prefer canonical body, fall back to legacy text/content
          content: (payload.body as string) || (payload.text as string) || (payload.content as string) || '',
          channel: payload.channel as string | undefined,
          thread: payload.thread as string | undefined
        });
        statsStore.update((s) => ({ ...s, messagesSent: s.messagesSent + 1 }));
      }
      break;
    }

    case 'daemon/status': {
      daemonStatusStore.set({
        component: (payload.component as string) || 'daemon',
        status: (payload.status as 'online' | 'offline' | 'error') || 'online',
        detail: payload.detail as string | undefined
      });
      break;
    }

    case 'pty/open':
    case 'pty/io':
    case 'pty/exit': {
      // PTY events - update agent activity
      updateAgentStatus(source, subtype === 'exit' ? 'idle' : 'busy');
      break;
    }

    default:
      // Unknown event type - log for debugging
      console.debug('Unknown event type:', eventType, event);
  }
}

/**
 * Reset all stores
 */
export function resetStores(): void {
  clearAgents();
  clearMessages();
  agentIndex = 0;
  statsStore.set({
    totalEvents: 0,
    agentSpawns: 0,
    agentReleases: 0,
    messagesSent: 0,
    errors: 0
  });
  daemonStatusStore.set({
    component: 'daemon',
    status: 'online'
  });
}
