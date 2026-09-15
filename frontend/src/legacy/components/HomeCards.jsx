import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';
import { Link } from 'react-router-dom';
import { Clock, Trophy } from 'lucide-react';

function HomeCards() {
  const [latestSession, setLatestSession] = useState(null);
  const [nextRace, setNextRace] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/sessions`)
      .then((res) => res.json())
      .then((sessions) => { if (sessions.length > 0) setLatestSession(sessions[0]); });

    fetch(`${API_URL}/api/openf1/sessions?year=2026`)
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        <Link to="/live" className="p-4 sm:p-6 hover:bg-muted/40 transition-colors group">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {liveStatus ? liveStatus.sessionType : 'Standby'}
          </div>
          <div className="text-muted-foreground text-sm mt-1">
            {liveStatus ? liveStatus.status : 'Checking session status...'}
          </div>
        </Link>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-3">
            <Trophy size={14} /> Latest Result
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">
            {latestSession ? latestSession.meeting_name : 'Loading...'}
          </div>
          <div className="text-muted-foreground text-sm mt-1">
            {latestSession ? latestSession.session_name : ''}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-3">
            <Clock size={14} /> Next Race
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">
            {nextRace ? nextRace.location : 'Loading...'}
          </div>
          <div className="text-muted-foreground text-sm mt-1">
            {nextRace ? new Date(nextRace.date_start).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeCards;