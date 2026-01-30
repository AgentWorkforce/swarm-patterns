// Canonical shared types for the relay-pty visualization (frontend-only, simulated-first).
// Keep dependency-free so stores, simulators, and fixtures can import without pulling UI code.

export type EventKind = 'pty' | 'agent' | 'daemon' | 'relay' | 'system';

export type PtyOpenPayload = {
  type: 'pty/open';
  ptyId: string;
  cmd: string;
  cwd: string;
  env?: string[];
};

export type PtyIoPayload = {
  type: 'pty/io';
  ptyId: string;
  stream: 'stdout' | 'stdin';
  data: string;
  len: number;
};

export type PtyExitPayload = {
  type: 'pty/exit';
  ptyId: string;
  code: number;
  signal?: string;
};

export type AgentMsgPayload = {
  type: 'agent/msg';
  body: string; // canonical (Lead FINAL - DO NOT CHANGE)
  text?: string; // legacy alias
  isBroadcast?: boolean;
  isUrgent?: boolean;
  channel?: string;
  thread?: string;
  from?: string;
  to?: string;
  meta?: Record<string, unknown>;
};

export type DaemonStatusPayload = {
  type: 'daemon/status';
  component: string;
  status: 'ok' | 'warn' | 'error';
  detail?: string;
};

export type RelaySpawnPayload = {
  type: 'relay/spawn';
  name: string;
  cli: string;
};

export type RelayReleasePayload = {
  type: 'relay/release';
  name: string;
  reason?: string;
};

export type SystemStatePayload = {
  type: 'system/state';
  action: 'join' | 'leave';
  member: string;
  channel?: string;
};

export type EventPayload =
  | PtyOpenPayload
  | PtyIoPayload
  | PtyExitPayload
  | AgentMsgPayload
  | DaemonStatusPayload
  | RelaySpawnPayload
  | RelayReleasePayload
  | SystemStatePayload;

export type Event = {
  id: string;
  ts: string; // ISO timestamp
  sessionId: string;
  kind: EventKind;
  subtype: string;
  source: string;
  target?: string;
  channel?: string;
  thread?: string;
  payload: EventPayload;
  seq?: number;
  status?: string;
  raw?: unknown;
};

// Back-compat alias used by earlier modules.
export type BaseEvent = Event;

export type Session = {
  id: string;
  startedAt: string;
  endedAt?: string;
  command: string;
  tags: string[];
  agents: string[];
  stats: {
    eventCount: number;
    ioBytes: number;
    errorCount?: number;
  };
  lastEventAt?: string;
};

// Helpers
export const kindFromPayload = (payload: EventPayload): EventKind => {
  if (payload.type.startsWith('pty/')) return 'pty';
  if (payload.type.startsWith('agent/')) return 'agent';
  if (payload.type.startsWith('daemon/')) return 'daemon';
  if (payload.type.startsWith('relay/')) return 'relay';
  return 'system';
};

export const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `evt-${Math.random().toString(36).slice(2, 10)}`;
