import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function RaceWeekend() {
  const { meetingKey } = useParams();
  const [sessions, setSessions] = useState([]);
  const [meetingInfo, setMeetingInfo] = useState(null);

  useEffect(() => {
    fetch(`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        setSessions(sorted);
        if (sorted.length > 0) {
          setMeetingInfo({
            location: sorted[0].location,
            country: sorted[0].country_name,
            circuit: sorted[0].circuit_short_name,
          });
        }
      });
  }, [meetingKey]);

  function getSessionStatus(session) {
    const now = new Date();
    const start = new Date(session.date_start);
    const end = new Date(session.date_end);
    if (now > end) return 'Completed';
    if (now >= start && now <= end) return 'Live';
    return 'Upcoming';
  }

  const statusColors = {
    Completed: 'bg-slate-700 text-slate-300',
    Live: 'bg-red-600 text-white',
    Upcoming: 'bg-blue-600 text-white',
  };

  return (
    <div className="p-8 min-h-screen bg-slate-950">
      {meetingInfo && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{meetingInfo.location}</h1>
          <p className="text-slate-400">{meetingInfo.circuit} — {meetingInfo.country}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => {
          const status = getSessionStatus(session);
          return (
            <Link key={session.session_key} to={`/races/${meetingKey}/${session.session_key}`}>
              <Card className="bg-slate-900 border-slate-800 hover:border-red-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      {session.session_type} — {session.session_name}
                    </CardTitle>
                    <Badge className={statusColors[status]}>{status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  {new Date(session.date_start).toLocaleString()}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RaceWeekend;