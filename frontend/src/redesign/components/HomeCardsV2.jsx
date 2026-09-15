import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';
import { Link } from 'react-router-dom';
import { useRevealV2 } from '@/redesign/lib/useRevealV2';
import Skeleton from '@/redesign/components/Skeleton';

function StatBlock({ to, label, value, sub, live, loading }) {
  return (
    <Link
      to={to}
      className="rd-row-hover flex flex-col justify-between px-6 py-6 sm:py-8 border-[var(--rd-line)] first:border-t-0 border-t sm:border-t-0 sm:border-l first:sm:border-l-0"
    >
      <div className="flex items-center gap-2 rd-label">
        {live && <span className="w-1.5 h-1.5 bg-primary" />}
        {label}
      </div>
      {loading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : (
        <>
          <div className="rd-display text-2xl sm:text-3xl mt-4 truncate">{value}</div>
          <div className="rd-mono text-xs text-[var(--rd-text-dim)] mt-1">{sub}</div>
        </>
      )}
    </Link>
  );
}

function HomeCardsV2() {
  const [latestSession, setLatestSession] = useState(null);
  const [nextRace, setNextRace] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [liveChecked, setLiveChecked] = useState(false);
  const revealRef = useRevealV2({ childSelector: '.stat-block' });

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
        setLiveChecked(true);
        source.close();
      }
    };
    return () => source.close();
  }, []);

  return (
    <div ref={revealRef} className="grid grid-cols-1 sm:grid-cols-3 border border-[var(--rd-line)]">
      <div className="stat-block">
        <StatBlock
          to="/live"
          label="Live"
          live
          loading={!liveChecked}
          value={liveStatus ? liveStatus.sessionType : 'Standby'}
          sub={liveStatus ? liveStatus.status : 'No session running'}
        />
      </div>
      <div className="stat-block">
        <StatBlock
          to="/races"
          label="Latest Result"
          loading={!latestSession}
          value={latestSession?.meeting_name}
          sub={latestSession?.session_name}
        />
      </div>
      <div className="stat-block">
        <StatBlock
          to="/races"
          label="Next Race"
          loading={!nextRace}
          value={nextRace?.location}
          sub={nextRace ? new Date(nextRace.date_start).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : ''}
        />
      </div>
    </div>
  );
}

export default HomeCardsV2;
