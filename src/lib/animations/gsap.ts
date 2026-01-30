/**
 * GSAP Setup with Modular Imports
 *
 * Following DevOps bundle optimization guidelines:
 * - Import only what we need
 * - Tree-shakeable imports
 * - Register plugins once
 */

import { gsap } from 'gsap';

// Only import plugins we actually use
// ScrollTrigger imported separately if needed for scroll-based animations

/**
 * Initialize GSAP with optimized defaults for swarm animations
 */
export function initGSAP(): void {
  // Set global defaults for consistent animation feel
  gsap.defaults({
    ease: 'power2.out',
    duration: 0.4
  });

  // Enable will-change optimization
  gsap.config({
    autoSleep: 60,
    force3D: true,
    nullTargetWarn: false
  });
}

/**
 * Timeline factory for agent spawn sequences
 */
export function createSpawnTimeline(
  element: Element,
  options: { delay?: number; onComplete?: () => void } = {}
): gsap.core.Timeline {
  const { delay = 0, onComplete } = options;

  return gsap.timeline({ delay, onComplete })
    .fromTo(element,
      { scale: 0, opacity: 0, y: -20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
    )
    .to(element,
      { boxShadow: '0 0 20px 5px rgba(255,255,255,0.3)', duration: 0.2 },
      '-=0.1'
    )
    .to(element,
      { boxShadow: '0 0 0 0 rgba(255,255,255,0)', duration: 0.3 }
    );
}

/**
 * Timeline factory for agent despawn sequences
 */
export function createDespawnTimeline(
  element: Element,
  options: { delay?: number; onComplete?: () => void } = {}
): gsap.core.Timeline {
  const { delay = 0, onComplete } = options;

  return gsap.timeline({ delay, onComplete })
    .to(element,
      { scale: 0.8, opacity: 0, duration: 0.2, ease: 'power2.in' }
    );
}

/**
 * Timeline factory for message received pulse
 */
export function createMessagePulse(
  element: Element,
  color: string = '#3B82F6'
): gsap.core.Timeline {
  return gsap.timeline()
    .to(element,
      {
        boxShadow: `0 0 30px 15px ${color}`,
        scale: 1.1,
        duration: 0.15,
        ease: 'power2.out'
      }
    )
    .to(element,
      {
        boxShadow: `0 0 0 0 ${color}`,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      }
    );
}

/**
 * Timeline factory for connection line animation
 */
export function createConnectionAnimation(
  pathElement: SVGPathElement,
  options: { duration?: number; reverse?: boolean } = {}
): gsap.core.Timeline {
  const { duration = 0.8, reverse = false } = options;
  const length = pathElement.getTotalLength();

  // Set initial state
  gsap.set(pathElement, {
    strokeDasharray: length,
    strokeDashoffset: reverse ? 0 : length
  });

  return gsap.timeline()
    .to(pathElement, {
      strokeDashoffset: reverse ? length : 0,
      duration,
      ease: 'power2.inOut'
    });
}

/**
 * Staggered spawn for multiple agents
 */
export function staggerSpawn(
  elements: Element[],
  options: { stagger?: number; onComplete?: () => void } = {}
): gsap.core.Timeline {
  const { stagger = 0.05, onComplete } = options;

  return gsap.timeline({ onComplete })
    .fromTo(elements,
      { scale: 0, opacity: 0, y: -15 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(1.4)',
        stagger
      }
    );
}

/**
 * Activity pulse loop (for active agents)
 */
export function createActivityPulse(
  element: Element,
  color: string = '#22C55E'
): gsap.core.Timeline {
  return gsap.timeline({ repeat: -1, repeatDelay: 2 })
    .to(element, {
      boxShadow: `0 0 15px 5px ${color}40`,
      duration: 0.5,
      ease: 'power2.out'
    })
    .to(element, {
      boxShadow: `0 0 0 0 ${color}00`,
      duration: 0.8,
      ease: 'power2.out'
    });
}

/**
 * Kill all animations on an element (cleanup)
 */
export function killAnimations(element: Element): void {
  gsap.killTweensOf(element);
}

/**
 * Pause/resume all animations (for tab visibility)
 */
export function pauseAllAnimations(): void {
  gsap.globalTimeline.pause();
}

export function resumeAllAnimations(): void {
  gsap.globalTimeline.resume();
}

// Re-export gsap for direct use when needed
export { gsap };
