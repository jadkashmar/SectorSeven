import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '@/lib/config';
import 'flag-icons/css/flag-icons.min.css';
import { getFlagCode } from '@/lib/countryCodes';

const statusStyles = {
  Completed: 'border-border',
  Live: 'border-primary shadow-[0_0_20px_-4px_var(--color-primary)]',
  Upcoming: 'border-yellow-500/40',
  TBD: 'border-border',
};

const statusText = {
  Completed: 'text-muted-foreground',
  Live: 'text-primary',
  Upcoming: 'text-yellow-500',
  TBD: 'text-muted-foreground',
};

function RacesList() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/openf1/sessions?year=2026`)
      .then((res) => res.json())
      .then((sessions) => {
        if (!Array.isArray(sessions)) return;
        const grouped = {};
        sessions.forEach((s) => {
          if (!grouped[s.meeting_key]) {
            grouped[s.meeting_key] = { meetingKey: s.meeting_key, location: s.location, country: s.country_name, countryCode: s.country_code, circuit: s.circuit_short_name, sessions: [] };
          }
          grouped[s.meeting_key].sessions.push(s);
        });
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
    const r = sessions.find((s) => s.session_type === 'Race');
    if (!r) return 'TBD';
    const end = new Date(r.date_end), start = new Date(r.date_start);
    if (now > end) return 'Completed';
    if (now >= start && now <= end) return 'Live';
    return 'Upcoming';
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 bg-background min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-1">2026 Season</h1>
      <p className="text-muted-foreground mb-6 sm:mb-10">Every round of the championship</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((meeting, i) => {
          const status = getStatus(meeting.sessions);
          const raceSession = meeting.sessions.find((s) => s.session_type === 'Race');

          return (
            <Link
              key={meeting.meetingKey}
              to={`/races/${meeting.meetingKey}`}
              className={`relative overflow-hidden rounded-xl border bg-card p-4 sm:p-6 h-36 sm:h-40 flex flex-col justify-between transition-all hover:-translate-y-1 hover:border-primary ${statusStyles[status]}`}
            >
              <span className="absolute -right-3 -bottom-6 text-6xl sm:text-8xl font-black text-foreground/5 select-none leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className={`text-xs font-semibold tracking-widest uppercase ${statusText[status]}`}>
                {status}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  {getFlagCode(meeting.countryCode) && (
                    <span className={`fi fi-${getFlagCode(meeting.countryCode)} rounded-sm text-lg`} />
                  )}
                  <div className="text-foreground text-lg sm:text-xl font-bold leading-tight">{meeting.location}</div>
                </div>
                <div className="text-muted-foreground text-sm mt-1">{meeting.circuit}</div>
                {raceSession && (
                  <div className="text-muted-foreground text-xs mt-3">
                    {new Date(raceSession.date_start).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RacesList;