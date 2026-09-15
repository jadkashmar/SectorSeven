import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(el, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500,
            easing: 'easeOutQuad'
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    el.style.opacity = 0;
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}