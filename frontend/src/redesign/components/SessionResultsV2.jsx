import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '@/lib/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeamLogo } from '@/lib/teamLogos';
import { useRevealV2 } from '@/redesign/lib/useRevealV2';
import Skeleton from '@/redesign/components/Skeleton';

// Deliberately keeps the boxed-table layout of the original SessionResults —
// only spacing, typography and color get refined here per the redesign brief.
function SessionResultsV2() {
  const { sessionKey } = useParams();
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('loading');
  const revealRef = useRevealV2({ childSelector: '.result-row', staggerMs: 15 });

  useEffect(() => {
    setStatus('loading');
    fetch(`${API_URL}/api/sessions/${sessionKey}/results`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setResults(data);
          setStatus('found');
        } else {
          setStatus('not-found');
        }
      })
      .catch(() => setStatus('not-found'));
  }, [sessionKey]);

  if (status === 'loading') {
    return (
      <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-9 w-56 mb-8" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen">
        <div className="border border-[var(--rd-line)] p-8 text-center">
          <p className="text-[var(--rd-text-dim)]">
            No results captured for this session yet. This session may be upcoming, or wasn't tracked while it was live.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-6">
        <div className="rd-label mb-2">Results</div>
        <h1 className="rd-display text-3xl sm:text-4xl">Session Results</h1>
      </div>
      <div className="border border-[var(--rd-line)] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--rd-line)] hover:bg-transparent">
              <TableHead className="rd-label !text-[var(--rd-text-dim)]">Pos</TableHead>
              <TableHead className="rd-label !text-[var(--rd-text-dim)]">Driver</TableHead>
              <TableHead className="rd-label !text-[var(--rd-text-dim)]">Team</TableHead>
              <TableHead className="rd-label !text-[var(--rd-text-dim)]">Gap</TableHead>
              <TableHead className="rd-label !text-[var(--rd-text-dim)] hidden sm:table-cell">Best Lap</TableHead>
              <TableHead className="rd-label !text-[var(--rd-text-dim)]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={revealRef}>
            {results.map((row) => (
              <TableRow key={row.driver_number} className="result-row rd-row-hover border-[var(--rd-line)]">
                <TableCell className={`rd-mono ${row.position === 1 ? 'text-primary font-semibold' : ''}`}>{row.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTeamLogo(row.team_name) && (
                      <img src={getTeamLogo(row.team_name)} alt={row.team_name} className="w-4 h-4 object-contain" loading="lazy" />
                    )}
                    <span className="font-medium text-[var(--rd-text)]">{row.full_name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-[var(--rd-text-dim)]">{row.team_name}</TableCell>
                <TableCell className="rd-mono text-sm">{row.gap_to_leader}</TableCell>
                <TableCell className="hidden sm:table-cell rd-mono text-sm">{row.best_lap_time}</TableCell>
                <TableCell>
                  {row.retired === 1 && <span className="rd-chip rd-chip-live">DNF</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SessionResultsV2;
