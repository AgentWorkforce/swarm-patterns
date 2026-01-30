/**
 * Agents Store
 *
 * Reactive store for managing agent state in the swarm visualization.
 * Responds to spawn/release/state events from the event source.
 */

import { writable, derived, get } from 'svelte/store';
import type { AgentRole, AgentStatus } from '$lib/animations';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  x: number;
  y: number;
  spawnedAt: number;
  spawnedBy?: string;
}

// Internal store
const agentsMap = writable<Map<string, Agent>>(new Map());

// Public derived store as array (for iteration)
export const agents = derived(agentsMap, ($map) => Array.from($map.values()));

// Agent count by role
export const agentsByRole = derived(agentsMap, ($map) => {
  const counts: Record<string, number> = {};
  for (const agent of $map.values()) {
    counts[agent.role] = (counts[agent.role] || 0) + 1;
  }
  return counts;
});

// Get agent by ID
export function getAgent(id: string): Agent | undefined {
  return get(agentsMap).get(id);
}

// Spawn a new agent
export function spawnAgent(agent: Omit<Agent, 'spawnedAt'>): void {
  agentsMap.update((map) => {
    map.set(agent.id, {
      ...agent,
      spawnedAt: Date.now()
    });
    return new Map(map);
  });
}

// Release (remove) an agent
export function releaseAgent(id: string): void {
  agentsMap.update((map) => {
    map.delete(id);
    return new Map(map);
  });
}

// Update agent status
export function updateAgentStatus(id: string, status: AgentStatus): void {
  agentsMap.update((map) => {
    const agent = map.get(id);
    if (agent) {
      map.set(id, { ...agent, status });
    }
    return new Map(map);
  });
}

// Update agent position
export function updateAgentPosition(id: string, x: number, y: number): void {
  agentsMap.update((map) => {
    const agent = map.get(id);
    if (agent) {
      map.set(id, { ...agent, x, y });
    }
    return new Map(map);
  });
}

// Bulk update agents (for initial state)
export function setAgents(newAgents: Agent[]): void {
  agentsMap.set(new Map(newAgents.map((a) => [a.id, a])));
}

// Clear all agents
export function clearAgents(): void {
  agentsMap.set(new Map());
}

// Calculate layout positions for agents (simple circle layout)
export function layoutAgents(
  centerX: number,
  centerY: number,
  radius: number
): void {
  agentsMap.update((map) => {
    const agentList = Array.from(map.values());
    const count = agentList.length;

    agentList.forEach((agent, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      map.set(agent.id, { ...agent, x, y });
    });

    return new Map(map);
  });
}
