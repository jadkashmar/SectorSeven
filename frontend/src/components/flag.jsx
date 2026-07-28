import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const STRIP_COUNT = 24; // more strips since it now spans a wider area

function Flag() {
  const stripsRef = useRef([]);

  useEffect(() => {
    animate(stripsRef.current, {
      skewY: [
        { to: -4, duration: 900 },
        { to: 4, duration: 900 },
        { to: 0, duration: 900 }
      ],
      scaleY: [
        { to: 0.97, duration: 900 },
        { to: 1.03, duration: 900 },
        { to: 1, duration: 900 }
      ],
      loop: true,
      delay: stagger(60),
      easing: 'easeInOutSine'
    });
  }, []);

  return (
    <div className="absolute inset-0 flex">
      {Array.from({ length: STRIP_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (stripsRef.current[i] = el)}
          className="h-full"
          style={{
            width: `${100 / STRIP_COUNT}%`,
            backgroundImage: 'repeating-linear-gradient(0deg, #000 0 40px, #fff 40px 80px)',
            backgroundSize: '100% 80px',
            backgroundPosition: `0 ${i % 2 === 0 ? '0' : '40px'}`,
          }}
        />
      ))}
    </div>
  );
}

export default Flag;