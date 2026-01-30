/**
 * Animation Module Exports
 *
 * Central export point for all animation utilities.
 */

// Presets and constants
export {
  springs,
  durations,
  easings,
  agentColors,
  statusColors,
  keyframes,
  activityScale,
  layers,
  type AgentRole,
  type AgentStatus,
  type ActivityLevel
} from './presets';

// Custom Svelte transitions
export {
  agentSpawn,
  agentDespawn,
  connectionDraw,
  messagePulse,
  statusFlash,
  staggeredSpawn,
  elasticBounce,
  floatIdle,
  trailFade
} from './transitions';

// GSAP utilities
export {
  initGSAP,
  createSpawnTimeline,
  createDespawnTimeline,
  createMessagePulse,
  createConnectionAnimation,
  staggerSpawn,
  createActivityPulse,
  killAnimations,
  pauseAllAnimations,
  resumeAllAnimations,
  gsap
} from './gsap';
