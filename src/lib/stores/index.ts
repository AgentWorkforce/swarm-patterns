/**
 * Stores Module Exports
 *
 * Central export point for all Svelte stores.
 */

// Agent store
export {
  agents,
  agentsByRole,
  getAgent,
  spawnAgent,
  releaseAgent,
  updateAgentStatus,
  updateAgentPosition,
  setAgents,
  clearAgents,
  layoutAgents,
  type Agent
} from './agents';

// Message store
export {
  messages,
  connections,
  messagesInFlight,
  recentMessages,
  messagesByChannel,
  sendMessage,
  ackMessage,
  deactivateStaleConnections,
  clearMessages,
  getConnection,
  type Message,
  type ActiveConnection
} from './messages';

// Event handler
export {
  handleEvent,
  resetStores,
  daemonStatus,
  eventStats,
  type BaseEvent,
  type DaemonStatus
} from './eventHandler';
