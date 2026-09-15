import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import 'flag-icons/css/flag-icons.min.css';

import NavbarV2 from '@/redesign/components/NavbarV2';
import FooterV2 from '@/redesign/components/FooterV2';
import HeroV2 from '@/redesign/components/HeroV2';
import HomeCardsV2 from '@/redesign/components/HomeCardsV2';
import SectorReveal from '@/redesign/components/SectorReveal';
import SectorProgressRail from '@/redesign/components/SectorProgressRail';
import CheckeredDivider from '@/redesign/components/CheckeredDivider';
import RaceCalendarStripV2 from '@/redesign/components/RaceCalendarStripV2';
import DriverStandingsPreviewV2 from '@/redesign/components/DriverStandingsPreviewV2';
import ConstructorStandingsV2 from '@/redesign/components/ConstructorStandingsV2';
import RacesListV2 from '@/redesign/components/RacesListV2';
import RaceWeekendV2 from '@/redesign/components/RaceWeekendV2';
import SessionResultsV2 from '@/redesign/components/SessionResultsV2';
import StandingsV2 from '@/redesign/components/StandingsV2';
import NotFoundV2 from '@/redesign/components/NotFoundV2';

import '@/redesign/redesign.css';

function HomeV2() {
  return (
    <div>
      <HeroV2 />
      <CheckeredDivider />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-16 sm:space-y-24">
        <SectorReveal>
          <HomeCardsV2 />
        </SectorReveal>
        <SectorReveal>
          <RaceCalendarStripV2 />
        </SectorReveal>
        <SectorReveal>
          <DriverStandingsPreviewV2 />
        </SectorReveal>
      </div>
    </div>
  );
}

function StandingsPageV2() {
  const [tab, setTab] = useState('drivers');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="rd-label mb-2 text-center">Championship</div>
      <h1 className="rd-display text-4xl text-center mb-10">Standings</h1>

      <div className="flex justify-center gap-1 mb-10 border border-[var(--rd-line)] w-fit mx-auto">
        {['drivers', 'constructors'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rd-label !text-[0.75rem] px-5 py-2 transition-colors ${
              tab === key ? 'bg-primary text-white' : 'text-[var(--rd-text-dim)] hover:text-[var(--rd-text)]'
            }`}
          >
            {key === 'drivers' ? 'Drivers' : 'Constructors'}
          </button>
        ))}
      </div>

      {tab === 'drivers' ? <DriverStandingsPreviewV2 /> : <ConstructorStandingsV2 />}
    </div>
  );
}

function RedesignApp() {
  return (
    <div className="redesign-root flex flex-col min-h-screen">
      <NavbarV2 />
      <main className="flex-1">
        <Routes>
          <Route index element={<HomeV2 />} />
          <Route path="live" element={<StandingsV2 />} />
          <Route path="races" element={<RacesListV2 />} />
          <Route path="races/:meetingKey" element={<RaceWeekendV2 />} />
          <Route path="races/:meetingKey/:sessionKey" element={<SessionResultsV2 />} />
          <Route path="standings" element={<StandingsPageV2 />} />
          <Route path="*" element={<NotFoundV2 />} />
        </Routes>
      </main>
      <FooterV2 />
      <SectorProgressRail />
    </div>
  );
}

export default RedesignApp;
