import { useState, useEffect } from 'react';
import { getTrackSvgUrl } from '@/lib/trackSvgs';

function TrackOutline({ circuitShortName }) {
  const [svgMarkup, setSvgMarkup] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const url = getTrackSvgUrl(circuitShortName);
    if (!url) {
      setSvgMarkup(null);
      return;
    }

    fetch(url)
      .then((res) => res.text())
      .then((raw) => {
        if (!cancelled) setSvgMarkup(raw);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup(null);
      });

    return () => {
      cancelled = true;
    };
  }, [circuitShortName]);

  if (!svgMarkup) return null;

  console.log('svgMarkup state:', svgMarkup ? `${svgMarkup.length} chars` : svgMarkup);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export default TrackOutline;