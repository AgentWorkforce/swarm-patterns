import type { Event } from '$lib/types/contracts';

export type MockWsOptions = {
  events: Event[];
  intervalMs?: number;
  loop?: boolean;
};

export type MockWs = {
  subscribe: (fn: (ev: Event) => void) => () => void;
  start: () => void;
  stop: () => void;
  send: (msg: unknown) => void;
  status: () => 'open' | 'closed';
};

// Lightweight mock that mirrors the shape of a browser WebSocket for the UI.
export function createMockWs({ events, intervalMs = 500, loop = false }: MockWsOptions): MockWs {
  let idx = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<(ev: Event) => void>();

  const tick = () => {
    listeners.forEach((l) => l(events[idx]));
    idx += 1;
    if (idx >= events.length) {
      if (loop) idx = 0;
      else stop();
    }
  };

  const start = () => {
    if (timer || events.length === 0) return;
    timer = setInterval(tick, intervalMs);
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  return {
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    start,
    stop,
    send: (_msg) => {
      /* no-op: kept for API parity */
    },
    status: () => (timer ? 'open' : 'closed')
  };
}
