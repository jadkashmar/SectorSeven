import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import Standings from '@/components/Standings';
import Hero from '@/components/Hero';
import HomeCards from '@/components/HomeCards';
import Navbar from '@/components/Navbar';
import RacesList from '@/components/RacesList';
import RaceWeekend from '@/components/RaceWeekend';
import SessionResults from '@/components/SessionResults';
import RaceCalendarStrip from '@/components/RaceCalendarStrip';
import DriverStandingsPreview from '@/components/DriverStandingsPreview';
import Footer from '@/components/Footer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ConstructorStandings from '@/components/ConstructorStandings';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { Separator } from '@/components/ui/separator';
import ScrollCarTrack from '@/components/ScrollCarTrack';
import 'flag-icons/css/flag-icons.min.css';
import TrackMap from '@/components/TrackMap';


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

function App() {
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

export default App;