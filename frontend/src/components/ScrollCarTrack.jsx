import { useEffect, useRef } from 'react';

function ScrollCarTrack() {
  const trackRef = useRef(null);
  const carRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    function update() {
      const track = trackRef.current;
      const car = carRef.current;
      if (!track || !car) return;

      const rect = track.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const raw = (viewportH - rect.top) / (rect.height + viewportH);
      const progress = Math.min(1, Math.max(0, raw));

      const trackWidth = track.offsetWidth;
      const carWidth = car.offsetWidth;
      const x = progress * (trackWidth - carWidth);
      const bounce = Math.sin(progress * Math.PI * 14) * 2;

      car.style.transform = `translate(${x}px, ${bounce}px)`;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={trackRef} className="relative h-2 my-16">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-border" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div ref={carRef} className="absolute top-1/2 -translate-y-1/2 w-50 -mt-4">
        <img
  src="https://i.ibb.co/PvjQF5L2/clipsnap-edit-7-31-2026.png"
  alt="F1 car"
  className="w-full drop-shadow-[0_0_14px_var(--color-primary)]"
/>
      </div>
    </div>
  );
}

export default ScrollCarTrack;