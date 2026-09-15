import { useState, useEffect, useLayoutEffect, useRef, useMemo, memo } from 'react';
import { API_URL } from '@/lib/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { animate } from 'animejs';
import { getTeamLogo } from '@/lib/teamLogos';
import { prefersReducedMotion } from '@/redesign/lib/motion';
import Skeleton from '@/redesign/components/Skeleton';

const tyreImages = {
  SOFT: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/F1_tire_Pirelli_PZero_Red.svg/1920px-F1_tire_Pirelli_PZero_Red.svg.png',
  MEDIUM: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/F1_tire_Pirelli_PZero_Yellow.svg/1920px-F1_tire_Pirelli_PZero_Yellow.svg.png',
  HARD: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/F1_tire_Pirelli_PZero_White.svg/1920px-F1_tire_Pirelli_PZero_White.svg.png',
  INTERMEDIATE: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/F1_tire_Pirelli_Cinturato_Green.svg/1920px-F1_tire_Pirelli_Cinturato_Green.svg.png',
  WET: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/F1_tire_Pirelli_Cinturato_Blue.svg/1920px-F1_tire_Pirelli_Cinturato_Blue.svg.png'
};

const columns = [
  'DRIVER', 'GRID', 'BEST LAP', 'LAST LAP', 'GAP', 'INTERVAL',
  'S1', 'S2', 'S3', 'TOP SPEED', 'TYRE', 'TYRE AGE', 'STOPS', 'STATUS'
];

const mobileHidden = ['GRID', 'BEST LAP', 'LAST LAP', 'INTERVAL', 'S1', 'S2', 'S3', 'TOP SPEED', 'TYRE AGE', 'STOPS'];

function getTla(fullName) {
  if (!fullName) return '';
  const lastName = fullName.split(' ').slice(1).join(' ');
  return lastName.slice(0, 3).toUpperCase();
}

