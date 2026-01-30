/**
 * Custom Svelte Transitions for Swarm Visualization
 *
 * Extends built-in transitions with swarm-specific effects.
 */

import { cubicOut, elasticOut, backOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { durations, easings } from './presets';

interface BaseParams {
  delay?: number;
  duration?: number;
  easing?: (t: number) => number;
}

/**
 * Agent spawn transition - scales up with slight bounce
 */
export function agentSpawn(
  node: Element,
  params: BaseParams = {}
): TransitionConfig {
  const { delay = 0, duration = durations.spawn, easing = backOut } = params;

  return {
    delay,
    duration,
    easing,
    css: (t: number) => `
      transform: scale(${t}) translateY(${(1 - t) * -20}px);
      opacity: ${t};
    `
  };
}

/**
 * Agent despawn transition - fades and shrinks
 */
export function agentDespawn(
  node: Element,
  params: BaseParams = {}
): TransitionConfig {
  const { delay = 0, duration = durations.despawn, easing = cubicOut } = params;

  return {
    delay,
    duration,
    easing,
    css: (t: number) => `
      transform: scale(${0.8 + t * 0.2});
      opacity: ${t};
    `
  };
}

/**
 * Connection line draw transition - animates stroke dashoffset
 */
export function connectionDraw(
  node: SVGPathElement,
  params: BaseParams & { length?: number } = {}
): TransitionConfig {
  const {
    delay = 0,
    duration = durations.move,
    easing = cubicOut,
    length = node.getTotalLength?.() || 100
  } = params;

  return {
    delay,
    duration,
    easing,
    css: (t: number) => `
      stroke-dasharray: ${length};
      stroke-dashoffset: ${length * (1 - t)};
    `
  };
}

/**
 * Message pulse effect - ripple outward from element
 */
export function messagePulse(
  node: Element,
  params: BaseParams & { color?: string } = {}
): TransitionConfig {
  const {
    delay = 0,
    duration = durations.pulse,
    easing = cubicOut,
    color = 'currentColor'
  } = params;

  return {
    delay,
    duration,
    easing,
    css: (t: number) => {
      const spread = (1 - t) * 20;
      const opacity = t * 0.6;
      return `
        box-shadow: 0 0 ${spread}px ${spread / 2}px ${color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')};
      `;
    }
  };
}

/**
 * Status change flash - brief highlight
 */
export function statusFlash(
  node: Element,
  params: BaseParams = {}
): TransitionConfig {
  const { delay = 0, duration = durations.statusChange, easing = cubicOut } = params;

  return {
    delay,
    duration,
    easing,
    css: (t: number) => {
      // Flash bright then return to normal
      const brightness = t < 0.5 ? 1 + (1 - t * 2) * 0.5 : 1;
      return `filter: brightness(${brightness});`;
    }
  };
}

/**
 * Staggered list transition - for spawning multiple agents
 */
export function staggeredSpawn(
  node: Element,
  params: BaseParams & { index?: number; staggerDelay?: number } = {}
): TransitionConfig {
  const {
    duration = durations.spawn,
    easing = backOut,
    index = 0,
    staggerDelay = 50
  } = params;

  return {
    delay: index * staggerDelay,
    duration,
    easing,
    css: (t: number) => `
      transform: scale(${t}) translateY(${(1 - t) * -10}px);
      opacity: ${t};
    `
  };
}

/**
 * Elastic bounce for interactive feedback
 */
export function elasticBounce(
  node: Element,
  params: BaseParams = {}
): TransitionConfig {
  const { delay = 0, duration = 400, easing = elasticOut } = params;

  return {
    delay,
    duration,
    easing,
    css: (t: number) => `transform: scale(${t});`
  };
}

/**
 * Floating idle animation (use with animate:)
 */
export function floatIdle(
  node: Element,
  params: { amplitude?: number; period?: number } = {}
): TransitionConfig {
  const { amplitude = 3, period = 2000 } = params;

  return {
    duration: period,
    css: (t: number) => {
      const y = Math.sin(t * Math.PI * 2) * amplitude;
      return `transform: translateY(${y}px);`;
    }
  };
}

/**
 * Trail fade for message paths
 */
export function trailFade(
  node: Element,
  params: BaseParams = {}
): TransitionConfig {
  const { delay = 0, duration = durations.messageTrail, easing = cubicOut } = params;

  return {
    delay,
    duration,
    easing,
    css: (t: number) => `
      opacity: ${t * 0.7};
      transform: scaleX(${0.8 + t * 0.2});
    `
  };
}
