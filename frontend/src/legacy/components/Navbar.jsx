import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '@/lib/config';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live' },
  { to: '/races', label: 'Races' },
  { to: '/standings', label: 'Standings' },
];

function Navbar() {
  const [isLive, setIsLive] = useState(false);
  const [sessionLabel, setSessionLabel] = useState('');

  useEffect(() => {
    const source = new EventSource(`${API_URL}/api/live`);
    source.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type === 'sessionInfo') {
        setIsLive(payload.status !== 'Finalised');
        setSessionLabel(`${payload.sessionType}`);
        source.close();
      }
    };
    return () => source.close();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-primary backdrop-blur-sm border-b border-primary/50">
      <div className="flex flex-wrap items-center justify-between px-6 py-3 gap-4">
        <Link to="/" className="text-xl font-bold text-primary-foreground tracking-tight">
          SECTOR SEVEN
        </Link>

        <nav className="flex items-center gap-6 flex-wrap">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/live"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/20 border border-primary-foreground/20 text-xs font-medium"
        >
          <span
            className={`w-2 h-2 rounded-full ${isLive ? 'bg-primary-foreground animate-pulse' : 'bg-primary-foreground/40'}`}
          />
          <span className="text-primary-foreground/90">
            {isLive ? `LIVE — ${sessionLabel}` : 'No live session'}
          </span>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;