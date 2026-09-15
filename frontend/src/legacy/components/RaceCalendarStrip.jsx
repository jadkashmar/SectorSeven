import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/legacy/components/ui/button';
import { API_URL } from '@/lib/config';

const CARDS_PER_PAGE = 5;

const statusDot = {
  Completed: 'bg-emerald-500',
  Live: 'bg-primary animate-pulse',
  Upcoming: 'bg-yellow-500',
  TBD: 'bg-muted-foreground',
};

function RaceCalendarStrip() {
  const [meetings, setMeetings] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/openf1/sessions?year=2026`)
      .then((res) => res.json())
      .then((sessions) => {
        if (!Array.isArray(sessions)) return;
        const grouped = {};
        sessions.forEach((s) => {
          if (!grouped[s.meeting_key]) {
            grouped[s.meeting_key] = { meetingKey: s.meeting_key, location: s.location, country: s.country_name, sessions: [] };
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
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Race Calendar</h2>
          <p className="text-muted-foreground text-sm mt-1">2026 Formula 1 World Championship</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page === maxPage}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {visible.map((meeting, i) => {
          const status = getStatus(meeting.sessions);
          const raceSession = meeting.sessions.find((s) => s.session_type === 'Race');
          const index = page * CARDS_PER_PAGE + i + 1;

          return (
            <Link key={meeting.meetingKey} to={`/races/${meeting.meetingKey}`} className="flex items-center gap-6 py-4 group">
              <span className="text-muted-foreground/50 text-sm font-mono w-6">{String(index).padStart(2, '0')}</span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[status]}`} />
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-semibold group-hover:text-primary transition-colors truncate">
                  {meeting.location} Grand Prix
                </div>
                <div className="text-muted-foreground text-xs">{meeting.country}</div>
              </div>
              {meeting.winner && (
                <div className="text-muted-foreground text-sm hidden sm:block">{meeting.winner}</div>
              )}
              {raceSession && (
                <div className="text-muted-foreground text-sm w-16 text-right">
                  {new Date(raceSession.date_start).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <Link to="/races" className="inline-block mt-4 text-primary text-sm font-medium hover:text-primary/80">
        View full schedule →
      </Link>
    </div>
  );
}

export default RaceCalendarStrip;