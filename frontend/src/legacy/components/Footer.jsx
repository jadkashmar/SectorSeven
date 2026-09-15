import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live' },
  { to: '/races', label: 'Races' },
  { to: '/standings', label: 'Standings' },
];

function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-foreground font-bold text-lg tracking-tight mb-2">SECTOR SEVEN</h3>
          <p className="text-muted-foreground text-sm">Your home for every session, every race.</p>
        </div>
        <div>
          <h4 className="text-foreground font-semibold text-sm mb-3">Navigate</h4>
          <div className="flex flex-col gap-2">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-foreground font-semibold text-sm mb-3">Data Sources</h4>
          <p className="text-muted-foreground text-sm mb-1">Live timing via Formula 1's official live timing feed</p>
          <p className="text-muted-foreground text-sm mb-3">Schedule and standings via OpenF1 and Jolpica-F1</p>
          <a href="https://github.com/jadkashmar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Link2 size={18} />
          </a>
        </div>
      </div>
      <div className="border-t border-border px-6 py-4 text-center text-muted-foreground text-xs">
        (c) {new Date().getFullYear()} Sector Seven. Not affiliated with Formula 1, FIA, or Liberty Media.
      </div>
    </footer>
  );
}

export default Footer;