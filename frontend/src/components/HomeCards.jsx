import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

function HomeCards() {
  const [latestSession, setLatestSession] = useState(null);
  const [nextRace, setNextRace] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    
    fetch(`${API_URL}/api/sessions`)
      .then((res) => res.json())
      .then((sessions) => {
        if (sessions.length > 0) setLatestSession(sessions[0]);
      });

  
    fetch('https://api.openf1.org/v1/sessions?year=2026')
      .then((res) => res.json())
      .then((sessions) => {
        const now = new Date();
       const upcoming = sessions
  .filter((s) => new Date(s.date_start) > now && s.session_type === 'Race')
  .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        if (upcoming.length > 0) setNextRace(upcoming[0]);
      });

  
    const source = new EventSource(`${API_URL}/api/live`);
    source.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type === 'sessionInfo') {
        setLiveStatus(payload);
        source.close(); 
      }
    };

    return () => source.close();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Link to="/live">
        <Card className="bg-slate-900 border-slate-800 hover:border-red-500 transition-colors h-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Session
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400">
            {liveStatus
              ? `${liveStatus.sessionType} — ${liveStatus.status}`
              : 'Checking session status...'}
          </CardContent>
        </Card>
      </Link>

      <Card className="bg-slate-900 border-slate-800 h-full">
        <CardHeader>
          <CardTitle className="text-white">Latest Results</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-400">
          {latestSession
            ? `${latestSession.meeting_name} — ${latestSession.session_name}`
            : 'Loading...'}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 h-full">
        <CardHeader>
          <CardTitle className="text-white">Next Race</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-400">
         {nextRace
  ? `${nextRace.location} — ${nextRace.session_name} — ${new Date(nextRace.date_start).toLocaleDateString()}`
  : 'Loading...'}
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeCards;