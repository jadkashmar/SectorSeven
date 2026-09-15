import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/redesign/lib/motion';

// A fixed vertical rail, styled like a car's position readout on a mini
// track map, that fills as the page is scrolled — the F1-flavored
// replacement for the removed scroll-linked car. Desktop only; hidden
// under prefers-reduced-motion since it exists purely as scroll decoration.
function SectorProgressRail() {
  const fillRef = useRef(null);
  const markerRef = useRef(null);
  const pctRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let rafId = null;

    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;

      if (fillRef.current) fillRef.current.style.height = `${pct * 100}%`;
      if (markerRef.current) markerRef.current.style.top = `${pct * 100}%`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(pct * 100)}`;

      rafId = null;
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center pointer-events-none">
      <span className="rd-mono text-[0.6rem] text-primary mb-2" ref={pctRef}>0</span>
      <div className="relative w-px h-40 bg-[var(--rd-line-strong)]">
        <div ref={fillRef} className="absolute top-0 left-0 w-px bg-primary" style={{ height: '0%' }} />
        <div
          ref={markerRef}
          className="absolute left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-primary rotate-45"
          style={{ top: '0%' }}
        />
      </div>
      <span className="rd-mono text-[0.6rem] text-[var(--rd-text-faint)] mt-2">%</span>
    </div>
  );
}

export default SectorProgressRail;
