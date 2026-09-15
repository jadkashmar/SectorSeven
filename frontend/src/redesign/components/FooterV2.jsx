import { Link } from 'react-router-dom';

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live' },
  { to: '/races', label: 'Races' },
  { to: '/standings', label: 'Standings' },
];

function FooterV2() {
  return (
    <footer className="border-t border-[var(--rd-line)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="rd-display text-xl mb-2">
            Sector<span className="text-primary">7</span>
          </div>
          <p className="text-[var(--rd-text-dim)] text-sm max-w-xs leading-relaxed">
            Live timing, results and standings for the entire Formula 1 season — updated the moment it happens on track.
          </p>
        </div>

        <div>
          <div className="rd-label mb-4">Navigate</div>
          <div className="flex flex-col gap-2.5">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="rd-link text-[var(--rd-text-dim)] hover:text-[var(--rd-text)] text-sm w-fit transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="rd-label mb-4">Data Sources</div>
          <p className="text-[var(--rd-text-dim)] text-sm mb-2 leading-relaxed">Live timing via Formula 1's official live timing feed</p>
          <p className="text-[var(--rd-text-dim)] text-sm mb-4 leading-relaxed">Schedule and standings via OpenF1 and Jolpica-F1</p>
          <a
            href="https://github.com/jadkashmar"
            target="_blank"
            rel="noopener noreferrer"
            className="rd-link text-[var(--rd-text-dim)] hover:text-[var(--rd-text)] text-sm transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-[var(--rd-line)] px-4 sm:px-6 py-4 text-center rd-label !text-[var(--rd-text-faint)]">
        (c) {new Date().getFullYear()} Sector Seven — not affiliated with Formula 1, FIA, or Liberty Media — redesign preview
      </div>
    </footer>
  );
}

export default FooterV2;
