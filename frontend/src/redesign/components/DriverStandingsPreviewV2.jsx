import { useState, useEffect, useRef } from 'react';
import { useRevealV2 } from '@/redesign/lib/useRevealV2';
import { useCountUp } from '@/redesign/lib/useCountUp';
import { getTeamLogo } from '@/lib/teamLogos';
import Skeleton from '@/redesign/components/Skeleton';

function DriverRow({ driver, pct, isTop3, trigger }) {
  const points = useCountUp(parseFloat(driver.points), trigger);
  const teamName = driver.Constructors[0]?.name;
  const logoUrl = getTeamLogo(teamName);

  return (
    <div className="standing-row rd-row-hover flex items-center gap-4 py-2.5 border-b border-[var(--rd-line)]">
      <span className={`rd-mono text-sm w-6 shrink-0 ${isTop3 ? 'text-primary font-semibold' : 'text-[var(--rd-text-faint)]'}`}>
        {driver.position}
      </span>
      {logoUrl && <img src={logoUrl} alt={teamName} className="w-4 h-4 object-contain shrink-0" loading="lazy" />}
      <div className="flex-1 min-w-0">
        <span className="text-[var(--rd-text)] font-medium text-sm">
          {driver.Driver.givenName} {driver.Driver.familyName}
        </span>
        <div className="h-[3px] bg-[var(--rd-surface-raised)] mt-1.5 overflow-hidden">
          <div className="h-full bg-primary transition-[width] duration-700 ease-out" style={{ width: trigger ? `${pct}%` : '0%' }} />
        </div>
      </div>
      <span className="rd-mono text-sm w-10 text-right shrink-0">{points}</span>
    </div>
  );
}

function DriverStandingsPreviewV2() {
  const [standings, setStandings] = useState([]);
  const [visible, setVisible] = useState(false);
  const revealRef = useRevealV2({ childSelector: '.standing-row', staggerMs: 25 });
  const listRef = useRef(null);

  useEffect(() => {
    fetch('https://api.jolpi.ca/ergast/f1/2026/driverstandings/')
      .then((res) => res.json())
      .then((data) => {
        const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        setStandings(list);
      });
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [standings.length]);

  const leader = standings[0]?.points ? parseFloat(standings[0].points) : 1;

  return (
    <div ref={listRef}>
      <h2 className="rd-display text-2xl sm:text-3xl mb-6 pb-4 border-b border-[var(--rd-line)]">Driver Standings</h2>

      {standings.length === 0 ? (
        <div className="space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      ) : (
        <div ref={revealRef}>
          {standings.map((driver, i) => {
            const pct = leader ? (parseFloat(driver.points) / leader) * 100 : 0;
            return (
              <DriverRow key={driver.Driver.driverId} driver={driver} pct={pct} isTop3={i < 3} trigger={visible} />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DriverStandingsPreviewV2;
