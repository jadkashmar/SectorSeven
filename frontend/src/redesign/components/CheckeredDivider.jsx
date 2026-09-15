import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { prefersReducedMotion } from '@/redesign/lib/motion';

const COLS = 24;

// A start/finish-line motif: a strip of checkered squares that snaps in
// left-to-right, like a flag being waved open, the first time it scrolls
// into view. Purely a section-break flourish between the hero and the rest
// of the home page.
function CheckeredDivider() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.querySelectorAll('.chk-sq').forEach((sq) => { sq.style.opacity = 1; });
      return;
    }

    let played = false;
    function play() {
      if (played) return;
      played = true;
      animate(el.querySelectorAll('.chk-sq'), {
        opacity: [0, 1],
        scale: [0.3, 1],
        duration: 350,
        delay: stagger(18),
        easing: 'easeOutQuad',
      });
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex h-3 border-y border-[var(--rd-line)]">
      {Array.from({ length: COLS }).map((_, i) => (
        <div
          key={i}
          className="chk-sq flex-1"
          style={{ background: i % 2 === 0 ? 'var(--rd-text)' : 'var(--rd-bg)', opacity: 0 }}
        />
      ))}
    </div>
  );
}

export default CheckeredDivider;
