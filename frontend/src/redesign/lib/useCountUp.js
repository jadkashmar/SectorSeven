import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/redesign/lib/motion';

// Counts a number up from 0 to `value` once, the first time `trigger` turns
// true (meant to be paired with a scroll-reveal trigger) — a small
// broadcast-timing-style flourish for point totals. Renders the final value
// immediately under reduced motion.
export function useCountUp(value, trigger, duration = 700) {
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0);
  const started = useRef(false);

  useEffect(() => {
    if (!trigger || started.current || prefersReducedMotion()) return;
    started.current = true;

    const start = performance.now();
    const from = 0;
    let rafId;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [trigger, value, duration]);

  return display;
}
