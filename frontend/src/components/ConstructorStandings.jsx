import { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { getTeamLogo } from '@/lib/teamLogos';

function ConstructorStandings() {
  const [standings, setStandings] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    fetch('https://api.jolpi.ca/ergast/f1/2026/constructorstandings/')
      .then((res) => res.json())
      .then((data) => {
        const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
        setStandings(list);
      });
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const rows = listRef.current.querySelectorAll('.standing-row');
    if (rows.length === 0) return;
    animate(rows, { opacity: [0, 1], translateX: [-12, 0], duration: 300, delay: stagger(40), easing: 'easeOutQuad' });
  }, [standings]);

  const leader = standings[0]?.points ? parseFloat(standings[0].points) : 1;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Constructor Standings</h2>
        <p className="text-muted-foreground text-sm mt-1">2026 Season</p>
      </div>

      <div ref={listRef} className="divide-y divide-border">
        {standings.map((team) => {
          const logoUrl = getTeamLogo(team.Constructor.name);
          const pct = leader ? (parseFloat(team.points) / leader) * 100 : 0;

          return (
            <div key={team.Constructor.constructorId} className="standing-row flex items-center gap-4 py-3">
              <span className="text-muted-foreground/50 text-sm font-mono w-6">{team.position}</span>
              {logoUrl && <img src={logoUrl} alt={team.Constructor.name} className="w-5 h-5 object-contain shrink-0" />}
              <div className="flex-1 min-w-0">
                <span
                  className="text-foreground font-semibold cursor-pointer inline-block"
                  onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.05, duration: 200 })}
                  onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 200 })}
                >
                  {team.Constructor.name}
                </span>
                <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-foreground text-sm font-mono w-12 text-right">{team.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConstructorStandings;