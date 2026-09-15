import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { API_URL } from '@/lib/config';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/live', label: 'Live' },
  { to: '/races', label: 'Races' },
  { to: '/standings', label: 'Standings' },
];

function NavbarV2() {
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
    <header className="sticky top-0 z-50 bg-[var(--rd-bg)] border-b border-[var(--rd-line)]">
      {/* Single row on md+: logo, nav, live chip, all with room to breathe.
          On mobile the nav drops to its own scrollable row below instead of
          competing with the logo and chip for the same 375px — cramming all
          three into one row was clipping the nav links against the logo. */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 h-14">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="rd-display text-xl text-[var(--rd-text)]">
            Sector<span className="text-primary">7</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rd-link rd-label !text-[0.75rem] !tracking-[0.1em] transition-colors ${
                  isActive ? 'text-[var(--rd-text)]' : 'text-[var(--rd-text-dim)] hover:text-[var(--rd-text)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/live"
          className={`rd-chip shrink-0 whitespace-nowrap ${isLive ? 'rd-chip-live' : 'border border-[var(--rd-line-strong)] text-[var(--rd-text-dim)]'}`}
        >
          {isLive ? `Live — ${sessionLabel}` : 'No Session'}
        </Link>
      </div>

      <nav className="flex md:hidden items-center gap-5 overflow-x-auto no-scrollbar px-4 sm:px-6 h-10 border-t border-[var(--rd-line)]">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rd-label !text-[0.7rem] whitespace-nowrap shrink-0 ${isActive ? 'text-[var(--rd-text)]' : 'text-[var(--rd-text-dim)]'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="rd-rule" />
    </header>
  );
}

export default NavbarV2;
