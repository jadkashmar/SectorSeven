import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '@/lib/config';
import { useRevealV2 } from '@/redesign/lib/useRevealV2';
import Skeleton from '@/redesign/components/Skeleton';

const chipClass = { Completed: 'rd-chip-done', Live: 'rd-chip-live', Upcoming: 'rd-chip-upcoming' };

function SessionRow({ session, meetingKey }) {
  const now = new Date();
  const start = new Date(session.date_start), end = new Date(session.date_end);
  const status = now > end ? 'Completed' : (now >= start && now <= end ? 'Live' : 'Upcoming');

  return (
    <Link
      to={`/races/${meetingKey}/${session.session_key}`}
      className="rd-row-hover flex items-center justify-between border border-[var(--rd-line)] px-5 py-4"
    >
      <div>
        <div className="text-[var(--rd-text)] font-medium">{session.session_name}</div>
        <div className="rd-mono text-xs text-[var(--rd-text-dim)] mt-1">
          {new Date(session.date_start).toLocaleString(undefined, { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <span className={`rd-chip ${chipClass[status]}`}>{status}</span>
    </Link>
  );
}

function SessionColumn({ label, sessions, meetingKey }) {
  return (
    <div>
      <div className="rd-label mb-4 pb-3 border-b border-[var(--rd-line)]">{label}</div>
      <div className="flex flex-col gap-2.5">
        {sessions.map((s) => <SessionRow key={s.session_key} session={s} meetingKey={meetingKey} />)}
        {sessions.length === 0 && (
          <div className="rd-mono text-xs text-[var(--rd-text-faint)] border border-dashed border-[var(--rd-line)] px-5 py-4">
            Not scheduled
          </div>
        )}
      </div>
    </div>
  );
}

function RaceWeekendV2() {
  const { meetingKey } = useParams();
  const [sessions, setSessions] = useState([]);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const revealRef = useRevealV2({ childSelector: '.weekend-col', staggerMs: 60 });

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

  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Skeleton className="h-10 w-2/3 mb-3" />
        <Skeleton className="h-4 w-1/3 mb-14" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, col) => (
            <div key={col} className="space-y-2.5">
              <Skeleton className="h-3 w-20 mb-4" />
              {Array.from({ length: 2 }).map((_, row) => (
                <Skeleton key={row} className="h-16" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {meetingInfo && (
        <div className="mb-12 sm:mb-16 pb-8 border-b border-[var(--rd-line)]">
          <div className="rd-label mb-3">Race Weekend</div>
          <h1 className="rd-display text-4xl sm:text-5xl">{meetingInfo.location} Grand Prix</h1>
          <p className="rd-mono text-sm text-[var(--rd-text-dim)] mt-2">{meetingInfo.circuit} — {meetingInfo.country}</p>
        </div>
      )}

      <div ref={revealRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="weekend-col">
          <SessionColumn label="Practice" sessions={practice} meetingKey={meetingKey} />
        </div>
        <div className="weekend-col">
          <SessionColumn
            label={qualiOrSprint.some((s) => s.session_name?.includes('Sprint')) ? 'Sprint' : 'Qualifying'}
            sessions={qualiOrSprint}
            meetingKey={meetingKey}
          />
        </div>
        <div className="weekend-col">
          <SessionColumn label="Race" sessions={race} meetingKey={meetingKey} />
        </div>
      </div>
    </div>
  );
}

export default RaceWeekendV2;
