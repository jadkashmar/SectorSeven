import { useEffect, useRef } from 'react';
import { safeAnimate, prefersReducedMotion, stagger } from '@/redesign/lib/motion';

// Scroll-triggered reveal for a single element, or for a group of children
// matched by `childSelector` (staggered). Skips the animation entirely under
// prefers-reduced-motion, just leaving content visible.
//
// Uses IntersectionObserver as the primary trigger, but backs it with a
// throttled scroll/resize fallback that checks getBoundingClientRect()
// directly. A fast/instant scroll (fling, "scroll to bottom", a large wheel
// jump) can move an element straight past the viewport between the observer's
// sampled frames, so isIntersecting never flips true — the fallback catches
// that by checking actual position rather than relying only on a threshold
// crossing being observed.
export function useRevealV2({ childSelector, staggerMs = 35, threshold = 0.1 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = 1;
      return;
    }

    const targets = childSelector ? el.querySelectorAll(childSelector) : el;
    const hasTargets = childSelector ? targets.length > 0 : true;

    if (!hasTargets) {
      el.style.opacity = 1;
      return;
    }

    el.style.opacity = childSelector ? 1 : 0;
    if (childSelector) {
      targets.forEach((t) => { t.style.opacity = 0; });
    }

    let revealed = false;
    let rafId = null;

    function reveal() {
      if (revealed) return;
      revealed = true;
      safeAnimate(targets, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 380,
        delay: childSelector ? stagger(staggerMs) : 0,
        easing: 'easeOutQuad',
      });
      cleanup();
    }

    function checkPosition() {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom !== rect.top) {
        reveal();
      }
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        checkPosition();
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { threshold }
    );
    observer.observe(el);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    function cleanup() {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    }

    checkPosition();

    return cleanup;
  }, [childSelector, staggerMs, threshold]);

  return ref;
}
