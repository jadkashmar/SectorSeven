import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function RacesList() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetch('https://api.openf1.org/v1/sessions?year=2026')
      .then((res) => res.json())
      .then((sessions) => {
        // Group sessions by meeting_key so each Grand Prix weekend is one entry
        const grouped = {};
        sessions.forEach((s) => {
          if (!grouped[s.meeting_key]) {
            grouped[s.meeting_key] = {
              meetingKey: s.meeting_key,
              location: s.location,
              country: s.country_name,
              circuit: s.circuit_short_name,
              sessions: [],
            };
          }
          grouped[s.meeting_key].sessions.push(s);
        });

        // Sort weekends by their earliest session date
        const list = Object.values(grouped).sort((a, b) => {
          const aStart = Math.min(...a.sessions.map((s) => new Date(s.date_start)));
          const bStart = Math.min(...b.sessions.map((s) => new Date(s.date_start)));
          return aStart - bStart;
        });

        setMeetings(list);
      });
  }, []);

  function getStatus(sessions) {
    const now = new Date();
    const raceSession = sessions.find((s) => s.session_type === 'Race');
    if (!raceSession) return 'TBD';
    const raceEnd = new Date(raceSession.date_end);
    const raceStart = new Date(raceSession.date_start);
    if (now > raceEnd) return 'Completed';
    if (now >= raceStart && now <= raceEnd) return 'Live';
    return 'Upcoming';
  }

  const statusColors = {
    Completed: 'bg-slate-700 text-slate-300',
    Live: 'bg-red-600 text-white',
    Upcoming: 'bg-blue-600 text-white',
    TBD: 'bg-slate-800 text-slate-500',
  };

  return (
    <div className="p-8 min-h-screen bg-slate-950">
      <h1 className="text-3xl font-bold text-white mb-6">2026 Season</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((meeting) => {
          const status = getStatus(meeting.sessions);
          return (
            <Link key={meeting.meetingKey} to={`/races/${meeting.meetingKey}`}>
              <Card className="bg-slate-900 border-slate-800 hover:border-red-500 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{meeting.location}</CardTitle>
                    <Badge className={statusColors[status]}>{status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  {meeting.circuit} — {meeting.country}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RacesList;