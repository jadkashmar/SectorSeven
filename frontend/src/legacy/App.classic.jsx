// Preserved for reference only — this is the original App.jsx exactly as it
// was before the "Timing Tower" redesign replaced it. It is not imported by
// the live app (see src/App.jsx). The full original site, including this
// file in its original location, remains browsable on GitHub at the
// `classic-ui` branch.
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import Standings from '@/legacy/components/Standings';
import Hero from '@/legacy/components/Hero';
import HomeCards from '@/legacy/components/HomeCards';
import Navbar from '@/legacy/components/Navbar';
import RacesList from '@/legacy/components/RacesList';
import RaceWeekend from '@/legacy/components/RaceWeekend';
import SessionResults from '@/legacy/components/SessionResults';
import RaceCalendarStrip from '@/legacy/components/RaceCalendarStrip';
import DriverStandingsPreview from '@/legacy/components/DriverStandingsPreview';
import Footer from '@/legacy/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/legacy/components/ui/tabs';
import ConstructorStandings from '@/legacy/components/ConstructorStandings';
import { useScrollReveal } from '@/legacy/lib/useScrollReveal';
import ScrollCarTrack from '@/legacy/components/ScrollCarTrack';
import 'flag-icons/css/flag-icons.min.css';
import TrackMap from '@/legacy/components/TrackMap';

function Home() {
  const cardsRef = useScrollReveal();
  const calendarRef = useScrollReveal();
  const standingsRef = useScrollReveal();

  return (
    <div className="bg-background">
      <Hero />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div ref={cardsRef}>
          <HomeCards />
        </div>

        <ScrollCarTrack />

        <div ref={calendarRef}>
          <RaceCalendarStrip />
        </div>

        <div ref={standingsRef}>
          <DriverStandingsPreview />
        </div>
      </div>
    </div>
  );
}

function StandingsPage() {
  return (
    <div className="p-8 min-h-screen bg-background">
      <Tabs defaultValue="drivers">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-card border border-border h-11 p-1">
            <TabsTrigger
              value="drivers"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-base px-6"
            >
              Drivers
            </TabsTrigger>
            <TabsTrigger
              value="constructors"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-base px-6"
            >
              Constructors
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="drivers">
          <DriverStandingsPreview />
        </TabsContent>

        <TabsContent value="constructors">
          <ConstructorStandings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClassicApp() {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live" element={<Standings />} />
            <Route path="/races" element={<RacesList />} />
            <Route path="/races/:meetingKey" element={<RaceWeekend />} />
            <Route path="/races/:meetingKey/:sessionKey" element={<SessionResults />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/track" element={<div className="p-8 bg-background min-h-screen"><TrackMap /></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}

export default ClassicApp;
