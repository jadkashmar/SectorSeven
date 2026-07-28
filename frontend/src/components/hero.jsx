import { useRef, useEffect } from 'react';
import { animate } from 'animejs';
import Flag from '@/components/Flag';

function Hero() {
  const containerRef = useRef(null);
  const tiltRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const tilt = tiltRef.current;

    function handleMouseMove(e) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const offsetX = (e.clientX - centerX) / (rect.width / 2);
      const offsetY = (e.clientY - centerY) / (rect.height / 2);

      animate(tilt, {
        rotateY: offsetX * 8,
        rotateX: offsetY * -8,
        scale: 1.03,
        duration: 400,
        easing: 'easeOutQuad'
      });
    }

    function handleMouseLeave() {
      animate(tilt, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 600,
        easing: 'easeOutElastic(1, .6)'
      });
    }

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[500px] rounded-xl overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <div ref={tiltRef} className="absolute inset-0">
        <Flag />
        {/* Dark overlay so the flag doesn't fight with the text */}
        <div className="absolute inset-0 bg-slate-950/50" />
      </div>

      <div className="absolute inset-0 flex flex-col items-start justify-end p-10">
        <div className="bg-slate-950/80 backdrop-blur-sm rounded-lg px-6 py-5 border border-slate-800">
          <h1 className="text-5xl font-bold text-white tracking-tight">SECTOR SEVEN</h1>
          <p className="text-slate-300 mt-2 text-lg">Your home for every session, every race.</p>
        </div>
      </div>
    </div>
  );
}

export default Hero;