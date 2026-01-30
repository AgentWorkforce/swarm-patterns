/**
 * Messages Store
 *
 * Reactive store for managing message state in the swarm visualization.
 * Tracks message flow between agents for animation triggers.
 */

import { writable, derived, get } from 'svelte/store';

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  channel?: string;
  thread?: string;
  timestamp: number;
  status: 'sending' | 'delivered' | 'acked';
}

export interface ActiveConnection {
  id: string;
  from: string;
  to: string;
  messageCount: number;
  lastActivity: number;
  active: boolean;
}

// Message history (limited to recent messages)
const MAX_MESSAGES = 100;
const messagesStore = writable<Message[]>([]);

// Active connections (for animation state)
const connectionsStore = writable<Map<string, ActiveConnection>>(new Map());

// Messages in flight (for animation triggers)
const inFlightStore = writable<Set<string>>(new Set());

// Public stores
export const messages = derived(messagesStore, ($msgs) => $msgs);
export const connections = derived(connectionsStore, ($map) =>
  Array.from($map.values())
);
export const messagesInFlight = derived(inFlightStore, ($set) => $set);

// Recent messages (last N)
export const recentMessages = derived(messagesStore, ($msgs) =>
  $msgs.slice(-20)
);

// Messages by channel
export const messagesByChannel = derived(messagesStore, ($msgs) => {
  const grouped: Record<string, Message[]> = {};
  for (const msg of $msgs) {
    const channel = msg.channel || 'direct';
    if (!grouped[channel]) grouped[channel] = [];
    grouped[channel].push(msg);
  }
  return grouped;
});

// Generate connection ID from agent pair
function connectionId(from: string, to: string): string {
  return `${from}->${to}`;
}

// Send a message (triggers animation)
export function sendMessage(message: Omit<Message, 'timestamp' | 'status'>): void {
  const fullMessage: Message = {
    ...message,
    timestamp: Date.now(),
    status: 'sending'
  };

  // Add to message history
  messagesStore.update((msgs) => {
    const updated = [...msgs, fullMessage];
    // Trim to max size
    return updated.slice(-MAX_MESSAGES);
  });

  // Update connection activity
  const connId = connectionId(message.from, message.to);
  connectionsStore.update((map) => {
    const existing = map.get(connId);
    map.set(connId, {
      id: connId,
      from: message.from,
      to: message.to,
      messageCount: (existing?.messageCount || 0) + 1,
      lastActivity: Date.now(),
      active: true
    });
    return new Map(map);
  });

  // Mark as in-flight for animation
  inFlightStore.update((set) => {
    set.add(connId);
    return new Set(set);
  });

  // Clear in-flight after animation duration
  setTimeout(() => {
    inFlightStore.update((set) => {
      set.delete(connId);
      return new Set(set);
    });

    // Update message status to delivered
    messagesStore.update((msgs) =>
      msgs.map((m) =>
        m.id === message.id ? { ...m, status: 'delivered' as const } : m
      )
    );
  }, 800); // Match animation duration
}

// Acknowledge a message
export function ackMessage(messageId: string): void {
  messagesStore.update((msgs) =>
    msgs.map((m) =>
      m.id === messageId ? { ...m, status: 'acked' as const } : m
    )
  );
}

// Deactivate stale connections
export function deactivateStaleConnections(maxAge: number = 5000): void {
  const now = Date.now();
  connectionsStore.update((map) => {
    for (const [id, conn] of map.entries()) {
      if (now - conn.lastActivity > maxAge) {
        map.set(id, { ...conn, active: false });
      }
    }
    return new Map(map);
  });
}

// Clear all messages
export function clearMessages(): void {
  messagesStore.set([]);
  connectionsStore.set(new Map());
  inFlightStore.set(new Set());
}

// Get connection between two agents
export function getConnection(from: string, to: string): ActiveConnection | undefined {
  return get(connectionsStore).get(connectionId(from, to));
}
