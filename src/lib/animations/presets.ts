/**
 * Animation Presets for Swarm Pattern Visualization
 *
 * Spring physics and timing configurations optimized for 60fps
 * on desktop and mobile browsers.
 */

// Spring configurations for svelte/motion
export const springs = {
  // Agent movement - smooth, slightly bouncy
  agent: { stiffness: 0.15, damping: 0.8 },

  // Connection lines - snappy, responsive
  connection: { stiffness: 0.3, damping: 0.9 },

  // Pulse effects - elastic, attention-grabbing
  pulse: { stiffness: 0.5, damping: 0.5 },

  // Gentle transitions - slow, smooth
  gentle: { stiffness: 0.08, damping: 0.9 },

  // Quick snap - fast, minimal overshoot
  snap: { stiffness: 0.4, damping: 0.95 }
} as const;

// Duration presets in milliseconds
export const durations = {
  spawn: 300,
  despawn: 200,
  move: 400,
  pulse: 600,
  messageTrail: 800,
  statusChange: 250,
  hover: 150
} as const;

// Easing functions for CSS/GSAP animations
export const easings = {
  // Standard easing
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',

  // Elastic/bounce
  elasticOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounceOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

  // Sharp for UI feedback
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
} as const;

// Color palette for agent roles
export const agentColors = {
  lead: {
    primary: '#F59E0B',    // Amber/gold
    glow: '#FCD34D',
    shadow: 'rgba(245, 158, 11, 0.4)'
  },
  worker: {
    primary: '#3B82F6',    // Blue
    glow: '#93C5FD',
    shadow: 'rgba(59, 130, 246, 0.4)'
  },
  architect: {
    primary: '#8B5CF6',    // Purple
    glow: '#C4B5FD',
    shadow: 'rgba(139, 92, 246, 0.4)'
  },
  researcher: {
    primary: '#10B981',    // Emerald
    glow: '#6EE7B7',
    shadow: 'rgba(16, 185, 129, 0.4)'
  },
  devops: {
    primary: '#EF4444',    // Red
    glow: '#FCA5A5',
    shadow: 'rgba(239, 68, 68, 0.4)'
  },
  default: {
    primary: '#6B7280',    // Gray
    glow: '#D1D5DB',
    shadow: 'rgba(107, 114, 128, 0.4)'
  }
} as const;

// Agent status indicators
export const statusColors = {
  idle: '#9CA3AF',
  active: '#22C55E',
  busy: '#F59E0B',
  error: '#EF4444',
  spawning: '#8B5CF6',
  releasing: '#6B7280'
} as const;

// Animation keyframe presets for GSAP timelines
export const keyframes = {
  spawn: {
    from: { scale: 0, opacity: 0, y: -20 },
    to: { scale: 1, opacity: 1, y: 0 }
  },
  despawn: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.8, opacity: 0 }
  },
  pulse: {
    keyframes: [
      { scale: 1, boxShadow: '0 0 0 0 currentColor' },
      { scale: 1.1, boxShadow: '0 0 20px 10px transparent' },
      { scale: 1, boxShadow: '0 0 0 0 transparent' }
    ]
  },
  messageReceived: {
    keyframes: [
      { filter: 'brightness(1)' },
      { filter: 'brightness(1.5)' },
      { filter: 'brightness(1)' }
    ]
  }
} as const;

// Size scaling based on activity
export const activityScale = {
  idle: 1,
  low: 1.05,
  medium: 1.1,
  high: 1.15,
  critical: 1.2
} as const;

// Z-index layers for proper stacking
export const layers = {
  background: 0,
  connections: 10,
  agents: 20,
  activeAgent: 30,
  overlay: 40,
  tooltip: 50
} as const;

export type AgentRole = keyof typeof agentColors;
export type AgentStatus = keyof typeof statusColors;
export type ActivityLevel = keyof typeof activityScale;
