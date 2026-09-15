import { useState, useEffect, useRef } from 'react';
import { API_URL } from '@/lib/config';
import { animate } from 'animejs';
import TrackOutline from '@/components/TrackOutline';

function TrackMap() {
  const [positions, setPositions] = useState([]);
  const [circuitName, setCircuitName] = useState('zandvoort');
  const [drivers, setDrivers] = useState({});
  const [calibration, setCalibration] = useState({ rotation: 0, flipX: false, flipY: false });
  const dotRefs = useRef({});

  useEffect(() => {
    const source = new EventSource(`${API_URL}/api/live`);

    source.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      if (type === 'drivers') {
        const map = {};
        payload.forEach((d) => { map[d.number] = d; });
        setDrivers(map);
      }

      if (type === 'sessionInfo') {
        console.log('sessionInfo circuit:', payload.circuit);
        setCircuitName(payload.circuit);
      }

      if (type === 'position') {
        setPositions(payload);
      }
    };

    return () => source.close();
  }, []);

  function transformPoint(x, y) {
    const rad = (calibration.rotation * Math.PI) / 180;
    let px = x, py = y;
    if (calibration.flipX) px = -px;
    if (calibration.flipY) py = -py;
    const rx = px * Math.cos(rad) - py * Math.sin(rad);
    const ry = px * Math.sin(rad) + py * Math.cos(rad);
    return { x: rx, y: ry };
  }

  const transformed = positions.map((p) => ({ ...p, ...transformPoint(p.x, p.y) }));

  const xs = transformed.map((p) => p.x).filter((v) => v != null);
  const ys = transformed.map((p) => p.y).filter((v) => v != null);
  const minX = Math.min(...xs, 0), maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0), maxY = Math.max(...ys, 1);

  function scaleX(x) {
    return 40 + ((x - minX) / (maxX - minX || 1)) * 720;
  }
  function scaleY(y) {
    return 40 + ((y - minY) / (maxY - minY || 1)) * 420;
  }

  useEffect(() => {
    transformed.forEach((pos) => {
      const el = dotRefs.current[pos.number];
      if (!el) return;
      animate(el, {
        cx: scaleX(pos.x),
        cy: scaleY(pos.y),
        duration: 400,
        easing: 'linear'
      });
    });
  }, [positions, calibration]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-foreground font-bold text-lg mb-4">Track Map</h2>

      <div className="relative min-h-[500px]">
        <TrackOutline circuitShortName={circuitName} />

        {positions.length === 0 ? (
          <p className="text-muted-foreground text-sm p-4">Waiting for live position data...</p>
        ) : (
          <svg viewBox="0 0 800 500" className="w-full h-auto bg-background rounded-lg relative z-10">
            {transformed.map((pos) => {
              const driver = drivers[pos.number];
              return (
                <circle
                  key={pos.number}
                  ref={(el) => (dotRefs.current[pos.number] = el)}
                  cx={scaleX(pos.x)}
                  cy={scaleY(pos.y)}
                  r={8}
                  fill={driver?.color || '#888'}
                  stroke="var(--color-background)"
                  strokeWidth={2}
                />
              );
            })}
          </svg>
        )}
      </div>

      <div className="flex gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
        <label className="flex items-center gap-1">
          Rotation:
          <input
            type="range" min="0" max="360" value={calibration.rotation}
            onChange={(e) => setCalibration((c) => ({ ...c, rotation: +e.target.value }))}
          />
          {calibration.rotation}°
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox" checked={calibration.flipX}
            onChange={(e) => setCalibration((c) => ({ ...c, flipX: e.target.checked }))}
          /> Flip X
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox" checked={calibration.flipY}
            onChange={(e) => setCalibration((c) => ({ ...c, flipY: e.target.checked }))}
          /> Flip Y
        </label>
      </div>
    </div>
  );
}

export default TrackMap;