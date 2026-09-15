import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { prefersReducedMotion } from '@/redesign/lib/motion';

// A closed-loop circuit outline (stretched to fill the panel via
// preserveAspectRatio="none") — a longer main straight, a sweeping right-hander,
// an S-chicane, a hairpin, and a run of esses, so it reads as an actual
// circuit rather than a simple oval.
const TRACK_PATH =
  'M50,250 L330,250 ' +
  'C370,250 380,220 380,190 C380,160 355,150 325,150 ' +
  'C295,150 285,120 305,100 C325,80 365,78 372,45 ' +
  'C378,20 358,8 328,8 L130,8 ' +
  'C98,8 78,18 85,42 C92,66 130,58 148,78 ' +
  'C166,98 148,118 118,118 L75,118 ' +
  'C45,118 40,140 60,155 C80,170 78,190 55,198 ' +
  'C32,206 20,190 20,165 L20,205 ' +
  'C20,232 30,250 50,250 Z';

// Path-space (0-400 x 0-300) samples used to find the point on the track
// nearest the cursor, so the marker can "follow" the mouse while staying
// snapped to the line rather than floating freely inside the panel.
const TRACK_SAMPLE_COUNT = 400;

function useTickerItems() {
  const [items, setItems] = useState(['LOADING TIMING DATA…']);

  useEffect(() => {
    let cancelled = false;

    const source = new EventSource(`${API_URL}/api/live`);
    source.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type === 'sessionInfo' && !cancelled) {
        setItems((cur) => [`SESSION — ${payload.sessionType?.toUpperCase()} · ${payload.status?.toUpperCase()}`, ...cur.slice(1)]);
        source.close();
      }
    };

    fetch(`${API_URL}/api/openf1/sessions?year=2026`)
      .then((res) => res.json())
      .then((sessions) => {
        if (cancelled || !Array.isArray(sessions)) return;
        const now = new Date();
        const upcoming = sessions
          .filter((s) => new Date(s.date_start) > now && s.session_type === 'Race')
          .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))[0];
        if (upcoming) {
          const date = new Date(upcoming.date_start).toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
          setItems((cur) => [cur[0] ?? 'STANDBY', `NEXT RACE — ${upcoming.location?.toUpperCase()} · ${date}`]);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; source.close(); };
  }, []);

  return items;
}

// A circuit outline that stays put, plus a small red marker that acts as a
// custom cursor: instead of following the pointer freely, it snaps to
// whichever point on the track line is nearest the mouse — so moving the
// cursor around the panel drives the marker around the circuit.
function TrackReveal({ pathRef, dotRef }) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <path d={TRACK_PATH} fill="none" stroke="var(--rd-line-strong)" strokeWidth="3" />
      <path ref={pathRef} d={TRACK_PATH} fill="none" stroke="none" />
      <circle ref={dotRef} r="3" fill="var(--color-primary)" />
    </svg>
  );
}

