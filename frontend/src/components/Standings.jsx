import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { API_URL } from '@/lib/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { animate } from 'animejs';

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

function Standings() {
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
        payload.forEach((row) => {
          const prev = prevLapTimes.current[row.number];
          if (prev && prev !== row.lastLapTime) {
            const el = rowRefs.current[row.number];
            if (el) {
              animate(el, {
                backgroundColor: ['rgba(250, 204, 21, 0.35)', 'rgba(0,0,0,0)'],
                duration: 800,
                easing: 'easeOutQuad'
              });
            }
          }
          prevLapTimes.current[row.number] = row.lastLapTime;
        });
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
          duration: 500,
          easing: 'easeOutQuad'
        });
      }

      prevRects.current[row.number] = newTop;
    });
  }, [timingData]);

  function getTla(fullName) {
    if (!fullName) return '';
    const lastName = fullName.split(' ').slice(1).join(' ');
    return lastName.slice(0, 3).toUpperCase();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
          <span className="font-bold tracking-wide">LIVE TIMING</span>
        </div>
        <span className="font-semibold">{sessionTitle}</span>
      </div>

      <div className="p-6">
        <Card className="bg-slate-900 border-slate-800 overflow-x-auto">
          <Table className="text-white">
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                {columns.map((label) => (
                  <TableHead key={label} className="text-slate-400 whitespace-nowrap">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timingData.map((row) => {
                const driver = drivers[row.number];
                const tyre = tyres[row.number];
                const isLeader = row.position === 1;

                return (
                  <TableRow
                    key={row.number}
                    ref={(el) => { rowRefs.current[row.number] = el; }}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell>
                      <div
                        className="flex items-center gap-3 rounded-md px-3 py-1.5 font-semibold w-fit"
                        style={{ backgroundColor: driver?.color || '#333' }}
                      >
                        <span className="text-base w-5">{row.position}</span>
                        <span>{getTla(driver?.name)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tyre?.gridPosition ?? '—'}</TableCell>
                    <TableCell className={isLeader ? 'text-green-300 font-semibold' : ''}>
                      {row.bestLapTime || '—'}
                    </TableCell>
                    <TableCell>{row.lastLapTime || '—'}</TableCell>
                    <TableCell>{isLeader ? 'LEADER' : row.gapToLeader}</TableCell>
                    <TableCell className={row.catching ? 'text-green-400' : ''}>
                      {row.intervalAhead || '—'}
                    </TableCell>
                    <TableCell>{row.sectors?.[0] || '—'}</TableCell>
                    <TableCell>{row.sectors?.[1] || '—'}</TableCell>
                    <TableCell>{row.sectors?.[2] || '—'}</TableCell>
                    <TableCell>{row.speeds?.speedTrap || '—'}</TableCell>
                    <TableCell>
                      {tyre?.currentCompound && (
                        <img
                          src={tyreImages[tyre.currentCompound]}
                          alt={tyre.currentCompound}
                          className="w-7 h-7"
                        />
                      )}
                    </TableCell>
                    <TableCell>{tyre?.currentStintLaps ?? '—'}</TableCell>
                    <TableCell>{row.pitStops}</TableCell>
                    <TableCell>
                      {row.retired && <Badge variant="destructive">DNF</Badge>}
                      {row.inPit && !row.retired && <Badge className="bg-yellow-500 text-black">PIT</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

export default Standings;