// Memoized so a re-render triggered by an unrelated timing update doesn't
// re-render every row's DOM — only rows whose own data actually changed.
const StandingsRowV2 = memo(function StandingsRowV2({ row, driver, tyre, isLeader, rowRef }) {
  return (
    <TableRow ref={rowRef} className="border-[var(--rd-line)] rd-row-hover">
      <TableCell>
        <div className="flex items-center gap-2.5 px-2.5 py-1 rd-mono font-semibold w-28 bg-[var(--rd-surface)] border border-[var(--rd-line)]">
          <span className={`w-5 ${isLeader ? 'text-primary' : ''}`}>{row.position}</span>
          {getTeamLogo(driver?.team) && (
            <img src={getTeamLogo(driver?.team)} alt={driver?.team} className="w-4 h-4 object-contain" loading="lazy" />
          )}
          <span>{getTla(driver?.name)}</span>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-[var(--rd-text-dim)] rd-mono text-sm">{tyre?.gridPosition ?? '—'}</TableCell>
      <TableCell className={`hidden sm:table-cell rd-mono text-sm ${isLeader ? 'text-emerald-400 font-semibold' : ''}`}>
        {row.bestLapTime || '—'}
      </TableCell>
      <TableCell className="hidden sm:table-cell rd-mono text-sm">{row.lastLapTime || '—'}</TableCell>
      <TableCell className="rd-mono text-sm">{isLeader ? 'LEADER' : row.gapToLeader}</TableCell>
      <TableCell className={`hidden sm:table-cell rd-mono text-sm ${row.catching ? 'text-emerald-400' : ''}`}>
        {row.intervalAhead || '—'}
      </TableCell>
      <TableCell className="hidden sm:table-cell rd-mono text-sm">{row.sectors?.[0] || '—'}</TableCell>
      <TableCell className="hidden sm:table-cell rd-mono text-sm">{row.sectors?.[1] || '—'}</TableCell>
      <TableCell className="hidden sm:table-cell rd-mono text-sm">{row.sectors?.[2] || '—'}</TableCell>
      <TableCell className="hidden sm:table-cell rd-mono text-sm">{row.speeds?.speedTrap || '—'}</TableCell>
      <TableCell>
        {tyre?.currentCompound && (
          <img src={tyreImages[tyre.currentCompound]} alt={tyre.currentCompound} className="w-6 h-6" loading="lazy" />
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-[var(--rd-text-dim)] rd-mono text-sm">{tyre?.currentStintLaps ?? '—'}</TableCell>
      <TableCell className="hidden sm:table-cell text-[var(--rd-text-dim)] rd-mono text-sm">{row.pitStops}</TableCell>
      <TableCell>
        {row.retired && <span className="rd-chip rd-chip-live">DNF</span>}
        {row.inPit && !row.retired && <span className="rd-chip rd-chip-upcoming">PIT</span>}
      </TableCell>
    </TableRow>
  );
});

function StandingsV2() {
  const [drivers, setDrivers] = useState({});
  const [timingData, setTimingData] = useState([]);
  const [tyres, setTyres] = useState({});
  const [sessionTitle, setSessionTitle] = useState('Loading...');

  const rowRefs = useRef({});
  const prevLapTimes = useRef({});
  const prevRects = useRef({});

  useEffect(() => {
    const source = new EventSource(`${API_URL}/api/live`);

    source.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      if (type === 'drivers') {
        const driverMap = {};
        payload.forEach((driver) => { driverMap[driver.number] = driver; });
        setDrivers(driverMap);
      }
      if (type === 'sessionInfo') {
        setSessionTitle(`${payload.sessionType} — ${payload.status}`);
      }
      if (type === 'timingData') {
        if (!prefersReducedMotion()) {
          payload.forEach((row) => {
            const prev = prevLapTimes.current[row.number];
            if (prev && prev !== row.lastLapTime) {
              const el = rowRefs.current[row.number];
              if (el) {
                animate(el, {
                  backgroundColor: ['rgba(255, 255, 255, 0.08)', 'rgba(0,0,0,0)'],
                  duration: 700,
                  easing: 'easeOutQuad'
                });
              }
            }
            prevLapTimes.current[row.number] = row.lastLapTime;
          });
        }
        setTimingData(payload);
      }
      if (type === 'timingAppData') {
        const tyreMap = {};
        payload.forEach((entry) => { tyreMap[entry.number] = entry; });
        setTyres(tyreMap);
      }
    };

    return () => source.close();
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    timingData.forEach((row) => {
      const el = rowRefs.current[row.number];
      if (!el) return;

      const newTop = el.getBoundingClientRect().top;
      const oldTop = prevRects.current[row.number];

      if (oldTop !== undefined && oldTop !== newTop) {
        const delta = oldTop - newTop;
        el.style.transform = `translateY(${delta}px)`;
        animate(el, {
          translateY: 0,
          duration: 450,
          easing: 'easeOutQuad'
        });
      }

      prevRects.current[row.number] = newTop;
    });
  }, [timingData]);

  const rows = useMemo(() => timingData.map((row) => ({
    row,
    driver: drivers[row.number],
    tyre: tyres[row.number],
    isLeader: row.position === 1,
  })), [timingData, drivers, tyres]);

  // Stable ref-callback per driver number, rebuilt only when the set of
  // numbers changes (not on every timing tick) — built with useMemo rather
  // than reading rowRefCallbacks.current during render.
  const numbersKey = rows.map((r) => r.row.number).sort((a, b) => a - b).join(',');
  const rowRefCallbackMap = useMemo(() => {
    const map = {};
    rows.forEach(({ row }) => {
      map[row.number] = (el) => { rowRefs.current[row.number] = el; };
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numbersKey]);

  return (
    <div className="min-h-screen">
      <div className="bg-primary px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-2 border-b border-[var(--rd-line)]">
        <div className="flex items-center gap-2 rd-mono text-xs tracking-widest uppercase font-semibold text-white">
          <span className="w-1.5 h-1.5 bg-white" />
          Live Timing
        </div>
        <span className="rd-mono text-sm text-white">{sessionTitle}</span>
      </div>

      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        <div className="border border-[var(--rd-line)] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--rd-line)] hover:bg-transparent">
                {columns.map((label) => (
                  <TableHead
                    key={label}
                    className={`rd-label !text-[var(--rd-text-dim)] whitespace-nowrap ${mobileHidden.includes(label) ? 'hidden sm:table-cell' : ''}`}
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-[var(--rd-line)] hover:bg-transparent">
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="h-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                rows.map(({ row, driver, tyre, isLeader }) => (
                  <StandingsRowV2
                    key={row.number}
                    row={row}
                    driver={driver}
                    tyre={tyre}
                    isLeader={isLeader}
                    rowRef={rowRefCallbackMap[row.number]}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default StandingsV2;