// The interactive centerpiece: a bordered panel showing only the wordmark on
// a plain black field. Idle state is just that — logo, black background. On
// hover, the entire panel reveals a circuit outline, and the cursor itself
// is replaced by a small marker snapped to the nearest point on the track —
// no crosshair, no telemetry readout.
function LogoPanel() {
  const panelRef = useRef(null);
  const logoRef = useRef(null);
  const trackPathRef = useRef(null);
  const dotRef = useRef(null);
  const samplesRef = useRef(null);
  const currentPosRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef(null);
  const [active, setActive] = useState(false);
  const reduced = prefersReducedMotion();

  // Sample the (static) track path once so nearest-point lookups on every
  // mouse move are a cheap array scan instead of repeated SVG geometry
  // queries.
  useEffect(() => {
    const pathEl = trackPathRef.current;
    if (!pathEl) return;
    const total = pathEl.getTotalLength();
    const samples = [];
    for (let i = 0; i <= TRACK_SAMPLE_COUNT; i++) {
      const pt = pathEl.getPointAtLength((i / TRACK_SAMPLE_COUNT) * total);
      samples.push({ x: pt.x, y: pt.y });
    }
    samplesRef.current = samples;
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || reduced) return;

    function nearestOnTrack(px, py) {
      const samples = samplesRef.current;
      if (!samples) return null;
      let best = samples[0];
      let bestDist = Infinity;
      for (const s of samples) {
        const dx = s.x - px;
        const dy = s.y - py;
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          best = s;
        }
      }
      return best;
    }

    function tick() {
      const target = targetRef.current;
      if (target && dotRef.current) {
        const cur = currentPosRef.current ?? target;
        const next = { x: cur.x + (target.x - cur.x) * 0.35, y: cur.y + (target.y - cur.y) * 0.35 };
        currentPosRef.current = next;
        dotRef.current.setAttribute('cx', next.x);
        dotRef.current.setAttribute('cy', next.y);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    function apply(x, y, rect) {
      const relX = x / rect.width;
      const relY = y / rect.height;

      if (logoRef.current) {
        const tiltY = (relX - 0.5) * 10;
        const tiltX = (0.5 - relY) * 10;
        logoRef.current.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }

      targetRef.current = nearestOnTrack(relX * 400, relY * 300);
    }

    function onMove(e) {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      apply(x, y, rect);
    }

    function onEnter() {
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    }
    function onLeave() {
      setActive(false);
      if (logoRef.current) logoRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      currentPosRef.current = null;
      targetRef.current = null;
    }

    panel.addEventListener('mousemove', onMove);
    panel.addEventListener('mouseenter', onEnter);
    panel.addEventListener('mouseleave', onLeave);
    return () => {
      panel.removeEventListener('mousemove', onMove);
      panel.removeEventListener('mouseenter', onEnter);
      panel.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  return (
    <div
      ref={panelRef}
      className={`relative h-[300px] sm:h-[380px] md:h-[440px] border border-[var(--rd-line-strong)] overflow-hidden flex items-center justify-center select-none bg-[var(--rd-bg)] ${active && !reduced ? 'cursor-none' : ''}`}
      style={{ perspective: '900px' }}
    >
      {!reduced && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 overflow-hidden"
          style={{ opacity: active ? 1 : 0 }}
        >
          <TrackReveal pathRef={trackPathRef} dotRef={dotRef} />
        </div>
      )}

      <div ref={logoRef} className="relative z-10 transition-transform duration-150 ease-out" style={{ transformStyle: 'preserve-3d' }}>
        <div className="rd-display text-[4rem] sm:text-[6rem] md:text-[7.5rem] leading-none text-center">
          SECTOR<span className="text-primary">7</span>
        </div>
      </div>
    </div>
  );
}

// Subtle depth cue as the hero scrolls out of view — the panel drifts and
// fades slightly slower than the page, capped so it never moves far.
function useHeroParallax() {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = wrapRef.current;
    if (!el) return;
    let rafId = null;

    function update() {
      const rect = el.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      el.style.transform = `translateY(${progress * 40}px)`;
      el.style.opacity = `${1 - progress * 0.5}`;
      rafId = null;
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return wrapRef;
}

// Repeats the ticker phrase enough times to comfortably exceed any
// reasonable viewport width. A marquee only loops seamlessly if each of its
// two halves is at least as wide as the visible row — with just one or two
// short phrases, a half could end up narrower than the row, leaving a
// visible gap that read as the text sliding around off-center instead of
// scrolling smoothly edge-to-edge.
function buildTickerHalf(tickerText) {
  return Array.from({ length: 8 }, () => tickerText).join('   //   ');
}

function HeroV2() {
  const ticker = useTickerItems();
  const tickerText = ticker.join('   //   ');
  const tickerHalf = buildTickerHalf(tickerText);
  const parallaxRef = useHeroParallax();

  return (
    <div className="border-b border-[var(--rd-line)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 sm:pb-14">
        <div ref={parallaxRef} className="will-change-transform">
          <LogoPanel />
        </div>

        <p className="text-[var(--rd-text-dim)] mt-8 text-base sm:text-lg max-w-lg leading-relaxed">
          Live timing, results and standings for the entire Formula 1 season — rendered the moment it happens on track.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-7">
          <Link
            to="/live"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-sm hover:bg-primary/85 transition-colors"
          >
            Watch Live Timing
            <ArrowUpRight size={15} />
          </Link>
          <Link
            to="/races"
            className="inline-flex items-center gap-2 border border-[var(--rd-line-strong)] text-[var(--rd-text)] font-semibold text-sm px-5 py-2.5 rounded-sm hover:border-[var(--rd-text-dim)] transition-colors"
          >
            Race Calendar
          </Link>
        </div>
      </div>

      <div className="rd-ticker-wrap overflow-hidden border-t border-[var(--rd-line)] bg-[var(--rd-surface)]">
        {/* Keyed on the text itself: the ticker's content changes once,
            asynchronously, when live session data arrives. Without a key
            here the running CSS animation's translateX(-50%) is recomputed
            mid-cycle against the new (wider) track width and visibly jumps.
            Keying forces a clean remount so the loop always restarts flush,
            never mid-glitch. */}
        <div key={tickerText} className="rd-ticker-track flex items-center py-2.5">
          <span className="rd-mono text-xs text-[var(--rd-text-dim)] tracking-wide px-4 whitespace-nowrap">
            {tickerHalf}
          </span>
          <span className="rd-mono text-xs text-[var(--rd-text-dim)] tracking-wide px-4 whitespace-nowrap" aria-hidden="true">
            {tickerHalf}
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeroV2;
