// Flat skeleton block — used everywhere data is still loading, in place of
// static "Loading…" text. `rd-skeleton` (redesign.css) provides a single
// soft light sweep, static under prefers-reduced-motion.
function Skeleton({ className = '' }) {
  return <div className={`rd-skeleton rounded-[2px] ${className}`} />;
}

export default Skeleton;
