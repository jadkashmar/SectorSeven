import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '@/lib/config';

function SessionRow({ session, meetingKey }) {
  const now = new Date();
  const start = new Date(session.date_start), end = new Date(session.date_end);
  const status = now > end ? 'Completed' : (now >= start && now <= end ? 'Live' : 'Upcoming');

  return (
    <Link
      to={`/races/${meetingKey}/${session.session_key}`}
      className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 hover:border-primary transition-colors group"
    >
      <div>
        <div className="text-foreground font-semibold group-hover:text-primary transition-colors">
          {session.session_name}
        </div>
        <div className="text-muted-foreground text-sm mt-0.5">
          {new Date(session.date_start).toLocaleString(undefined, { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <span className={`text-xs font-semibold tracking-widest uppercase ${status === 'Live' ? 'text-primary' : status === 'Completed' ? 'text-muted-foreground' : 'text-yellow-500'}`}>
        {status}
      </span>
    </Link>
  );
}

function RaceWeekend() {
  const { meetingKey } = useParams();
  const [sessions, setSessions] = useState([]);
  const [meetingInfo, setMeetingInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/openf1/sessions/${meetingKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const sorted = data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        setSessions(sorted);
        if (sorted.length > 0) {
          setMeetingInfo({ location: sorted[0].location, country: sorted[0].country_name, circuit: sorted[0].circuit_short_name });
        }
      });
  }, [meetingKey]);

  const practice = sessions.filter((s) => s.session_type === 'Practice');
  const qualiOrSprint = sessions.filter((s) => s.session_type === 'Qualifying' || s.session_type === 'Sprint' || s.session_name?.includes('Sprint'));
  const race = sessions.filter((s) => s.session_type === 'Race');

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 bg-background min-h-screen">
      {meetingInfo && (
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">{meetingInfo.location} Grand Prix</h1>
          <p className="text-muted-foreground mt-1">{meetingInfo.circuit} — {meetingInfo.country}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">Practice</h2>
          <div className="flex flex-col gap-3">
            {practice.map((s) => <SessionRow key={s.session_key} session={s} meetingKey={meetingKey} />)}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            {qualiOrSprint.some((s) => s.session_name?.includes('Sprint')) ? 'Sprint' : 'Qualifying'}
          </h2>
          <div className="flex flex-col gap-3">
            {qualiOrSprint.map((s) => <SessionRow key={s.session_key} session={s} meetingKey={meetingKey} />)}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">Race</h2>
          <div className="flex flex-col gap-3">
            {race.map((s) => <SessionRow key={s.session_key} session={s} meetingKey={meetingKey} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaceWeekend;