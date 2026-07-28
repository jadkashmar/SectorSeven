import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '@/lib/config';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live' },
  { to: '/races', label: 'Races' },
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
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-xl font-bold text-white tracking-tight">
          SECTOR SEVEN
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <Link
            to="/live"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium"
          >
            <span
              className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}
            />
            <span className={isLive ? 'text-red-400' : 'text-slate-500'}>
              {isLive ? `LIVE — ${sessionLabel}` : 'No live session'}
            </span>
          </Link>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden text-white p-2">
                <Menu size={22} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950 border-slate-800">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;