import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// Styled as a dropped broadcast feed rather than a generic "404" card —
// consistent with the timing-tower system's telemetry/diagnostic language.
function NotFoundV2() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
      <div className="rd-label mb-6 justify-center flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-primary" />
        No Signal — Sector Not Found
      </div>

      <div className="rd-display text-[6rem] sm:text-[9rem] leading-none">
        4<span className="text-primary">0</span>4
      </div>

      <p className="text-[var(--rd-text-dim)] mt-6 max-w-md mx-auto leading-relaxed">
        This page dropped off the timing feed. It may have been moved, or the
        session never existed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-sm hover:bg-primary/85 transition-colors"
        >
          Back to Home
          <ArrowUpRight size={15} />
        </Link>
        <Link
          to="/live"
          className="inline-flex items-center gap-2 border border-[var(--rd-line-strong)] text-[var(--rd-text)] font-semibold text-sm px-5 py-2.5 rounded-sm hover:border-[var(--rd-text-dim)] transition-colors"
        >
          Watch Live Timing
        </Link>
      </div>
    </div>
  );
}

export default NotFoundV2;
