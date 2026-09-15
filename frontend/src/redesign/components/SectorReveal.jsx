import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/redesign/lib/motion';

// Section entrance modeled on the sector-split flash on a real F1 timing
// screen: a colored bar draws down the left edge before the content settles
// in, instead of a generic fade-up. Falls back to an instant reveal under
// reduced motion.
function SectorReveal({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      setVisible(true);
    }

    function checkPosition() {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) reveal();
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) reveal();
    }, { threshold: 0.1 });
    observer.observe(el);

    let rafId = null;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { rafId = null; checkPosition(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    checkPosition();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={ref} className="relative pl-6">
      <div
        className="absolute left-0 top-0 w-[3px] bg-primary transition-[height] duration-[600ms] ease-out"
        style={{ height: visible ? '100%' : '0%' }}
      />
      <div
        className="transition-[opacity,transform] duration-500 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transitionDelay: visible ? '100ms' : '0ms',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default SectorReveal;
