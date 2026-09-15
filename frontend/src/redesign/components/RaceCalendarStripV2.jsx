import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '@/lib/config';
import 'flag-icons/css/flag-icons.min.css';
import { resolveFlagCode } from '@/redesign/lib/flags';
import { useRevealV2 } from '@/redesign/lib/useRevealV2';
import Skeleton from '@/redesign/components/Skeleton';

const CARDS_PER_PAGE = 6;

const chipClass = {
  Completed: 'rd-chip-done',
  Live: 'rd-chip-live',
  Upcoming: 'rd-chip-upcoming',
  TBD: 'rd-chip-done',
};

function RaceCalendarStripV2() {
  const [meetings, setMeetings] = useState([]);
  const [page, setPage] = useState(0);
  const revealRef = useRevealV2({ childSelector: '.cal-row', staggerMs: 25 });

  useEffect(() => {
    fetch(`${API_URL}/api/openf1/sessions?year=2026`)
      .then((res) => res.json())
      .then((sessions) => {
        if (!Array.isArray(sessions)) return;
        const grouped = {};
        sessions.forEach((s) => {
          if (!grouped[s.meeting_key]) {
            grouped[s.meeting_key] = { meetingKey: s.meeting_key, location: s.location, country: s.country_name, countryCode: s.country_code, sessions: [] };
          }
          grouped[s.meeting_key].sessions.push(s);
        });
        const list = Object.values(grouped).sort((a, b) => {
          const aStart = Math.min(...a.sessions.map((s) => new Date(s.date_start)));
          const bStart = Math.min(...b.sessions.map((s) => new Date(s.date_start)));
          return aStart - bStart;
        });
        setMeetings(list);

        const now = new Date();
        const idx = list.findIndex((m) => {
          const r = m.sessions.find((s) => s.session_type === 'Race');
          return r && new Date(r.date_end) >= now;
        });
        if (idx !== -1) setPage(Math.floor(idx / CARDS_PER_PAGE));

        list.forEach((meeting) => {
          const raceSession = meeting.sessions.find((s) => s.session_type === 'Race');
          if (!raceSession) return;
          fetch(`${API_URL}/api/sessions/${raceSession.session_key}/results`)
            .then((res) => res.json())
            .then((results) => {
              const winner = results.find((r) => r.position === 1);
              if (winner) {
                setMeetings((cur) => cur.map((m) => m.meetingKey === meeting.meetingKey ? { ...m, winner: winner.full_name } : m));
              }
            })
            .catch(() => {});
        });
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

  const visible = meetings.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);
  const maxPage = Math.max(0, Math.ceil(meetings.length / CARDS_PER_PAGE) - 1);

  return (
    <div>
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[var(--rd-line)]">
        <h2 className="rd-display text-2xl sm:text-3xl">Race Calendar</h2>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-[var(--rd-text-dim)] hover:text-[var(--rd-text)] disabled:opacity-30 transition-colors"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="p-1.5 text-[var(--rd-text-dim)] hover:text-[var(--rd-text)] disabled:opacity-30 transition-colors"
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page === maxPage}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      ) : (
      <div ref={revealRef}>
        {visible.map((meeting, i) => {
          const status = getStatus(meeting.sessions);
          const raceSession = meeting.sessions.find((s) => s.session_type === 'Race');
          const index = page * CARDS_PER_PAGE + i + 1;
          const flagCode = resolveFlagCode(meeting);

          return (
            <Link
              key={meeting.meetingKey}
              to={`/races/${meeting.meetingKey}`}
              className="cal-row rd-row-hover flex items-center gap-3 sm:gap-6 py-3.5 border-b border-[var(--rd-line)]"
            >
              <span className="hidden sm:inline-block rd-mono text-xs text-[var(--rd-text-faint)] w-6 shrink-0">{String(index).padStart(2, '0')}</span>
              <span className={`rd-chip ${chipClass[status]} shrink-0 sm:w-[5.5rem] sm:justify-center`}>{status}</span>
              {flagCode && <span className={`fi fi-${flagCode} text-base shrink-0 rounded-[1px]`} />}
              <div className="flex-1 min-w-0">
                <div className="text-[var(--rd-text)] font-medium truncate">{meeting.location} Grand Prix</div>
                <div className="rd-mono text-xs text-[var(--rd-text-dim)] truncate">{meeting.country}</div>
              </div>
              {meeting.winner && (
                <div className="text-[var(--rd-text-dim)] text-sm hidden sm:block">{meeting.winner}</div>
              )}
              {raceSession && (
                <div className="rd-mono text-xs text-[var(--rd-text-dim)] w-14 sm:w-16 text-right shrink-0">
                  {new Date(raceSession.date_start).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}
                </div>
              )}
            </Link>
          );
        })}
      </div>
      )}

      <Link to="/races" className="rd-link inline-block mt-5 text-primary text-sm font-medium">
        View full schedule →
      </Link>
    </div>
  );
}

export default RaceCalendarStripV2;
