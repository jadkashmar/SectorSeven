import { animate, stagger } from 'animejs';

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Fire-and-forget wrapper around animejs `animate` that no-ops (and jumps
// straight to the end state) when the user asks for reduced motion.
export function safeAnimate(targets, params) {
  if (!targets || (Array.isArray(targets) && targets.length === 0)) return null;
  if (prefersReducedMotion()) {
    const endState = {};
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'duration' || key === 'delay' || key === 'easing' || key === 'loop') return;
      endState[key] = Array.isArray(value) ? value[value.length - 1] : value;
    });
    return animate(targets, { ...endState, duration: 1, delay: 0 });
  }
  return animate(targets, params);
}

// Kept deliberately subtle: a small upward drift, short duration, no
// bounce/scale theatrics — this system prefers a quick, confident cut over
// a flourish.
export function revealStagger(targets, opts = {}) {
  return safeAnimate(targets, {
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 380,
    delay: stagger(opts.staggerMs ?? 35),
    easing: 'easeOutQuad',
    ...opts,
  });
}

export { stagger };
