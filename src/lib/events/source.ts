// Dual-mode event source for relay-pty visualization
// Supports simulated events (default) and WebSocket connection (optional)

import { readable, type Readable } from 'svelte/store';
import type { BaseEvent } from '$lib/types/events';
import { createSimulatedStream } from './simulator';

// ============================================
// Types
// ============================================

export type EventSourceMode = 'simulated' | 'websocket';

export interface EventSourceConfig {
  mode: EventSourceMode;
  wsUrl?: string;
  simSpeed?: number; // Events per second
}

// ============================================
// WebSocket Event Stream
// ============================================

function createWebSocketStream(url: string): Readable<BaseEvent | null> {
  return readable<BaseEvent | null>(null, (set) => {
    let ws: WebSocket | null = null;
    let backoff = 1;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log('[EventSource] WebSocket connected');
          backoff = 1; // Reset backoff on successful connection
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as BaseEvent;
            set(data);
          } catch (e) {
            console.error('[EventSource] Failed to parse event:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('[EventSource] WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log(`[EventSource] WebSocket closed, reconnecting in ${backoff}s`);
          if (!destroyed) {
            reconnectTimeout = setTimeout(() => {
              backoff = Math.min(backoff * 2, 30); // Max 30s backoff
              connect();
            }, backoff * 1000);
          }
        };
      } catch (e) {
        console.error('[EventSource] Failed to create WebSocket:', e);
      }
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  });
}

// ============================================
// Dual-Mode Event Source Factory
// ============================================

export function createEventSource(config: EventSourceConfig): Readable<BaseEvent | null> {
  const { mode, wsUrl, simSpeed = 5 } = config;

  if (mode === 'websocket') {
    if (!wsUrl) {
      console.warn('[EventSource] WebSocket mode requires wsUrl, falling back to simulated');
      return createSimulatedStream(simSpeed);
    }
    return createWebSocketStream(wsUrl);
  }

  return createSimulatedStream(simSpeed);
}

// ============================================
// Default Export (Simulated Mode)
// ============================================

export const defaultEventSource = createEventSource({
  mode: 'simulated',
  simSpeed: 3, // 3 events per second for demos
});

// ============================================
// Re-export simulator utilities
// ============================================

export { createSimulatedStream, createManualStream, DEMO_AGENTS, DEMO_MESSAGES } from './simulator';
