import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import Standings from '@/components/Standings';
import Hero from '@/components/Hero';
import HomeCards from '@/components/HomeCards';
import Navbar from '@/components/Navbar';
import RacesList from '@/components/RacesList';
import RaceWeekend from '@/components/RaceWeekend';

function Home() {
  return (
    <div className="p-8 min-h-screen bg-slate-950">
      <Hero />
      <HomeCards />
    </div>
  );
}



function App() {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <SidebarProvider>
          <div className="flex flex-1">
            <Sidebar className="bg-slate-950 border-slate-800 text-white">
              <SidebarContent className="bg-slate-950">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-slate-500">F1 Hub</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="text-slate-300 hover:text-white hover:bg-slate-800">
                        <Link to="/">Home</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="text-slate-300 hover:text-white hover:bg-slate-800">
                        <Link to="/live">Live Session</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="text-slate-300 hover:text-white hover:bg-slate-800">
                        <Link to="/races">All Races</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <main className="flex-1 bg-slate-950 min-h-screen">
              <SidebarTrigger className="m-2 text-white hover:bg-slate-800" />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/live" element={<Standings />} />
              <Route path="/races" element={<RacesList />} />
              <Route path="/races/:meetingKey" element={<RaceWeekend />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}

export default App;