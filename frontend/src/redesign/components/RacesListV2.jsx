import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { API_URL } from '@/lib/config';
import 'flag-icons/css/flag-icons.min.css';
import { resolveFlagCode } from '@/redesign/lib/flags';
import { useRevealV2 } from '@/redesign/lib/useRevealV2';
import Skeleton from '@/redesign/components/Skeleton';

const chipClass = {
  Completed: 'rd-chip-done',
  Live: 'rd-chip-live',
  Upcoming: 'rd-chip-upcoming',
  TBD: 'rd-chip-done',
};

const accentClass = {
  Completed: 'bg-[var(--rd-line-strong)]',
  Live: 'bg-primary',
  Upcoming: 'bg-yellow-500',
  TBD: 'bg-[var(--rd-line-strong)]',
};

function RacesListV2() {
  const [meetings, setMeetings] = useState([]);
  const revealRef = useRevealV2({ childSelector: '.race-card', staggerMs: 25 });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="rd-label mb-3">Schedule</div>
      <h1 className="rd-display text-4xl sm:text-6xl mb-2">2026 Season</h1>
      <p className="text-[var(--rd-text-dim)] mb-10 sm:mb-14">Every round of the championship</p>

      {meetings.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
      <div ref={revealRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {meetings.map((meeting, i) => {
          const status = getStatus(meeting.sessions);
          const raceSession = meeting.sessions.find((s) => s.session_type === 'Race');
          const flagCode = resolveFlagCode(meeting);

          return (
            <div key={meeting.meetingKey} className="race-card group">
              <Link
                to={`/races/${meeting.meetingKey}`}
                className="relative overflow-hidden border border-[var(--rd-line)] bg-[var(--rd-surface)] p-5 sm:p-6 h-44 flex flex-col justify-between transition-all duration-200 hover:border-[var(--rd-line-strong)] hover:-translate-y-0.5 hover:bg-[var(--rd-surface-raised)]"
              >
                <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentClass[status]}`} />

                {flagCode && (
                  <span
                    className={`fi fi-${flagCode} absolute -right-3 top-1/2 -translate-y-1/2 text-[6.5rem] opacity-[0.07] scale-150 pointer-events-none transition-transform duration-300 group-hover:scale-[1.65]`}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <span className={`rd-chip ${chipClass[status]} w-fit`}>{status}</span>
                  <span className="rd-mono text-xs text-[var(--rd-text-faint)]">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2.5">
                    {flagCode && <span className={`fi fi-${flagCode} text-lg rounded-[1px] shrink-0`} />}
                    <div className="text-[var(--rd-text)] text-xl font-semibold leading-tight truncate">{meeting.location}</div>
                    <ArrowUpRight
                      size={15}
                      className="text-[var(--rd-text-faint)] shrink-0 transition-all duration-200 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                    />
                  </div>
                  <div className="rd-mono text-xs text-[var(--rd-text-dim)] mt-1">{meeting.circuit}</div>
                  {raceSession && (
                    <div className="rd-mono text-xs text-[var(--rd-text-faint)] mt-3">
                      {new Date(raceSession.date_start).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

export default RacesListV2;
