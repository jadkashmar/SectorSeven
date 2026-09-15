import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '@/lib/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/legacy/components/ui/card';
import { Badge } from '@/legacy/components/ui/badge';
import { getTeamLogo } from '@/lib/teamLogos';
import { animate } from 'animejs';

function SessionResults() {
  const { meetingKey, sessionKey } = useParams();
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('loading');

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
    return <div className="p-4 sm:p-8 text-foreground bg-background min-h-screen">Loading...</div>;
  }

  if (status === 'not-found') {
    return (
      <div className="p-4 sm:p-8 min-h-screen bg-background">
        <Card className="bg-card border-border p-6 text-center">
          <p className="text-muted-foreground">
            No results captured for this session yet. This session may be upcoming, or wasn't tracked while it was live.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-background">
      <h1 className="text-2xl font-bold text-foreground mb-4">Session Results</h1>
      <Card className="bg-card border-border overflow-x-auto">
        <Table className="text-foreground">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">POS</TableHead>
              <TableHead className="text-muted-foreground">DRIVER</TableHead>
              <TableHead className="text-muted-foreground">TEAM</TableHead>
              <TableHead className="text-muted-foreground">GAP</TableHead>
              <TableHead className="text-muted-foreground hidden sm:table-cell">BEST LAP</TableHead>
              <TableHead className="text-muted-foreground">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((row) => (
              <TableRow key={row.driver_number} className="border-border hover:bg-muted/50">
                <TableCell>{row.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTeamLogo(row.team_name) && (
                      <img src={getTeamLogo(row.team_name)} alt={row.team_name} className="w-5 h-5 object-contain" />
                    )}
                    <span
                      style={{ color: `#${row.team_colour}` }}
                      className="font-semibold cursor-pointer inline-block"
                      onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.08, duration: 200 })}
                      onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 200 })}
                    >
                      {row.full_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{row.team_name}</TableCell>
                <TableCell>{row.gap_to_leader}</TableCell>
                <TableCell className="hidden sm:table-cell">{row.best_lap_time}</TableCell>
                <TableCell>
                  {row.retired === 1 && <Badge variant="destructive">DNF</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default SessionResults;